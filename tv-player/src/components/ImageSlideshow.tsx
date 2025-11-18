import { useState, useEffect } from 'react';
import type { MediaContent } from '../types';

interface ImageSlideshowProps {
  media: MediaContent;
}

export const ImageSlideshow = ({ media }: ImageSlideshowProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when media changes
    setImageLoaded(false);
    setError(false);
  }, [media.url]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
    console.error('Failed to load image:', media.url);
  };

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
    <div className="min-h-screen bg-black flex items-center justify-center animate-fade-in">
      {/* Loading indicator */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-islamic-gold"></div>
        </div>
      )}

      {/* Image */}
      {media.type === 'image' && (
        <img
          src={media.url}
          alt={media.title || 'Media content'}
          className={`max-w-full max-h-screen object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Video */}
      {media.type === 'video' && (
        <video
          src={media.url}
          className="max-w-full max-h-screen object-contain"
          autoPlay
          muted
          loop
          onLoadedData={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Title overlay if provided */}
      {media.title && imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-12">
          <h3 className="text-4xl font-bold text-white text-center">
            {media.title}
          </h3>
        </div>
      )}
    </div>
  );
};
