import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const BACKGROUND_CLASSES: Record<string, string> = {
  'none': 'bg-background text-foreground', // Usa variable CSS global actualizada
  'pure-white': 'bg-white text-slate-900',
  'soft-cream': 'bg-slate-50 text-slate-900', // REDEFINIDO: Ahora es "Gris Suave", no crema amarillenta
  'elegant-gray': 'bg-gray-50 text-gray-900',
  'book-beige': 'bg-white text-slate-800', // REDEFINIDO: Forzado a blanco puro aunque se llame beige
  'morning-blue': 'bg-blue-50/30 text-slate-900',
  'mint-tea': 'bg-emerald-50/30 text-teal-950',
  'paper': 'bg-[#fdf6e3] text-slate-900 border-l-8 border-l-[#dcb]', // Tono solarizado suave
  'parchment': 'bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
  'clouds': 'bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50',
  'sunset-sky': 'bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30',
  'forest-mist': 'bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30',
  'ocean-depth': 'bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/30',
  'lavender-field': 'bg-gradient-to-br from-violet-50/30 via-white to-fuchsia-50/30',
  'warm-sand': 'bg-white text-slate-900',
  'night-sky': 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white',
  'nature-sunset': 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900 via-purple-950 to-slate-950 text-white drop-shadow-md',
  'deep-river': 'text-white drop-shadow-md',
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

  useEffect(() => {
    if (user && book) {
      personalStudyService.getNotes().then(allNotes => {
        const chapterNotes = allNotes.filter(n => n.bookId === book.id && n.chapter === chapter);
        setNotes(chapterNotes);
      });
    }
  }, [book?.id, chapter, user]);

  useEffect(() => {
    setAnalysisContent(null);
    setShowAnalysis(false);
  }, [book?.id, chapter]);

  const handleQuickAnalysis = async () => {
    if (!book || !passage?.verses) return;
    const cacheKey = `quick_analysis_${book.id}_${chapter}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { content, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        setAnalysisContent(content);
        setShowAnalysis(true);
        return;
      }
    }
    setAnalysisLoading(true);
    setShowAnalysis(true);
    const passageText = passage.verses.map(v => v.text).join(' ').substring(0, 1200);
    const messages = [
      { role: 'system' as const, content: `Eres un teólogo experto. Responde en español con emojis.` },
      { role: 'user' as const, content: `Análisis de ${book.name} ${chapter}:\n"${passageText}"` }
    ];
    try {
      const result = await callAIFast(messages);
      setAnalysisContent(result.content);
      localStorage.setItem(cacheKey, JSON.stringify({ content: result.content, timestamp: Date.now() }));
    } catch (e) {
      setAnalysisContent('Error al generar el análisis.');
    }
    setAnalysisLoading(false);
  };

  const handleHighlight = async (color: string) => {
    if (selectedVerseIndex < 0 || !passage?.verses[selectedVerseIndex]) return;
    const verseNum = passage.verses[selectedVerseIndex].verse;
    try {
      const existingNote = notes.find(n => n.verse === verseNum);
      await personalStudyService.saveNote({
        bookId: book!.id, chapter, verse: verseNum, content: existingNote ? existingNote.content : '', color
      });
      const all = await personalStudyService.getNotes();
      setNotes(all.filter(n => n.bookId === book?.id && n.chapter === chapter));
      setSelectedVerseIndex(-1);
    } catch (e) {
      toast.error('Error al resaltar');
    }
  };

  const backgroundClass = BACKGROUND_CLASSES[themeSettings.background] || '';
  const fontFamily = FONT_FAMILIES[themeSettings.font] || FONT_FAMILIES.serif;

  // Calculamos el estilo dinámico para el texto
  const textStyle = {
    fontFamily,
    fontSize: `${themeSettings.fontSize}px`,
    lineHeight: themeSettings.lineHeight,
    color: themeSettings.textColor !== 'auto' ? themeSettings.textColor : undefined
  };

  if (!book) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${backgroundClass}`}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">📖</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Bienvenido</h2>
          <p className="text-muted-foreground">Selecciona un libro para comenzar.</p>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p className="font-serif italic">Preparando las Escrituras...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-center">
          <p className="font-bold text-destructive">Error al cargar</p>
        </div>
      );
    }
    if (passage && passage.verses.length > 0) {
      return (
        <AnimatePresence mode="wait">
          <motion.div key={`${book.id}-${chapter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            {showAudioPlayer && (
              <div className="mb-6 border rounded-xl overflow-hidden shadow-sm">
                <AudioPlayer verses={passage.verses.map(v => v.text)} onVerseHighlight={setHighlightedVerse} />
              </div>
            )}
            <article
              className={`bible-text prose prose-lg dark:prose-invert max-w-none ${themeSettings.textColor === 'auto' ? 'text-foreground' : ''}`}
              style={textStyle}
            >
              {passage.verses.map((verse, index) => (
                <div
                  key={`${verse.chapter}-${verse.verse}`}
                  id={`verse-${verse.verse}`}
                  onClick={() => setSelectedVerseIndex(selectedVerseIndex === index ? -1 : index)}
                  className={`mb-4 transition-all p-2 rounded-lg cursor-pointer ${highlightedVerse === index ? 'bg-primary/20' : selectedVerseIndex === index ? 'bg-primary/5 ring-1 ring-primary/30' : notes.find(n => n.verse === verse.verse)?.color || ''}`}
                >
                  <sup className={`verse-number font-bold mr-2 select-none ${hasScenicBackground ? '!text-amber-200/90 drop-shadow-sm' : '!text-primary/70'}`}>{verse.verse}</sup>
                  <span dangerouslySetInnerHTML={{ __html: verse.text }} />
                  {selectedVerseIndex === index && (
                    <div className="mt-2 p-2 bg-card border rounded-lg flex gap-2">
                      <button onClick={() => handleHighlight('bg-yellow-200/50')} className="w-6 h-6 rounded-full bg-yellow-200" />
                      <button onClick={() => handleHighlight('bg-green-200/50')} className="w-6 h-6 rounded-full bg-green-200" />
                      <Button variant="ghost" size="sm" onClick={() => setIsNoteDialogOpen(true)}>Nota</Button>
                    </div>
                  )}
                </div>
              ))}
            </article>
            <div className="mt-8">
              {!showAnalysis ? (
                <Button onClick={handleQuickAnalysis} variant="outline" className="w-full h-14 bg-indigo-50/50">
                  <Sparkles className="h-5 w-5 mr-2" /> Análisis rápido
                </Button>
              ) : (
                <div className="p-5 bg-indigo-50/30 border rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Análisis</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}>Cerrar</Button>
                  </div>
                  {analysisLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <div className="whitespace-pre-wrap text-sm">{analysisContent}</div>}
                </div>
              )}
            </div>
            <div className="mt-12 text-center text-xs text-muted-foreground">{passage.translation_name}</div>
          </motion.div>
        </AnimatePresence>
      );
    }
    return <div className="text-center py-20">No disponible.</div>;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`flex items-center justify-between px-4 py-4 border-b transition-colors ${hasScenicBackground ? 'bg-black/20 border-white/10 text-white backdrop-blur-sm' : 'bg-card/50 backdrop-blur-sm'}`}>
        <Button
          variant={hasScenicBackground ? "outline" : "ghost"}
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className={`gap-1 rounded-full px-4 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-30' : ''}`}
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>

        <div className="text-center">
          <h2 className="text-xl font-bold">{book.name}</h2>
          <p className={`text-xs ${hasScenicBackground ? 'text-white/70' : 'text-muted-foreground'}`}>Capítulo {chapter}</p>
        </div>

        <div className="flex gap-2">
          {[
            { icon: Volume2, action: () => setShowAudioPlayer(!showAudioPlayer), active: showAudioPlayer },
            { icon: Languages, action: () => setIsComparatorOpen(true), active: false },
          ].map((btn, i) => (
            <Button
              key={i}
              variant={hasScenicBackground ? "outline" : (btn.active ? "default" : "ghost")}
              size="icon"
              onClick={btn.action}
              className={`rounded-full h-9 w-9 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10' : ''} ${btn.active && !hasScenicBackground ? '' : ''}`}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          ))}

          <Button
            variant={hasScenicBackground ? "outline" : "ghost"}
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={`gap-1 rounded-full px-4 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-30' : ''}`}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={`flex-1 overflow-auto ${!hasScenicBackground ? backgroundClass : ''}`}>
        <div className={`max-w-3xl mx-auto px-4 py-8 ${hasScenicBackground ? 'bg-black/30 backdrop-blur-[2px] rounded-xl my-4 shadow-2xl border border-white/10' : ''}`}>
          {renderContent()}
        </div>
      </div>
      <VersionComparator isOpen={isComparatorOpen} onClose={() => setIsComparatorOpen(false)} book={book} chapter={chapter} />
      {selectedVerseIndex >= 0 && passage?.verses[selectedVerseIndex] && (
        <NoteDialog
          isOpen={isNoteDialogOpen}
          onClose={() => setIsNoteDialogOpen(false)}
          bookId={book.id}
          bookName={book.name}
          chapter={chapter}
          verse={passage.verses[selectedVerseIndex].verse}
          existingContent={notes.find(n => n.verse === passage.verses[selectedVerseIndex].verse)?.content}
          onSave={async () => {
            const all = await personalStudyService.getNotes();
            setNotes(all.filter(n => n.bookId === book.id && n.chapter === chapter));
            setSelectedVerseIndex(-1);
          }}
        />
      )}
    </div>
  );
}
