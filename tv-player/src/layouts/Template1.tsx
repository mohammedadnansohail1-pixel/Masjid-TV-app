import type { PrayerTimes } from '../types';
import { CurrentTime } from '../components/CurrentTime';
import { IslamicDate } from '../components/IslamicDate';
import { NextPrayerCountdown } from '../components/NextPrayerCountdown';
import { getPrayerList, getCurrentPrayer } from '../utils/prayerUtils';
import { formatTime } from '../utils/timeUtils';

interface Template1Props {
  prayerTimes: PrayerTimes;
  masjidName?: string;
  masjidLogo?: string;
}

export const Template1 = ({ prayerTimes, masjidName, masjidLogo }: Template1Props) => {
  const prayers = getPrayerList(prayerTimes);
  const currentPrayer = getCurrentPrayer(prayerTimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {masjidLogo && (
            <img
              src={masjidLogo}
              alt={masjidName || 'Masjid'}
              className="h-24 mx-auto mb-4"
            />
          )}
          <h1 className="text-6xl font-bold text-white mb-2">
            {masjidName || 'Prayer Times'}
          </h1>
          <IslamicDate hijriDate={prayerTimes.hijriDate} className="mb-4" />
          <CurrentTime className="mb-8" />
        </div>

        {/* Prayer Times Table */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-islamic-gold p-6">
            <h2 className="text-4xl font-bold text-white text-center">
              Today's Prayer Times
            </h2>
          </div>

          <div className="p-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-6 px-8 text-3xl font-semibold text-gray-700">
                    Prayer
                  </th>
                  <th className="text-left py-6 px-8 text-3xl font-semibold text-gray-700">
                    Arabic
                  </th>
                  <th className="text-center py-6 px-8 text-3xl font-semibold text-gray-700">
                    Adhan
                  </th>
                  <th className="text-right py-6 px-8 text-3xl font-semibold text-islamic-gold">
                    Iqamah
                  </th>
                </tr>
              </thead>
              <tbody>
                {prayers.map((prayer, index) => {
                  const isCurrent = currentPrayer?.name === prayer.name;

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 transition-all ${
                        isCurrent
                          ? 'bg-islamic-lightGreen/20 scale-105'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-8 px-8">
                        <div className="flex items-center">
                          {isCurrent && (
                            <div className="w-3 h-3 bg-islamic-gold rounded-full mr-4 animate-pulse" />
                          )}
                          <span
                            className={`text-4xl font-semibold ${
                              isCurrent ? 'text-islamic-darkGreen' : 'text-gray-800'
                            }`}
                          >
                            {prayer.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-8">
                        <span
                          className={`text-3xl font-arabic ${
                            isCurrent ? 'text-islamic-darkGreen' : 'text-gray-600'
                          }`}
                        >
                          {prayer.arabicName}
                        </span>
                      </td>
                      <td className="py-8 px-8 text-center">
                        <span
                          className={`text-5xl font-bold font-mono ${
                            isCurrent ? 'text-islamic-darkGreen' : 'text-gray-800'
                          }`}
                        >
                          {formatTime(prayer.time)}
                        </span>
                      </td>
                      <td className="py-8 px-8 text-right">
                        {prayer.iqamahTime ? (
                          <span
                            className={`text-5xl font-bold font-mono ${
                              isCurrent ? 'text-islamic-gold' : 'text-islamic-gold/80'
                            }`}
                          >
                            {formatTime(prayer.iqamahTime)}
                          </span>
                        ) : (
                          <span className="text-3xl text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Prayer Countdown */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <NextPrayerCountdown prayerTimes={prayerTimes} />
        </div>
      </div>
    </div>
  );
};
