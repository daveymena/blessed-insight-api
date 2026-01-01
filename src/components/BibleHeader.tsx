import { BookOpen, Menu, Sparkles, Search, Heart, Moon, Sun, Languages, GraduationCap, Palette, ChevronDown, Home, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { VersionSelector } from './VersionSelector';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { BibleBook } from '@/lib/bibleApi';

interface BibleHeaderProps {
  onMenuClick: () => void;
  onAIClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onStudyClick?: () => void;
  onThemeClick?: () => void;
  onHomeClick?: () => void;
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
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error changing font size:', e);
    }
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-500 ${hasScenicBackground ? 'bg-black/40 backdrop-blur-md shadow-sm border-white/10 text-white' : 'bg-background/95 backdrop-blur-sm border-border'}`}>
      <div className="flex items-center justify-between h-14 px-3 md:px-6">
        {/* Lado izquierdo - Menú y Título */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Botón Home (móvil) */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden flex-shrink-0 h-9 w-9 ${hasScenicBackground ? 'hover:bg-white/10 text-white' : ''}`}
            onClick={onHomeClick}
          >
            <Home className="h-5 w-5" />
          </Button>

          {/* Título del libro/capítulo */}
          <div
            className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg transition-colors min-w-0 ${hasScenicBackground ? 'hover:bg-white/10' : 'hover:bg-secondary/50'}`}
            onClick={onTitleClick}
          >
            <div className="hidden sm:block">
              <div className={`p-1.5 rounded-lg ${hasScenicBackground ? 'bg-white/20' : 'bg-primary/10'}`}>
                <BookOpen className={`h-4 w-4 ${hasScenicBackground ? 'text-white' : 'text-primary'}`} />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className={`text-base sm:text-lg font-serif font-semibold flex items-center gap-1 truncate ${hasScenicBackground ? 'text-white' : 'text-foreground'}`}>
                {selectedBook ? `${selectedBook.abbrev} ${selectedChapter}` : 'Blessed Insight'}
                <ChevronDown className={`h-4 w-4 flex-shrink-0 ${hasScenicBackground ? 'text-white/70' : 'text-muted-foreground'}`} />
              </h1>
            </div>
          </div>
        </div>

        {/* Lado derecho - Acciones */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Versión - Solo en tablet/desktop */}
          <div className="hidden sm:block">
            <VersionSelector onVersionChange={onVersionChange} />
          </div>

          {/* Botón IA - Siempre visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onAIClick}
            className={`h-9 w-9 ${hasScenicBackground ? 'text-purple-300 hover:bg-white/10' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}
            title="Asistente Biblo"
          >
            <Sparkles className="h-5 w-5" />
          </Button>

          {/* MÓVIL: Menú hamburguesa con todas las opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`sm:hidden h-9 w-9 ${hasScenicBackground ? 'hover:bg-white/10 text-white' : ''}`}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onMenuClick}>
                <Menu className="h-4 w-4 mr-3" />
                Libros de la Biblia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSearchClick}>
                <Search className="h-4 w-4 mr-3" />
                Buscar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFavoritesClick}>
                <Heart className="h-4 w-4 mr-3" />
                Favoritos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStudyClick}>
                <GraduationCap className="h-4 w-4 mr-3" />
                Centro de Estudio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onThemeClick}>
                <Palette className="h-4 w-4 mr-3" />
                Personalizar Tema
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="h-4 w-4 mr-3" /> : <Moon className="h-4 w-4 mr-3" />}
                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFontSizeChange(2)}>
                <span className="w-4 h-4 mr-3 flex items-center justify-center font-bold text-xs">A+</span>
                Aumentar Texto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFontSizeChange(-2)}>
                <span className="w-4 h-4 mr-3 flex items-center justify-center font-bold text-xs">A-</span>
                Reducir Texto
              </DropdownMenuItem>
              {!user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLoginClick}>
                    Iniciar Sesión
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DESKTOP: Controles individuales */}
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className={`h-9 w-9 ${hasScenicBackground ? 'text-white hover:bg-white/10' : ''}`}
              title="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onFavoritesClick}
              className={`h-9 w-9 ${hasScenicBackground ? 'text-white hover:bg-white/10' : ''}`}
              title="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <div className={`w-[1px] h-6 mx-1 ${hasScenicBackground ? 'bg-white/20' : 'bg-border'}`} />

            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeClick}
              className={`h-9 w-9 ${hasScenicBackground ? 'text-white hover:bg-white/10' : 'text-muted-foreground'}`}
              title="Tema"
            >
              <Palette className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={`h-9 w-9 ${hasScenicBackground ? 'text-white hover:bg-white/10' : 'text-muted-foreground'}`}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border ml-1 ${hasScenicBackground ? 'bg-white/20 border-white/30 text-white' : 'bg-primary/20 border-primary/30 text-primary'}`}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onLoginClick}
                className={`ml-1 ${hasScenicBackground ? 'border-white/30 text-white hover:bg-white/10' : 'border-primary/20 text-primary hover:bg-primary/5'}`}
              >
                Acceder
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
