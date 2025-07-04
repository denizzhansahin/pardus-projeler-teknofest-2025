import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, TestConfig, TestResult, Keystroke } from '../types';
import { SettingsPanel } from './SettingsPanel';
import { useHotkeys } from 'react-hotkeys-hook';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface TypingTestProps {
    appState: AppState;
    config: TestConfig;
    textToType: string;
    onConfigChange: (newConfig: TestConfig) => void;
    onTestComplete: (result: TestResult) => void;
    onRestart: () => void;
    onTypingStart: () => void;
}

const Caret: React.FC = () => (
    <span className="animate-pulse text-caret text-2xl absolute" style={{ transform: 'translateY(-2px)' }}>|</span>
);

const Character: React.FC<{ char: string; state: 'correct' | 'incorrect' | 'untyped' }> = React.memo(({ char, state }) => {
    const stateClasses = {
        correct: 'text-correct',
        incorrect: 'text-incorrect bg-red-500/20 rounded',
        untyped: 'text-text_secondary',
    };
    return <span className={`transition-colors duration-150 ${stateClasses[state]}`}>{char}</span>;
});


export const TypingTest: React.FC<TypingTestProps> = ({ appState, config, textToType, onConfigChange, onTestComplete, onRestart, onTypingStart }) => {
    const [internalState, setInternalState] = useState<{
        typed: string;
        errors: { [char: string]: number };
        startTime: number | null;
        timeElapsed: number;
        keystrokes: Keystroke[];
    }>({
        typed: '',
        errors: {},
        startTime: null,
        timeElapsed: 0,
        keystrokes: [],
    });

    const [timeLeft, setTimeLeft] = useState(config.duration === 'custom' ? config.customDuration : (config.duration || 0));
    const timerIntervalRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const isTestRunning = appState === 'typing';

    const resetTest = useCallback(() => {
        setInternalState({ typed: '', errors: {}, startTime: null, timeElapsed: 0, keystrokes: [] });
        if(timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
        const newTime = config.duration === 'custom' ? config.customDuration : (config.duration || 0);
        if (typeof newTime === 'number') {
           setTimeLeft(newTime);
        }
        inputRef.current?.focus();
    }, [config]);

    useEffect(() => {
        if(appState === 'ready') {
            resetTest();
        }
    }, [appState, textToType, resetTest]);

    const startTimer = useCallback(() => {
        const startTime = Date.now();
        setInternalState(prev => ({ ...prev, startTime }));
        if(timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);

        if (config.duration !== 0) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        window.clearInterval(timerIntervalRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else { // Practice mode, count up
            timerIntervalRef.current = window.setInterval(() => {
                setInternalState(p => ({...p, timeElapsed: p.startTime ? (Date.now() - p.startTime)/1000 : 0 }));
            }, 100);
        }
    }, [config.duration, config.customDuration]);

    useEffect(() => {
        if (appState === 'typing' && !internalState.startTime) {
            startTimer();
        }
    }, [appState, internalState.startTime, startTimer]);


    const finishTest = useCallback(() => {
        if (!isTestRunning) return;
        if(timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
        
        const endTime = Date.now();
        const timeElapsed = internalState.startTime ? (endTime - internalState.startTime) / 1000 : 0;
        const rawWpm = (internalState.typed.length / 5) / (timeElapsed / 60 || 1);

        const correctChars = internalState.typed.split('').filter((char, i) => char === textToType[i]).length;
        const accuracy = internalState.typed.length > 0 ? (correctChars / internalState.typed.length) * 100 : 0;
        const wpm = rawWpm * (accuracy / 100);
        
        onTestComplete({
            id: new Date().toISOString(),
            wpm: Math.round(wpm > 0 ? wpm : 0),
            accuracy: parseFloat(accuracy.toFixed(2)),
            rawWpm: Math.round(rawWpm),
            charStats: {
                correct: correctChars,
                incorrect: Object.values(internalState.errors).reduce((a, b) => a + b, 0),
                total: internalState.typed.length,
            },
            timeElapsed: parseFloat(timeElapsed.toFixed(2)),
            config: config,
            date: Date.now(),
            errors: internalState.errors,
            keystrokes: internalState.keystrokes,
            originalText: textToType,
        });
    }, [isTestRunning, internalState, textToType, config, onTestComplete]);

    useEffect(() => {
        const testDuration = config.duration === 'custom' ? config.customDuration : config.duration;
        if (timeLeft === 0 && typeof testDuration === 'number' && testDuration !== 0) {
            finishTest();
        }
    }, [timeLeft, config.duration, config.customDuration, finishTest]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (appState === 'finished' || appState === 'loading') return;
        if (e.key === 'Escape') {
             e.preventDefault();
             onRestart();
             resetTest();
             return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            onRestart();
            resetTest();
            return;
        }

        if (appState === 'ready' && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            onTypingStart();
        }

        if (appState !== 'typing') return;

        if (e.key.length === 1 && internalState.typed.length < textToType.length) {
            e.preventDefault();
            const char = e.key;
            const timeOffset = internalState.startTime ? Date.now() - internalState.startTime : 0;
            const correct = char === textToType[internalState.typed.length];

            const newKeystroke: Keystroke = { char, timeOffset, correct };

            setInternalState(prev => ({
                ...prev,
                typed: prev.typed + char,
                keystrokes: [...prev.keystrokes, newKeystroke],
                errors: correct ? prev.errors : { ...prev.errors, [textToType[prev.typed.length]]: (prev.errors[textToType[prev.typed.length]] || 0) + 1 },
            }));

        } else if (e.key === 'Backspace') {
            e.preventDefault();
            if (internalState.typed.length > 0) {
                 const timeOffset = internalState.startTime ? Date.now() - internalState.startTime : 0;
                 const newKeystroke: Keystroke = { char: 'Backspace', timeOffset, correct: false };
                setInternalState(prev => ({ 
                    ...prev, 
                    typed: prev.typed.slice(0, -1),
                    keystrokes: [...prev.keystrokes, newKeystroke],
                }));
            }
        }
    };
    
    useEffect(() => {
        if (appState === 'typing' && internalState.typed.length === textToType.length && textToType.length > 0) {
            finishTest();
        }
    }, [appState, internalState.typed, textToType, finishTest]);

    useHotkeys('ctrl+r, cmd+r', (e) => {
        e.preventDefault();
        onRestart();
        resetTest();
    }, {}, [onRestart, resetTest]);

    const focusInput = () => inputRef.current?.focus();
    
    const chars = textToType.split('').map((char, index) => {
        let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
        if (index < internalState.typed.length) {
            state = internalState.typed[index] === char ? 'correct' : 'incorrect';
        }
        return (
            <React.Fragment key={index}>
                {index === internalState.typed.length && <Caret />}
                <Character char={char} state={state} />
            </React.Fragment>
        );
    });

    return (
        <div className="space-y-8">
            {appState === 'configuring' ? (
                <SettingsPanel initialConfig={config} onStart={onConfigChange} />
            ) : (
                <div className="bg-medium p-6 sm:p-8 rounded-lg shadow-xl transition-opacity duration-300" onClick={focusInput}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-2xl font-mono font-bold text-primary">
                             {config.duration !== 0 ? `${timeLeft}s` : `${internalState.timeElapsed.toFixed(1)}s`}
                        </div>
                        <button 
                            onClick={() => { onRestart(); resetTest(); }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 bg-light text-text_secondary hover:bg-gray-600">
                             <RotateCcw size={16} />
                             <span>Yeniden Başlat (Tab)</span>
                        </button>
                    </div>

                    {appState === 'loading' ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="ml-4 text-text_secondary">Yapay zeka ile metin oluşturuluyor...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <p className="text-xl sm:text-2xl font-mono leading-relaxed tracking-wider">
                                {chars}
                                {internalState.typed.length === textToType.length && textToType.length > 0 && <Caret />}
                            </p>
                            <input
                                ref={inputRef}
                                type="text"
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default"
                                onKeyDown={handleKeyDown}
                                autoFocus
                                disabled={appState === 'finished'}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};