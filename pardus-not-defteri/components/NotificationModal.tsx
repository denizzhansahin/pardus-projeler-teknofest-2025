
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import Modal from './Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetNotification: (noteId: string, time: string | null) => void;
  note: Note | null;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onSetNotification, note }) => {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    if (note && note.notification && !note.notification.triggered) {
      // Format existing notification time for datetime-local input
      // Input expects 'YYYY-MM-DDTHH:mm'
      const d = new Date(note.notification.time);
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      const hours = (`0${d.getHours()}`).slice(-2);
      const minutes = (`0${d.getMinutes()}`).slice(-2);
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      // Set default to 1 hour from now if no existing or triggered notification
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const year = now.getFullYear();
      const month = (`0${now.getMonth() + 1}`).slice(-2);
      const day = (`0${now.getDate()}`).slice(-2);
      const hours = (`0${now.getHours()}`).slice(-2);
      const minutes = (`0${now.getMinutes()}`).slice(-2);
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [note, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note && dateTime) {
      const selectedTime = new Date(dateTime).getTime();
      if (selectedTime <= Date.now()) {
        alert("Lütfen gelecekte bir zaman seçin.");
        return;
      }
      onSetNotification(note.id, new Date(dateTime).toISOString());
      onClose();
    }
  };

  const handleClearNotification = () => {
    if (note) {
      onSetNotification(note.id, null);
      onClose();
    }
  };

  if (!note) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`"${note.title}" için Hatırlatıcı Ayarla`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="notificationTime" className="block text-sm font-medium text-slate-700 mb-1">
            Hatırlatma Zamanı
          </label>
          <input
            type="datetime-local"
            id="notificationTime"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // Min 1 minute from now
            required
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div>
            {note.notification && !note.notification.triggered && (
              <button
                type="button"
                onClick={handleClearNotification}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Hatırlatıcıyı Temizle
              </button>
            )}
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hatırlatıcıyı Ayarla
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NotificationModal;
