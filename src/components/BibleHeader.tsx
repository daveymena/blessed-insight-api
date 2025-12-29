import { BookOpen, Menu, Sparkles, Search, Heart, Moon, Sun, Languages, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { VersionSelector } from './VersionSelector';
import { Switch } from '@/components/ui/switch';

interface BibleHeaderProps {
  onMenuClick: () => void;
  onAIClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onStudyClick?: () => void;
  onVersionChange?: () => void;
  showSpanishEquivalent?: boolean;
  onSpanishToggle?: (value: boolean) => void;
  isSpanishVersion?: boolean;
}

export function BibleHeader({ 
  onMenuClick, 
  onAIClick, 
  onSearchClick, 
  onFavoritesClick,
  onStudyClick,
  onVersionChange,
  showSpanishEquivalent = false,
  onSpanishToggle,
  isSpanishVersion = true
}: BibleHeaderProps) {
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

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
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
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">
                Blessed Insight
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Biblia de Estudio con IA
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <VersionSelector onVersionChange={onVersionChange} />
          
          {/* Toggle para mostrar equivalente en español - solo visible si no es versión española */}
          {!isSpanishVersion && onSpanishToggle && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50" title="Mostrar equivalente en español (RVR)">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">ES</span>
              <Switch
                checked={showSpanishEquivalent}
                onCheckedChange={onSpanishToggle}
                className="scale-75"
              />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            title="Buscar"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavoritesClick}
            title="Favoritos"
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* Botón Centro de Estudio */}
          {onStudyClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStudyClick}
              className="hidden sm:flex gap-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400"
              title="Centro de Estudio"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden md:inline">Estudio</span>
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={onAIClick}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-1"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
