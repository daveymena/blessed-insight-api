import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Volume2, Wifi, Heart, BookOpen, Languages, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/AudioPlayer';
import { getCurrentVersionInfo } from '@/lib/bibleApi';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AdPlaceholder } from './AdPlaceholder';
import { NoteDialog } from './NoteDialog';
import { VersionComparator } from './VersionComparator';
import { personalStudyService, type Note } from '@/lib/personalStudyService';
import { toast } from 'sonner';
import { callAIFast } from '@/lib/aiProvider';

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
  user?: any;
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
  user,
}: ScriptureReaderProps) {
  const { settings: themeSettings, hasScenicBackground } = useThemeSettings();
  const [highlightedVerse, setHighlightedVerse] = useState(-1);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState(-1);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const versionInfo = getCurrentVersionInfo();

  // Cargar notas al montar o cambiar de capítulo
  useEffect(() => {
    if (user) {
      personalStudyService.getNotes().then(allNotes => {
        const chapterNotes = allNotes.filter(n => n.bookId === book?.id && n.chapter === chapter);
        setNotes(chapterNotes);
      });
    }
  }, [book?.id, chapter, user]);

  // Reset analysis when chapter changes
  useEffect(() => {
    setAnalysisContent(null);
    setShowAnalysis(false);
  }, [book?.id, chapter]);

  const handleQuickAnalysis = async () => {
    if (!book || !passage?.verses) return;
    
    // Check cache first
    const cacheKey = `quick_analysis_${book.id}_${chapter}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { content, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 min cache
        setAnalysisContent(content);
        setShowAnalysis(true);
        return;
      }
    }

    setAnalysisLoading(true);
    setShowAnalysis(true);
    
    const passageText = passage.verses.map(v => v.text).join(' ').substring(0, 1200);
    
    const messages = [
      { role: 'system' as const, content: `Eres un teólogo experto. Responde en español de forma clara y estructurada con emojis.` },
      { role: 'user' as const, content: `Análisis rápido de ${book.name} ${chapter}:
"${passageText}"

Proporciona un análisis BREVE pero ÚTIL:

📋 RESUMEN (2-3 oraciones sobre el contenido principal)

🎯 TEMA CENTRAL (1 frase)

👥 PERSONAJES CLAVE (si los hay)

💎 VERSÍCULOS DESTACADOS (2-3 versículos importantes con breve explicación)

🔑 PALABRAS CLAVE (3-4 términos importantes)

💡 APLICACIÓN PRÁCTICA (1-2 puntos concretos para hoy)

🙏 ORACIÓN SUGERIDA (1-2 oraciones basadas en el texto)

Sé conciso pero profundo.` }
    ];

    try {
      const result = await callAIFast(messages);
      setAnalysisContent(result.content);
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({ content: result.content, timestamp: Date.now() }));
    } catch (e) {
      setAnalysisContent('Error al generar el análisis. Intenta nuevamente.');
    }
    setAnalysisLoading(false);
  };

  const handleHighlight = async (color: string) => {
    if (selectedVerseIndex < 0 || !passage?.verses[selectedVerseIndex]) return;
    const verseNum = passage.verses[selectedVerseIndex].verse;

    try {
      const existingNote = notes.find(n => n.verse === verseNum);
      await personalStudyService.saveNote({
        bookId: book!.id,
        chapter,
        verse: verseNum,
        content: existingNote ? existingNote.content : '',
        color
      });
      // Refresh notes
      const all = await personalStudyService.getNotes();
      setNotes(all.filter(n => n.bookId === book?.id && n.chapter === chapter));
      setSelectedVerseIndex(-1);
    } catch (e) {
      toast.error('Error al resaltar');
    }
  };

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
                onClick={() => setSelectedVerseIndex(selectedVerseIndex === index ? -1 : index)}
                className={`mb-4 transition-all duration-300 scroll-mt-24 p-2 rounded-lg cursor-pointer hover:bg-primary/5 active:scale-[0.98] ${highlightedVerse === index
                  ? 'bg-primary/20 -mx-2'
                  : selectedVerseIndex === index
                    ? 'ring-2 ring-primary/50 shadow-md bg-primary/5 -mx-2'
                    : notes.find(n => n.verse === verse.verse)?.color || ''
                  }`}
              >
                <sup className="verse-number font-semibold text-primary/70 mr-2 text-sm">{verse.verse}</sup>
                <span className="verse-content" dangerouslySetInnerHTML={{ __html: verse.text.trim() }} />

                {/* Verse Actions Toolbar (appears when selected) */}
                {selectedVerseIndex === index && (
                  <div className="mt-2 p-2 bg-background border border-border rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-1 mr-2 border-r border-border pr-2">
                      <button onClick={(e) => { e.stopPropagation(); handleHighlight('bg-yellow-200/50'); }} className="w-6 h-6 rounded-full bg-yellow-200 hover:scale-110 transition-transform" />
                      <button onClick={(e) => { e.stopPropagation(); handleHighlight('bg-green-200/50'); }} className="w-6 h-6 rounded-full bg-green-200 hover:scale-110 transition-transform" />
                      <button onClick={(e) => { e.stopPropagation(); handleHighlight('bg-blue-200/50'); }} className="w-6 h-6 rounded-full bg-blue-200 hover:scale-110 transition-transform" />
                      <button onClick={(e) => { e.stopPropagation(); handleHighlight('bg-pink-200/50'); }} className="w-6 h-6 rounded-full bg-pink-200 hover:scale-110 transition-transform" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                      <Heart className="h-3 w-3" /> Favorito
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={(e) => {
                      e.stopPropagation();
                      setIsNoteDialogOpen(true);
                    }}>
                      <BookOpen className="h-3 w-3" /> Añadir Nota
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </article>

          {/* Quick Analysis Panel */}
          <div className="mt-8 border-t border-border/50 pt-6">
            {!showAnalysis ? (
              <Button 
                onClick={handleQuickAnalysis}
                variant="outline"
                className="w-full h-14 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100"
              >
                <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Obtener Análisis del Capítulo</span>
              </Button>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 cursor-pointer"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-800 dark:text-indigo-200">Análisis de {book.name} {chapter}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowAnalysis(false); }}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-5">
                  {analysisLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-3" />
                      <span className="text-indigo-700 dark:text-indigo-300">Generando análisis...</span>
                    </div>
                  ) : analysisContent ? (
                    <div className="space-y-1 text-sm">
                      {analysisContent.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={idx} className="h-2" />;
                        
                        // Headers with emojis
                        const headerMatch = trimmed.match(/^([\p{Emoji}]+)\s*(.+)$/u);
                        if (headerMatch && (trimmed.includes('RESUMEN') || trimmed.includes('TEMA') || trimmed.includes('PERSONAJES') || trimmed.includes('VERSÍCULOS') || trimmed.includes('PALABRAS') || trimmed.includes('APLICACIÓN') || trimmed.includes('ORACIÓN'))) {
                          return (
                            <div key={idx} className="mt-4 mb-2 first:mt-0">
                              <div className="flex items-center gap-2 bg-white/60 dark:bg-black/20 p-2 rounded-lg">
                                <span className="text-lg">{headerMatch[1]}</span>
                                <h4 className="font-bold text-indigo-800 dark:text-indigo-200 text-sm">{headerMatch[2]}</h4>
                              </div>
                            </div>
                          );
                        }
                        
                        // List items
                        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                          return (
                            <div key={idx} className="flex gap-2 ml-3 my-1">
                              <span className="text-indigo-500">•</span>
                              <span className="text-foreground/90">{trimmed.replace(/^[-•]\s*/, '')}</span>
                            </div>
                          );
                        }
                        
                        // Regular text
                        return <p key={idx} className="text-foreground/90 leading-relaxed my-1">{trimmed}</p>;
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Ad Placement: End of Chapter */}
          <div className="my-10">
            <AdPlaceholder type="banner" />
          </div>

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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsComparatorOpen(true)}
            className="h-9 w-9"
            title="Comparar Versiones"
          >
            <Languages className="h-4 w-4" />
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

      {/* Note Dialog */}
      {selectedVerseIndex >= 0 && passage?.verses[selectedVerseIndex] && (
        <NoteDialog
          isOpen={isNoteDialogOpen}
          onClose={() => setIsNoteDialogOpen(false)}
          bookId={book.id}
          bookName={book.name}
          chapter={chapter}
          verse={passage.verses[selectedVerseIndex].verse}
          existingContent={notes.find(n => n.verse === passage.verses[selectedVerseIndex].verse)?.content}
          onSave={() => {
            // Re-fetch notes after save
            personalStudyService.getNotes().then(setNotes);
          }}
        />
      )}

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
      {/* Version Comparator Modal */}
      <VersionComparator
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        book={book}
        chapter={chapter}
      />

      {selectedVerseIndex >= 0 && passage?.verses[selectedVerseIndex] && (
        <NoteDialog
          isOpen={isNoteDialogOpen}
          onClose={() => setIsNoteDialogOpen(false)}
          bookId={book!.id}
          bookName={book!.name}
          chapter={chapter}
          verse={passage.verses[selectedVerseIndex].verse}
          existingContent={notes.find(n => n.verse === passage.verses[selectedVerseIndex].verse)?.content || ''}
          onSave={async () => {
            const all = await personalStudyService.getNotes();
            setNotes(all.filter(n => n.bookId === book?.id && n.chapter === chapter));
            setSelectedVerseIndex(-1);
          }}
        />
      )}
    </div>
  );
}
