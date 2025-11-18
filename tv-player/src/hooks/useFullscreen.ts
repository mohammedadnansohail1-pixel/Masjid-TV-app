import { useEffect, useState, useCallback } from 'react';

export const useFullscreen = (autoEnter = true) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }

      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      setIsFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    // Check fullscreen state
    const checkFullscreen = () => {
      const isFull =
        !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement;

      setIsFullscreen(isFull);
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    // Auto-enter fullscreen on mount if enabled
    if (autoEnter) {
      // Delay to avoid issues with some browsers
      const timer = setTimeout(() => {
        if (!isFullscreen) {
          enterFullscreen();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, [autoEnter, isFullscreen, enterFullscreen]);

  // Listen for Ctrl+Q to exit fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [exitFullscreen]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
