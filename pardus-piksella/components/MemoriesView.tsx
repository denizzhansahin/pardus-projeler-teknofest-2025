import React, { useState, useCallback } from 'react';
import type { MediaItem, Memory } from '../types';
import { suggestMemories } from '../services/geminiService';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';

interface MemoriesViewProps {
    mediaItems: MediaItem[];
    memories: Memory[];
    onAddMemory: (memory: Omit<Memory, 'id'>) => void;
    onViewMemory: (memory: Memory) => void;
}

const MemoriesView: React.FC<MemoriesViewProps> = ({ mediaItems, memories, onAddMemory, onViewMemory }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateMemories = useCallback(async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const newMemories = await suggestMemories(mediaItems);
            if (newMemories.length === 0) {
                setError("Yeni anı oluşturmak için yeterli analiz edilmiş görsel bulunamadı veya AI bir tema öneremedi.");
            }
            newMemories.forEach(mem => onAddMemory(mem));
        } catch (e: any) {
            setError(e.message || "Anı oluşturulurken bir hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    }, [mediaItems, onAddMemory]);

    const getMemoryThumbnail = (memory: Memory) => {
        const firstImageId = memory.imageIds[0];
        const item = mediaItems.find(i => i.id === firstImageId);
        return item?.url;
    }

    return (
        <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-pardus-text">Anılar</h2>
                <button
                    onClick={handleGenerateMemories}
                    disabled={isGenerating}
                    className="flex items-center justify-center bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Spinner />
                            <span className="ml-2">Oluşturuluyor...</span>
                        </>
                    ) : (
                         <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            <span>AI ile Anı Öner</span>
                         </>
                    )}
                </button>
            </div>
            
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">{error}</div>}

            {memories.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map(memory => (
                        <div key={memory.id} onClick={() => onViewMemory(memory)} className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg bg-pardus-light-dark transform hover:scale-105 transition-transform duration-300">
                           <img src={getMemoryThumbnail(memory)} alt={memory.title} className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                           <div className="absolute bottom-0 left-0 p-4">
                                <h3 className="text-white text-xl font-bold">{memory.title}</h3>
                                <p className="text-gray-300 text-sm">{memory.imageIds.length} öğe</p>
                           </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="text-center p-10 text-pardus-text-dark">
                    <p>Henüz hiç anı oluşturulmadı.</p>
                    <p className="mt-2 text-sm">AI'dan sizin için anılar oluşturmasını istemek için yukarıdaki düğmeyi kullanın.</p>
                </div>
            )}
        </div>
    );
};

export default MemoriesView;