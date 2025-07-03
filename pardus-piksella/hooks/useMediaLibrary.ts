import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { MediaItem, Memory, Album } from '../types';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'PardusPiksellaDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'mediaItems';
const MEMORIES_STORE = 'memories';
const ALBUMS_STORE = 'albums';

// This is the type for items stored in IndexedDB, where 'url' is a File object.
type StoredMediaItem = Omit<MediaItem, 'url'> & {
    url: File;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
    if (dbPromise) return dbPromise;
    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(MEMORIES_STORE)) {
                db.createObjectStore(MEMORIES_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
                db.createObjectStore(ALBUMS_STORE, { keyPath: 'id' });
            }
        },
    });
    return dbPromise;
};


export const useMediaLibrary = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const createdUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const db = await initDB();
            try {
                const mediaTx = db.transaction(MEDIA_STORE, 'readonly');
                const rawMediaItems = await mediaTx.objectStore(MEDIA_STORE).getAll() as StoredMediaItem[];
                
                const urls: string[] = [];
                const mediaWithUrls = rawMediaItems.map(item => {
                    const url = URL.createObjectURL(item.url);
                    urls.push(url);
                    return {...item, url};
                });
                createdUrlsRef.current = urls;
                setMediaItems(mediaWithUrls);
                
                const memoriesTx = db.transaction(MEMORIES_STORE, 'readonly');
                const storedMemories = await memoriesTx.objectStore(MEMORIES_STORE).getAll();
                setMemories(storedMemories);

                const albumsTx = db.transaction(ALBUMS_STORE, 'readonly');
                const storedAlbums = await albumsTx.objectStore(ALBUMS_STORE).getAll();
                setAlbums(storedAlbums);

            } catch (error) {
                console.error("IndexedDB'den veri yüklenirken hata oluştu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
        
        // Cleanup object URLs on unmount to prevent memory leaks
        return () => {
            createdUrlsRef.current.forEach(URL.revokeObjectURL);
        };
    }, []);

    const addMediaItems = useCallback(async (files: FileList) => {
        // FileList'i hemen Array'e çevir
        const fileArr = Array.from(files);
        console.log('Yükleme başlatıldı:', fileArr.map(f => f.name), fileArr);
        const db = await initDB();
        const itemsToStore: StoredMediaItem[] = [];
        const itemsToState: MediaItem[] = [];
        const newUrls: string[] = [];

        // Desteklenen uzantılar ve mime tipleri
        const allowedExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.heic', '.avif', '.tiff', '.tif'
        ];
        const allowedMimePrefixes = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp', 'image/heic', 'image/avif', 'image/tiff'
        ];

        for (const file of fileArr) {
            const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
            const isAllowedExt = allowedExtensions.includes(ext);
            const isAllowedMime = allowedMimePrefixes.some(prefix => file.type.startsWith(prefix));
            if (!isAllowedExt && !isAllowedMime) continue;

            const id = Date.now() + Math.random();
            const url = URL.createObjectURL(file);
            newUrls.push(url);

            itemsToStore.push({
                id,
                type: 'image',
                url: file, // Store the file/blob in DB
                title: file.name,
                analyzed: false,
                tags: [],
                description: '',
            });
            
            itemsToState.push({
                id,
                type: 'image',
                url: url, // Store the object URL in state
                title: file.name,
                analyzed: false,
                tags: [],
                description: '',
            });
        }

        if (itemsToStore.length > 0) {
            try {
                const tx = db.transaction(MEDIA_STORE, 'readwrite');
                await Promise.all([...itemsToStore.map(item => tx.objectStore(MEDIA_STORE).put(item)), tx.done]);
                
                // Update state only after successful DB transaction
                setMediaItems(prevItems => {
                  const yeni = [...prevItems, ...itemsToState];
                  console.log('State güncellendi:', yeni);
                  return yeni;
                });
                createdUrlsRef.current.push(...newUrls);

            } catch (error) {
                 console.error("Yeni medya öğeleri eklenirken hata:", error);
                 // Rollback URL creation if DB write fails
                 newUrls.forEach(URL.revokeObjectURL);
            }
        } else {
            console.warn('Yüklenen dosya yok veya dosya tipi/uzantısı desteklenmiyor.');
        }
    }, []);

    const updateMediaItem = useCallback(async (updatedItem: MediaItem) => {
        const db = await initDB();
        
        const originalItem = await db.get(MEDIA_STORE, updatedItem.id) as StoredMediaItem;
        if(!originalItem) return;

        const { url, ...restOfUpdatedItem } = updatedItem;
        const itemToStore: StoredMediaItem = {
            ...restOfUpdatedItem,
            url: originalItem.url 
        };

        await db.put(MEDIA_STORE, itemToStore);
        setMediaItems(prevItems => {
            const newItems = prevItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );
            return newItems;
        });
    }, []);

    const addMemory = useCallback(async (memory: Omit<Memory, 'id'>) => {
        const db = await initDB();
        const newMemory = { ...memory, id: `mem-${Date.now()}` };
        await db.put(MEMORIES_STORE, newMemory);
        setMemories(prev => [...prev, newMemory]);
    }, []);

    const addAlbum = useCallback(async (albumData: Pick<Album, 'title' | 'description'>) => {
        const db = await initDB();
        const newAlbum: Album = { ...albumData, id: `album-${Date.now()}`, mediaIds: [] };
        await db.put(ALBUMS_STORE, newAlbum);
        setAlbums(prev => [...prev, newAlbum]);
    }, []);

    const deleteAlbum = useCallback(async (albumId: string) => {
        const db = await initDB();
        await db.delete(ALBUMS_STORE, albumId);
        setAlbums(prev => prev.filter(album => album.id !== albumId));
    }, []);

    const toggleMediaInAlbum = useCallback(async (albumId: string, mediaId: number) => {
        const db = await initDB();
        const album = await db.get(ALBUMS_STORE, albumId) as Album;
        if (!album) return;
        
        const newMediaIds = album.mediaIds.includes(mediaId)
            ? album.mediaIds.filter(id => id !== mediaId)
            : [...album.mediaIds, mediaId];
        const updatedAlbum = { ...album, mediaIds: newMediaIds };

        await db.put(ALBUMS_STORE, updatedAlbum);
        setAlbums(prev => prev.map(a => a.id === albumId ? updatedAlbum : a));
    }, []);

    return { 
        mediaItems, 
        memories, 
        albums,
        isLoading,
        updateMediaItem, 
        addMediaItems, 
        addMemory,
        addAlbum,
        deleteAlbum,
        toggleMediaInAlbum
    };
};