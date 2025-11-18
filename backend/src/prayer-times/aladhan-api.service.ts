import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrayerCalculationMethod, AsrCalculation, HighLatitudeRule } from '@prisma/client';

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  data: {
    timings: AladhanTimings;
    date: {
      gregorian: {
        date: string;
      };
    };
  };
}

interface AladhanCalendarResponse {
  data: Array<{
    timings: AladhanTimings;
    date: {
      gregorian: {
        date: string;
        day: string;
        month: {
          number: number;
        };
        year: string;
      };
    };
  }>;
}

@Injectable()
export class AladhanApiService {
  private readonly logger = new Logger(AladhanApiService.name);
  private readonly baseUrl = 'http://api.aladhan.com/v1';

  /**
   * Convert our calculation method to Aladhan API method number
   */
  private getMethodNumber(method: PrayerCalculationMethod): number {
    const methodMap: Record<PrayerCalculationMethod, number> = {
      MWL: 3,
      ISNA: 2,
      EGYPT: 5,
      MAKKAH: 4,
      KARACHI: 1,
      TEHRAN: 7,
      JAFARI: 0,
      GULF: 8,
      KUWAIT: 9,
      QATAR: 10,
      SINGAPORE: 11,
      FRANCE: 12,
      TURKEY: 13,
      RUSSIA: 14,
    };
    return methodMap[method] || 2; // Default to ISNA
  }

  /**
   * Convert Asr calculation to Aladhan API school number
   */
  private getSchoolNumber(asrCalculation: AsrCalculation): number {
    return asrCalculation === 'HANAFI' ? 1 : 0; // 0 = Standard (Shafi), 1 = Hanafi
  }

  /**
   * Convert high latitude rule to Aladhan API adjustment number
   */
  private getLatitudeAdjustment(rule: HighLatitudeRule): number {
    const adjustmentMap: Record<HighLatitudeRule, number> = {
      MIDDLE_OF_NIGHT: 1,
      SEVENTH_OF_NIGHT: 2,
      TWILIGHT_ANGLE: 3,
    };
    return adjustmentMap[rule] || 1;
  }

  /**
   * Format time from Aladhan API (HH:mm (TZ)) to just HH:mm
   */
  private formatTime(time: string): string {
    // Aladhan returns time like "06:00 (EST)" or "06:00"
    const timeMatch = time.match(/^(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : time;
  }

  /**
   * Get prayer times for a specific date
   */
  async getPrayerTimesForDate(
    date: Date,
    latitude: number,
    longitude: number,
    method: PrayerCalculationMethod,
    asrCalculation: AsrCalculation,
    highLatitudeRule: HighLatitudeRule,
  ): Promise<{
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  }> {
    try {
      const timestamp = Math.floor(date.getTime() / 1000);
      const methodNumber = this.getMethodNumber(method);
      const school = this.getSchoolNumber(asrCalculation);
      const adjustment = this.getLatitudeAdjustment(highLatitudeRule);

      const url = `${this.baseUrl}/timings/${timestamp}`;

      this.logger.debug(`Fetching prayer times from Aladhan API: ${url}`);

      const response = await axios.get<AladhanResponse>(url, {
        params: {
          latitude,
          longitude,
          method: methodNumber,
          school,
          midnightMode: adjustment === 1 ? 0 : 1,
        },
        timeout: 10000,
      });

      const timings = response.data.data.timings;

      return {
        fajr: this.formatTime(timings.Fajr),
        sunrise: this.formatTime(timings.Sunrise),
        dhuhr: this.formatTime(timings.Dhuhr),
        asr: this.formatTime(timings.Asr),
        maghrib: this.formatTime(timings.Maghrib),
        isha: this.formatTime(timings.Isha),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch prayer times from Aladhan API`, error);
      throw new BadRequestException(
        'Failed to calculate prayer times. Please check location coordinates.',
      );
    }
  }

  /**
   * Get prayer times for an entire month
   */
  async getPrayerTimesForMonth(
    year: number,
    month: number,
    latitude: number,
    longitude: number,
    method: PrayerCalculationMethod,
    asrCalculation: AsrCalculation,
    highLatitudeRule: HighLatitudeRule,
  ): Promise<Array<{
    date: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  }>> {
    try {
      const methodNumber = this.getMethodNumber(method);
      const school = this.getSchoolNumber(asrCalculation);
      const adjustment = this.getLatitudeAdjustment(highLatitudeRule);

      const url = `${this.baseUrl}/calendar/${year}/${month}`;

      this.logger.debug(`Fetching monthly prayer times from Aladhan API: ${url}`);

      const response = await axios.get<AladhanCalendarResponse>(url, {
        params: {
          latitude,
          longitude,
          method: methodNumber,
          school,
          midnightMode: adjustment === 1 ? 0 : 1,
        },
        timeout: 15000,
      });

      return response.data.data.map((day) => ({
        date: `${day.date.gregorian.year}-${String(day.date.gregorian.month.number).padStart(2, '0')}-${String(day.date.gregorian.day).padStart(2, '0')}`,
        fajr: this.formatTime(day.timings.Fajr),
        sunrise: this.formatTime(day.timings.Sunrise),
        dhuhr: this.formatTime(day.timings.Dhuhr),
        asr: this.formatTime(day.timings.Asr),
        maghrib: this.formatTime(day.timings.Maghrib),
        isha: this.formatTime(day.timings.Isha),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch monthly prayer times from Aladhan API`, error);
      throw new BadRequestException(
        'Failed to calculate prayer times. Please check location coordinates.',
      );
    }
  }
}
