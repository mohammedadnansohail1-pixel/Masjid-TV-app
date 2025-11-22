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

      // If we have masjid_id in localStorage, device is already paired
      // Even if API call fails, trust the localStorage state
      if (savedMasjidId && savedDeviceId) {
        setIsPaired(true);
        setDevice({
          id: savedDeviceId,
          pairingCode: localStorage.getItem('pairing_code') || '',
          isPaired: true,
          name: 'TV Display',
        } as Device);

        // Try to refresh device info from API, but don't fail if it doesn't work
        try {
          const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
          setDevice(deviceInfo);
          // Sync localStorage with actual device state
          if (deviceInfo.masjid?.id) {
            localStorage.setItem('masjid_id', deviceInfo.masjid.id);
            if (deviceInfo.masjid.name) {
              localStorage.setItem('masjid_name', deviceInfo.masjid.name);
            }
          }
        } catch (err) {
          console.warn('Could not refresh device info from API:', err);
          // Keep using localStorage values - device is still paired
        }
        setIsLoading(false);
        return;
      }

      try {
        if (savedDeviceId) {
          // Device was previously registered, check its status
          const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
          setDevice(deviceInfo);

          // Check if device is paired from API response
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
          // New device - need to register
          await registerNewDevice();
        }
      } catch (err) {
        console.error('Error loading device:', err);
        // Only register new device if we don't have a masjid_id
        if (!savedMasjidId) {
          await registerNewDevice();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDevice();
  }, []);

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
    checkPairingStatus,
    resetDevice,
  };
};
