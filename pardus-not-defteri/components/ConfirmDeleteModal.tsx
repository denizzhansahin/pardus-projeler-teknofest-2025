
import React from 'react';
import Modal from './Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, noteTitle }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notu Silmeyi Onayla" size="sm">
      <div className="space-y-5">
        <p className="text-sm text-slate-300">
          "<strong className="font-medium text-slate-100">{noteTitle}</strong>" başlıklı notu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;