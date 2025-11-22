export interface Masjid {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  calculationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTime {
  id: string;
  masjidId: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  // Iqamah times (manually set)
  fajrIqamah?: string;
  dhuhrIqamah?: string;
  asrIqamah?: string;
  maghribIqamah?: string;
  ishaIqamah?: string;
  // Jumuah times
  jumuah1?: string;
  jumuah2?: string;
  isManual?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  masjidId: string;
  name: string;
  pairingCode: string;
  isPaired: boolean;
  lastSeen?: string;
  displayTemplateId?: number;
  activeTemplate?: string;
  createdAt: string;
  updatedAt: string;
  masjid?: Masjid;
}

export interface Announcement {
  id: string;
  masjidId: string;
  title: string;
  body: string;
  imageUrl?: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  masjid?: Masjid;
}

export interface ContentSchedule {
  id: string;
  masjidId: string;
  name: string;
  contentType: "PRAYER_TIMES" | "ANNOUNCEMENT" | "IMAGE" | "VIDEO" | "WEBVIEW";
  contentId?: string;
  url?: string;
  startTime?: string;
  endTime?: string;
  days: number[];
  duration: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCampaign {
  id: number;
  masjidId: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  masjid?: Masjid;
}

export interface Donation {
  id: number;
  campaignId: number;
  donorName?: string;
  donorEmail?: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  campaign?: DonationCampaign;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
