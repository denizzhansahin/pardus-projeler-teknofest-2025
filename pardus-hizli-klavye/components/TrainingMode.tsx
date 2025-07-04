
import React from 'react';
import { TrainingLevel } from '../types';

interface TrainingModeProps {
    levels: TrainingLevel[];
    onSelectLevel: (level: TrainingLevel) => void;
}

const LevelCard: React.FC<{ level: TrainingLevel; onSelect: () => void; }> = ({ level, onSelect }) => {
    return (
        <div className="bg-light p-6 rounded-lg shadow-lg hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-bold bg-primary text-white px-3 py-1 rounded-full">Seviye {level.level}</span>
                </div>
                <h3 className="text-xl font-bold mt-4 text-text_primary">{level.title}</h3>
                <p className="text-text_secondary mt-2 text-sm">{level.description}</p>
            </div>
            <button
                onClick={onSelect}
                className="mt-6 w-full bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Alıştırmaya Başla
            </button>
        </div>
    );
};

export const TrainingMode: React.FC<TrainingModeProps> = ({ levels, onSelectLevel }) => {
    return (
        <div className="bg-medium p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center">Alıştırma Alanı</h2>
            <p className="text-text_secondary mb-8 text-center">Temel tuş vuruşlarından karmaşık cümlelere kadar yönlendirmeli alıştırmalarla becerilerinizi geliştirin.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map(level => (
                    <LevelCard key={level.level} level={level} onSelect={() => onSelectLevel(level)} />
                ))}
            </div>
        </div>
    );
};