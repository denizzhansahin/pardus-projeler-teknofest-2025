import React from 'react';
import { Note } from '../types';
import { getCategoryStyle } from '../constants';
import IconButton from './IconButton';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onSetNotification: (note: Note) => void;
  onSummarize: (note: Note) => void;
  onViewDetails: (note: Note) => void; // Added prop for viewing details
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onSetNotification, onSummarize, onViewDetails }) => {
  const categoryStyle = getCategoryStyle(note.category);
  const noteBgColor = note.backgroundColor || 'bg-white';
  const noteTextColor = note.textColor || 'text-slate-800';

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent opening view modal if an icon button within the card was clicked
    if ((e.target as HTMLElement).closest('button[aria-label]')) {
      return;
    }
    onViewDetails(note);
  };

  return (
    <div
      className={`relative rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between h-full group cursor-pointer
                  ${noteBgColor} ${noteTextColor} border-t-4 ${categoryStyle.border}`}
      onClick={handleCardClick} // Added onClick to the main card div
      role="button" // Semantically a button if the whole card is clickable
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any); }} // Keyboard accessibility
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-xl font-semibold break-words mr-2 ${noteTextColor}`}>{note.title}</h3>
          <span
            title={note.category}
            className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryStyle.bg} ${categoryStyle.text} whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[120px] shadow-sm`}
          >
            {note.category}
          </span>
        </div>

        {note.imageBase64 && (
          <div className="mb-4 rounded-lg overflow-hidden h-48 shadow-inner">
            <img src={note.imageBase64} alt={note.title} className="w-full h-full object-cover" />
          </div>
        )}

        <p className={`text-sm mb-4 whitespace-pre-wrap break-words min-h-[60px] max-h-[150px] overflow-y-auto scrollbar-thin ${noteTextColor === 'text-slate-800' ? 'text-slate-700' : (noteTextColor === 'text-slate-900' ? 'text-slate-700' : 'opacity-90') } pr-1`}>
          {note.content}
        </p>

        {note.linkUrl && (
          <div className="mb-4">
            <a
              href={note.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-400 hover:underline text-sm truncate block"
              onClick={(e) => e.stopPropagation()} // Prevent card click when link is clicked
            >
              {note.linkUrl}
            </a>
          </div>
        )}
      </div>

      <div className="px-5 pb-3"> {/* Footer area */}
        <div className={`text-xs mt-3 mb-3 ${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'text-slate-500' : 'opacity-70'}`}>
          Oluşturuldu: {formatDate(note.createdAt)}
          {note.createdAt !== note.updatedAt && <><br/>Güncellendi: {formatDate(note.updatedAt)}</>}
        </div>

        {note.notification && (
          <div className={`text-xs mb-3 p-2.5 rounded-lg shadow-sm ${note.notification.triggered
            ? `bg-opacity-10 ${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'bg-slate-500 text-slate-600' : 'bg-white text-opacity-70'}`
            : `bg-opacity-20 ${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'bg-amber-400 text-amber-800' : 'bg-amber-300 text-amber-900'}`
          }`}>
            <BellIcon className="w-4 h-4 inline mr-1.5 align-text-bottom"/>
            Hatırlatıcı: {formatDate(note.notification.time)}
            {note.notification.triggered && <span className="italic"> (Tetiklendi)</span>}
          </div>
        )}

        <div className={`flex items-center justify-end space-x-1 pt-3 border-t ${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'border-slate-200' : 'border-white/20'}
                        transition-opacity duration-200 lg:opacity-0 group-hover:opacity-100`}>
          <IconButton label="Notu Düzenle" onClick={(e) => { e.stopPropagation(); onEdit(note);}} size="sm" variant="ghost" className={`${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/20'}`}>
            <PencilIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Hatırlatıcı Ayarla" onClick={(e) => { e.stopPropagation(); onSetNotification(note);}} size="sm" variant="ghost" className={`${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/20'}`}>
            <BellIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Notu Özetle (AI)" onClick={(e) => { e.stopPropagation(); onSummarize(note);}} size="sm" variant="ghost" className={`${noteTextColor === 'text-slate-800' || noteTextColor === 'text-slate-900' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/20'}`}>
            <SparklesIcon className="w-5 h-5" />
          </IconButton>
          <IconButton label="Notu Sil" onClick={(e) => { e.stopPropagation(); onDelete(note.id);}} variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
            <TrashIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

// SVG Icons (Heroicons)
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

export default NoteCard;