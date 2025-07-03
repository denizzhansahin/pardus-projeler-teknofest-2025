import React from 'react';
import type { MediaItem } from '../types';
import MediaItemComponent from './MediaItem';

interface MediaGridProps {
    items: MediaItem[];
    onItemClick: (item: MediaItem) => void;
    headerText: string;
    emptyStateMessage?: React.ReactNode;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onItemClick, headerText, emptyStateMessage }) => {
    
    return (
        <div className="p-4">
             <h2 className="text-2xl font-bold text-pardus-text mb-4 px-2">{headerText}</h2>
            {items.length === 0 ? (
                 <div className="text-center p-10 bg-pardus-light-dark/20 rounded-lg text-pardus-text-dark">
                    {emptyStateMessage || "Gösterilecek hiçbir öğe yok."}
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map((item, index) => (
                        <MediaItemComponent key={item.id} item={item} index={index} onClick={onItemClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaGrid;