import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { PrayerTimes } from '../types';

export const usePrayerTimes = (masjidId: string | null) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrayerTimes = useCallback(async () => {
    if (!masjidId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const times = await apiService.getPrayerTimes(masjidId);
      setPrayerTimes(times);
      setLastUpdated(new Date());

      // Cache in localStorage for offline fallback
      localStorage.setItem('cached_prayer_times', JSON.stringify(times));
      localStorage.setItem('prayer_times_cache_date', new Date().toISOString());
    } catch (err: any) {
      console.error('Error fetching prayer times:', err);
      setError(err.message || 'Failed to fetch prayer times');

      // Try to load from cache
      const cached = localStorage.getItem('cached_prayer_times');
      if (cached) {
        try {
          setPrayerTimes(JSON.parse(cached));
        } catch (e) {
          console.error('Error parsing cached prayer times:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [masjidId]);

  useEffect(() => {
    fetchPrayerTimes();

    // Refresh prayer times at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      fetchPrayerTimes();

      // Set up daily refresh
      const dailyInterval = setInterval(fetchPrayerTimes, 24 * 60 * 60 * 1000);

      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [fetchPrayerTimes]);

  const refresh = useCallback(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  return {
    prayerTimes,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
};
