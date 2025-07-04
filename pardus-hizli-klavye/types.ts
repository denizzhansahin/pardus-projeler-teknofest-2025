export type AppState = 'configuring' | 'loading' | 'ready' | 'typing' | 'finished';
export type View = 'test' | 'training' | 'history';

export type LengthOption = 'short' | 'medium' | 'long' | 'custom';
export type DurationOption = 15 | 30 | 45 | 60 | 0 | 'custom'; // 0 for no limit

export interface TestConfig {
    type: 'ai' | 'custom';
    language: string;
    length: LengthOption;
    customLength: number;
    duration: DurationOption;
    customDuration: number;
    topic: string;
    customText?: string;
    isTraining?: boolean;
}

export interface Keystroke {
    char: string;
    timeOffset: number; // Milliseconds from the start of the test
    correct: boolean;
}

export interface TestResult {
    id: string;
    wpm: number;
    accuracy: number;
    rawWpm: number;
    charStats: {
        correct: number;
        incorrect: number;
        total: number;
    };
    timeElapsed: number;
    config: TestConfig;
    date: number;
    errors: { [char: string]: number };
    keystrokes: Keystroke[];
    originalText: string;
}

export interface TrainingLevel {
    level: number;
    title: string;
    description: string;
    text: string;
}