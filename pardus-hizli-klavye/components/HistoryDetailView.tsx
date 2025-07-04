import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TestResult, Keystroke } from '../types';
import { Keyboard } from './Keyboard';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface HistoryDetailViewProps {
    result: TestResult;
    onClose: () => void;
}

const PlaybackControls: React.FC<{
    onPlay: () => void;
    onPause: () => void;
    onReset: () => void;
    isPlaying: boolean;
}> = ({ onPlay, onPause, onReset, isPlaying }) => (
    <div className="flex items-center space-x-4">
        <button onClick={onReset} className="p-2 rounded-full bg-light hover:bg-gray-600 transition-colors">
            <RotateCcw size={20} />
        </button>
        <button onClick={isPlaying ? onPause : onPlay} className="p-3 rounded-full bg-primary text-white hover:bg-teal-600 transition-colors">
            {isPlaying ? (
                <Pause size={24} />
            ) : (
                <Play size={24} />
            )}
        </button>
    </div>
);

export const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ result, onClose }) => {
    const [playbackIndex, setPlaybackIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<number | null>(null);

    const originalText = result.originalText;

    const typedTextPlayback = useMemo(() => {
        let text = '';
        for (let i = 0; i <= playbackIndex && i < result.keystrokes.length; i++) {
            const stroke = result.keystrokes[i];
            if (stroke.char === 'Backspace') {
                text = text.slice(0, -1);
            } else {
                text += stroke.char;
            }
        }
        return text;
    }, [playbackIndex, result.keystrokes]);

    const activeKey = useMemo(() => {
        if (playbackIndex < 0 || playbackIndex >= result.keystrokes.length) return null;
        const stroke = result.keystrokes[playbackIndex];
        return { key: stroke.char, correct: stroke.correct };
    }, [playbackIndex, result.keystrokes]);

    const startPlayback = () => {
        setIsPlaying(true);
    };

    const pausePlayback = () => {
        setIsPlaying(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };
    
    const resetPlayback = () => {
        pausePlayback();
        setPlaybackIndex(-1);
    };

    useEffect(() => {
        if (isPlaying) {
            if (playbackIndex >= result.keystrokes.length - 1) {
                pausePlayback();
                return;
            }

            const nextIndex = playbackIndex + 1;
            const currentTime = playbackIndex >= 0 ? result.keystrokes[playbackIndex].timeOffset : 0;
            const nextTime = result.keystrokes[nextIndex].timeOffset;
            const delay = nextTime - currentTime;

            timerRef.current = window.setTimeout(() => {
                setPlaybackIndex(nextIndex);
            }, delay);
        }

        return () => {
            if(timerRef.current) clearTimeout(timerRef.current);
        }
    }, [isPlaying, playbackIndex, result.keystrokes]);
    
    useEffect(() => resetPlayback, [result]); // Reset if result changes

    return (
        <div className="bg-medium p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Test Tekrarı</h2>
                <button onClick={onClose} className="bg-light text-text_secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                    &larr; Geçmişe Dön
                </button>
            </div>
            
            {/* Playback Section */}
            <div className="space-y-4">
                <div className="bg-dark p-6 rounded-lg font-mono text-xl relative">
                    <p className="text-text_secondary leading-relaxed">
                        {(originalText || '').split('').map((char, index) => {
                            let typedChar = '';
                            if (index < typedTextPlayback.length) {
                                typedChar = typedTextPlayback[index];
                            }
                            let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
                            if (index < typedTextPlayback.length) {
                                state = typedChar === char ? 'correct' : 'incorrect';
                            }

                             const stateClasses = {
                                correct: 'text-correct',
                                incorrect: 'text-incorrect bg-red-500/20 rounded',
                                untyped: 'text-text_secondary opacity-50',
                            };

                            return <span key={index} className={stateClasses[state]}>{char}</span>
                        })}
                    </p>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20" style={{ transform: `translateY(${Math.floor(typedTextPlayback.length / 50) * 32}px)` }}></div>
                </div>

                <div className="flex items-center justify-center py-4">
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlay={startPlayback}
                        onPause={pausePlayback}
                        onReset={resetPlayback}
                    />
                </div>

                <Keyboard activeKey={activeKey} />
            </div>

            {/* Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-light p-4 rounded-lg text-center shadow-md">
                    <p className="text-sm text-text_secondary font-medium">DKS</p>
                    <p className="text-3xl font-bold text-primary">{result.wpm}</p>
                </div>
                <div className="bg-light p-4 rounded-lg text-center shadow-md">
                    <p className="text-sm text-text_secondary font-medium">Doğruluk</p>
                    <p className="text-3xl font-bold text-correct">{result.accuracy}%</p>
                </div>
                <div className="bg-light p-4 rounded-lg text-center shadow-md">
                    <p className="text-sm text-text_secondary font-medium">Süre</p>
                    <p className="text-3xl font-bold text-text_primary">{result.timeElapsed}s</p>
                </div>
                <div className="bg-light p-4 rounded-lg text-center shadow-md">
                    <p className="text-sm text-text_secondary font-medium">Hatalar</p>
                    <p className="text-3xl font-bold text-incorrect">{result.charStats.incorrect}</p>
                </div>
            </div>
        </div>
    );
};