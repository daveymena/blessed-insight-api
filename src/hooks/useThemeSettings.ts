import { useState, useEffect } from 'react';

export interface ThemeSettings {
    theme: string;
    background: string;
    fontSize: number;
    lineHeight: number;
    font: string;
    darkMode: boolean;
    spanishEquivalent: boolean;
}

const DEFAULT_SETTINGS: ThemeSettings = {
    theme: "light",
    background: "none",
    fontSize: 18,
    lineHeight: 2,
    font: "serif",
    darkMode: false,
    spanishEquivalent: false
};

export function useThemeSettings() {
    const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
    const [hasScenicBackground, setHasScenicBackground] = useState(false);

    useEffect(() => {
        const loadSettings = () => {
            try {
                const saved = localStorage.getItem('bible_theme_settings');
                const darkSaved = localStorage.getItem('bible_darkMode');

                if (saved) {
                    const parsed = JSON.parse(saved);
                    const merged = {
                        ...DEFAULT_SETTINGS,
                        ...parsed,
                        darkMode: darkSaved ? JSON.parse(darkSaved) : (parsed.darkMode || false)
                    };
                    setSettings(merged);
                    setHasScenicBackground(
                        merged.background !== 'none' &&
                        merged.background !== 'dots' &&
                        merged.background !== 'paper'
                    );
                }
            } catch (e) {
                console.error('Error loading theme settings:', e);
            }
        };

        loadSettings();

        const handleStorageChange = () => {
            loadSettings();
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-window updates
        window.addEventListener('theme-change', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-change', handleStorageChange);
        };
    }, []);

    return { settings, hasScenicBackground };
}
