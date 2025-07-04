import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateTypingText, getTypingTips } from './services/geminiService';
import { Header } from './components/Header';
import { TypingTest } from './components/TypingTest';
import { ResultsModal } from './components/ResultsModal';
import { TrainingMode } from './components/TrainingMode';
import { HistoryPanel } from './components/HistoryPanel';
import { HistoryDetailView } from './components/HistoryDetailView';
import { AppState, TestResult, TestConfig, TrainingLevel } from './types';
import { TRAINING_LEVELS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('configuring');
    const [view, setView] = useState<'test' | 'training' | 'history'>('test');
    
    const [config, setConfig] = useState<TestConfig>({
        type: 'ai',
        language: 'Turkish',
        length: 'medium',
        customLength: 100,
        duration: 60,
        customDuration: 60,
        topic: 'bir uzay kaşifi hakkında bir hikaye',
    });
    const [textToType, setTextToType] = useState<string>('');
    const [lastResult, setLastResult] = useState<TestResult | null>(null);
    const [history, setHistory] = useLocalStorage<TestResult[]>('typing-history', []);
    const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
    const [aiTips, setAiTips] = useState<string>('');
    const [isTipsLoading, setIsTipsLoading] = useState(false);
    const [apiKey] = useLocalStorage<string>('gemini-api-key', '');
    const ai = new GoogleGenAI({ apiKey });

    const handleStartTest = useCallback(async (newConfig: TestConfig) => {
        setConfig(newConfig);
        setAppState('loading');
        try {
            if (newConfig.type === 'ai') {
                const text = await generateTypingText(ai, newConfig);
                setTextToType(text);
            } else {
                setTextToType(newConfig.customText || 'Başlamak için lütfen bir metin girin.');
            }
            setAppState('ready');
        } catch (error) {
            console.error("Metin oluşturulamadı:", error);
            setTextToType("Hata: YZ'den metin alınamadı. Lütfen tekrar deneyin veya özel metin kullanın.");
            setAppState('ready'); 
        }
    }, [ai]);
    
    const handleTypingStart = () => {
        if (appState === 'ready') {
            setAppState('typing');
        }
    };

    const handleTestComplete = (result: TestResult) => {
        setLastResult(result);
        const newHistory = [result, ...history].slice(0, 50); // Keep last 50 results
        setHistory(newHistory);
        setAppState('finished');
        setAiTips(''); // Reset tips for new result
    };

    const handleRetry = () => {
        setLastResult(null);
        setAppState('ready');
    };

    const handleNewTest = () => {
        setLastResult(null);
        setSelectedResult(null);
        setAiTips('');
        setTextToType('');
        setAppState('configuring');
    };
    
    const handleSelectTrainingLevel = (level: TrainingLevel) => {
        setTextToType(level.text);
        const newConfig: TestConfig = {
            ...config,
            type: 'custom',
            customText: level.text,
            topic: `Alıştırma: ${level.title}`,
            duration: 0, // No time limit for training levels unless specified
            isTraining: true,
        };
        setConfig(newConfig);
        setAppState('ready');
        setView('test');
    };

    const handleRequestAiTips = useCallback(async () => {
        if (!lastResult) return;
        setIsTipsLoading(true);
        try {
            const tips = await getTypingTips(ai, lastResult);
            setAiTips(tips);
        } catch (error) {
            console.error("YZ ipuçları alınamadı:", error);
            setAiTips("YZ'den ipuçları alınamadı. Lütfen bağlantınızı veya API anahtarınızı kontrol edin.");
        } finally {
            setIsTipsLoading(false);
        }
    }, [ai, lastResult]);

    const handleViewHistoryDetail = (result: TestResult) => {
        setSelectedResult(result);
        setView('history');
    };

    const handleCloseHistoryDetail = () => {
        setSelectedResult(null);
    };

    return (
        <div className="bg-dark min-h-screen text-text_primary flex flex-col items-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-6xl mx-auto">
                <Header currentView={view} setView={setView} />
                <main className="mt-8">
                    {view === 'test' && (
                        <TypingTest
                            appState={appState}
                            config={config}
                            textToType={textToType}
                            onConfigChange={handleStartTest}
                            onTestComplete={handleTestComplete}
                            onRestart={() => setAppState('ready')}
                            onTypingStart={handleTypingStart}
                        />
                    )}
                    {view === 'training' && (
                        <TrainingMode
                            levels={TRAINING_LEVELS}
                            onSelectLevel={handleSelectTrainingLevel}
                        />
                    )}
                    {view === 'history' && (
                        selectedResult ? (
                            <HistoryDetailView result={selectedResult} onClose={handleCloseHistoryDetail} />
                        ) : (
                            <HistoryPanel history={history} setHistory={setHistory} onSelectResult={handleViewHistoryDetail} />
                        )
                    )}
                </main>
            </div>
            {appState === 'finished' && lastResult && (
                <ResultsModal
                    result={lastResult}
                    onRetry={handleRetry}
                    onNewTest={handleNewTest}
                    aiTips={aiTips}
                    isTipsLoading={isTipsLoading}
                    onRequestAiTips={handleRequestAiTips}
                />
            )}
        </div>
    );
};

export default App;