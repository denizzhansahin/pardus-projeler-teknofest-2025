import React from 'react';
import { CameraIcon, UploadIcon, SparklesIcon, TrashIcon, PhotoIcon, CollectionIcon, ChatIcon, PlusCircleIcon } from './icons';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'library', name: 'Kütüphane', icon: PhotoIcon },
        { id: 'memories', name: 'Anılar', icon: SparklesIcon },
        { id: 'albums', name: 'Albümler', icon: CollectionIcon },
        { id: 'chat', name: 'Sohbet', icon: ChatIcon },
    ];

    return (
        <div className="w-64 bg-pardus-light-dark/50 dark:bg-pardus-light-dark/30 h-screen p-4 flex flex-col flex-shrink-0">
            <div className="flex items-center mb-10">
                <SparklesIcon className="h-8 w-8 text-pardus-accent" />
                <h1 className="text-2xl font-bold ml-2 text-pardus-text">Pardus Piksella</h1>
            </div>
            <nav className="flex-grow">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.id} className="mb-2">
                            <button
                                onClick={() => setActiveView(item.id)}
                                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-left ${
                                    activeView === item.id
                                        ? 'bg-pardus-accent text-white shadow-lg'
                                        : 'text-pardus-text-dark hover:bg-pardus-light-dark hover:text-pardus-text'
                                }`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="ml-4 font-semibold">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto flex flex-col gap-4">
                 <div className="p-4 bg-pardus-dark rounded-lg text-center">
                    <p className="text-pardus-text-dark text-sm">Pardus için tasarlandı.</p>
                    <p className="text-pardus-text text-xs mt-2">v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
