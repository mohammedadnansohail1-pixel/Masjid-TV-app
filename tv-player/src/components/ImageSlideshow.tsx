import { useState, useEffect, useRef } from 'react';
import type { MediaContent } from '../types';

interface ImageSlideshowProps {
  media: MediaContent;
}

export const ImageSlideshow = ({ media }: ImageSlideshowProps) => {
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload image when URL changes
  useEffect(() => {
    if (media.type !== 'image') {
      setIsReady(true);
      return;
    }

    setError(false);

    // Create a new image to preload
    const img = new Image();
    img.src = media.url;

    img.onload = () => {
      setIsReady(true);
    };

    img.onerror = () => {
      setError(true);
      console.error('Failed to load image:', media.url);
    };

    // If image is already cached, it loads immediately
    if (img.complete) {
      setIsReady(true);
    }
  }, [media.url, media.type]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-3xl">
          Failed to load media content
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Image - shows immediately without loading spinner */}
      {media.type === 'image' && (
        <img
          ref={imgRef}
          src={media.url}
          alt={media.title || 'Media content'}
          className="max-w-full max-h-screen object-contain animate-fade-in"
          onError={() => setError(true)}
        />
      )}

      {/* Video */}
      {media.type === 'video' && (
        <video
          src={media.url}
          className="max-w-full max-h-screen object-contain animate-fade-in"
          autoPlay
          muted
          loop
          onError={() => setError(true)}
        />
      )}

      {/* Title overlay if provided */}
      {media.title && isReady && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-12">
          <h3 className="text-4xl font-bold text-white text-center">
            {media.title}
          </h3>
        </div>
      )}
    </div>
  );
};
