import { BookOpen, Menu, Sparkles, Search, Heart, Moon, Sun, Languages, GraduationCap, Palette, ChevronDown, Home, MoreVertical, X, MessageCircle, Share2 } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { VersionSelector } from './VersionSelector';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        {/* Lado izquierdo */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onHomeClick}>
            <Logo size={32} />
          </Button>

          <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-lg truncate" onClick={onTitleClick}>
            <h1 className="text-sm md:text-base font-serif font-black flex items-center gap-1 truncate">
              {selectedBook ? `${selectedBook.abbrev} ${selectedChapter}` : "Blessed Insight"}
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </h1>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:block">
            <VersionSelector onVersionChange={onVersionChange} />
          </div>

          <Button variant="ghost" size="icon" onClick={onChatClick} className="text-blue-600 dark:text-blue-400">
            <MessageCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onAIClick} className="text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5" />
          </Button>

          {/* Menú Móvil */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onMenuClick}><BookOpen className="h-4 w-4 mr-2" /> Libros</DropdownMenuItem>
                <DropdownMenuItem onClick={onSearchClick}><Search className="h-4 w-4 mr-2" /> Buscar</DropdownMenuItem>
                <DropdownMenuItem onClick={onThemeClick}><Palette className="h-4 w-4 mr-2" /> Temas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Versión Tablet/Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onMenuClick}><BookOpen className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={onThemeClick}><Palette className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleDarkModeToggle}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
