import React, { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { BookUpIcon } from '../icons/BookUpIcon';
import { RewindIcon } from '../icons/RewindIcon';
import { FastForwardIcon } from '../icons/FastForwardIcon';

interface ScrollingReaderExerciseProps {
  onBack: () => void;
}

const ScrollingReaderExercise: React.FC<ScrollingReaderExerciseProps> = ({ onBack }) => {
  const [words, setWords] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(250);
  const [chunkSize, setChunkSize] = useState(1);
  
  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const stopExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetState = useCallback(() => {
    stopExercise();
    setWords([]);
    setBookTitle(null);
    setCurrentIndex(0);
  }, [stopExercise]);
  
  const handleStartPause = useCallback(() => {
    if (isRunning) {
      stopExercise();
    } else {
      if (currentIndex >= words.length && words.length > 0) {
        setCurrentIndex(0);
      }
      setIsRunning(true);
    }
  }, [isRunning, stopExercise, currentIndex, words.length]);

  const handleBackward = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 10));
  }, []);

  const handleForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 10, words.length > 0 ? words.length - 1 : 0));
  }, [words.length]);

  useEffect(() => {
    if (!isRunning || words.length === 0) return;
    const interval = (60000 / wpm) * chunkSize;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => {
          if (prevIndex + chunkSize >= words.length) {
              stopExercise();
              return prevIndex;
          }
          return prevIndex + chunkSize
      });
    }, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, wpm, words, chunkSize, stopExercise]);
  
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex]);

  const extractTextFromBook = async (book: any): Promise<string> => {
    await book.ready;
    const sections = await Promise.all(
        book.spine.spineItems.map((item: any) =>
            book.load(item.href).then((contents: any) => {
                const body = contents?.body || contents;
                const text = body.innerText || body.textContent || '';
                return text.trim().replace(/\s\s+/g, ' ');
            })
        )
    );
    return sections.join(' ');
  };

  const processFile = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/epub+zip') {
      setError('Lütfen geçerli bir .epub dosyası seçin.');
      return;
    }
    setError('');
    setIsLoading(true);
    resetState();
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) throw new Error('Dosya okunamadı.');
        
        const book = ePub(e.target.result as ArrayBuffer);
        const metadata = await book.loaded.metadata;
        setBookTitle(metadata.title || 'İsimsiz Kitap');
        
        const allText = await extractTextFromBook(book);
        const parsedWords = allText.trim().split(/\s+/).filter(Boolean);
        
        if (parsedWords.length === 0) throw new Error('Kitapta okunabilir metin bulunamadı.');
        
        setWords(parsedWords);
      } catch (err) {
        console.error("EPUB işlenirken hata:", err);
        const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
        setError(`EPUB işlenemedi. ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError('Dosya okunurken bir hata oluştu.');
        setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, [resetState]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  const triggerFileSelect = () => fileInputRef.current?.click();

  const isFinished = currentIndex >= words.length - chunkSize && words.length > 0;
  const canStart = words.length > 0 && !isLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500 mb-4"></div>
          <p className="font-semibold">Kitap İşleniyor...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
          <p className="font-bold mb-2">Hata!</p>
          <p className="text-center mb-4">{error}</p>
          <button onClick={triggerFileSelect} className="text-lime-600 dark:text-lime-400 font-semibold hover:underline">Tekrar Dene</button>
        </div>
      );
    }
    
    if (words.length === 0) {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-lime-400'}`}
        >
          <BookUpIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">EPUB dosyasını buraya sürükleyin</p>
          <p className="text-slate-500 dark:text-slate-400">veya seçmek için tıklayın</p>
        </div>
      );
    }

    return (
        <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto p-4 md:p-6 text-xl md:text-2xl leading-relaxed text-left font-serif scroll-smooth">
            {words.map((word, index) => {
                const isPartOfChunk = index >= currentIndex && index < currentIndex + chunkSize;
                const isActiveWord = index === currentIndex;
                return (
                    <span
                        key={index}
                        ref={isActiveWord ? activeWordRef : null}
                        className={`transition-colors duration-200 ease-in-out ${isPartOfChunk ? 'bg-lime-200 dark:bg-lime-700/80 text-slate-900 dark:text-white rounded' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                        {word}{' '}
                    </span>
                );
            })}
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
        {bookTitle && (
            <button onClick={resetState} className="text-sm text-slate-500 hover:text-lime-500">
                Farklı Kitap Yükle
            </button>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-lime-600 dark:text-lime-400 mb-2">Kaydırarak Okuma</h2>
                {bookTitle && <p className="text-slate-600 dark:text-slate-400 truncate max-w-sm">Kitap: {bookTitle}</p>}
            </div>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".epub" className="hidden" />

        <div className="relative w-full h-96 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
          {renderContent()}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 ${!canStart && 'opacity-50 pointer-events-none'}`}>
          <div>
            <label htmlFor="epub-wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
            <input type="range" id="epub-wpm" min="50" max="1500" step="10" value={wpm} onChange={e => setWpm(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500" disabled={!canStart} />
          </div>
          <div>
            <label htmlFor="epub-chunk" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grup Boyutu: {chunkSize} kelime</label>
            <input type="range" id="epub-chunk" min="1" max="5" step="1" value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500" disabled={!canStart || isRunning} />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <button onClick={handleBackward} disabled={!canStart} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <RewindIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Geri</span>
          </button>
          <button onClick={handleStartPause} disabled={!canStart} className="flex items-center justify-center space-x-3 w-36 px-4 py-3 rounded-md bg-lime-500 hover:bg-lime-600 text-white font-bold disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-transform active:scale-95">
            {isRunning ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
            <span className="text-lg">{isRunning ? 'Durdur' : (isFinished ? 'Baştan' : 'Başlat')}</span>
          </button>
           <button onClick={handleForward} disabled={!canStart} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span className="hidden sm:inline">İleri</span>
            <FastForwardIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrollingReaderExercise;