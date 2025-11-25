import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Device } from '../types';

export const useDeviceRegistration = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState(false);

  // Load device from localStorage
  useEffect(() => {
    const loadDevice = async () => {
      const savedDeviceId = localStorage.getItem('device_id');
      const savedMasjidId = localStorage.getItem('masjid_id');

      // Already paired
      if (savedMasjidId && savedDeviceId) {
        setIsPaired(true);
        setDevice({
          id: savedDeviceId,
          pairingCode: localStorage.getItem('pairing_code') || '',
          isPaired: true,
          name: 'TV Display',
        } as Device);

        try {
          const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
          setDevice(deviceInfo);

          if (deviceInfo.masjid?.id) {
            localStorage.setItem('masjid_id', deviceInfo.masjid.id);
            if (deviceInfo.masjid.name) {
              localStorage.setItem('masjid_name', deviceInfo.masjid.name);
            }
          }
        } catch (err) {
          console.warn('Could not refresh device info from API:', err);
        }

        setIsLoading(false);
        return;
      }

      try {
        if (savedDeviceId) {
          const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
          setDevice(deviceInfo);

          if (deviceInfo.isPaired && deviceInfo.masjid?.id) {
            setIsPaired(true);
            localStorage.setItem('masjid_id', deviceInfo.masjid.id);
            if (deviceInfo.masjid.name) {
              localStorage.setItem('masjid_name', deviceInfo.masjid.name);
            }
          } else {
            setIsPaired(false);
          }
        } else {
          await registerNewDevice();
        }
      } catch (err) {
        console.error('Error loading device:', err);
        if (!savedMasjidId) {
          await registerNewDevice();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDevice();
  }, []);

  // --- REGISTER NEW DEVICE ---
  const registerNewDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.registerDevice();
      const newDevice = response.device;

      setDevice(newDevice);
      localStorage.setItem('device_id', newDevice.id);
      localStorage.setItem('pairing_code', newDevice.pairingCode);

      setIsPaired(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register device');
      console.error('Device registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PAIR DEVICE (THIS IS WHAT YOUR UI NEEDS) ---
  const pairDevice = useCallback(async (pairingCode: string) => {
    if (!device) return false;

    try {
      setIsLoading(true);
      setError(null);

      const result = await apiService.pairDevice(pairingCode);

      if (result.masjidId) {
        setIsPaired(true);
        localStorage.setItem('masjid_id', result.masjidId);
        if (result.masjidName) {
          localStorage.setItem('masjid_name', result.masjidName);
        }
        return true;
      }

      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to pair device');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [device]);

  const checkPairingStatus = useCallback(async () => {
    if (!device) return false;

    try {
      const status = await apiService.checkPairingStatus(device.id);

      if (status.isPaired && status.masjidId) {
        setIsPaired(true);
        localStorage.setItem('masjid_id', status.masjidId);
        if (status.masjidName) {
          localStorage.setItem('masjid_name', status.masjidName);
        }
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking pairing status:', err);
      return false;
    }
  }, [device]);

  const resetDevice = useCallback(() => {
    localStorage.removeItem('device_id');
    localStorage.removeItem('masjid_id');
    localStorage.removeItem('masjid_name');
    localStorage.removeItem('pairing_code');
    localStorage.removeItem('device_token');
    apiService.clearAuthToken();
    setDevice(null);
    setIsPaired(false);
    registerNewDevice();
  }, []);

  return {
    device,
    isPaired,
    isLoading,
    error,
    pairDevice,
    checkPairingStatus,
    resetDevice,
  };
};
