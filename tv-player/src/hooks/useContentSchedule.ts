import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { ContentSchedule, Announcement, MediaContent, ScheduleItem } from '../types';

export const useContentSchedule = (masjidId: string | null) => {
  const [schedule, setSchedule] = useState<ContentSchedule | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentSchedule = useCallback(async () => {
    if (!masjidId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await apiService.getContentSchedule(masjidId);
      setSchedule(data);
      setAnnouncements(data.announcements || []);
      setMedia(data.media || []);
      setScheduleItems(data.contentSchedule || []);

      // Cache for offline use
      localStorage.setItem('cached_content_schedule', JSON.stringify(data));
    } catch (err: any) {
      console.error('Error fetching content schedule:', err);
      setError(err.message || 'Failed to fetch content schedule');

      // Try to load from cache
      const cached = localStorage.getItem('cached_content_schedule');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setSchedule(data);
          setAnnouncements(data.announcements || []);
          setMedia(data.media || []);
          setScheduleItems(data.contentSchedule || []);
        } catch (e) {
          console.error('Error parsing cached content:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [masjidId]);

  const fetchAnnouncements = useCallback(async () => {
    if (!masjidId) return;

    try {
      const data = await apiService.getAnnouncements(masjidId);
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, [masjidId]);

  const fetchMedia = useCallback(async () => {
    if (!masjidId) return;

    try {
      const data = await apiService.getMedia(masjidId);
      setMedia(data);
    } catch (err) {
      console.error('Error fetching media:', err);
    }
  }, [masjidId]);

  useEffect(() => {
    fetchContentSchedule();

    // Refresh content every 5 minutes
    const interval = setInterval(fetchContentSchedule, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchContentSchedule]);

  const refresh = useCallback(() => {
    fetchContentSchedule();
  }, [fetchContentSchedule]);

  return {
    schedule,
    announcements,
    media,
    scheduleItems,
    isLoading,
    error,
    refresh,
    fetchAnnouncements,
    fetchMedia,
  };
};
