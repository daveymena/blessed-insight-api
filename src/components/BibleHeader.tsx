import { BookOpen, Menu, Moon, Sun, Palette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { VersionSelector } from './VersionSelector';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn } from '@/lib/utils';
import type { BibleBook } from '@/lib/bibleApi';

interface BibleHeaderProps {
  onMenuClick: () => void;
  onAIClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onStudyClick?: () => void;
  onThemeClick?: () => void;
  onHomeClick?: () => void;
  onChatClick?: () => void;
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
  onHomeClick,
  onChatClick,
  onVersionChange,
  user,
  onLoginClick,
  onTitleClick,
  selectedBook,
  selectedChapter
}: BibleHeaderProps) {
  const { hasScenicBackground, activeTheme } = useThemeSettings();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setDarkMode(true);
  }, []);

  const handleDarkModeToggle = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const isDarkMode = activeTheme.uiMode === 'dark';

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b shadow-sm text-foreground overflow-hidden transition-all duration-500",
      activeTheme.type === 'scenic'
        ? (isDarkMode ? "bg-black/40 backdrop-blur-xl border-white/10" : "bg-white/60 backdrop-blur-xl border-black/5")
        : "bg-card border-border"
    )}>
      <div className="flex items-center justify-between h-14 px-3 md:px-6">
        {/* Lado izquierdo: Menú hamburguesa + Título */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 px-2 py-1 rounded-lg" onClick={onTitleClick}>
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm md:text-base font-serif font-bold truncate">
              {selectedBook ? `${selectedBook.name} ${selectedChapter}` : "Biblia"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </div>
        </div>

        {/* Lado derecho: Versión + Tema + Modo oscuro */}
        <div className="flex items-center gap-1 shrink-0">
          <VersionSelector onVersionChange={onVersionChange} />
          
          <Button variant="ghost" size="icon" onClick={onThemeClick}>
            <Palette className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleDarkModeToggle}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
