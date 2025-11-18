import { useState, useEffect } from 'react';
import type { PrayerTimes, TemplateType } from '../types';
import { Template1 } from '../layouts/Template1';
import { Template2 } from '../layouts/Template2';
import { Template3 } from '../layouts/Template3';

interface PrayerTimeDisplayProps {
  prayerTimes: PrayerTimes;
  template?: TemplateType;
  masjidName?: string;
  masjidLogo?: string;
}

export const PrayerTimeDisplay = ({
  prayerTimes,
  template = 'template1',
  masjidName,
  masjidLogo,
}: PrayerTimeDisplayProps) => {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>(template);

  useEffect(() => {
    setCurrentTemplate(template);
  }, [template]);

  const renderTemplate = () => {
    switch (currentTemplate) {
      case 'template1':
        return (
          <Template1
            prayerTimes={prayerTimes}
            masjidName={masjidName}
            masjidLogo={masjidLogo}
          />
        );
      case 'template2':
        return (
          <Template2
            prayerTimes={prayerTimes}
            masjidName={masjidName}
            masjidLogo={masjidLogo}
          />
        );
      case 'template3':
        return (
          <Template3
            prayerTimes={prayerTimes}
            masjidName={masjidName}
            masjidLogo={masjidLogo}
          />
        );
      default:
        return (
          <Template1
            prayerTimes={prayerTimes}
            masjidName={masjidName}
            masjidLogo={masjidLogo}
          />
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderTemplate()}
    </div>
  );
};
