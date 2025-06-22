
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Note } from '../types';
import Modal from './Modal';
import { CalendarClock, Save, X } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSetReminder: (noteId: string, reminderTimestamp: number | undefined) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, note, onSetReminder }) => {
  const { t } = useTranslation();
  const [reminderDateTime, setReminderDateTime] = useState<string>('');

  useEffect(() => {
    if (note && note.reminder) {
      const d = new Date(note.reminder);
      const pad = (num: number) => num.toString().padStart(2, '0');
      const isoString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setReminderDateTime(isoString);
    } else {
      setReminderDateTime('');
    }
  }, [note]);

  const handleSaveReminder = () => {
    if (note) {
      const timestamp = reminderDateTime ? new Date(reminderDateTime).getTime() : undefined;
      onSetReminder(note.id, timestamp);
      onClose();
    }
  };
  
  const handleClearReminder = () => {
    if (note) {
      onSetReminder(note.id, undefined);
      setReminderDateTime(''); // Clear the input field as well
      // Optionally close the modal or provide feedback
    }
  };

  if (!note) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('setReminder')} - ${note.title}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="reminderDateTime" className="block text-sm font-medium text-neutral-700 mb-1">{t('reminderDateTime')}</label>
          <div className="flex items-center gap-2">
            <CalendarClock size={20} className="text-neutral-500"/>
            <input
              type="datetime-local"
              id="reminderDateTime"
              value={reminderDateTime}
              onChange={(e) => setReminderDateTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
           <button
            type="button"
            onClick={handleClearReminder}
            disabled={!reminderDateTime}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Clear Reminder
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md shadow-sm"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveReminder}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm flex items-center"
          >
            <Save size={16} className="mr-2"/>
            {t('save')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReminderModal;
