import React from 'react';
import type { MediaItem } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface MediaItemProps {
    item: MediaItem;
    index: number;
    onClick: (item: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ item, index, onClick }) => {
    return (
        <div 
            className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 animate-slide-in"
            onClick={() => onClick(item)}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-bold truncate">{item.title}</h3>
            </div>
            {item.analyzed && (
                <div className="absolute top-2 right-2 p-1.5 bg-pardus-accent/80 rounded-full backdrop-blur-sm">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
};

export default MediaItemComponent;