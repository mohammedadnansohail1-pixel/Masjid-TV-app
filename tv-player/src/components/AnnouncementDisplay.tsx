import type { Announcement } from '../types';

interface AnnouncementDisplayProps {
  announcement: Announcement;
}

export const AnnouncementDisplay = ({ announcement }: AnnouncementDisplayProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-darkGreen to-islamic-lightGreen flex items-center justify-center p-12 animate-fade-in">
      <div className="max-w-6xl w-full">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
          {/* Image if available */}
          {announcement.imageUrl && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-12">
            {/* Title */}
            <h2 className="text-6xl font-bold text-islamic-darkGreen mb-8">
              {announcement.title}
            </h2>

            {/* Content */}
            <div className="text-3xl text-gray-700 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </div>
          </div>

          {/* Decorative bottom bar */}
          <div className="h-4 bg-gradient-to-r from-islamic-gold via-islamic-lightGreen to-islamic-gold" />
        </div>
      </div>
    </div>
  );
};
