
import React from 'react';
import { Note } from '../types';
import Modal from './Modal';
import IconButton from './IconButton';
import { getCategoryStyle, NOTE_BACKGROUND_COLORS } from '../constants';

interface NoteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onSetNotification: (note: Note) => void;
  onSummarize: (note: Note) => void;
}

const NoteViewModal: React.FC<NoteViewModalProps> = ({
  isOpen,
  onClose,
  note,
  onEdit,
  onDelete,
  onSetNotification,
  onSummarize,
}) => {
  if (!note) return null;

  const categoryStyle = getCategoryStyle(note.category);
  const defaultNoteBgDetails = NOTE_BACKGROUND_COLORS.find(c => c.value === 'bg-slate-50') || NOTE_BACKGROUND_COLORS[0];

  const noteBgColorClass = note.backgroundColor || defaultNoteBgDetails.value;
  const contentAreaBg = noteBgColorClass;
  const contentAreaText = note.textColor || defaultNoteBgDetails.textColor;

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="5xl"> 
      <div className="flex flex-col max-h-[85vh]">
        {/* Header Section */}
        <div className={`p-6 rounded-t-lg ${contentAreaBg} ${contentAreaText} relative -m-6 mb-0 sm:-m-8 sm:mb-0 `}>
           <div className="flex justify-between items-start mb-3">
            <h2 id="modal-title" className={`text-2xl sm:text-3xl font-bold break-words mr-4 ${contentAreaText}`}>
              {note.title}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full absolute top-4 right-4 sm:top-6 sm:right-6
                          ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-500 hover:text-sky-600' : 'text-slate-300 hover:text-sky-400'} 
                          transition-colors`}
              aria-label="Kapat"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
          </div>
           <span
            title={note.category}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm inline-block ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {note.category}
          </span>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-grow p-6 overflow-y-auto scrollbar-thin ${contentAreaBg} ${contentAreaText} scrollbar-thumb-slate-500/50`}>
          {note.imageBase64 && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-lg max-h-[50vh]">
              <img src={note.imageBase64} alt={note.title} className="w-full h-full object-contain" />
            </div>
          )}

          <p className={`text-base mb-6 whitespace-pre-wrap break-words leading-relaxed ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-700' : 'opacity-90'}`}>
            {note.content}
          </p>

          {note.linkUrl && (
            <div className="mb-6">
              <span className={`block text-sm font-medium mb-1 ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-600' : 'text-slate-400'}`}>Bağlantı:</span>
              <a
                href={note.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 hover:underline break-all"
              >
                {note.linkUrl}
              </a>
            </div>
          )}

          <div className={`text-xs mt-6 mb-2 ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-500' : 'opacity-70'}`}>
            <p>Oluşturulma: {formatDate(note.createdAt)}</p>
            {note.createdAt !== note.updatedAt && <p>Son Güncelleme: {formatDate(note.updatedAt)}</p>}
          </div>

          {note.notification && (
            <div className={`text-sm mb-3 p-3 rounded-lg shadow-inner ${note.notification.triggered
              ? `bg-opacity-10 ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'bg-slate-500 text-slate-600' : 'bg-white text-opacity-70'}`
              : `bg-opacity-20 ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'bg-amber-400 text-amber-800' : 'bg-amber-300 text-amber-900'}`
            }`}>
              <BellIcon className="w-5 h-5 inline mr-2 align-text-bottom" />
              Hatırlatıcı: {formatDate(note.notification.time)}
              {note.notification.triggered && <span className="italic"> (Tetiklendi)</span>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-end flex-wrap space-x-3 p-4 border-t 
                        ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'border-slate-300' : 'border-slate-700'} 
                        rounded-b-lg -m-6 mt-0 sm:-m-8 sm:mt-0 ${contentAreaBg}`}
        >
          <IconButton label="Notu Düzenle" onClick={() => onEdit(note)} size="md" variant="ghost" className={`${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'}`}>
            <PencilIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Hatırlatıcı Ayarla" onClick={() => onSetNotification(note)} size="md" variant="ghost" className={`${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'}`}>
            <BellIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Notu Özetle (AI)" onClick={() => onSummarize(note)} size="md" variant="ghost" className={`${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'}`}>
            <SparklesIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Notu Sil" onClick={() => onDelete(note.id)} variant="ghost" size="md" className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
            <TrashIcon className="w-5 h-5" />
          </IconButton>
           <button
              onClick={onClose}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-colors
                          ${contentAreaText === 'text-slate-800' || contentAreaText === 'text-slate-900' 
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Kapat
            </button>
        </div>
      </div>
    </Modal>
  );
};

// SVG Icons (Heroicons - make sure they are defined or imported if not already)
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.094M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 012.087 2.087L24 12l-2.846.813a4.5 4.5 0 01-2.087 2.087L18.25 17.25l-.813-2.846a4.5 4.5 0 01-2.087-2.087L12.5 12l2.846-.813a4.5 4.5 0 012.087-2.087L18.25 7.5z" />
</svg>
);


export default NoteViewModal;
