
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notebook } from '../types';
import { useNoteStore } from '../store/noteStore';
import { BookOpen, PlusCircle, Trash2, Edit2, Folder, Check, X } from 'lucide-react';

interface NotebookManagerProps {
  isMobileMenuOpen?: boolean; // For mobile responsiveness
  onNotebookSelect?: () => void; // Callback for mobile menu close
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ isMobileMenuOpen, onNotebookSelect }) => {
  const { t } = useTranslation();
  const notebooks = useNoteStore((state) => state.notebooks);
  const activeNotebookId = useNoteStore((state) => state.activeNotebookId);
  const addNotebook = useNoteStore((state) => state.addNotebook);
  const deleteNotebook = useNoteStore((state) => state.deleteNotebook);
  const setActiveNotebookId = useNoteStore((state) => state.setActiveNotebookId);
  const updateNotebookStore = useNoteStore((state) => state.updateNotebook);

  const [newNotebookName, setNewNotebookName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingNotebookName, setEditingNotebookName] = useState('');

  const handleCreateNotebook = () => {
    if (newNotebookName.trim()) {
      addNotebook(newNotebookName.trim());
      setNewNotebookName('');
      setIsCreating(false);
    }
  };

  const handleDeleteNotebook = (notebookId: string) => {
    if (window.confirm(t('confirmDeleteNotebook'))) {
      deleteNotebook(notebookId);
    }
  };

  const handleSelectNotebook = (notebookId: string) => {
    setActiveNotebookId(notebookId);
    if (onNotebookSelect) onNotebookSelect(); // Close mobile menu if open
  };

  const handleStartEdit = (notebook: Notebook) => {
    setEditingNotebookId(notebook.id);
    setEditingNotebookName(notebook.name);
  };

  const handleSaveEdit = () => {
    if (editingNotebookId && editingNotebookName.trim()) {
      updateNotebookStore(editingNotebookId, editingNotebookName.trim());
      setEditingNotebookId(null);
      setEditingNotebookName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNotebookId(null);
    setEditingNotebookName('');
  };

  return (
    <div className={`p-4 space-y-4 bg-neutral-100 h-full overflow-y-auto ${isMobileMenuOpen ? 'block' : 'hidden md:block'} md:w-72 md:flex-shrink-0 md:border-r border-neutral-300`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center"><BookOpen size={24} className="mr-2" /> {t('notebooks')}</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 text-primary hover:text-primary-dark transition-colors"
          title={t('createNotebook')}
        >
          <PlusCircle size={22} />
        </button>
      </div>

      {isCreating && (
        <div className="p-3 bg-white rounded-md shadow mb-3 space-y-2">
          <input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder={t('notebookName')}
            className="w-full px-2 py-1.5 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsCreating(false)} className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800">{t('cancel')}</button>
            <button onClick={handleCreateNotebook} className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark">{t('create')}</button>
          </div>
        </div>
      )}

      {notebooks.length === 0 && !isCreating && (
         <p className="text-neutral-500 text-sm">{t('noNotebooks')}</p>
      )}

      <ul className="space-y-1">
        {notebooks.map((notebook) => (
          <li key={notebook.id}>
            {editingNotebookId === notebook.id ? (
              <div className="flex items-center p-2 bg-white rounded-md shadow">
                <input
                  type="text"
                  value={editingNotebookName}
                  onChange={(e) => setEditingNotebookName(e.target.value)}
                  className="flex-grow px-2 py-1 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:text-green-800 ml-1"><Check size={18} /></button>
                <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:text-red-700"><X size={18} /></button>
              </div>
            ) : (
              <div
                className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer group transition-all duration-150 ease-in-out
                            ${activeNotebookId === notebook.id ? 'bg-primary text-white shadow-lg' : 'text-neutral-700 hover:bg-primary-light hover:text-white'}`}
              >
                <div onClick={() => handleSelectNotebook(notebook.id)} className="flex items-center flex-grow truncate">
                    <Folder size={18} className={`mr-2.5 ${activeNotebookId === notebook.id ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`} />
                    <span className="font-medium text-sm truncate">{notebook.name}</span>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                   <button onClick={() => handleStartEdit(notebook)} className={`p-1 ${activeNotebookId === notebook.id ? 'text-white hover:bg-primary-dark' : 'text-neutral-500 hover:text-primary-dark' } rounded`} title={t('editNote')}>
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteNotebook(notebook.id)} className={`p-1 ${activeNotebookId === notebook.id ? 'text-white hover:bg-red-400' : 'text-neutral-500 hover:text-red-600' } rounded`} title={t('deleteNotebook')}>
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotebookManager;
