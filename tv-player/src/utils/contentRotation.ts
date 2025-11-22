import type { Announcement, MediaContent, ScheduleItem } from '../types';

export interface ContentItem {
  type: 'announcement' | 'media' | 'prayer' | 'webview';
  data?: Announcement | MediaContent | { url: string };
  duration: number; // in milliseconds
  scheduleId?: string;
}

export const DEFAULT_CONTENT_DURATION = 10000; // 10 seconds in ms
export const PRAYER_DISPLAY_DURATION = 30000; // 30 seconds in ms

/**
 * Create content rotation from schedule items
 * Uses schedule durations when available, falls back to defaults
 */
export const createContentRotation = (
  announcements: Announcement[],
  media: MediaContent[],
  scheduleItems?: ScheduleItem[]
): ContentItem[] => {
  const rotation: ContentItem[] = [];

  // If we have schedule items, use them for rotation with their durations
  if (scheduleItems && scheduleItems.length > 0) {
    // Sort by priority (higher first)
    const sortedSchedules = [...scheduleItems]
      .filter(s => s.isActive)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    sortedSchedules.forEach((schedule) => {
      // Duration from schedule is in seconds, convert to milliseconds
      const durationMs = (schedule.duration || 30) * 1000;

      switch (schedule.contentType) {
        case 'PRAYER_TIMES':
          rotation.push({
            type: 'prayer',
            duration: durationMs,
            scheduleId: schedule.id,
          });
          break;

        case 'ANNOUNCEMENT':
          // Find the linked announcement
          const announcement = schedule.contentId
            ? announcements.find(a => a.id === schedule.contentId)
            : null;

          if (announcement) {
            rotation.push({
              type: 'announcement',
              data: announcement,
              duration: durationMs,
              scheduleId: schedule.id,
            });
          } else if (!schedule.contentId) {
            // If no specific announcement, rotate through all active ones
            announcements.forEach(ann => {
              rotation.push({
                type: 'announcement',
                data: ann,
                duration: durationMs,
                scheduleId: schedule.id,
              });
            });
          }
          break;

        case 'IMAGE':
        case 'VIDEO':
          // Find the linked media
          const mediaItem = schedule.contentId
            ? media.find(m => m.id === schedule.contentId)
            : null;

          if (mediaItem) {
            rotation.push({
              type: 'media',
              data: mediaItem,
              duration: durationMs,
              scheduleId: schedule.id,
            });
          }
          break;

        case 'WEBVIEW':
          if (schedule.url) {
            rotation.push({
              type: 'webview',
              data: { url: schedule.url },
              duration: durationMs,
              scheduleId: schedule.id,
            });
          }
          break;
      }
    });

    // If we have rotation items, return them
    if (rotation.length > 0) {
      return rotation;
    }
  }

  // Fallback: Create rotation from announcements and media directly (legacy behavior)
  // Add high priority announcements first
  const priorityAnnouncements = announcements
    .filter((a) => a.priority && a.priority > 5)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  priorityAnnouncements.forEach((announcement) => {
    rotation.push({
      type: 'announcement',
      data: announcement,
      duration: DEFAULT_CONTENT_DURATION,
    });
  });

  // Add media content
  const sortedMedia = [...media].sort((a, b) => (a.order || 0) - (b.order || 0));

  sortedMedia.forEach((item) => {
    rotation.push({
      type: 'media',
      data: item,
      duration: (item.duration || 10) * 1000, // Convert seconds to ms
    });
  });

  // Add regular announcements
  const regularAnnouncements = announcements.filter((a) => !a.priority || a.priority <= 5);

  regularAnnouncements.forEach((announcement) => {
    rotation.push({
      type: 'announcement',
      data: announcement,
      duration: DEFAULT_CONTENT_DURATION,
    });
  });

  // Always show prayer times between content
  if (rotation.length > 0) {
    const itemsWithPrayer: ContentItem[] = [];
    rotation.forEach((item, index) => {
      itemsWithPrayer.push(item);
      // Add prayer display after every 2 content items
      if ((index + 1) % 2 === 0) {
        itemsWithPrayer.push({
          type: 'prayer',
          duration: PRAYER_DISPLAY_DURATION,
        });
      }
    });
    return itemsWithPrayer;
  }

  // If no content, just show prayer times
  return [
    {
      type: 'prayer',
      duration: PRAYER_DISPLAY_DURATION,
    },
  ];
};

export const getNextContent = (
  currentIndex: number,
  rotation: ContentItem[]
): { index: number; item: ContentItem } => {
  if (rotation.length === 0) {
    return {
      index: 0,
      item: {
        type: 'prayer',
        duration: PRAYER_DISPLAY_DURATION,
      },
    };
  }

  const nextIndex = (currentIndex + 1) % rotation.length;
  return {
    index: nextIndex,
    item: rotation[nextIndex],
  };
};

export const shouldShowPrayerTimes = (item: ContentItem): boolean => {
  return item.type === 'prayer';
};

export const shouldShowAnnouncement = (item: ContentItem): boolean => {
  return item.type === 'announcement' && !!item.data;
};

export const shouldShowMedia = (item: ContentItem): boolean => {
  return item.type === 'media' && !!item.data;
};

export const shouldShowWebview = (item: ContentItem): boolean => {
  return item.type === 'webview' && !!item.data;
};
