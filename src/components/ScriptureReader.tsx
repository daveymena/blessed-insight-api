import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Volume2, Heart, BookOpen, Languages, Sparkles, ChevronDown, Check, Columns, Trash2, FileEdit, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AudioPlayer } from '@/components/AudioPlayer';
import { getCurrentVersionInfo, BIBLE_VERSIONS, setVersion, getVersion } from '@/lib/bibleApi';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { NoteDialog } from './NoteDialog';
import { VersionComparator } from './VersionComparator';
import { personalStudyService, type Note } from '@/lib/personalStudyService';
import { toast } from 'sonner';
import { callAI } from '@/lib/aiProvider';

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
  onVersionChange?: () => void;
  user?: any;
}

const BACKGROUND_CLASSES: Record<string, string> = {
  'none': 'bg-background text-foreground',
  'pure-white': 'bg-white text-slate-900',
  'soft-cream': 'bg-slate-50 text-slate-900',
  'elegant-gray': 'bg-gray-50 text-gray-900',
  'book-beige': 'bg-white text-slate-800',
  'morning-blue': 'bg-blue-50/30 text-slate-900',
  'mint-tea': 'bg-emerald-50/30 text-teal-950',
  'paper': 'bg-[#fdf6e3] text-slate-900 border-l-8 border-l-[#dcb]',
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
  onVersionChange,
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
  const [versionDisplay, setVersionDisplay] = useState(getCurrentVersionInfo());
  const currentVersionId = getVersion();

  useEffect(() => {
    if (book) {
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

  const handleVersionSelect = (versionId: string) => {
    setVersion(versionId);
    setVersionDisplay(getCurrentVersionInfo());
    if (onVersionChange) {
      onVersionChange();
      toast.success(`Versión cambiada a ${BIBLE_VERSIONS.find(v => v.id === versionId)?.shortName}`);
    }
  };

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
    const passageText = passage.verses.map(v => v.text).join(' ').substring(0, 600);
    const messages = [
      { role: 'system' as const, content: `Eres un teólogo bíblico experto. Responde en español de forma clara y concisa.` },
      { role: 'user' as const, content: `Análisis de ${book.name} ${chapter}:
"${passageText}"

📖 RESUMEN: De qué trata el capítulo
🔑 TEMAS: Ideas principales
💎 VERSÍCULOS CLAVE: 2-3 versículos importantes
💡 APLICACIÓN: Cómo aplicar hoy
🙏 ORACIÓN: Breve oración` }
    ];
    try {
      const result = await callAI(messages, 1000);
      setAnalysisContent(result.content);
      localStorage.setItem(cacheKey, JSON.stringify({ content: result.content, timestamp: Date.now() }));
    } catch (e) {
      setAnalysisContent('Error al generar el análisis.');
    }
    setAnalysisLoading(false);
  };

  const HIGHLIGHT_COLORS = [
    { id: 'yellow', bg: 'bg-yellow-200/40 dark:bg-yellow-900/40', border: 'border-l-yellow-400', dot: 'bg-yellow-400' },
    { id: 'green', bg: 'bg-green-200/40 dark:bg-green-900/40', border: 'border-l-green-400', dot: 'bg-green-400' },
    { id: 'blue', bg: 'bg-blue-200/40 dark:bg-blue-900/40', border: 'border-l-blue-400', dot: 'bg-blue-400' },
    { id: 'red', bg: 'bg-red-200/40 dark:bg-red-900/40', border: 'border-l-red-400', dot: 'bg-red-400' },
    { id: 'purple', bg: 'bg-purple-200/40 dark:bg-purple-900/40', border: 'border-l-purple-400', dot: 'bg-purple-400' },
  ];

  const handleHighlight = async (colorClasses: string) => {
    if (selectedVerseIndex < 0 || !passage?.verses[selectedVerseIndex]) return;
    const verseNum = passage.verses[selectedVerseIndex].verse;

    try {
      const existingNote = notes.find(n => n.verse === verseNum);
      if (!colorClasses) {
        if (existingNote?.id) await personalStudyService.deleteNote(existingNote.id);
      } else {
        await personalStudyService.saveNote({
          bookId: book!.id,
          chapter,
          verse: verseNum,
          content: existingNote ? existingNote.content : '',
          color: colorClasses
        });
      }

      const all = await personalStudyService.getNotes();
      setNotes(all.filter(n => n.bookId === book?.id && n.chapter === chapter));
      setSelectedVerseIndex(-1);
      toast.success(colorClasses ? 'Resaltado guardado' : 'Resaltado eliminado');
    } catch (e) {
      toast.error('Error al actualizar resaltado');
    }
  };

  const backgroundClass = BACKGROUND_CLASSES[themeSettings.background] || '';
  const fontFamily = FONT_FAMILIES[themeSettings.font] || FONT_FAMILIES.serif;

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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`flex items-center justify-between px-3 py-3 border-b transition-colors ${hasScenicBackground ? 'bg-black/20 border-white/10 text-white backdrop-blur-sm' : 'bg-card/50 backdrop-blur-sm'}`}>
        <div className="flex items-center">
          <Button
            variant={hasScenicBackground ? "outline" : "ghost"}
            size="icon"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className={`md:hidden rounded-full h-9 w-9 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={hasScenicBackground ? "outline" : "ghost"}
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className={`hidden md:flex gap-1 rounded-full px-4 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-30' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
        </div>

        <div className="text-center flex-1 mx-2 min-w-0">
          <h2 className="text-lg md:text-xl font-bold truncate">{book.name}</h2>
          <p className={`text-[10px] md:text-xs ${hasScenicBackground ? 'text-white/70' : 'text-muted-foreground'}`}>
            Capítulo {chapter} • <span className="opacity-80 font-semibold">{versionDisplay.shortName}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant={hasScenicBackground ? "outline" : (showAudioPlayer ? "default" : "ghost")}
            size="icon"
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className={`rounded-full h-8 w-8 md:h-9 md:w-9 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10' : ''}`}
          >
            <Volume2 className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={hasScenicBackground ? "outline" : "ghost"}
                size="icon"
                className={`rounded-full h-8 w-8 md:h-9 md:w-9 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10' : ''}`}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
              <DropdownMenuLabel>Seleccionar Versión</DropdownMenuLabel>
              {BIBLE_VERSIONS.map((v) => (
                <DropdownMenuItem key={v.id} onClick={() => handleVersionSelect(v.id)}>
                  <span className="flex-1 font-medium">{v.shortName}</span>
                  {v.id === currentVersionId && <Check className="ml-2 h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsComparatorOpen(true)}>
                <Columns className="mr-2 h-4 w-4" /> Comparar Versiones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={hasScenicBackground ? "outline" : "ghost"}
            size="icon"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={`md:hidden rounded-full h-8 w-8 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10' : ''}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant={hasScenicBackground ? "outline" : "ghost"}
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={`hidden md:flex gap-1 rounded-full px-4 ${hasScenicBackground ? 'border-white/20 bg-black/20 text-white hover:bg-white/10 hover:text-white disabled:opacity-30' : ''}`}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${!hasScenicBackground ? backgroundClass : ''}`}>
        <div className={`max-w-3xl mx-auto px-4 py-8 ${hasScenicBackground ? 'bg-black/30 backdrop-blur-[2px] rounded-xl my-4 shadow-2xl border border-white/10' : ''}`}>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p className="font-serif italic opacity-70">Preparando las Escrituras...</p>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-center min-h-[60vh] flex flex-col items-center justify-center">
                <p className="font-bold text-destructive text-lg">⚠️ Error al cargar</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">Reintentar</Button>
              </motion.div>
            ) : passage && passage.verses.length > 0 ? (
              <motion.div
                key={`${book.id}-${chapter}-${currentVersionId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="min-h-[60vh]"
              >
                {showAudioPlayer && (
                  <div className="mb-8 border rounded-2xl overflow-hidden shadow-xl bg-card/50 backdrop-blur-md">
                    <AudioPlayer verses={passage.verses.map(v => v.text)} onVerseHighlight={setHighlightedVerse} />
                  </div>
                )}
                <article className={`bible-text prose prose-lg dark:prose-invert max-w-none`} style={textStyle}>
                  {passage.verses.map((verse, index) => (
                    <div
                      key={`${verse.chapter}-${verse.verse}`}
                      id={`verse-${verse.verse}`}
                      onClick={() => setSelectedVerseIndex(selectedVerseIndex === index ? -1 : index)}
                      className={cn(
                        "mb-3 transition-all p-4 rounded-2xl cursor-pointer border-l-4 border-transparent hover:bg-muted/40 group",
                        highlightedVerse === index && "bg-primary/20",
                        selectedVerseIndex === index && "bg-primary/10 ring-1 ring-primary/40 shadow-inner",
                        notes.find(n => n.verse === verse.verse)?.color
                      )}
                    >
                      <sup className={cn("verse-number font-black mr-3 select-none text-[12px] opacity-40 group-hover:opacity-100", hasScenicBackground ? "text-amber-200/90" : "text-primary")}>
                        {verse.verse}
                      </sup>
                      <span className="leading-relaxed tracking-wide" dangerouslySetInnerHTML={{ __html: verse.text }} />
                      <AnimatePresence>
                        {selectedVerseIndex === index && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 p-2 bg-popover border shadow-xl rounded-xl flex items-center gap-2 w-fit">
                            {HIGHLIGHT_COLORS.map(c => (
                              <button key={c.id} onClick={(e) => { e.stopPropagation(); handleHighlight(`${c.bg} ${c.border}`); }} className={cn("w-8 h-8 rounded-full", c.dot)} />
                            ))}
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleHighlight(''); }}><Trash2 className="h-4 w-4" /></Button>
                            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setIsNoteDialogOpen(true); }}>Nota</Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </article>
                <div className="mt-12">
                  {!showAnalysis ? (
                    <Button onClick={handleQuickAnalysis} variant="outline" className="w-full h-16 rounded-2xl">
                      <Sparkles className="h-5 w-5 mr-3 text-indigo-500" /> 🔍 Análisis Rápido
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-card border rounded-3xl shadow-xl">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-[10px] uppercase">Análisis</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}><X className="h-4 w-4" /></Button>
                      </div>
                      {analysisLoading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : <div className="font-serif italic">{analysisContent}</div>}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 opacity-50 italic">Pasaje no disponible.</div>
            )}
          </AnimatePresence>
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
