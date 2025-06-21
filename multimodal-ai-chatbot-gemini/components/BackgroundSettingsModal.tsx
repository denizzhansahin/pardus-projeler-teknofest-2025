import React, { useState, useRef } from 'react';
import { ChatBackgroundStyle } from '../types';
import IconButton from './IconButton'; // Assuming IconButton can be used for close
import { XMarkIcon } from './icons/XMarkIcon'; // Placeholder, create if needed or use text

// Simple XMarkIcon if not available
const CloseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);


interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBackground: (style: ChatBackgroundStyle) => void;
  currentBackground: ChatBackgroundStyle;
}

const colors = [
  { name: 'Default', type: 'default', value: '' },
  { name: 'Slate', type: 'color', value: '#475569' }, // slate-600
  { name: 'Sky', type: 'color', value: '#0ea5e9' }, // sky-500
  { name: 'Emerald', type: 'color', value: '#10b981' }, // emerald-500
  { name: 'Rose', type: 'color', value: '#f43f5e' }, // rose-500
  { name: 'Indigo', type: 'color', value: '#6366f1' }, // indigo-500
  { name: 'Orange', type: 'color', value: '#f97316' }, // orange-500
  { name: 'Amber', type: 'color', value: '#f59e42' }, // amber-400
  { name: 'Yellow', type: 'color', value: '#fde047' }, // yellow-300
  { name: 'Gold', type: 'color', value: '#ffd700' }, // gold
  { name: 'Light Yellow', type: 'color', value: '#fff9c4' }, // light yellow
  { name: 'Ivory', type: 'color', value: '#fffff0' }, // ivory
  { name: 'Cream', type: 'color', value: '#fffdd0' }, // cream
  { name: 'White', type: 'color', value: '#ffffff' }, // white
  { name: 'Off White', type: 'color', value: '#f8fafc' }, // off white (gray-50)
  { name: 'Sunset', type: 'color', value: '#ffb347' }, // sunset orange/yellow
];

const stockImages = [
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-03.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-04.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-02.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2022/04/5-dark.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2022/04/3-dark.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/DuvarKagidi-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-cyan.png' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/12/pardus-wallpaper-1920x1080-1.jpg' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_default-dark-2.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Anitkabir-Ankara-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Amasya-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Sehitler-Aniti-Canakkale-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Anitkabir-Ankara-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gocek-Fethiye-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gun-Dogumu-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gun-Dogumu-Kapadokya-Nevsehir-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Ismil-Konya-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Kamp-Hasandagi-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Hasandagi-Akhisar-Aksaray-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Amasya-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Ceceva-Rize-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Hasandagi-Aksaray-2-scaled.webp' },

  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Helvadere-Hasandagi-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Helvadere-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Hasandagi-Aksaray-3-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Cifte-Minareli-Medrese-Erzurum-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Hasandagi-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Hasandagi-Akhisar-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Flamingo-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Yat-scaled.webp' },
    { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Yat-3-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Zilkale-Rize-scaled.webp' },
    { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Kizil-Kilise-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Lavanta-Isparta-scaled.webp' },
    { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Narligol-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Samanyolu-Hasandagi-Aksaray-2-scaled.webp' },
    { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Kis-Masali-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Yedigoller-Bolu-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Uchisar-Nevsehir-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Tuz-Golu-Aksaray-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Uchisar-Nevsehir-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Yat-2-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Pamukkale-Denizli-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Kapadokya-Nevsehir-scaled.webp' },
  { name: 'Pardus', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Yilki-Atlari-Kayseri-scaled.webp' },
  
]; // Replace with your actual image URLs or a better source


const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  onApplyBackground,
  currentBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('geminiApiKey') || '');
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 in local storage
        alert("Dosya çok büyük. Lütfen 2MB'ın altında bir resim seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onApplyBackground({ type: 'imageData', value: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  const handleApiKeySave = () => {
    localStorage.setItem('geminiApiKey', apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="background-settings-title"
    >
      <div
        className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slide-up max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="background-settings-title" className="text-xl font-semibold text-textPrimary dark:text-white">Sohbet Arkaplan Ayarları</h2>
          <IconButton label="Close settings" onClick={onClose} variant="ghost" size="sm">
            <CloseIcon className="w-5 h-5 text-textSecondary dark:text-gray-400" />
          </IconButton>
        </div>

        {/* Gemini API Key Alanı */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-textSecondary dark:text-gray-300 mb-2">Gemini API Key</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="API Key girin..."
              className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-background dark:bg-gray-700 text-textPrimary dark:text-gray-100"
            />
            <button
              onClick={handleApiKeySave}
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
            >Kaydet</button>
          </div>
          {apiKeySaved && <p className="text-xs text-green-600 mt-1">API anahtarı kaydedildi!</p>}
        </div>

        {/* Colors */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-textSecondary dark:text-gray-300 mb-2">Düz Renkler</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={() => onApplyBackground({ type: color.type as 'default' | 'color', value: color.value })}
                className={`h-12 w-full rounded-md border-2 transition-all
                  ${currentBackground.type === color.type && currentBackground.value === color.value
                    ? 'ring-2 ring-offset-2 ring-primary dark:ring-accent'
                    : 'hover:opacity-80'}
                  ${color.type === 'default' ? 'bg-background dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-xs flex items-center justify-center text-textSecondary dark:text-gray-400' : 'border-transparent'}`}
                style={color.type === 'color' ? { backgroundColor: color.value } : {}}
                aria-pressed={currentBackground.type === color.type && currentBackground.value === color.value}
              >
                {color.type === 'default' && color.name}
                <span className="sr-only">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stock Images */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-textSecondary dark:text-gray-300 mb-2">Ön Tanımlı Resimler</h3>
          <div className="grid grid-cols-3 gap-2">
            {stockImages.map((image) => (
              <button
                key={image.name}
                title={image.name}
                onClick={() => onApplyBackground({ type: 'imageURL', value: image.value })}
                className={`h-20 w-full rounded-md border-2 bg-cover bg-center transition-all
                  ${currentBackground.type === 'imageURL' && currentBackground.value === image.value
                    ? 'ring-2 ring-offset-2 ring-primary dark:ring-accent'
                    : 'hover:opacity-80 border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundImage: `url(${image.value})` }}
                aria-pressed={currentBackground.type === 'imageURL' && currentBackground.value === image.value}
              >
                <span className="sr-only">{image.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Image */}
        <div>
          <h3 className="text-md font-medium text-textSecondary dark:text-gray-300 mb-2">Kendi Resmini Yükle</h3>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="hidden"
            id="bg-upload-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border-2 border-primary/30 dark:border-primary/40 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
          >
            Resim Seç (max 2MB)
          </button>
          {currentBackground.type === 'imageData' && (
            <p className="text-xs text-textSecondary dark:text-gray-400 mt-2">Özel resim uygulandı. Değiştirmek için başka bir resim yükleyin.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
