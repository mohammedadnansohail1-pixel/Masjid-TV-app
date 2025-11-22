export interface Masjid {
  id: number;
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
  id: number;
  masjidId: number;
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
  id: number;
  masjidId: number;
  title: string;
  content: string;
  imageUrl?: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  masjid?: Masjid;
}

export interface ContentSchedule {
  id: number;
  masjidId: number;
  contentType: "announcement" | "hadith" | "quran" | "donation" | "custom";
  contentId?: number;
  customContent?: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  masjid?: Masjid;
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
