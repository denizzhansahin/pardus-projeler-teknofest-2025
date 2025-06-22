
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
    if (isOpen) {
        if (note && note.notification && !note.notification.triggered) {
        const d = new Date(note.notification.time);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        const hours = (`0${d.getHours()}`).slice(-2);
        const minutes = (`0${d.getMinutes()}`).slice(-2);
        setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // Snap to next 15 min interval
        const year = now.getFullYear();
        const month = (`0${now.getMonth() + 1}`).slice(-2);
        const day = (`0${now.getDate()}`).slice(-2);
        const hours = (`0${now.getHours()}`).slice(-2);
        const minutes = (`0${now.getMinutes()}`).slice(-2);
        setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
    }
  }, [note, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note && dateTime) {
      const selectedTime = new Date(dateTime).getTime();
      if (selectedTime <= Date.now() + 30000) { // Add 30s buffer
        alert("Lütfen gelecekte en az bir dakika sonrası için bir zaman seçin.");
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
          <label htmlFor="notificationTime" className="block text-sm font-medium text-slate-300 mb-1.5">
            Hatırlatma Zamanı
          </label>
          <input
            type="datetime-local"
            id="notificationTime"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="mt-1 block w-full px-4 py-2.5 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm text-slate-100 placeholder-slate-400"
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} 
            required
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div>
            {note.notification && !note.notification.triggered && (
              <button
                type="button"
                onClick={handleClearNotification}
                className="px-4 py-2 text-sm font-semibold text-red-300 bg-red-500/20 hover:bg-red-500/30 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
              >
                Hatırlatıcıyı Temizle
              </button>
            )}
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400 transition-all transform hover:scale-105"
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