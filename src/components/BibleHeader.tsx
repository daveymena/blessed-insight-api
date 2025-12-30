import { BookOpen, Menu, Sparkles, Search, Heart, Moon, Sun, Languages, GraduationCap, Palette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { VersionSelector } from './VersionSelector';
import { Switch } from '@/components/ui/switch';
import { useThemeSettings } from '@/hooks/useThemeSettings';

import type { BibleBook } from '@/lib/bibleApi';

interface BibleHeaderProps {
  onMenuClick: () => void;
  onAIClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onStudyClick?: () => void;
  onThemeClick?: () => void;
  onVersionChange?: () => void;
  showSpanishEquivalent?: boolean;
  onSpanishToggle?: (value: boolean) => void;
  isSpanishVersion?: boolean;
  user?: any;
  onLoginClick?: () => void;
  onTitleClick?: () => void;
  selectedBook?: BibleBook | null;
  selectedChapter?: number;
}

export function BibleHeader({
  onMenuClick,
  onAIClick,
  onSearchClick,
  onFavoritesClick,
  onStudyClick,
  onThemeClick,
  onVersionChange,
  showSpanishEquivalent = false,
  onSpanishToggle,
  isSpanishVersion = true,
  user,
  onLoginClick,
  onTitleClick,
  selectedBook,
  selectedChapter
}: BibleHeaderProps) {
  const { hasScenicBackground } = useThemeSettings();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bible_darkMode');
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bible_darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleFontSizeChange = (delta: number) => {
    try {
      const saved = localStorage.getItem('bible_theme_settings');
      let settings = saved ? JSON.parse(saved) : { fontSize: 18 };

      const newSize = Math.max(14, Math.min(60, (settings.fontSize || 18) + delta));
      const newSettings = { ...settings, fontSize: newSize };

      localStorage.setItem('bible_theme_settings', JSON.stringify(newSettings));
      // Notificar a otros componentes (ScriptureReader)
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error changing font size:', e);
    }
  };

  return (
    <header className={`sticky top-0 z-40 border-b border-border transition-all duration-500 ${hasScenicBackground ? 'bg-background/60 backdrop-blur-md shadow-sm' : 'bg-background/95 backdrop-blur-sm'}`}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-secondary/50 transition-colors" onClick={onTitleClick}>
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                {selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Blessed Insight'}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Biblia de Estudio con IA
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* User Auth Status */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginClick}
              className="mr-2 hidden sm:flex border-primary/20 text-primary hover:bg-primary/5"
            >
              Acceder
            </Button>
          )}

          {/* Selector de Versión (Compacto en móvil) */}
          <VersionSelector onVersionChange={onVersionChange} />

          {/* Botón IA (Principal) */}
          <Button
            variant="default"
            size="sm"
            onClick={onAIClick}
            className="hidden sm:flex bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-1 shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">IA</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onAIClick}
            className="sm:hidden text-purple-600 dark:text-purple-400"
            title="Asistente IA"
          >
            <Sparkles className="h-5 w-5" />
          </Button>

          <div className="w-[1px] h-6 bg-border mx-1" />

          {/* MÓVIL: Botón de Ajustes Unificado */}
          <Button
            variant="outline"
            size="icon"
            onClick={onThemeClick}
            title="Ajustes de Lectura"
            className="flex sm:hidden border-primary/20 bg-primary/5 text-primary"
          >
            <Palette className="h-5 w-5" />
          </Button>

          {/* ESCRITORIO: Controles Individuales */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Zoom en escritorio */}
            <div className="flex items-center border border-border rounded-lg bg-muted/30 p-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFontSizeChange(-2)}>
                <span className="text-xs font-bold">A-</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFontSizeChange(2)}>
                <span className="text-xs font-bold">A+</span>
              </Button>
            </div>

            {/* Tema y Modo Oscuro en escritorio */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeClick}
              className="text-muted-foreground"
            >
              <Palette className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-muted-foreground"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
