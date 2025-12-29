import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/AudioPlayer';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';

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
  const [highlightedVerse, setHighlightedVerse] = useState(-1);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  // Welcome state when no book selected
  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
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
            <p className="text-muted-foreground">Cargando escrituras...</p>
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
                verses={passage.verses.map(v => `Versículo ${v.verse}. ${v.text}`)}
                onVerseHighlight={setHighlightedVerse}
              />
            </div>
          )}

          <article className="scripture-text text-foreground leading-[2] space-y-1">
            {passage.verses.map((verse, index) => (
              <span 
                key={`${verse.chapter}-${verse.verse}`} 
                className={`inline transition-all duration-300 ${
                  highlightedVerse === index 
                    ? 'bg-primary/20 rounded px-1 py-0.5' 
                    : ''
                }`}
              >
                <sup className="verse-number">{verse.verse}</sup>
                <span>{verse.text.trim()}</span>{' '}
              </span>
            ))}
          </article>

          <div className="mt-12 pt-6 border-t border-border">
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
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-card/50">
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

      {/* Scripture Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden border-t border-border p-4 flex items-center justify-between bg-card/50">
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
