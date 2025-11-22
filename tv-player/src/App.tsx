import { useState, useEffect, useCallback } from 'react';
import { DeviceSetup } from './components/DeviceSetup';
import { PrayerTimeDisplay } from './components/PrayerTimeDisplay';
import { AnnouncementDisplay } from './components/AnnouncementDisplay';
import { ImageSlideshow } from './components/ImageSlideshow';
import { WebViewContent } from './components/WebViewContent';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useWebSocket } from './hooks/useWebSocket';
import { useContentSchedule } from './hooks/useContentSchedule';
import { useFullscreen } from './hooks/useFullscreen';
import { apiService } from './services/api';
import {
  createContentRotation,
  getNextContent,
  shouldShowPrayerTimes,
  shouldShowAnnouncement,
  shouldShowMedia,
  type ContentItem,
} from './utils/contentRotation';
import type { TemplateType } from './types';

function App() {
  const [masjidId, setMasjidId] = useState<string | null>(
    localStorage.getItem('masjid_id')
  );
  const [masjidName, setMasjidName] = useState<string | null>(
    localStorage.getItem('masjid_name')
  );
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>('template1');
  const [contentRotation, setContentRotation] = useState<ContentItem[]>([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);

  // Custom hooks
  const {
    device,
    isPaired,
    isLoading: deviceLoading,
    pairDevice,
    checkPairingStatus,
  } = useDeviceRegistration();
  const { prayerTimes, refresh: refreshPrayerTimes } = usePrayerTimes(masjidId);
  const { schedule, announcements, media, refresh: refreshContent } = useContentSchedule(masjidId);
  const { isConnected } = useWebSocket(device?.id || null, masjidId, handleWebSocketMessage);
  const { isFullscreen } = useFullscreen(true);

  // Handle WebSocket messages
  function handleWebSocketMessage(message: any) {
    console.log('WebSocket message:', message);

    switch (message.type) {
      case 'prayer_times_updated':
        refreshPrayerTimes();
        break;
      case 'announcement_updated':
      case 'content_updated':
        refreshContent();
        break;
      case 'template_changed':
        if (message.data?.template) {
          setCurrentTemplate(message.data.template);
        }
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'device_paired':
        if (message.data?.masjidId) {
          setMasjidId(message.data.masjidId);
          if (message.data.masjidName) {
            setMasjidName(message.data.masjidName);
          }
        }
        break;
    }
  }

  // Handle successful pairing
  const handlePaired = useCallback(() => {
    const savedMasjidId = localStorage.getItem('masjid_id');
    const savedMasjidName = localStorage.getItem('masjid_name');

    if (savedMasjidId) {
      setMasjidId(savedMasjidId);
    }
    if (savedMasjidName) {
      setMasjidName(savedMasjidName);
    }
  }, []);

  // Create content rotation when schedule changes
  useEffect(() => {
    if (announcements.length > 0 || media.length > 0) {
      const rotation = createContentRotation(announcements, media);
      setContentRotation(rotation);
      setCurrentContentIndex(0);
    } else {
      // No content, just show prayer times
      setContentRotation([]);
      setCurrentContent({ type: 'prayer', duration: 30000 });
    }
  }, [announcements, media]);

  // Update current content based on index
  useEffect(() => {
    if (contentRotation.length > 0) {
      setCurrentContent(contentRotation[currentContentIndex]);
    }
  }, [contentRotation, currentContentIndex]);

  // Content rotation timer
  useEffect(() => {
    if (!currentContent) return;

    const timer = setTimeout(() => {
      if (contentRotation.length > 0) {
        const next = getNextContent(currentContentIndex, contentRotation);
        setCurrentContentIndex(next.index);
      }
    }, currentContent.duration);

    return () => clearTimeout(timer);
  }, [currentContent, currentContentIndex, contentRotation]);

  // Heartbeat to backend
  useEffect(() => {
    if (!device?.id || !isPaired) return;

    const heartbeatInterval = parseInt(
      import.meta.env.VITE_HEARTBEAT_INTERVAL || '30000'
    );

    const interval = setInterval(() => {
      apiService.sendHeartbeat(device.id);
    }, heartbeatInterval);

    return () => clearInterval(interval);
  }, [device?.id, isPaired]);

  // Update template from schedule
  useEffect(() => {
    if (schedule?.currentTemplate) {
      setCurrentTemplate(schedule.currentTemplate as TemplateType);
    }
  }, [schedule?.currentTemplate]);

  // Loading state
  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Device setup screen
  if (!isPaired && device) {
    return (
      <DeviceSetup
        device={device}
        onPaired={handlePaired}
        checkPairingStatus={checkPairingStatus}
      />
    );
  }

  // Main content display
  if (!prayerTimes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-2xl">Loading prayer times...</p>
        </div>
      </div>
    );
  }

  // Render current content
  const renderContent = () => {
    if (!currentContent) {
      return (
        <PrayerTimeDisplay
          prayerTimes={prayerTimes}
          template={currentTemplate}
          masjidName={masjidName || undefined}
          masjidLogo={schedule?.masjidLogo}
        />
      );
    }

    if (shouldShowPrayerTimes(currentContent)) {
      return (
        <PrayerTimeDisplay
          prayerTimes={prayerTimes}
          template={currentTemplate}
          masjidName={masjidName || undefined}
          masjidLogo={schedule?.masjidLogo}
        />
      );
    }

    if (shouldShowAnnouncement(currentContent)) {
      return <AnnouncementDisplay announcement={currentContent.data as any} />;
    }

    if (shouldShowMedia(currentContent)) {
      const mediaItem = currentContent.data as any;

      if (mediaItem.type === 'url') {
        return <WebViewContent media={mediaItem} />;
      }

      return <ImageSlideshow media={mediaItem} />;
    }

    // Default fallback
    return (
      <PrayerTimeDisplay
        prayerTimes={prayerTimes}
        template={currentTemplate}
        masjidName={masjidName || undefined}
        masjidLogo={schedule?.masjidLogo}
      />
    );
  };

  return (
    <div className="relative">
      {renderContent()}

      {/* Connection status indicator (only visible when not fullscreen or in debug mode) */}
      {(import.meta.env.VITE_DEBUG === 'true' || !isFullscreen) && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      )}

      {/* Debug info */}
      {import.meta.env.VITE_DEBUG === 'true' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
          <div>Device: {device?.id}</div>
          <div>Masjid: {masjidName || 'N/A'}</div>
          <div>Template: {currentTemplate}</div>
          <div>Content: {currentContent?.type || 'N/A'}</div>
          <div>Index: {currentContentIndex} / {contentRotation.length}</div>
        </div>
      )}
    </div>
  );
}

export default App;
