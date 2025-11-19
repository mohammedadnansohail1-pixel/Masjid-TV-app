// import { useEffect, useState } from 'react';
// import type { Device } from '../types';

// interface DeviceSetupProps {
//   device: Device;
//   onPaired: () => void;
//   checkPairingStatus: () => Promise<boolean>;
// }

// export const DeviceSetup = ({ device, onPaired, checkPairingStatus }: DeviceSetupProps) => {
//   const [dots, setDots] = useState('');

//   // Animated dots for "waiting" effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
//     }, 500);

//     return () => clearInterval(interval);
//   }, []);

//   // Poll for pairing status
//   useEffect(() => {
//     const pollInterval = setInterval(async () => {
//       const isPaired = await checkPairingStatus();
//       if (isPaired) {
//         onPaired();
//       }
//     }, 3000); // Check every 3 seconds

//     return () => clearInterval(pollInterval);
//   }, [checkPairingStatus, onPaired]);

//   const formatPairingCode = (code: string) => {
//     // Format as XXX-XXX for better readability
//     if (code.length === 6) {
//       return `${code.slice(0, 3)}-${code.slice(3)}`;
//     }
//     return code;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen flex items-center justify-center p-8">
//       <div className="max-w-4xl w-full">
//         <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-fade-in">
//           {/* Logo/Icon */}
//           <div className="mb-8">
//             <div className="w-32 h-32 bg-islamic-gold rounded-full mx-auto flex items-center justify-center">
//               <svg
//                 className="w-20 h-20 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                 />
//               </svg>
//             </div>
//           </div>

//           {/* Title */}
//           <h1 className="text-5xl font-bold text-gray-800 mb-4">
//             Masjid TV Player
//           </h1>

//           <p className="text-2xl text-gray-600 mb-12">
//             Device Setup Required
//           </p>

//           {/* Pairing Code */}
//           <div className="bg-gray-50 rounded-2xl p-8 mb-8 border-4 border-islamic-gold">
//             <p className="text-2xl text-gray-600 mb-4">Enter this code in the admin dashboard:</p>
//             <div className="text-9xl font-bold text-islamic-darkGreen tracking-widest font-mono">
//               {formatPairingCode(device.pairingCode)}
//             </div>
//           </div>

//           {/* Instructions */}
//           <div className="text-left bg-blue-50 rounded-xl p-6 mb-6">
//             <h3 className="text-2xl font-semibold text-gray-800 mb-4">Setup Instructions:</h3>
//             <ol className="space-y-3 text-xl text-gray-700">
//               <li className="flex items-start">
//                 <span className="font-bold text-islamic-gold mr-3">1.</span>
//                 <span>Open the Masjid Admin Dashboard on your computer or phone</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="font-bold text-islamic-gold mr-3">2.</span>
//                 <span>Navigate to TV Devices section</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="font-bold text-islamic-gold mr-3">3.</span>
//                 <span>Click "Pair New Device" and enter the code above</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="font-bold text-islamic-gold mr-3">4.</span>
//                 <span>This screen will automatically proceed once paired</span>
//               </li>
//             </ol>
//           </div>

//           {/* Waiting status */}
//           <div className="flex items-center justify-center text-xl text-gray-500">
//             <div className="animate-pulse">
//               <span>Waiting for pairing{dots}</span>
//             </div>
//           </div>

//           {/* Device ID (small, for reference) */}
//           <p className="text-sm text-gray-400 mt-8">
//             Device ID: {device.id}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };


import { useState } from "react";

interface DeviceSetupProps {
  onPaired: () => void;
  pairDevice: (code: string) => Promise<boolean>;
}

export const DeviceSetup = ({ onPaired, pairDevice }: DeviceSetupProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError("Pairing code must be 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    const success = await pairDevice(code);

    if (success) {
      onPaired();
    } else {
      setError("Invalid pairing code. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">

          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Masjid TV Player
          </h1>

          <p className="text-2xl text-gray-600 mb-10">Enter Pairing Code</p>

          {/* Input */}
          <input
            className="w-full text-center text-5xl font-mono border-4 border-islamic-gold rounded-2xl p-6 tracking-widest"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="______"
          />

          {/* Error */}
          {error && (
            <p className="text-red-500 text-lg mt-4">{error}</p>
          )}

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-8 bg-islamic-gold text-white px-10 py-4 rounded-xl text-2xl font-bold w-full"
          >
            {loading ? "Pairing..." : "Pair Device"}
          </button>

          {/* Instructions */}
          <div className="text-left bg-blue-50 rounded-xl p-6 mt-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Instructions:
            </h3>
            <ol className="space-y-3 text-lg text-gray-700">
              <li>1. Open the Masjid Admin Dashboard</li>
              <li>2. Go to <b>TV Devices → Pair New Device</b></li>
              <li>3. Enter the 6-digit code shown there</li>
              <li>4. Then enter the same code here</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
