import type { PrayerTimes, PrayerTime } from '../types';
import { isTimePassed, getTimeDifference } from './timeUtils';

export const PRAYER_NAMES = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PRAYER_ARABIC_NAMES = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export const getPrayerList = (prayerTimes: PrayerTimes): PrayerTime[] => {
  return [
    {
      name: PRAYER_NAMES.fajr,
      arabicName: PRAYER_ARABIC_NAMES.fajr,
      time: prayerTimes.fajr,
      iqamah: prayerTimes.fajrIqamah,
    },
    {
      name: PRAYER_NAMES.sunrise,
      arabicName: PRAYER_ARABIC_NAMES.sunrise,
      time: prayerTimes.sunrise,
      // No iqamah for sunrise
    },
    {
      name: PRAYER_NAMES.dhuhr,
      arabicName: PRAYER_ARABIC_NAMES.dhuhr,
      time: prayerTimes.dhuhr,
      iqamah: prayerTimes.dhuhrIqamah,
    },
    {
      name: PRAYER_NAMES.asr,
      arabicName: PRAYER_ARABIC_NAMES.asr,
      time: prayerTimes.asr,
      iqamah: prayerTimes.asrIqamah,
    },
    {
      name: PRAYER_NAMES.maghrib,
      arabicName: PRAYER_ARABIC_NAMES.maghrib,
      time: prayerTimes.maghrib,
      iqamah: prayerTimes.maghribIqamah,
    },
    {
      name: PRAYER_NAMES.isha,
      arabicName: PRAYER_ARABIC_NAMES.isha,
      time: prayerTimes.isha,
      iqamah: prayerTimes.ishaIqamah,
    },
  ];
};

export const getNextPrayer = (prayerTimes: PrayerTimes): PrayerTime | null => {
  const prayers = getPrayerList(prayerTimes);

  for (const prayer of prayers) {
    if (!isTimePassed(prayer.time)) {
      return prayer;
    }
  }

  // If all prayers have passed, return Fajr for tomorrow
  return prayers[0];
};

export const getCurrentPrayer = (prayerTimes: PrayerTimes): PrayerTime | null => {
  const prayers = getPrayerList(prayerTimes);
  let currentPrayer: PrayerTime | null = null;

  for (let i = 0; i < prayers.length; i++) {
    if (isTimePassed(prayers[i].time)) {
      currentPrayer = prayers[i];
    } else {
      break;
    }
  }

  return currentPrayer;
};

export const getTimeUntilNextPrayer = (prayerTimes: PrayerTimes): number => {
  const nextPrayer = getNextPrayer(prayerTimes);
  if (!nextPrayer) return 0;

  return getTimeDifference(nextPrayer.time);
};

export const isPrayerTime = (prayerTimes: PrayerTimes, withinMinutes = 15): boolean => {
  const timeUntil = getTimeUntilNextPrayer(prayerTimes);
  return timeUntil > 0 && timeUntil <= withinMinutes * 60;
};

export const getPrayerTimeByName = (prayerTimes: PrayerTimes, name: string): string | undefined => {
  const key = name.toLowerCase() as keyof PrayerTimes;
  return prayerTimes[key];
};

export const isPrayerPassed = (prayerTimes: PrayerTimes, prayerName: string): boolean => {
  const time = getPrayerTimeByName(prayerTimes, prayerName);
  if (!time) return false;
  return isTimePassed(time);
};
