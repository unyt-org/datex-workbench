export interface Preferences {
    appearance: {
        theme: 'system' | 'light' | 'dark';
        highContrast: boolean;
        reduceMotion: boolean;
    };
    language: {
        locale: 'en' | 'de' | 'hi';
    };
    editor: {
        fontSize: number;
        showLineNumbers: boolean;
    };
}

export const DEFAULT_PREFERENCES: Preferences = {
    appearance: {
        theme: 'system',
        highContrast: false,
        reduceMotion: false,
    },
    language: {
        locale: 'en',
    },
    editor: {
        fontSize: 14,
        showLineNumbers: true,
    },
};

export const STORAGE_KEY = 'datex-workbench-preferences';
