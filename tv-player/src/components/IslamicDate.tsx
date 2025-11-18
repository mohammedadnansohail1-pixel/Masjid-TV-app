import { useState, useEffect } from 'react';

interface IslamicDateProps {
  className?: string;
  hijriDate?: string;
}

export const IslamicDate = ({ className = '', hijriDate }: IslamicDateProps) => {
  const [displayDate, setDisplayDate] = useState(hijriDate || '');

  useEffect(() => {
    if (hijriDate) {
      setDisplayDate(hijriDate);
    } else {
      // If no Hijri date provided, you could fetch it from an API
      // For now, we'll just show a placeholder
      setDisplayDate('Hijri Date Not Available');
    }
  }, [hijriDate]);

  if (!displayDate) return null;

  return (
    <div className={`text-center ${className}`}>
      <div className="text-xl text-white/80 font-arabic">
        {displayDate}
      </div>
    </div>
  );
};
