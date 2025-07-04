import React from 'react';
import { TestResult } from '../types';

interface HistoryPanelProps {
    history: TestResult[];
    setHistory: (history: TestResult[]) => void;
    onSelectResult: (result: TestResult) => void;
}

const HistoryRow: React.FC<{ result: TestResult, onSelect: () => void }> = ({ result, onSelect }) => (
    <div 
        onClick={onSelect}
        className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center bg-light p-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
        <div className="col-span-3 md:col-span-2">
            <div className="flex items-center space-x-2">
                <p className="font-semibold text-text_primary truncate">{result.config.topic || 'Özel Metin'}</p>
                {result.config.isTraining && <span className="text-xs bg-secondary text-white font-semibold px-2 py-0.5 rounded-full">Alıştırma</span>}
            </div>
            <p className="text-sm text-text_secondary">{new Date(result.date).toLocaleString('tr-TR')}</p>
        </div>
        <div className="text-center">
            <p className="text-xl font-bold text-primary">{result.wpm}</p>
            <p className="text-xs text-text_secondary">DKS</p>
        </div>
        <div className="text-center">
            <p className="text-xl font-bold text-correct">{result.accuracy}%</p>
            <p className="text-xs text-text_secondary">Doğruluk</p>
        </div>
        <div className="text-center">
            <p className="text-xl font-bold text-text_primary">{result.timeElapsed}s</p>
            <p className="text-xs text-text_secondary">Süre</p>
        </div>
        <div className="text-center">
             <p className="text-sm text-text_primary capitalize">{result.config.language}</p>
             <p className="text-xs text-text_secondary">Dil</p>
        </div>
    </div>
);

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, setHistory, onSelectResult }) => {
    const clearHistory = () => {
        if (window.confirm("Tüm yazma geçmişinizi temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            setHistory([]);
        }
    };
    
    return (
        <div className="bg-medium p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gelişiminiz</h2>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm">Geçmişi Temizle</button>
                )}
            </div>
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(result => <HistoryRow key={result.id} result={result} onSelect={() => onSelectResult(result)} />)}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-text_secondary">Henüz herhangi bir testi tamamlamadınız.</p>
                    <p className="text-text_secondary mt-1">Bir testi bitirdiğinizde sonuçlarınız burada görünecektir.</p>
                </div>
            )}
        </div>
    );
};