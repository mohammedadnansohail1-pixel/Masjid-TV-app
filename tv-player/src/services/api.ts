import axios, { AxiosInstance } from 'axios';
import type {
  DeviceRegistrationResponse,
  PairingStatusResponse,
  PrayerTimes,
  ContentSchedule
} from '../types';

class APIService {
  private api: AxiosInstance;
  private deviceToken: string | null = null;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    this.api = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load device token from localStorage
    this.deviceToken = localStorage.getItem('device_token');
    if (this.deviceToken) {
      this.setAuthToken(this.deviceToken);
    }

    // Request interceptor for debugging
    this.api.interceptors.request.use(
      (config) => {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.error('API Error:', error.response?.status, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.deviceToken = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('device_token', token);
  }

  clearAuthToken() {
    this.deviceToken = null;
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('device_token');
  }

  // Device Registration
  async registerDevice(): Promise<DeviceRegistrationResponse> {
    const response = await this.api.post<DeviceRegistrationResponse>('/devices/register');
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async pairDevice(pairingCode: string) {
    const response = await this.api.post('/devices/pair', {
      pairingCode
    });
    return response.data;
  }

  // Check pairing status
  async checkPairingStatus(deviceId: string): Promise<PairingStatusResponse> {
    const response = await this.api.get<PairingStatusResponse>(`/devices/${deviceId}/pairing-status`);
    return response.data;
  }

  // Get prayer times
  async getPrayerTimes(masjidId: string): Promise<PrayerTimes> {
    const response = await this.api.get<PrayerTimes>(`/masjids/${masjidId}/prayer-times/today`);
    return response.data;
  }

  // Get content schedule
  async getContentSchedule(masjidId: string): Promise<ContentSchedule> {
    const response = await this.api.get<ContentSchedule>(`/masjids/${masjidId}/content-schedule`);
    return response.data;
  }

  // Get active announcements
  async getAnnouncements(masjidId: string) {
    const response = await this.api.get(`/masjids/${masjidId}/announcements/active`);
    return response.data;
  }

  // Get active media
  async getMedia(masjidId: string) {
    const response = await this.api.get(`/masjids/${masjidId}/media/active`);
    return response.data;
  }

  // Send heartbeat
  async sendHeartbeat(deviceId: string) {
    try {
      await this.api.post(`/devices/${deviceId}/heartbeat`);
    } catch (error) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('Heartbeat failed:', error);
      }
    }
  }

  // Get device info
  async getDeviceInfo(deviceId: string) {
    const response = await this.api.get(`/devices/${deviceId}`);
    return response.data;
  }
}

export const apiService = new APIService();
export default apiService;
