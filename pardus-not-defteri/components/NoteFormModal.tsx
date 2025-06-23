
import React, { useState, useEffect, useRef } from 'react';
import { Note, Category } from '../types'; // Removed AiHelperSuggestion as it's handled by App.tsx
import Modal from './Modal';
import IconButton from './IconButton';
import { NOTE_BACKGROUND_COLORS, getCategoryStyle } from '../constants';

// Type for pending new note data from AI, received from App.tsx
interface PendingNewNoteDataType {
  title?: string;
  content?: string;
}

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> | Note) => void;
  noteToEdit?: Note | null;
  onOpenAiHelper: (currentText: string, targetField: 'title' | 'content') => void;
  categories: Category[];
  onAddCategory: (newCategory: Category) => void;
  pendingNewNoteData?: PendingNewNoteDataType | null; // Changed from lastAiSuggestion
  onConsumePendingNewNoteData: () => void; // Changed from onClearLastAiSuggestion
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({ 
  isOpen, onClose, onSave, noteToEdit, onOpenAiHelper, 
  categories, onAddCategory,
  pendingNewNoteData, onConsumePendingNewNoteData 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0] || 'General');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(NOTE_BACKGROUND_COLORS[0].value);
  const [selectedTextColor, setSelectedTextColor] = useState(NOTE_BACKGROUND_COLORS[0].textColor);
  
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const defaultNoteBg = useRef(NOTE_BACKGROUND_COLORS.find(c => c.value === 'bg-slate-50') || NOTE_BACKGROUND_COLORS[0]);

  // Effect 1: Initialize/reset form based on mode (new/edit)
  useEffect(() => {
    if (!isOpen) {
        // If modal closes with pending data (e.g., user clicked outside), clear it.
        if (pendingNewNoteData) { 
            onConsumePendingNewNoteData();
        }
        return;
    }

    if (noteToEdit) {
        // Editing existing note
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
        setSelectedCategory(noteToEdit.category);
        setImageBase64(noteToEdit.imageBase64 || undefined);
        setLinkUrl(noteToEdit.linkUrl || '');
        setSelectedBgColor(noteToEdit.backgroundColor || defaultNoteBg.current.value);
        setSelectedTextColor(noteToEdit.textColor || defaultNoteBg.current.textColor);
        
        // If user was creating new, got suggestion, then switched to edit mode, clear pending data.
        if (pendingNewNoteData) {
            onConsumePendingNewNoteData();
        }
    } else {
        // Adding a new note.
        // If there's pendingNewNoteData, Effect 2 will handle applying it to title/content.
        // This block sets defaults for fields not covered by pendingNewNoteData,
        // or all fields if no pendingNewNoteData.
        if (!pendingNewNoteData) {
            setTitle('');
            setContent('');
        }
        setSelectedCategory(categories[0] || 'General');
        setImageBase64(undefined);
        setLinkUrl('');
        setSelectedBgColor(defaultNoteBg.current.value);
        setSelectedTextColor(defaultNoteBg.current.textColor);
    }
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  }, [isOpen, noteToEdit, categories, defaultNoteBg]); // pendingNewNoteData and onConsume are handled by Effect 2 for new notes.

  // Effect 2: Apply AI suggestion (pendingNewNoteData) for new notes
  useEffect(() => {
    if (isOpen && !noteToEdit && pendingNewNoteData) {
        // Only apply if the field exists in pending data
        if (typeof pendingNewNoteData.title === 'string') {
            setTitle(pendingNewNoteData.title);
        }
        if (typeof pendingNewNoteData.content === 'string') {
            setContent(pendingNewNoteData.content);
        }
        onConsumePendingNewNoteData(); // Consume after applying
    }
  }, [isOpen, noteToEdit, pendingNewNoteData, onConsumePendingNewNoteData]);


  useEffect(() => {
    if (isOpen && showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [isOpen, showNewCategoryInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Başlık boş olamaz.");
      return;
    }
    const noteData = {
      title,
      content,
      category: selectedCategory,
      imageBase64: imageBase64,
      linkUrl: linkUrl.trim() || undefined,
      backgroundColor: selectedBgColor,
      textColor: selectedTextColor,
    };

    if (noteToEdit) {
      onSave({ ...noteToEdit, ...noteData });
    } else {
      onSave(noteData);
    }
  };
  
  const handleBgColorChange = (bgColorValue: string) => {
    const colorOption = NOTE_BACKGROUND_COLORS.find(c => c.value === bgColorValue);
    if (colorOption) {
      setSelectedBgColor(colorOption.value);
      setSelectedTextColor(colorOption.textColor);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() !== '') {
      const existingCategory = categories.find(c => c.toLowerCase() === newCategoryName.trim().toLowerCase());
      if (existingCategory) {
          setSelectedCategory(existingCategory); 
      } else {
          onAddCategory(newCategoryName.trim());
          setSelectedCategory(newCategoryName.trim());
      }
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "__ADD_NEW__") {
      setShowNewCategoryInput(true);
    } else {
      setSelectedCategory(value);
      setShowNewCategoryInput(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { 
        alert("Dosya boyutu 15MB'den büyük olamaz. Lütfen daha küçük bir resim seçin.");
        e.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.onerror = () => { console.error("Resim okunurken hata"); alert("Resim okunurken hata."); }
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(undefined);
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const currentCategoryStyle = getCategoryStyle(selectedCategory);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={noteToEdit ? "Notu Düzenle" : "Yeni Not Oluştur"} size="xl">
      <form onSubmit={handleSubmit} className={`space-y-6 p-1 text-slate-100 rounded-b-md -mt-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start pt-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium mb-1.5 text-slate-300">Başlık</label>
            <div className="relative">
              <input
                type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-slate-100 placeholder-slate-400 ${currentCategoryStyle.ring} focus:border-transparent`}
                required
              />
              <IconButton label="Başlık için AI yardımı" onClick={() => onOpenAiHelper(title, 'title')} size="sm" variant="ghost" className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-300`}>
                <SparklesIcon className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1.5 text-slate-300">Kategori</label>
            <select
              id="category" value={selectedCategory} onChange={handleCategoryChange}
              className={`mt-1 block w-full px-4 py-3 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-slate-100 ${currentCategoryStyle.ring} focus:border-transparent`}
            >
              {categories.map(cat => <option key={cat} value={cat} style={{backgroundColor: getCategoryStyle(cat).bg, color: getCategoryStyle(cat).text}}>{cat}</option>)}
              <option value="__ADD_NEW__" className="font-semibold text-sky-400 bg-slate-800">-- Yeni Kategori Ekle --</option>
            </select>
            {showNewCategoryInput && (
              <div className="mt-2.5 flex">
                <input
                  ref={newCategoryInputRef}
                  type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Yeni kategori adı"
                  className={`flex-grow px-3 py-2.5 border border-slate-600 bg-slate-700/80 rounded-l-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-slate-100 placeholder-slate-400 ${currentCategoryStyle.ring} focus:border-transparent`}
                />
                <button type="button" onClick={handleAddNewCategory} className={`px-4 py-2.5 bg-sky-500 text-white rounded-r-md hover:bg-sky-600 text-sm font-semibold transition-colors`}>Ekle</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1.5 text-slate-300">İçerik</label>
          <div className="relative">
            <textarea
              id="content" value={content} onChange={(e) => setContent(e.target.value)}
              rows={8}
              className={`mt-1 block w-full px-4 py-3 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-slate-100 placeholder-slate-400 ${currentCategoryStyle.ring} focus:border-transparent scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent`}
            />
             <IconButton label="İçerik için AI yardımı" onClick={() => onOpenAiHelper(content, 'content')} size="sm" variant="ghost" className={`absolute right-2.5 top-3.5 text-sky-400 hover:text-sky-300`}>
               <SparklesIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium mb-1.5 text-slate-300">Görsel (Max 15MB)</label>
            <input
              type="file" id="imageUpload" accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleImageUpload}
              className={`mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer`}
            />
            {imageBase64 && (
              <div className="mt-3 relative group w-fit">
                <img src={imageBase64} alt="Önizleme" className="max-h-32 w-auto rounded-lg shadow-md border border-slate-600" />
                <button type="button" onClick={handleRemoveImage} className="absolute -top-2.5 -right-2.5 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" aria-label="Görseli kaldır"><XMarkIcon className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium mb-1.5 text-slate-300">Web Bağlantısı</label>
            <input
              type="url" id="linkUrl" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className={`mt-1 block w-full px-4 py-3 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-slate-100 placeholder-slate-400 ${currentCategoryStyle.ring} focus:border-transparent`}
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Not Rengi (Arka Plan)</label>
            <div className="flex flex-wrap gap-2.5">
                {NOTE_BACKGROUND_COLORS.map(color => (
                    <button
                        type="button"
                        key={color.name}
                        title={color.name}
                        onClick={() => handleBgColorChange(color.value)}
                        className={`w-9 h-9 rounded-full ${color.sampleBg} shadow-md transition-all duration-150 focus:outline-none 
                                    ${selectedBgColor === color.value ? 'ring-3 ring-offset-2 ring-pink-500 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                        aria-label={color.name}
                        style={{border: selectedBgColor === color.value ? '' : '1px solid rgba(255,255,255,0.2)' }}
                    />
                ))}
            </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-5">
          <button type="button" onClick={onClose}
            className={`px-6 py-3 text-sm font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all
                        bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500`}>
            İptal
          </button>
          <button type="submit"
            className={`px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all transform hover:scale-105
                        bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:ring-sky-400`}>
            {noteToEdit ? 'Notu Güncelle' : 'Notu Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 012.087 2.087L24 12l-2.846.813a4.5 4.5 0 01-2.087 2.087L18.25 17.25l-.813-2.846a4.5 4.5 0 01-2.087-2.087L12.5 12l2.846-.813a4.5 4.5 0 012.087-2.087L18.25 7.5z" /></svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

export default NoteFormModal;
