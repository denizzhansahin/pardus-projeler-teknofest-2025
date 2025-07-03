import React, { useState } from 'react';
import type { Album, MediaItem } from '../types';
import { PlusCircleIcon, TrashIcon, CollectionIcon } from './icons';

interface AlbumsViewProps {
    albums: Album[];
    mediaItems: MediaItem[];
    onAddAlbum: (albumData: Pick<Album, 'title' | 'description'>) => void;
    onDeleteAlbum: (albumId: string) => void;
    onViewAlbum: (album: Album) => void;
}

const AlbumsView: React.FC<AlbumsViewProps> = ({ albums, mediaItems, onAddAlbum, onDeleteAlbum, onViewAlbum }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAddAlbum({ title, description });
        setTitle('');
        setDescription('');
        setIsFormVisible(false);
    };
    
    const handleDeleteConfirm = (albumId: string) => {
        onDeleteAlbum(albumId);
        setConfirmingDeleteId(null);
    }

    const getAlbumThumbnail = (album: Album) => {
        if (album.mediaIds.length > 0) {
            const firstImage = mediaItems.find(item => item.id === album.mediaIds[0]);
            return firstImage?.url;
        }
        return null;
    };

    return (
        <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-pardus-text">Albümler</h2>
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="flex items-center justify-center bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>{isFormVisible ? 'Vazgeç' : 'Yeni Albüm Oluştur'}</span>
                </button>
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="bg-pardus-light-dark/50 p-4 rounded-lg mb-6 animate-slide-in">
                    <h3 className="text-xl font-semibold text-pardus-text mb-3">Yeni Albüm</h3>
                    <div className="mb-3">
                        <label htmlFor="title" className="block text-pardus-text-dark text-sm font-bold mb-2">Başlık</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-pardus-dark text-pardus-text rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pardus-accent"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-pardus-text-dark text-sm font-bold mb-2">Açıklama (İsteğe Bağlı)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-pardus-dark text-pardus-text rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pardus-accent"
                        />
                    </div>
                    <button type="submit" className="bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-2 px-4 rounded-lg">
                        Albümü Oluştur
                    </button>
                </form>
            )}

            {albums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {albums.map(album => {
                        const thumbnailUrl = getAlbumThumbnail(album);
                        return (
                            <div key={album.id} className="group bg-pardus-light-dark rounded-lg shadow-lg overflow-hidden flex flex-col">
                                <div onClick={() => confirmingDeleteId !== album.id && onViewAlbum(album)} className="relative h-48 cursor-pointer">
                                    {thumbnailUrl ? (
                                        <img src={thumbnailUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-pardus-dark flex items-center justify-center">
                                            <CollectionIcon className="w-16 h-16 text-pardus-text-dark opacity-50"/>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-bold text-pardus-text text-lg">{album.title}</h3>
                                    <p className="text-pardus-text-dark text-sm flex-grow">{album.description}</p>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-pardus-dark">
                                        <span className="text-xs text-pardus-text-dark">{album.mediaIds.length} öğe</span>
                                        
                                        {confirmingDeleteId === album.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-pardus-text">Emin misiniz?</span>
                                                <button onClick={() => handleDeleteConfirm(album.id)} className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Evet</button>
                                                <button onClick={() => setConfirmingDeleteId(null)} className="text-xs font-bold bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Hayır</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setConfirmingDeleteId(album.id)}
                                                className="p-1 text-pardus-text-dark hover:text-red-400 transition-colors"
                                                aria-label="Albümü Sil"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center p-10 bg-pardus-light-dark/20 rounded-lg text-pardus-text-dark">
                    <p>Henüz hiç albüm oluşturulmadı.</p>
                    <p className="mt-2 text-sm">Başlamak için "Yeni Albüm Oluştur" düğmesini kullanın.</p>
                </div>
            )}
        </div>
    );
};

export default AlbumsView;