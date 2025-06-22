
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Note } from '../types';
import { useNoteStore } from '../store/noteStore';
import { getAIContent } from '../services/geminiAIService';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import { Sparkles, Save, CalendarClock, Loader2 } from 'lucide-react';

interface NoteEditorProps {
  noteToEdit?: Note | null;
  notebookId: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteToEdit, notebookId, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(noteToEdit?.title || '');
  const [content, setContent] = useState(noteToEdit?.content || '');
  const [image, setImage] = useState<string | null>(noteToEdit?.image || null);
  const [reminder, setReminder] = useState<string>(''); // Store as ISO string for input
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  
  const addNote = useNoteStore((state) => state.addNote);
  const updateNote = useNoteStore((state) => state.updateNote);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setImage(noteToEdit.image || null);
      if (noteToEdit.reminder) {
        // Convert timestamp to YYYY-MM-DDTHH:mm format for datetime-local input
        const d = new Date(noteToEdit.reminder);
        // Pad month, day, hours, minutes with leading zeros if necessary
        const pad = (num: number) => num.toString().padStart(2, '0');
        const isoString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setReminder(isoString);
      } else {
        setReminder('');
      }
    } else {
      // Reset form for new note
      setTitle('');
      setContent('');
      setImage(null);
      setReminder('');
    }
  }, [noteToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notebookId) {
      alert("Title and notebook are required."); // Simple validation
      return;
    }
    
    const reminderTimestamp = reminder ? new Date(reminder).getTime() : undefined;

    const noteData = {
      title,
      content,
      notebookId,
      image: image || undefined, // Ensure undefined if null
      reminder: reminderTimestamp,
    };

    if (noteToEdit) {
      const updated: Note = { ...noteToEdit, ...noteData, updatedAt: Date.now() };
      updateNote(updated);
      onSave(updated);
    } else {
      const newNote = addNote(noteData);
      onSave(newNote);
    }
  };
  
  const handleAIAssist = async (type: 'summarize' | 'suggest' | 'plan') => {
    setIsAISuggestionLoading(true);
    try {
      const aiResponse = await getAIContent({ type, noteContent: content });
      setContent(content + `\n\n<hr><strong>AI ${type}:</strong>\n<p>${aiResponse.replace(/\n/g, "<br>")}</p>`);
    } catch (error) {
      console.error("AI Assistant error:", error);
      alert(t('errorOccurred'));
    } finally {
      setIsAISuggestionLoading(false);
    }
  };

  const handleImageChange = useCallback((base64Image: string | null) => {
    setImage(base64Image);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-xl rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-primary">{noteToEdit ? t('editNote') : t('newNote')}</h2>
      <div>
        <label htmlFor="noteTitle" className="block text-sm font-medium text-neutral-700">{t('noteTitle')}</label>
        <input
          type="text"
          id="noteTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="noteContent" className="block text-sm font-medium text-neutral-700">{t('noteContent')}</label>
        <RichTextEditor value={content} onChange={setContent} placeholder={t('noteContent')} />
      </div>

      <ImageUpload currentImage={image || undefined} onImageChange={handleImageChange} />

      <div>
        <label htmlFor="noteReminder" className="block text-sm font-medium text-neutral-700 mb-1">{t('reminderDateTime')}</label>
        <div className="flex items-center gap-2">
            <CalendarClock size={20} className="text-neutral-500"/>
            <input
            type="datetime-local"
            id="noteReminder"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-md font-medium text-neutral-700 mb-2 flex items-center">
            <Sparkles size={20} className="mr-2 text-accent"/>{t('aiAssistant')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {['suggest', 'plan', 'summarize'].map((actionType) => (
            <button
              key={actionType}
              type="button"
              onClick={() => handleAIAssist(actionType as 'summarize' | 'suggest' | 'plan')}
              disabled={isAISuggestionLoading || !content.trim()}
              className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-dark text-white font-medium rounded-md shadow-sm disabled:opacity-50 flex items-center transition-colors"
            >
              {isAISuggestionLoading && <Loader2 size={16} className="animate-spin mr-1" />}
              {t(actionType === 'suggest' ? 'getSuggestions' : actionType === 'plan' ? 'createPlan' : 'summarize')}
            </button>
          ))}
        </div>
        {isAISuggestionLoading && <p className="text-xs text-neutral-500 mt-2 animate-pulse">{t('generatingResponse')}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm flex items-center"
        >
          <Save size={16} className="mr-2"/>
          {t('save')}
        </button>
      </div>
    </form>
  );
};

export default NoteEditor;
