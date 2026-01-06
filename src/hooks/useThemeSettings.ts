import { useState, useEffect } from 'react';
import { BIBLE_THEMES, type ThemeConfig } from '@/lib/themeConfig';

export interface ExtendedThemeSettings {
    activeThemeId: string;
    fontSize: number;
    lineHeight: number;
    font: string;
    spanishEquivalent: boolean;
}

const DEFAULT_SETTINGS: ExtendedThemeSettings = {
    activeThemeId: 'pure-light',
    fontSize: 18,
    lineHeight: 2,
    font: 'serif',
    spanishEquivalent: false
};

export function useThemeSettings() {
    const [settings, setSettings] = useState<ExtendedThemeSettings>(DEFAULT_SETTINGS);
    const [activeTheme, setActiveTheme] = useState<ThemeConfig>(BIBLE_THEMES.find(t => t.id === DEFAULT_SETTINGS.activeThemeId)!);

    useEffect(() => {
        const loadSettings = () => {
            try {
                const saved = localStorage.getItem('bible_theme_v2');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSettings(prev => ({ ...prev, ...parsed }));

                    const theme = BIBLE_THEMES.find(t => t.id === parsed.activeThemeId) || BIBLE_THEMES[0];
                    setActiveTheme(theme);

                    // Sincronizar clases de la UI (Dark mode)
                    if (theme.uiMode === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } else {
                    // Fallback a herencia del sistema o primer tema
                    setActiveTheme(BIBLE_THEMES.find(t => t.id === 'pure-light') || BIBLE_THEMES[0]);
                }
            } catch (e) {
                console.error('Error loading theme settings:', e);
            }
        };

        loadSettings();

        const handleStorageChange = () => loadSettings();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('theme-change', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-change', handleStorageChange);
        };
    }, []);

    const updateTheme = (themeId: string) => {
        const theme = BIBLE_THEMES.find(t => t.id === themeId);
        if (theme) {
            const newSettings = { ...settings, activeThemeId: themeId };
            setSettings(newSettings);
            setActiveTheme(theme);
            localStorage.setItem('bible_theme_v2', JSON.stringify(newSettings));

            // Togle dark mode
            if (theme.uiMode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            window.dispatchEvent(new Event('theme-change'));
        }
    };

    const updateSettings = (partial: Partial<ExtendedThemeSettings>) => {
        const newSettings = { ...settings, ...partial };
        setSettings(newSettings);
        localStorage.setItem('bible_theme_v2', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('theme-change'));
    };

    return {
        settings,
        activeTheme,
        updateTheme,
        updateSettings,
        hasScenicBackground: activeTheme.type === 'scenic' || activeTheme.type === 'texture'
    };
}
