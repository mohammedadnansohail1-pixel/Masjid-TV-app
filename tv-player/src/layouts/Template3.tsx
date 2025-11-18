import type { PrayerTimes } from '../types';
import { CurrentTime } from '../components/CurrentTime';
import { IslamicDate } from '../components/IslamicDate';
import { NextPrayerCountdown } from '../components/NextPrayerCountdown';
import { getPrayerList } from '../utils/prayerUtils';
import { formatTime } from '../utils/timeUtils';

interface Template3Props {
  prayerTimes: PrayerTimes;
  masjidName?: string;
  masjidLogo?: string;
}

export const Template3 = ({ prayerTimes, masjidName, masjidLogo }: Template3Props) => {
  const prayers = getPrayerList(prayerTimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-islamic-darkGreen to-slate-900 flex items-center justify-center p-12 animate-fade-in">
      <div className="max-w-7xl w-full">
        {/* Main Content */}
        <div className="grid grid-cols-2 gap-12">
          {/* Left Column - Next Prayer Focus */}
          <div className="flex flex-col justify-center">
            {/* Header */}
            <div className="mb-12 text-center">
              {masjidLogo && (
                <img
                  src={masjidLogo}
                  alt={masjidName || 'Masjid'}
                  className="h-28 mx-auto mb-6 rounded-full"
                />
              )}
              <h1 className="text-6xl font-bold text-white mb-4">
                {masjidName || 'Masjid'}
              </h1>
              <IslamicDate hijriDate={prayerTimes.hijriDate} />
            </div>

            {/* Current Time */}
            <div className="mb-12 bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10">
              <CurrentTime className="text-center" />
            </div>

            {/* Next Prayer Countdown - Featured */}
            <div className="bg-gradient-to-br from-islamic-gold to-yellow-600 rounded-3xl p-12 shadow-2xl">
              <NextPrayerCountdown prayerTimes={prayerTimes} />
            </div>
          </div>

          {/* Right Column - All Prayer Times */}
          <div className="flex flex-col justify-center">
            <div className="bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10">
              <h2 className="text-4xl font-bold text-white mb-8 text-center border-b border-white/20 pb-6">
                All Prayer Times
              </h2>

              <div className="space-y-6">
                {prayers.map((prayer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div>
                      <div className="text-3xl font-semibold text-white mb-1">
                        {prayer.name}
                      </div>
                      <div className="text-xl text-white/70 font-arabic">
                        {prayer.arabicName}
                      </div>
                    </div>
                    <div className="text-4xl font-bold font-mono text-islamic-gold">
                      {formatTime(prayer.time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote/Message */}
            <div className="mt-8 text-center">
              <p className="text-2xl text-white/80 italic">
                "Indeed, prayer has been decreed upon the believers a decree of specified times."
              </p>
              <p className="text-xl text-white/60 mt-2">- Quran 4:103</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
