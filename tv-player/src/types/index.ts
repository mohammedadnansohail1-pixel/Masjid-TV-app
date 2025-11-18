export interface PrayerTime {
  name: string;
  time: string;
  arabicName?: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date?: string;
  hijriDate?: string;
}

export interface Device {
  id: string;
  name: string;
  pairingCode: string;
  isPaired: boolean;
  masjidId?: string;
  lastSeen?: string;
  orientation?: 'landscape' | 'portrait';
  template?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority?: number;
}

export interface MediaContent {
  id: string;
  type: 'image' | 'video' | 'url';
  url: string;
  title?: string;
  duration?: number;
  isActive: boolean;
  order?: number;
}

export interface ContentSchedule {
  announcements: Announcement[];
  media: MediaContent[];
  prayerTimes: PrayerTimes;
  currentTemplate: string;
  masjidName?: string;
  masjidLogo?: string;
}

export interface WebSocketMessage {
  type: 'prayer_times_updated' | 'announcement_updated' | 'content_updated' | 'template_changed' | 'refresh';
  data?: any;
}

export type TemplateType = 'template1' | 'template2' | 'template3';

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  heartbeatInterval: number;
  contentRotationInterval: number;
  debug: boolean;
}

export interface DeviceRegistrationResponse {
  device: Device;
  token: string;
}

export interface PairingStatusResponse {
  isPaired: boolean;
  masjidId?: string;
  masjidName?: string;
}
