import React from 'react';
import type { DailyHighlight, MediaItem } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface DailyHighlightProps {
    highlight: DailyHighlight;
    allItems: MediaItem[];
    onItemClick: (item: MediaItem) => void;
}

const DailyHighlightComponent: React.FC<DailyHighlightProps> = ({ highlight, allItems, onItemClick }) => {
    const highlightedItems = highlight.imageIds
        .map(id => allItems.find(item => item.id === id))
        .filter((item): item is MediaItem => !!item);

    if (highlightedItems.length === 0) return null;

    return (
        <div className="mx-4 mb-6 p-4 bg-pardus-light-dark/30 rounded-2xl animate-fade-in border border-pardus-accent/30 shadow-lg">
            <div className="flex items-center mb-3">
                <SparklesIcon className="h-6 w-6 text-pardus-accent" />
                <h3 className="text-xl font-bold ml-2 text-pardus-text">Günün Özeti</h3>
            </div>
            <p className="text-pardus-text-dark mb-4 text-sm italic">"{highlight.summary}"</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {highlightedItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative cursor-pointer overflow-hidden rounded-lg transform hover:scale-105 transition-transform duration-300"
                        onClick={() => onItemClick(item)}
                        style={{ animation: `fadeIn 0.5s ease-out ${index * 100}ms forwards`, opacity: 0 }}
                    >
                        <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-24 object-cover"
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyHighlightComponent;