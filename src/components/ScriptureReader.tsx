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
import { AdSlot } from './AdSlot';
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
  const { settings: themeSettings, activeTheme, hasScenicBackground } = useThemeSettings();
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
    const passageText = passage.verses.map(v => v.text).join(' ').substring(0, 800);
    const messages = [
      {
        role: 'system' as const, content: `Eres un experto en exégesis bíblica y análisis documental de alto nivel. 

IDENTIDAD Y ESTILO:
- Tu enfoque es la EXÉGESIS PURA: explicar lo que el texto dice realmente en su contexto.
- Eres NEUTRAL e IMPARCIAL: No tomas partido por dogmas específicos (Trinitarios, Unitarios, etc.).
- Utilizas el INTELECTO de un erudito bien documentado y la PASIÓN de un expositor vibrante para desglosar las verdades bíblicas.

REGLA DE ORO: 
- Tu análisis debe basarse EXCLUSIVAMENTE en el texto proporcionado. 
- MANTÉN UN TONO SOLEMNE Y REVELADOR: Organiza la respuesta con encabezados elegantes, usa NEGRITAS para conceptos clave y utiliza EMOJIS bíblicos estratégicos (🕊️, 🔥, 🏺, 🍇) para una presentación hermosa y profesional.
- Responde en español con excelencia intelectual y profundidad espiritual.` },
      {
        role: 'user' as const, content: `ANÁLISIS DE ${book.name} ${chapter}:
"${passageText}"

Usa ESTRICTAMENTE este formato visual:

🤖 **Análisis Espiritual de ${book.name} ${chapter}**

🌿 **Contexto del Capítulo**
(Explica brevemente la situación histórica y narrativa)

✨ **Temas Centrales**
🔹 (Tema Importante)
(Explicación técnica y espiritual)
👉 (Aplicación o por qué es clave)

🔍 **Análisis Teológico y Lingüístico**
📌 (Desglosa términos originales y verdades doctrinales profundas e imparciales)

💖 **Aplicación y Vida**
🩺 (Sanidad para el alma y enseñanza práctica)
🌟 (Pregunta para meditar)

🔑 **Resumen de Tesoros**
✅ (Punto clave final 1)
✅ (Punto clave final 2)

🕊️ (Bendición final breve)` }
    ];
    try {
      const result = await callAI(messages, 1500);
      setAnalysisContent(result.content);
      localStorage.setItem(cacheKey, JSON.stringify({ content: result.content, timestamp: Date.now() }));
    } catch (e) {
      setAnalysisContent('Error al generar el análisis.');
    }
    setAnalysisLoading(false);
  };

  const fontFamily = FONT_FAMILIES[themeSettings.font] || FONT_FAMILIES.serif;

  // Colores dinámicos
  const isDarkMode = activeTheme.uiMode === 'dark';
  const readerTextColor = activeTheme.textColor;

  const textStyle = {
    fontFamily,
    fontSize: `${themeSettings.fontSize}px`,
    lineHeight: themeSettings.lineHeight,
    color: readerTextColor,
    fontWeight: isDarkMode ? 400 : 600
  };

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-transparent">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-black mb-2">Lectura Bíblica</h2>
          <p className="opacity-70">Elige un libro y capítulo para comenzar tu estudio.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-transparent">
      {/* Cabecera del Lector */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-3 md:px-6 h-14 shrink-0 transition-all">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onPrevious} disabled={!canGoPrevious || isLoading} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center min-w-0 px-2">
          <h1 className="text-base md:text-lg font-serif font-black truncate leading-tight">{book.name} {chapter}</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowAudioPlayer(!showAudioPlayer)} className={cn("h-9 w-9", showAudioPlayer && "bg-primary/10 text-primary")}>
            <Volume2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} disabled={!canGoNext || isLoading} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* El fondo ahora es global (BackgroundLayer en Index.tsx) */}

        <div className={cn(
          "max-w-3xl mx-auto px-6 md:px-14 py-12 md:py-20 relative z-10 min-h-screen transition-all"
        )}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center bg-destructive/5 rounded-3xl border border-destructive/10">
                <p className="font-serif font-black text-destructive mb-4">No se pudo cargar</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
              </motion.div>
            ) : (
              <motion.div
                key={`${book.id}-${chapter}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {showAudioPlayer && (
                  <div className="mb-10 bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
                    <AudioPlayer verses={passage?.verses.map(v => v.text) || []} onVerseHighlight={setHighlightedVerse} />
                  </div>
                )}

                <article
                  className={cn(
                    "bible-text max-w-none transition-all",
                    hasScenicBackground && (isDarkMode ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]" : "drop-shadow-[0_1px_4px_rgba(255,255,255,1)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]")
                  )}
                  style={textStyle}
                >
                  {passage?.verses.map((verse, index) => (
                    <div
                      key={index}
                      className={cn(
                        "mb-4 transition-all p-4 rounded-2xl border-l-4 border-transparent hover:bg-white/5 dark:hover:bg-black/5 cursor-pointer relative",
                        highlightedVerse === index && "bg-primary/10",
                        selectedVerseIndex === index && "bg-primary/5 ring-1 ring-primary/20",
                        notes.find(n => n.verse === verse.verse)?.color
                      )}
                      onClick={() => setSelectedVerseIndex(selectedVerseIndex === index ? -1 : index)}
                    >
                      <sup className="verse-number font-black mr-3 text-primary opacity-50">{verse.verse}</sup>
                      <span className="leading-relaxed tracking-wide" dangerouslySetInnerHTML={{ __html: verse.text }} />
                    </div>
                  ))}
                </article>

                <div className="mt-20">
                  {!showAnalysis ? (
                    <Button onClick={handleQuickAnalysis} variant="outline" className="w-full h-20 rounded-[2rem] border-2 border-primary/10 bg-card/40 backdrop-blur-xl group hover:shadow-xl transition-all">
                      <Sparkles className="h-6 w-6 mr-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                      <span className="font-serif font-black text-lg uppercase tracking-widest">Ver análisis espiritual</span>
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-card/90 backdrop-blur-3xl border border-primary/10 rounded-[2.5rem] shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="font-black text-[10px] uppercase tracking-[0.3em]">IA Teológica</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(false)}><X className="h-4 w-4" /></Button>
                      </div>
                      {analysisLoading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary opacity-20" /></div>
                      ) : (
                        <div className="font-serif text-lg leading-relaxed scripture-response">
                          {analysisContent}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <VersionComparator isOpen={isComparatorOpen} onClose={() => setIsComparatorOpen(false)} book={book} chapter={chapter} />
    </div>
  );
}
