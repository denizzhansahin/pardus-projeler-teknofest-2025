
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Note } from '../types';
import { Edit3, Trash2, Volume2, Sparkles, Bell, Copy } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { getNoteSummaryForSpeech } from '../services/geminiAIService'; // Corrected import
import { speakText } from '../services/notificationAndAlarmService';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onSetReminder: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onSetReminder }) => {
  const { t, i18n } = useTranslation();
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const [isAISummaryLoading, setIsAISummaryLoading] = useState(false);
  
  const handleReadSummary = async () => {
    setIsAISummaryLoading(true);
    try {
      // Use note.content, which is HTML. The service should handle stripping tags if needed.
      const summary = await getNoteSummaryForSpeech(note.content); 
      speakText(summary, i18n.language); // Pass current language for TTS
    } catch (error) {
      console.error("Error generating or speaking summary:", error);
      alert(t('errorOccurred'));
    } finally {
      setIsAISummaryLoading(false);
    }
  };

  const copyContentToClipboard = () => {
    const plainTextContent = note.content.replace(/<[^>]+>/g, ' '); // Basic HTML to text
    navigator.clipboard.writeText(plainTextContent)
      .then(() => alert(t('copiedToClipboard')))
      .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-semibold text-primary mb-2 break-words">{note.title}</h3>
        <div 
          className="text-neutral-700 text-sm prose prose-sm max-w-none mb-3 max-h-28 overflow-y-auto break-words" 
          dangerouslySetInnerHTML={{ __html: note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content }} 
        />
        {note.image && <img src={note.image} alt={note.title} className="max-h-32 w-auto object-cover rounded my-2"/>}
      </div>
      <div className="mt-auto pt-3 border-t border-neutral-200 flex flex-wrap gap-2 items-center justify-end">
        <button
          onClick={() => onEdit(note)}
          title={t('editNote')}
          className="p-2 text-primary-dark hover:text-primary transition-colors"
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={handleReadSummary}
          title={t('readSummaryAloud')}
          className="p-2 text-green-600 hover:text-green-800 transition-colors"
          disabled={isAISummaryLoading}
        >
          {isAISummaryLoading ? <Sparkles size={18} className="animate-pulse" /> : <Volume2 size={18} />}
        </button>
         <button
          onClick={() => onSetReminder(note)}
          title={t('setReminder')}
          className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
        >
          <Bell size={18} />
        </button>
         <button
          onClick={copyContentToClipboard}
          title={t('copyContent')}
          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={() => { if(window.confirm(t('confirmDeleteNote'))) deleteNote(note.id)}}
          title={t('deleteNote')}
          className="p-2 text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default NoteCard;