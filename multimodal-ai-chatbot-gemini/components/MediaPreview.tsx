
import React from 'react';
import { MediaAttachment, MediaType } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface MediaPreviewProps {
  media: MediaAttachment;
  isLoading?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ media, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-32 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg my-2">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface/50 dark:bg-gray-700/30 shadow-sm max-w-xs">
      {media.type === MediaType.Image && (
        <img
          src={media.url}
          alt={media.name || 'Uploaded image'}
          className="max-w-full max-h-64 rounded-md object-contain"
        />
      )}
      {media.type === MediaType.Video && (
        <video
          src={media.url}
          controls
          className="max-w-full max-h-64 rounded-md"
          aria-label={media.name || 'Uploaded video'}
        >
          video etiketini desteklenmiyor.
        </video>
      )}
      {media.type === MediaType.Audio && (
        <div className="py-2">
          <audio
            src={media.url}
            controls
            className="w-full rounded-md"
            aria-label={media.name || 'Uploaded audio'}
          >
            Ses etiketini desteklenmiyor.
          </audio>
        </div>
      )}
      <p className="text-xs text-textSecondary dark:text-gray-400 mt-1 truncate" title={media.name}>{media.name}</p>
    </div>
  );
};

export default MediaPreview;