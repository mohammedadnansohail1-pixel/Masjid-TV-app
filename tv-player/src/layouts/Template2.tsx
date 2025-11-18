import type { PrayerTimes } from '../types';
import { CurrentTime } from '../components/CurrentTime';
import { IslamicDate } from '../components/IslamicDate';
import { getPrayerList, getNextPrayer } from '../utils/prayerUtils';
import { formatTime } from '../utils/timeUtils';

interface Template2Props {
  prayerTimes: PrayerTimes;
  masjidName?: string;
  masjidLogo?: string;
}

export const Template2 = ({ prayerTimes, masjidName, masjidLogo }: Template2Props) => {
  const prayers = getPrayerList(prayerTimes);
  const nextPrayer = getNextPrayer(prayerTimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-islamic-darkGreen to-gray-900 p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            {masjidLogo && (
              <img
                src={masjidLogo}
                alt={masjidName || 'Masjid'}
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-5xl font-bold text-white">
                {masjidName || 'Masjid'}
              </h1>
              <IslamicDate hijriDate={prayerTimes.hijriDate} className="mt-2" />
            </div>
          </div>
          <CurrentTime showDate={false} />
        </div>

        {/* Prayer Cards Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {prayers.map((prayer, index) => {
            const isNext = nextPrayer?.name === prayer.name;

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
                  isNext
                    ? 'bg-gradient-to-br from-islamic-gold to-yellow-600 scale-105 shadow-2xl'
                    : 'bg-white/10 backdrop-blur hover:bg-white/20'
                }`}
              >
                {/* Decorative corner */}
                {isNext && (
                  <div className="absolute top-0 right-0">
                    <div className="w-16 h-16 bg-white/20 transform rotate-45 translate-x-8 -translate-y-8" />
                  </div>
                )}

                {/* Prayer Name */}
                <div className="mb-4">
                  <h3
                    className={`text-3xl font-bold mb-2 ${
                      isNext ? 'text-white' : 'text-white/90'
                    }`}
                  >
                    {prayer.name}
                  </h3>
                  <p
                    className={`text-2xl font-arabic ${
                      isNext ? 'text-white/90' : 'text-white/70'
                    }`}
                  >
                    {prayer.arabicName}
                  </p>
                </div>

                {/* Time */}
                <div
                  className={`text-5xl font-bold font-mono ${
                    isNext ? 'text-white' : 'text-islamic-gold'
                  }`}
                >
                  {formatTime(prayer.time)}
                </div>

                {/* Next indicator */}
                {isNext && (
                  <div className="absolute bottom-4 right-6">
                    <span className="text-white/90 text-xl font-semibold flex items-center gap-2">
                      <span className="animate-pulse">NEXT</span>
                      <svg
                        className="w-6 h-6 animate-bounce"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
          <p className="text-2xl text-white/80">
            May Allah accept our prayers
          </p>
        </div>
      </div>
    </div>
  );
};
