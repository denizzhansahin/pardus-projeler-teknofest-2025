import React, { useState, useEffect, useRef } from 'react';
import { Note, Category, AiHelperSuggestion } from '../types';
import Modal from './Modal';
import IconButton from './IconButton';
// import LoadingSpinner from './LoadingSpinner'; // Not used directly here
import { NOTE_BACKGROUND_COLORS, getCategoryStyle } from '../constants';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> | Note) => void;
  noteToEdit?: Note | null;
  onOpenAiHelper: (currentText: string, targetField: 'title' | 'content') => void;
  categories: Category[];
  onAddCategory: (newCategory: Category) => void;
  lastAiSuggestion?: AiHelperSuggestion;
  onClearLastAiSuggestion: () => void;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({ 
  isOpen, onClose, onSave, noteToEdit, onOpenAiHelper, 
  categories, onAddCategory,
  lastAiSuggestion, onClearLastAiSuggestion
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

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        // Editing an existing note. AI suggestions should already be in noteToEdit if applied.
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
        setSelectedCategory(noteToEdit.category);
        setImageBase64(noteToEdit.imageBase64 || undefined);
        setLinkUrl(noteToEdit.linkUrl || '');
        setSelectedBgColor(noteToEdit.backgroundColor || NOTE_BACKGROUND_COLORS[0].value);
        setSelectedTextColor(noteToEdit.textColor || NOTE_BACKGROUND_COLORS[0].textColor);
        
        // If there's a lastAiSuggestion (e.g., user clicked AI helper, then cancel, then edit again),
        // it's stale for an *edit* scenario if noteToEdit is the source of truth.
        // However, App.tsx logic aims to update noteToEdit *before* re-opening this modal.
        // So, if lastAiSuggestion still exists, it means it wasn't consumed for a *new* note,
        // or there's a logic flow where it persists. Clearing it here if noteToEdit is present is safer.
        if (lastAiSuggestion) {
            onClearLastAiSuggestion();
        }

      } else { // New note
        // Reset all fields for a new note form
        setTitle('');
        setContent('');
        setSelectedCategory(categories[0] || 'General');
        setImageBase64(undefined);
        setLinkUrl('');
        setSelectedBgColor(NOTE_BACKGROUND_COLORS[0].value);
        setSelectedTextColor(NOTE_BACKGROUND_COLORS[0].textColor);

        // Apply AI suggestion if available for a new note
        if (lastAiSuggestion) {
          if (lastAiSuggestion.field === 'title') {
            setTitle(lastAiSuggestion.text);
          } else if (lastAiSuggestion.field === 'content') {
            setContent(lastAiSuggestion.text);
          }
          onClearLastAiSuggestion(); // Consume it
        }
      }
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  }, [isOpen, noteToEdit, categories, lastAiSuggestion, onClearLastAiSuggestion]);


  useEffect(() => {
    if (showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewCategoryInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { // Content can be empty if user wants, but title usually not
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
    // onClose will be called by App.tsx after save to ensure state updates
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
      if (file.size > 2 * 1024 * 1024) { 
        alert("Dosya boyutu 2MB'den büyük olamaz. Lütfen daha küçük bir resim seçin.");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={noteToEdit ? "Notu Düzenle" : "Yeni Not Oluştur"} size="xl">
      <form onSubmit={handleSubmit} className={`space-y-5 p-1 ${selectedBgColor} ${selectedTextColor} rounded-b-md -mt-4`}> {/* Adjusted margin for title bar */}
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium mb-1">Başlık</label>
            <div className="relative">
              <input
                type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${getCategoryStyle(selectedCategory).ring} bg-white/80 ${selectedTextColor}`}
                required
              />
              <IconButton label="Başlık için AI yardımı" onClick={() => onOpenAiHelper(title, 'title')} size="sm" className={`absolute right-2 top-1/2 -translate-y-1/2 ${selectedTextColor} hover:bg-black/10`}>
                <SparklesIcon className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Kategori</label>
            <select
              id="category" value={selectedCategory} onChange={handleCategoryChange}
              className={`mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${getCategoryStyle(selectedCategory).ring} bg-white/80 ${selectedTextColor}`}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="__ADD_NEW__" className="font-semibold text-indigo-600">-- Yeni Kategori Ekle --</option>
            </select>
            {showNewCategoryInput && (
              <div className="mt-2 flex">
                <input
                  ref={newCategoryInputRef}
                  type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Yeni kategori adı"
                  className={`flex-grow px-3 py-2 border border-slate-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm bg-white/80 ${selectedTextColor} ${getCategoryStyle(selectedCategory).ring}`}
                />
                <button type="button" onClick={handleAddNewCategory} className={`px-3 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 text-sm`}>Ekle</button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">İçerik</label>
          <div className="relative">
            <textarea
              id="content" value={content} onChange={(e) => setContent(e.target.value)}
              rows={8}
              className={`mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${getCategoryStyle(selectedCategory).ring} bg-white/80 ${selectedTextColor} scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent`}
            />
             <IconButton label="İçerik için AI yardımı" onClick={() => onOpenAiHelper(content, 'content')} size="sm" className={`absolute right-2 top-3 ${selectedTextColor} hover:bg-black/10`}>
               <SparklesIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        
        {/* Row 3: Image & Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium mb-1">Görsel (Max 2MB)</label>
            <input
              type="file" id="imageUpload" accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleImageUpload}
              className={`mt-1 block w-full text-sm ${selectedTextColor} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer`}
            />
            {imageBase64 && (
              <div className="mt-3 relative group w-fit">
                <img src={imageBase64} alt="Önizleme" className="max-h-32 w-auto rounded-md shadow-md border border-slate-300" />
                <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Görseli kaldır"><XMarkIcon className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium mb-1">Web Bağlantısı</label>
            <input
              type="url" id="linkUrl" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className={`mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${getCategoryStyle(selectedCategory).ring} bg-white/80 ${selectedTextColor}`}
            />
          </div>
        </div>

        {/* Row 4: Background Color Picker */}
        <div>
            <label className="block text-sm font-medium mb-1.5">Not Rengi</label>
            <div className="flex flex-wrap gap-2">
                {NOTE_BACKGROUND_COLORS.map(color => (
                    <button
                        type="button"
                        key={color.name}
                        title={color.name}
                        onClick={() => handleBgColorChange(color.value)}
                        className={`w-8 h-8 rounded-full ${color.sampleBg} shadow-sm transition-all duration-150 focus:outline-none ${selectedBgColor === color.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`}
                        aria-label={color.name}
                    />
                ))}
            </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-5">
          <button type="button" onClick={onClose}
            className={`px-5 py-2.5 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${selectedTextColor === 'text-slate-800' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400' 
                                                                 : 'bg-white/20 hover:bg-white/30 focus:ring-white/50'}`}>
            İptal
          </button>
          <button type="submit"
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${selectedTextColor === 'text-slate-800' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                                                                 : 'bg-indigo-500 hover:bg-indigo-400 focus:ring-indigo-300'}`}>
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