import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

const defaultText = "Hızlı okuma, bilgi çağının vazgeçilmez bir becerisi olarak öne çıkıyor. Her gün karşılaştığımız sayısız makale, e-posta, rapor ve kitap yığını arasında kaybolmak yerine, bu bilgi selini etkin bir şekilde yönetmek mümkündür. Hızlı okuma, sadece kelimeleri gözle daha süratli takip etmek değil, aynı zamanda okuduğunu anlama oranını ve kalıcılığını artırma sanatıdır. Bu, zihinsel bir disiplin ve doğru tekniklerin birleşimiyle kazanılan bir yetenektir. Temelde, geleneksel okuma alışkanlıklarımızın getirdiği engelleri ortadan kaldırmayı hedefler. Bu engellerin başında iç seslendirme, yani kelimeleri okurken zihnimizde tekrar etme alışkanlığı gelir. Konuşma hızımızla sınırlı olan bu yöntem, okuma potansiyelimizin önündeki en büyük settir. İç sesi susturmak, gözlerimizin kelimeleri seslendirmeden doğrudan anlamasına olanak tanır, bu da hızı inanılmaz derecede artırır. Bir diğer önemli engel ise geri sıçramalar, yani okuduğumuz bir kelimeyi veya cümleyi anlamadığımızı düşünerek tekrar okuma eğilimidir. Bu durum, okuma akışını bozar ve ciddi zaman kaybına neden olur. İleriye Odaklanma Egzersizi gibi çalışmalar, gözlerinizi sürekli ileri hareket etmeye alıştırarak bu kötü alışkanlığı kırmanıza yardımcı olur. Gözler, bu süreçte metin üzerinde adeta kayarak ilerlemeyi öğrenir. Hızlı okumanın temelinde yatan bir başka prensip ise bloklar halinde okumadır. Gözlerimiz, tek bir bakışta birden fazla kelimeyi algılayabilecek kapasiteye sahiptir. Geleneksel okumada kelime kelime ilerlerken, hızlı okuma teknikleriyle her duraksamada üç, dört veya daha fazla kelimeyi bir bütün olarak algılamayı öğreniriz. Bu, \"görüş alanı genişletme\" olarak da bilinir ve göz kaslarını tıpkı bir sporcunun kaslarını çalıştırdığı gibi eğiterek geliştirilir. Çevresel görüşünüz ne kadar genişlerse, tek bir bakışta o kadar fazla bilgiyi beyninize gönderebilirsiniz. Bu teknikleri uygulamak için pratik ve sabır gerekir. Başlangıçta anlama oranınızda geçici bir düşüş yaşayabilirsiniz, ancak bu normaldir. Beyniniz ve gözleriniz yeni okuma ritmine alıştıkça, hem hızınız hem de anlama kapasiteniz eş zamanlı olarak artacaktır. Unutmayın, hızlı okuma bir yarış değildir; zamanınızı daha verimli kullanmak, daha fazla öğrenmek ve entelektüel merakınızı daha geniş bir alanda beslemek için güçlü bir araçtır. Bu beceriyi kazanmak, size sadece akademik veya profesyonel hayatta değil, kişisel gelişim yolculuğunuzda da büyük bir avantaj sağlayacaktır. Okuma eylemini pasif bir bilgi alımından, aktif ve dinamik bir keşif sürecine dönüştürerek bilgiye olan erişiminizi kökten değiştirebilirsiniz. Bu yolculuğa çıkmaya hazır olun, çünkü zihninizin sınırlarını zorladığınızda ne kadar ileri gidebileceğinize şaşıracaksınız.";


interface FocusForwardExerciseProps {
  onBack: () => void;
}

const FocusForwardExercise: React.FC<FocusForwardExerciseProps> = ({ onBack }) => {
  const [words, setWords] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('Egzersize Hazır');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(220);
  const [chunkSize, setChunkSize] = useState(1);
  
  const intervalRef = useRef<number | null>(null);
  
  const stopExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const parsedWords = defaultText.trim().split(/\s+/).filter(word => word.length > 0);
    setWords(parsedWords);
  }, []);

  useEffect(() => {
    if (!isRunning || words.length === 0) {
      return;
    }

    const interval = (60000 / wpm) * chunkSize;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + chunkSize);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, wpm, words.length, chunkSize]);
  
  useEffect(() => {
    if (words.length === 0) return;

    if (currentIndex >= words.length) {
      stopExercise();
      setDisplayText('Bitti!');
    } else {
      const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
      setDisplayText(chunk);
    }
  }, [currentIndex, words, chunkSize, stopExercise]);


  const handleStartPause = () => {
    if (isRunning) {
      stopExercise();
    } else {
      if (currentIndex >= words.length && words.length > 0) {
        setCurrentIndex(0);
      }
      setIsRunning(true);
    }
  };

  const resetExercise = useCallback(() => {
    stopExercise();
    setCurrentIndex(0);
  }, [stopExercise]);

  const isFinished = currentIndex >= words.length && words.length > 0;
  const canStart = words.length > 0;
  const progress = canStart ? (currentIndex / words.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-2">İleriye Odaklan Egzersizi</h2>
            <p className="text-slate-600 dark:text-slate-400">Geriye dönme alışkanlığınızı kırmak için metni tek yönlü bir akışta okuyun. Bu, okuma hızınızı ve akıcılığınızı artırır.</p>
        </div>
        
        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
          <span key={displayText + currentIndex} className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white animate-fade-in text-center px-4">{displayText}</span>
           <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-700">
                <div 
                    className="h-full bg-sky-500 transition-all duration-150 ease-linear"
                    style={{width: `${progress}%`}}
                ></div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <label htmlFor="custom-wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
                <input 
                    type="range" 
                    id="custom-wpm" 
                    min="50" 
                    max="1200" 
                    step="10" 
                    value={wpm} 
                    onChange={e => setWpm(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500" 
                    disabled={isRunning}
                />
            </div>
            <div>
                <label htmlFor="chunk-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grup Boyutu: {chunkSize} kelime</label>
                <input 
                    type="range" 
                    id="chunk-size" 
                    min="1" 
                    max="3" 
                    step="1" 
                    value={chunkSize} 
                    onChange={e => setChunkSize(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    disabled={isRunning}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
                onClick={handleStartPause}
                disabled={!canStart}
                className="w-full flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                <span>{isRunning ? 'Durdur' : (isFinished ? 'Yeniden Başlat' : 'Başlat')}</span>
            </button>
            <button
                onClick={resetExercise}
                disabled={!canStart || isRunning}
                className="w-full flex items-center justify-center space-x-2 bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                <RefreshCwIcon className="h-5 w-5" />
                <span>Sıfırla</span>
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FocusForwardExercise;
