import React, { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { BookUpIcon } from '../icons/BookUpIcon';

interface EpubReaderExerciseProps {
  onBack: () => void;
}

const EpubReaderExercise: React.FC<EpubReaderExerciseProps> = ({ onBack }) => {
  const [words, setWords] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [displayText, setDisplayText] = useState('Kitap Yükleyin');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(250);
  const [chunkSize, setChunkSize] = useState(1);
  
  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const stopExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetExercise = useCallback(() => {
    stopExercise();
    setCurrentIndex(0);
    if (words.length > 0) {
      const chunk = words.slice(0, chunkSize).join(' ');
      setDisplayText(chunk);
    } else {
      setDisplayText('Kitap Yükleyin');
    }
  }, [stopExercise, words, chunkSize]);

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

  useEffect(() => {
    if (!isRunning || words.length === 0) return;
    const interval = (60000 / wpm) * chunkSize;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + chunkSize);
    }, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, wpm, words, chunkSize]);
  
  useEffect(() => {
    if (currentIndex >= words.length) {
      stopExercise();
      if (words.length > 0) setDisplayText('Bitti!');
    } else {
      const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
      setDisplayText(chunk);
    }
  }, [currentIndex, words, stopExercise, chunkSize]);

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
    setWords([]);
    setBookTitle(null);
    resetExercise();
    
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
        const firstChunk = parsedWords.slice(0, chunkSize).join(' ');
        setDisplayText(firstChunk);
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
  }, [resetExercise, chunkSize]);

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

  const isFinished = currentIndex >= words.length && words.length > 0;
  const canStart = words.length > 0 && !isLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="font-semibold">Kitap İşleniyor...</p>
          <p className="text-sm">{bookTitle}</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <p className="font-bold mb-2">Hata!</p>
          <p className="text-center mb-4">{error}</p>
          <button onClick={triggerFileSelect} className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Tekrar Dene</button>
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
          className={`flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-orange-400'}`}
        >
          <BookUpIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">EPUB dosyasını buraya sürükleyin</p>
          <p className="text-slate-500 dark:text-slate-400">veya seçmek için tıklayın</p>
        </div>
      );
    }

    return (
      <>
        <span key={displayText + currentIndex} className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white animate-fade-in text-center px-4">{displayText}</span>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-700">
          <div className="h-full bg-orange-500 transition-all duration-150 ease-linear" style={{ width: `${(currentIndex / words.length) * 100}%` }}></div>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
        {bookTitle && (
            <button onClick={() => { setWords([]); setBookTitle(null); resetExercise(); }} className="text-sm text-slate-500 hover:text-orange-500">
                Farklı Kitap Yükle
            </button>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">EPUB Okuyucu</h2>
                {bookTitle && <p className="text-slate-600 dark:text-slate-400 truncate max-w-sm">Kitap: {bookTitle}</p>}
            </div>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".epub" className="hidden" />

        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
          {renderContent()}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 ${!canStart && 'opacity-50 pointer-events-none'}`}>
          <div>
            <label htmlFor="epub-wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
            <input type="range" id="epub-wpm" min="50" max="1500" step="10" value={wpm} onChange={e => setWpm(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" disabled={!canStart} />
          </div>
          <div>
            <label htmlFor="epub-chunk" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grup Boyutu: {chunkSize} kelime</label>
            <input type="range" id="epub-chunk" min="1" max="5" step="1" value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" disabled={!canStart || isRunning} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleStartPause} disabled={!canStart} className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            <span>{isRunning ? 'Durdur' : (isFinished ? 'Yeniden Başlat' : 'Başlat')}</span>
          </button>
          <button onClick={resetExercise} disabled={!canStart} className="w-full flex items-center justify-center space-x-2 bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">
            <RefreshCwIcon className="h-5 w-5" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default EpubReaderExercise;