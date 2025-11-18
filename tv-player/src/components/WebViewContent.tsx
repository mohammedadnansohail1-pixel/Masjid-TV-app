import { useState } from 'react';
import type { MediaContent } from '../types';

interface WebViewContentProps {
  media: MediaContent;
}

export const WebViewContent = ({ media }: WebViewContentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-3xl mb-4">
            Failed to load external content
          </div>
          <div className="text-gray-400 text-xl">
            URL: {media.url}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative animate-fade-in">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-islamic-gold mx-auto mb-4"></div>
            <div className="text-white text-2xl">Loading content...</div>
          </div>
        </div>
      )}

      {/* iFrame */}
      <iframe
        src={media.url}
        title={media.title || 'External content'}
        className="w-full h-screen border-0"
        onLoad={handleLoad}
        onError={handleError}
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  );
};
