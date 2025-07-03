import React, { useState, useCallback } from 'react';
import type { MediaItem, Album, MoreInfoResult } from '../types';
import { analyzeImage, getMoreInfo } from '../services/geminiService';
import Spinner from './Spinner';
import Tag from './Tag';
import { SparklesIcon } from './icons';

interface MediaDetailModalProps {
    item: MediaItem;
    onClose: () => void;
    onUpdate: (item: MediaItem) => void;
    albums: Album[];
    onToggleMediaInAlbum: (albumId: string, mediaId: number) => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ item, onClose, onUpdate, albums, onToggleMediaInAlbum }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const [isFetchingInfo, setIsFetchingInfo] = useState(false);
    const [moreInfo, setMoreInfo] = useState<MoreInfoResult | null>(null);
    const [infoError, setInfoError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
            const response = await fetch(item.url);
            if (!response.ok) throw new Error("Görsel verisi alınamadı.");
            const imageBlob = await response.blob();
            
            const result = await analyzeImage(imageBlob);
            const updatedItem = {
                ...item,
                analyzed: true,
                description: result.description,
                tags: result.tags,
            };
            onUpdate(updatedItem);
        } catch (error: any) {
            console.error("Analiz sırasında hata:", error);
            const errorMessage = error.message || "Bilinmeyen bir analiz hatası oluştu.";
            setAnalysisError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    }, [item, onUpdate]);

    const handleGetMoreInfo = useCallback(async () => {
        if (!item.analyzed) return;
        setIsFetchingInfo(true);
        setInfoError(null);
        setMoreInfo(null);
        try {
             const response = await fetch(item.url);
             if (!response.ok) throw new Error("Görsel verisi alınamadı.");
             const imageBlob = await response.blob();
             const result = await getMoreInfo(imageBlob);
             if(result) {
                setMoreInfo(result);
             } else {
                throw new Error("AI ek bilgi üretemedi.");
             }
        } catch (error: any) {
            console.error("Daha fazla bilgi alınırken hata:", error);
            setInfoError(error.message || "Bilgi alınırken bir hata oluştu.");
        } finally {
            setIsFetchingInfo(false);
        }
    }, [item.url, item.analyzed]);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-pardus-dark text-pardus-text w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Resim Paneli */}
                <div className="w-full md:w-2/3 bg-black flex items-center justify-center">
                    <img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Bilgi Paneli */}
                <div className="w-full md:w-1/3 p-6 flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-2">
                        <h2 className="text-2xl font-bold mb-2 break-words">{item.title}</h2>
                        
                        <div className="mt-4">
                            <h3 className="font-semibold text-pardus-text-dark mb-2">AI Açıklaması</h3>
                            <p className="text-sm italic">{item.description || "Henüz analiz edilmedi."}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold text-pardus-text-dark mb-3">AI Etiketleri</h3>
                            <div className="flex flex-wrap">
                                {item.tags && item.tags.length > 0 ? (
                                    item.tags.map(tag => <Tag key={tag} label={tag} />)
                                ) : (
                                    <p className="text-sm text-pardus-text-dark">Etiket bulunamadı.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold text-pardus-text-dark mb-3">Albümler</h3>
                            <div className="flex flex-col gap-2">
                                {albums.length > 0 ? albums.map(album => {
                                    const isInAlbum = album.mediaIds.includes(item.id);
                                    return (
                                        <button 
                                            key={album.id}
                                            onClick={() => onToggleMediaInAlbum(album.id, item.id)}
                                            className={`w-full text-left text-sm font-semibold p-2 rounded-md transition-colors ${isInAlbum ? 'bg-pardus-accent/80 text-white' : 'bg-pardus-light-dark hover:bg-pardus-light-dark/70 text-pardus-text'}`}
                                        >
                                            {isInAlbum ? '✓ ' : '+ '} {album.title}
                                        </button>
                                    )
                                }) : (
                                     <p className="text-sm text-pardus-text-dark">Hiç albüm oluşturulmadı.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* More Info Section */}
                        {moreInfo && (
                             <div className="mt-6 p-3 bg-pardus-light-dark/70 rounded-lg animate-fade-in">
                                <h4 className="font-bold text-pardus-accent">{moreInfo.title}</h4>
                                <p className="text-sm mt-1">{moreInfo.content}</p>
                            </div>
                        )}
                        {infoError && <p className="text-red-400 text-sm mt-4 text-center">{infoError}</p>}
                        {isFetchingInfo && <div className="mt-4"><Spinner /></div>}
                    </div>

                    {/* Eylem Butonları */}
                    <div className="mt-auto pt-4 flex flex-col gap-2">
                        {analysisError && <p className="text-red-400 text-sm mb-2 text-center">{analysisError}</p>}
                        
                        {!item.analyzed && !isAnalyzing && (
                            <button
                                onClick={handleAnalyze}
                                className="w-full flex items-center justify-center bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                AI ile Analiz Et
                            </button>
                        )}
                        {isAnalyzing && (
                            <div className="w-full flex items-center justify-center bg-pardus-light-dark text-white font-bold py-3 px-4 rounded-lg">
                                <Spinner />
                                <span className="ml-3">Analiz ediliyor...</span>
                            </div>
                        )}
                        
                        {item.analyzed && !isAnalyzing && !isFetchingInfo && (
                           <button
                                onClick={handleGetMoreInfo}
                                className="w-full flex items-center justify-center bg-pardus-light-dark hover:bg-pardus-accent-hover/20 border border-pardus-accent text-pardus-accent font-bold py-2 px-4 rounded-lg transition-all duration-200"
                            >
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Daha Fazla Bilgi Al
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-pardus-accent transition-colors text-3xl font-bold"
                aria-label="Kapat"
            >
                &times;
            </button>
        </div>
    );
};

export default MediaDetailModal;