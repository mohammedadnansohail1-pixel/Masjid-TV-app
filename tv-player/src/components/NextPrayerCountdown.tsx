import { useState, useEffect } from 'react';
import type { PrayerTimes } from '../types';
import { getNextPrayer, getTimeUntilNextPrayer } from '../utils/prayerUtils';
import { formatCountdown } from '../utils/timeUtils';

interface NextPrayerCountdownProps {
  prayerTimes: PrayerTimes;
  className?: string;
}

export const NextPrayerCountdown = ({ prayerTimes, className = '' }: NextPrayerCountdownProps) => {
  const [countdown, setCountdown] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(getNextPrayer(prayerTimes));

  useEffect(() => {
    const updateCountdown = () => {
      const seconds = getTimeUntilNextPrayer(prayerTimes);
      setCountdown(seconds);
      setNextPrayer(getNextPrayer(prayerTimes));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (!nextPrayer) return null;

  return (
    <div className={`${className}`}>
      <div className="text-center">
        <div className="text-2xl text-white/80 mb-2">
          Next Prayer
        </div>
        <div className="text-5xl font-bold text-white mb-4">
          {nextPrayer.name}
          {nextPrayer.arabicName && (
            <span className="text-3xl ml-4 font-arabic text-white/90">
              {nextPrayer.arabicName}
            </span>
          )}
        </div>
        <div className="text-4xl font-mono text-islamic-gold">
          {formatCountdown(countdown)}
        </div>
        <div className="text-xl text-white/70 mt-2">
          until {nextPrayer.name}
        </div>
      </div>
    </div>
  );
};
