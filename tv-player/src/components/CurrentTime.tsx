import { useState, useEffect } from 'react';
import { getCurrentTime, getCurrentDate } from '../utils/timeUtils';

interface CurrentTimeProps {
  className?: string;
  showDate?: boolean;
  use12Hour?: boolean;
}

export const CurrentTime = ({ className = '', showDate = true, use12Hour = true }: CurrentTimeProps) => {
  const [time, setTime] = useState(getCurrentTime(use12Hour));
  const [date, setDate] = useState(getCurrentDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime(use12Hour));
      setDate(getCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, [use12Hour]);

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl font-bold text-white font-mono">
        {time}
      </div>
      {showDate && (
        <div className="text-2xl text-white/90 mt-2">
          {date}
        </div>
      )}
    </div>
  );
};
