// import { useState, useEffect, useCallback } from 'react';
// import { apiService } from '../services/api';
// import type { Device } from '../types';

// export const useDeviceRegistration = () => {
//   const [device, setDevice] = useState<Device | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isPaired, setIsPaired] = useState(false);

//   // Load device from localStorage
//   useEffect(() => {
//     const loadDevice = async () => {
//       try {
//         const savedDeviceId = localStorage.getItem('device_id');
//         const savedMasjidId = localStorage.getItem('masjid_id');

//         if (savedDeviceId && savedMasjidId) {
//           // Device was previously registered and paired
//           const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
//           setDevice(deviceInfo);
//           setIsPaired(true);
//         } else if (savedDeviceId) {
//           // Device registered but not paired yet
//           const deviceInfo = await apiService.getDeviceInfo(savedDeviceId);
//           setDevice(deviceInfo);
//           setIsPaired(false);
//         } else {
//           // New device - need to register
//           await registerNewDevice();
//         }
//       } catch (err) {
//         console.error('Error loading device:', err);
//         // If there's an error, try registering a new device
//         await registerNewDevice();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDevice();
//   }, []);

//   const registerNewDevice = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const response = await apiService.registerDevice();
//       const newDevice = response.device;

//       setDevice(newDevice);
//       localStorage.setItem('device_id', newDevice.id);
//       localStorage.setItem('pairing_code', newDevice.pairingCode);

//       setIsPaired(false);
//     } catch (err: any) {
//       setError(err.message || 'Failed to register device');
//       console.error('Device registration error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const checkPairingStatus = useCallback(async () => {
//     if (!device) return false;

//     try {
//       const status = await apiService.checkPairingStatus(device.id);

//       if (status.isPaired && status.masjidId) {
//         setIsPaired(true);
//         localStorage.setItem('masjid_id', status.masjidId);
//         if (status.masjidName) {
//           localStorage.setItem('masjid_name', status.masjidName);
//         }
//         return true;
//       }

//       return false;
//     } catch (err) {
//       console.error('Error checking pairing status:', err);
//       return false;
//     }
//   }, [device]);

//   const resetDevice = useCallback(() => {
//     localStorage.removeItem('device_id');
//     localStorage.removeItem('masjid_id');
//     localStorage.removeItem('masjid_name');
//     localStorage.removeItem('pairing_code');
//     localStorage.removeItem('device_token');
//     apiService.clearAuthToken();
//     setDevice(null);
//     setIsPaired(false);
//     registerNewDevice();
//   }, []);

//   return {
//     device,
//     isPaired,
//     isLoading,
//     error,
//     checkPairingStatus,
//     resetDevice,
//   };
// };

import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";

export const useDeviceRegistration = () => {
  const [device, setDevice] = useState<any>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pairingCode = localStorage.getItem("pairing_code");
  const masjidId = localStorage.getItem("masjid_id");

  // Load device from localStorage (paired or not)
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      try {
        if (pairingCode) {
          // See if this pairing code is still valid
          const config = await apiService.pairDevice(pairingCode);

          setDevice(config.data);
          setIsPaired(true);

          // Store masjid ID & name
          if (config.data.masjidId)
            localStorage.setItem("masjid_id", config.data.masjidId);
          if (config.data.masjidName)
            localStorage.setItem("masjid_name", config.data.masjidName);

          setIsLoading(false);
          return;
        }
      } catch (err) {
        // pairing code invalid → must enter a new one
        setIsPaired(false);
      }

      setIsLoading(false);
    }

    load();
  }, []);

  // TV App calls this when user enters code
  const pairDevice = async (pairingCode: string): Promise<boolean> => {
    try {
      const response = await apiService.pairDevice(pairingCode);

      if (!response || !response.device) {
        return false;
      }

      const device = response.device;

      // Save device info
      localStorage.setItem('device_id', device.id);
      localStorage.setItem('masjid_id', device.masjidId);
      if (device.masjidName) {
        localStorage.setItem('masjid_name', device.masjidName);
      }

      setDevice(device);
      setIsPaired(true);
      return true;
    } catch (err) {
      console.error("Pairing failed:", err);
      return false;
    }
  };


  // Allows DeviceSetup to re-check pairing status
  const checkPairingStatus = useCallback(async () => {
    if (!pairingCode) return false;

    try {
      const config = await apiService.pairDevice(pairingCode);

      setDevice(config.data);
      setIsPaired(true);
      return true;
    } catch {
      setIsPaired(false);
      return false;
    }
  }, [pairingCode]);

  const resetDevice = useCallback(() => {
    localStorage.removeItem("pairing_code");
    localStorage.removeItem("masjid_id");
    localStorage.removeItem("masjid_name");

    setDevice(null);
    setIsPaired(false);
  }, []);

  return {
    device,
    isPaired,
    isLoading,
    pairDevice,
    checkPairingStatus,
    resetDevice,
  };
};
