import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Volume2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/AudioPlayer';
import { getCurrentVersionInfo } from '@/lib/bibleApi';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { useThemeSettings } from '@/hooks/useThemeSettings';

interface ScriptureReaderProps {
  book: BibleBook | null;
  chapter: number;
  passage: BiblePassage | undefined;
  isLoading: boolean;
  error: Error | null;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

// Obtener configuración del tema
function getThemeSettings() {
  try {
    const saved = localStorage.getItem('bible_theme_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) { }
  return { background: 'none', fontSize: 18, lineHeight: 2, font: 'serif' };
}

// Mapeo de fondos
const BACKGROUND_CLASSES: Record<string, string> = {
  'none': '',
  'paper': 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950',
  'parchment': 'bg-gradient-to-b from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950 dark:via-amber-950 dark:to-yellow-950',
  'clouds': 'bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-slate-900 dark:to-blue-950',
  'sunset-sky': 'bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 dark:from-orange-950 dark:via-pink-950 dark:to-purple-950',
  'forest-mist': 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950',
  'ocean-depth': 'bg-gradient-to-br from-cyan-50 via-blue-100 to-indigo-100 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950',
  'lavender-field': 'bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 dark:from-purple-950 dark:via-violet-950 dark:to-fuchsia-950',
  'warm-sand': 'bg-gradient-to-br from-yellow-50 via-amber-100 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950',
  'night-sky': 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900',
};

const FONT_FAMILIES: Record<string, string> = {
  'serif': "'Cormorant Garamond', Georgia, serif",
  'sans': "'Inter', system-ui, sans-serif",
  'georgia': "Georgia, 'Times New Roman', serif",
  'palatino': "'Palatino Linotype', 'Book Antiqua', serif",
};

export function ScriptureReader({
  book,
  chapter,
  passage,
  isLoading,
  error,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: ScriptureReaderProps) {
  const { settings: themeSettings, hasScenicBackground } = useThemeSettings();
  const [highlightedVerse, setHighlightedVerse] = useState(-1);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const versionInfo = getCurrentVersionInfo();

  const backgroundClass = BACKGROUND_CLASSES[themeSettings.background] || '';
  const fontFamily = FONT_FAMILIES[themeSettings.font] || FONT_FAMILIES.serif;

  // Welcome state when no book selected
  if (!book) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${backgroundClass}`}>
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">📖</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
            Bienvenido a Blessed Insight
          </h2>
          <p className="text-muted-foreground">
            Selecciona un libro y capítulo para comenzar a leer las Escrituras en español.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">
              {versionInfo.isOnline ? (
                <span className="flex items-center justify-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  Descargando {versionInfo.shortName}...
                </span>
              ) : (
                'Cargando escrituras...'
              )}
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error al cargar
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            No se pudo cargar el capítulo. Por favor, intenta nuevamente.
          </p>
        </div>
      );
    }

    if (passage?.verses && passage.verses.length > 0) {
      return (
        <div className="animate-fade-in">
          {/* Audio Player */}
          {showAudioPlayer && (
            <div className="mb-6">
              <AudioPlayer
                verses={passage.verses.map(v => v.text)}
                onVerseHighlight={setHighlightedVerse}
              />
            </div>
          )}

          <article
            className="scripture-text text-foreground"
            style={{
              fontFamily,
              fontSize: `${themeSettings.fontSize}px`,
              lineHeight: themeSettings.lineHeight,
            }}
          >
            {passage.verses.map((verse, index) => (
              <div
                key={`${verse.chapter}-${verse.verse}`}
                id={`verse-${verse.verse}`}
                className={`mb-4 transition-all duration-300 scroll-mt-24 p-2 rounded-lg ${highlightedVerse === index
                  ? 'bg-primary/20 -mx-2'
                  : ''
                  }`}
              >
                <sup className="verse-number font-semibold text-primary/70 mr-2 text-sm">{verse.verse}</sup>
                <span className="verse-content" dangerouslySetInnerHTML={{ __html: verse.text.trim() }} />
              </div>
            ))}
          </article>

          <div className="mt-12 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              {passage.translation_name || 'Reina Valera'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-20 text-muted-foreground">
        No hay contenido disponible para este capítulo.
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chapter Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="text-center flex items-center gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground">
              {book.name}
            </h2>
            <p className="text-sm text-muted-foreground">Capítulo {chapter}</p>
          </div>

          {/* Botón de Audio */}
          <Button
            variant={showAudioPlayer ? "default" : "ghost"}
            size="icon"
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className={`h-9 w-9 ${showAudioPlayer ? 'bg-primary' : ''}`}
            title={showAudioPlayer ? "Ocultar reproductor" : "Escuchar capítulo"}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="gap-1"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scripture Content with Background */}
      <div className={`flex-1 overflow-auto ${!hasScenicBackground ? backgroundClass : ''} transition-colors duration-500`}>
        <div className={`max-w-3xl mx-auto px-4 md:px-8 py-8 min-h-full transition-all duration-500 ${hasScenicBackground ? 'bg-glass/80 rounded-xl my-4 mx-4 shadow-xl backdrop-blur-md' : ''}`}>
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden border-t border-border p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="flex-1 mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="flex-1 ml-2"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
