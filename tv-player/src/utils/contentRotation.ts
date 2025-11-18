import type { Announcement, MediaContent } from '../types';

export interface ContentItem {
  type: 'announcement' | 'media' | 'prayer';
  data?: Announcement | MediaContent;
  duration: number;
}

export const DEFAULT_CONTENT_DURATION = 10000; // 10 seconds
export const PRAYER_DISPLAY_DURATION = 30000; // 30 seconds

export const createContentRotation = (
  announcements: Announcement[],
  media: MediaContent[]
): ContentItem[] => {
  const rotation: ContentItem[] = [];

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
      duration: item.duration || DEFAULT_CONTENT_DURATION,
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
