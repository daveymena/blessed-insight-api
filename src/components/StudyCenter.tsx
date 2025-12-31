// Centro de Estudio Bíblico Profesional
import { useState, useEffect, useRef } from 'react';
import {
  X, BookOpen, GraduationCap, Calendar, Heart, MessageSquare,
  Sparkles, Loader2, ChevronRight, Users, User, BookMarked,
  PenLine, Clock, Flame, Target, FileText, Zap, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  performExegesis,
  thematicStudy,
  generateReflectionQuestions,
  generateCustomReadingPlan,
  generateDailyDevotional,
  getVerseOfTheDay,
  READING_PLANS,
  saveStudyNote,
  getNotesForPassage,
  getReadingStats,
  getActivePlan,
  startPlan,
  updatePlanProgress,
  cancelPlan,
  getPlanById,
  type StudyNote,
  type ActivePlan,
  type ReadingPlan
} from '@/lib/studyService';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';

// Cache simple para respuestas de IA
const responseCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.content;
  }
  return null;
}

function setCachedResponse(key: string, content: string): void {
  responseCache.set(key, { content, timestamp: Date.now() });
}

// Componente para renderizar la respuesta de IA con formato bonito
// Componente mejorado para estados de carga educativos
function StudyLoadingState({ time }: { time: number }) {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "La exégesis busca extraer el significado original del texto...",
    "El contexto histórico es clave para una correcta interpretación...",
    "Analizando palabras clave en los idiomas originales...",
    "Conectando con otros pasajes bíblicos relacionados...",
    "Preparando aplicaciones prácticas para tu vida...",
    "Consultando comentarios eruditos y teológicos..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-background p-4 rounded-full border-2 border-primary/20 shadow-lg">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Profundizando en las Escrituras
        </h3>
        <p className="text-sm text-muted-foreground animate-fade-in key={tipIndex}">
          {tips[tipIndex]}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-1">
        <Progress value={Math.min((time / 15000) * 100, 95)} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Analizando...</span>
          <span>{(time / 1000).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

// Componente para renderizar la respuesta de IA con formato profesional y espaciado
function FormattedAIResponse({ content }: { content: string }) {
  if (!content) return null;

  // Dividir el contenido en secciones lógicas basadas en encabezados
  const sections = content.split(/\n(?=[^\n]*[\p{Emoji}]+\s*[A-ZÁÉÍÓÚÑ]+)/u).filter(Boolean);

  // Si no se detectan secciones claras, intentar formatear línea por línea pero mejorado
  if (sections.length <= 1) {
    return (
      <div className="space-y-4 text-lg leading-relaxed text-foreground/90 font-serif">
        {content.split('\n').map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-4" />;
          return <p key={i} className="mb-2">{line}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {sections.map((section, idx) => {
        const lines = section.split('\n');
        const headerLine = lines[0];
        const bodyLines = lines.slice(1);

        // Extraer emoji y título
        const headerMatch = headerLine.match(/^([\p{Emoji}]+)\s*(.+)$/u);
        const icon = headerMatch ? headerMatch[1] : '📄';
        const title = headerMatch ? headerMatch[2] : headerLine;

        return (
          <Card key={idx} className="overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 border-b border-primary/10">
              <h3 className="text-xl font-bold text-primary flex items-center gap-3 font-serif">
                <span className="text-3xl filter drop-shadow-sm">{icon}</span>
                {title.replace(/\*\*/g, '')}
              </h3>
            </div>

            <CardContent className="p-6 space-y-4 bg-card/50">
              {bodyLines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                // Subtítulos
                if (trimmed.startsWith('###') || (trimmed.match(/^[\p{Emoji}]+ /u) && trimmed.length < 50)) {
                  return (
                    <h4 key={i} className="text-lg font-semibold text-foreground/90 mt-4 mb-2 flex items-center gap-2">
                      {trimmed.replace(/^[#\s]+/, '').replace(/\*\*/g, '')}
                    </h4>
                  );
                }

                // Listas con bullets
                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                  return (
                    <div key={i} className="flex gap-4 items-start ml-2 group">
                      <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0" />
                      <p className="text-base leading-relaxed text-foreground/80 flex-1">
                        {trimmed.replace(/^[-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                      </p>
                    </div>
                  );
                }

                // Listas numeradas
                const numMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);
                if (numMatch) {
                  return (
                    <div key={i} className="flex gap-4 items-start ml-2 mb-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                        {numMatch[1]}
                      </span>
                      <p className="text-base leading-relaxed text-foreground/80 flex-1 pt-0.5"
                        dangerouslySetInnerHTML={{
                          __html: numMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                        }}
                      />
                    </div>
                  );
                }

                // Citas bíblicas
                if (trimmed.startsWith('"') || trimmed.startsWith('«')) {
                  return (
                    <blockquote key={i} className="my-6 pl-6 border-l-4 border-amber-500/50 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30 p-4 rounded-r-xl italic text-lg text-foreground/80 font-serif shadow-sm">
                      {trimmed.replace(/"/g, '')}
                    </blockquote>
                  );
                }

                // Párrafos normales con resaltado de negritas
                return (
                  <p key={i} className="text-base leading-8 text-foreground/80 font-normal tracking-wide text-balance mb-3"
                    dangerouslySetInnerHTML={{
                      __html: trimmed
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary/90 font-bold">$1</strong>')
                        .replace(/\(([^)]*(?:hebreo|griego)[^)]*)\)/gi, '<span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium mx-1">$1</span>')
                    }}
                  />
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface StudyCenterProps {
  book: BibleBook | null;
  chapter: number;
  passage: BiblePassage | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function StudyCenter({ book, chapter, passage, isOpen, onClose }: StudyCenterProps) {
  const [activeTab, setActiveTab] = useState('exegesis');
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [topic, setTopic] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [planDuration, setPlanDuration] = useState(7);
  const [planAudience, setPlanAudience] = useState<'individual' | 'family' | 'group'>('individual');
  const [stats, setStats] = useState({ totalChapters: 0, streak: 0, lastRead: null as Date | null });
  const [copied, setCopied] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [currentPlanData, setCurrentPlanData] = useState<ReadingPlan | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const passageText = passage?.verses?.map(v => v.text).join(' ') || '';
  const verseOfDay = getVerseOfTheDay();

  useEffect(() => {
    if (book && isOpen) {
      setNotes(getNotesForPassage(book.id, chapter));
      setStats(getReadingStats());
      // Cargar plan activo
      const plan = getActivePlan();
      setActivePlan(plan);
      if (plan) {
        const planData = getPlanById(plan.planId);
        setCurrentPlanData(planData || null);
      }
    }
  }, [book, chapter, isOpen]);

  // Timer para mostrar tiempo de carga
  useEffect(() => {
    if (loading) {
      setLoadingTime(0);
      timerRef.current = setInterval(() => {
        setLoadingTime(t => t + 100);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleExegesis = async () => {
    if (!book) return;
    const cacheKey = `exegesis_${book.id}_${chapter}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setResponse(cached);
      setFromCache(true);
      setResponseTime(0);
      return;
    }

    setLoading(true);
    setResponse(null);
    setFromCache(false);
    const startTime = Date.now();

    const result = await performExegesis(passageText, book.name, chapter);

    setResponseTime(Date.now() - startTime);
    setResponse(result.content);
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleThematicStudy = async () => {
    if (!topic.trim()) return;
    const cacheKey = `thematic_${topic.toLowerCase()}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setResponse(cached);
      setFromCache(true);
      setResponseTime(0);
      return;
    }

    setLoading(true);
    setResponse(null);
    setFromCache(false);
    const startTime = Date.now();

    const result = await thematicStudy(topic);

    setResponseTime(Date.now() - startTime);
    setResponse(result.content);
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleReflectionQuestions = async () => {
    if (!book) return;
    const cacheKey = `questions_${book.id}_${chapter}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setResponse(cached);
      setFromCache(true);
      setResponseTime(0);
      return;
    }

    setLoading(true);
    setResponse(null);
    setFromCache(false);
    const startTime = Date.now();

    const result = await generateReflectionQuestions(passageText, book.name, chapter);

    setResponseTime(Date.now() - startTime);
    setResponse(result.content);
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleDevotional = async () => {
    if (!book) return;
    const cacheKey = `devotional_${book.id}_${chapter}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setResponse(cached);
      setFromCache(true);
      setResponseTime(0);
      return;
    }

    setLoading(true);
    setResponse(null);
    setFromCache(false);
    const startTime = Date.now();

    const result = await generateDailyDevotional(passageText, book.name, chapter);

    setResponseTime(Date.now() - startTime);
    setResponse(result.content);
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!topic.trim()) return;
    const cacheKey = `plan_${topic.toLowerCase()}_${planDuration}_${planAudience}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setResponse(cached);
      setFromCache(true);
      setResponseTime(0);
      return;
    }

    setLoading(true);
    setResponse(null);
    setFromCache(false);
    const startTime = Date.now();

    const result = await generateCustomReadingPlan(topic, planDuration, planAudience);

    setResponseTime(Date.now() - startTime);
    setResponse(result.content);
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleSaveNote = () => {
    if (!book || !noteContent.trim()) return;
    const note = saveStudyNote({
      bookId: book.id,
      chapter,
      content: noteContent,
      tags: [],
    });
    setNotes([...notes, note]);
    setNoteContent('');
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartPlan = (planId: string) => {
    const plan = startPlan(planId);
    setActivePlan(plan);
    const planData = getPlanById(planId);
    setCurrentPlanData(planData || null);
  };

  const handleCompleteDayReading = (day: number) => {
    const updated = updatePlanProgress(day, true);
    setActivePlan(updated);
  };

  const handleCancelPlan = () => {
    cancelPlan();
    setActivePlan(null);
    setCurrentPlanData(null);
  };

  // Obtener nombre del libro en español
  const getBookNameSpanish = (bookId: string): string => {
    const bookNames: Record<string, string> = {
      'genesis': 'Génesis', 'exodus': 'Éxodo', 'leviticus': 'Levítico', 'numbers': 'Números',
      'deuteronomy': 'Deuteronomio', 'joshua': 'Josué', 'judges': 'Jueces', 'ruth': 'Rut',
      '1samuel': '1 Samuel', '2samuel': '2 Samuel', '1kings': '1 Reyes', '2kings': '2 Reyes',
      '1chronicles': '1 Crónicas', '2chronicles': '2 Crónicas', 'ezra': 'Esdras', 'nehemiah': 'Nehemías',
      'esther': 'Ester', 'job': 'Job', 'psalms': 'Salmos', 'proverbs': 'Proverbios',
      'ecclesiastes': 'Eclesiastés', 'song of solomon': 'Cantares', 'isaiah': 'Isaías', 'jeremiah': 'Jeremías',
      'lamentations': 'Lamentaciones', 'ezekiel': 'Ezequiel', 'daniel': 'Daniel', 'hosea': 'Oseas',
      'joel': 'Joel', 'amos': 'Amós', 'obadiah': 'Abdías', 'jonah': 'Jonás', 'micah': 'Miqueas',
      'nahum': 'Nahúm', 'habakkuk': 'Habacuc', 'zephaniah': 'Sofonías', 'haggai': 'Hageo',
      'zechariah': 'Zacarías', 'malachi': 'Malaquías', 'matthew': 'Mateo', 'mark': 'Marcos',
      'luke': 'Lucas', 'john': 'Juan', 'acts': 'Hechos', 'romans': 'Romanos',
      '1corinthians': '1 Corintios', '2corinthians': '2 Corintios', 'galatians': 'Gálatas',
      'ephesians': 'Efesios', 'philippians': 'Filipenses', 'colossians': 'Colosenses',
      '1thessalonians': '1 Tesalonicenses', '2thessalonians': '2 Tesalonicenses',
      '1timothy': '1 Timoteo', '2timothy': '2 Timoteo', 'titus': 'Tito', 'philemon': 'Filemón',
      'hebrews': 'Hebreos', 'james': 'Santiago', '1peter': '1 Pedro', '2peter': '2 Pedro',
      '1john': '1 Juan', '2john': '2 Juan', '3john': '3 Juan', 'jude': 'Judas', 'revelation': 'Apocalipsis'
    };
    return bookNames[bookId.toLowerCase()] || bookId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header Mejorado */}
      <header className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 flex items-center justify-between shadow-xl z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
        <div className="flex items-center gap-4 text-primary-foreground relative z-10">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-wide">Centro de Estudio Profundo</h1>
            <p className="text-xs text-primary-foreground/80 font-medium uppercase tracking-wider">Investigación Teológica y Exegética</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20 rounded-full h-10 w-10 transition-transform hover:scale-105 active:scale-95"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      {/* Stats Bar */}
      <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span><strong>{stats.streak}</strong> días seguidos</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span><strong>{stats.totalChapters}</strong> capítulos leídos</span>
        </div>
        {book && (
          <div className="flex items-center gap-2 ml-auto">
            <BookMarked className="h-4 w-4 text-purple-500" />
            <span>{book.name} {chapter}</span>
          </div>
        )}
      </div>

      {/* Loading indicator Educativo */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <StudyLoadingState time={loadingTime} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-6 rounded-none border-b h-auto p-0">
            {[
              { id: 'exegesis', icon: GraduationCap, label: 'Exégesis' },
              { id: 'thematic', icon: Target, label: 'Temático' },
              { id: 'devotional', icon: Heart, label: 'Devocional' },
              { id: 'plans', icon: Calendar, label: 'Planes' },
              { id: 'notes', icon: PenLine, label: 'Notas' },
              { id: 'questions', icon: MessageSquare, label: 'Reflexión' },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col gap-1 py-3 rounded-none data-[state=active]:bg-primary/10"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6 max-w-4xl mx-auto">
              {/* Exégesis Tab */}
              <TabsContent value="exegesis" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                      Análisis Exegético
                    </CardTitle>
                    <CardDescription>
                      Estudio profundo del texto bíblico con contexto histórico, análisis lingüístico y aplicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                      <p className="font-medium text-indigo-800 dark:text-indigo-200">
                        📖 Pasaje actual: {book?.name || 'Ninguno'} {chapter}
                      </p>
                      {passageText && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2 line-clamp-3">
                          "{passageText.substring(0, 200)}..."
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleExegesis}
                      disabled={loading || !book}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Realizar Exégesis Completa
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Thematic Study Tab */}
              <TabsContent value="thematic" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-600" />
                      Estudio Temático
                    </CardTitle>
                    <CardDescription>
                      Explora cualquier tema bíblico en profundidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ej: La gracia, El perdón, La fe..."
                      className="text-lg"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['La fe', 'El perdón', 'La oración', 'El Espíritu Santo', 'La salvación', 'El amor'].map(t => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setTopic(t)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={handleThematicStudy}
                      disabled={loading || !topic.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                      Generar Estudio Temático
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Devotional Tab */}
              <TabsContent value="devotional" className="mt-0 space-y-6">
                <Card className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border-rose-200 dark:border-rose-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <Heart className="h-5 w-5" />
                      Versículo del Día
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-lg italic text-rose-800 dark:text-rose-200 border-l-4 border-rose-400 pl-4">
                      "{verseOfDay.text}"
                    </blockquote>
                    <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 text-right">
                      — {verseOfDay.book} {verseOfDay.chapter}:{verseOfDay.verse}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-rose-600" />
                      Devocional del Pasaje
                    </CardTitle>
                    <CardDescription>
                      Genera un devocional inspirador basado en tu lectura actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleDevotional}
                      disabled={loading || !book}
                      className="w-full bg-rose-600 hover:bg-rose-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                      Generar Devocional
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reading Plans Tab */}
              <TabsContent value="plans" className="mt-0 space-y-6">
                {/* Plan Activo */}
                {activePlan && currentPlanData && (
                  <Card className="border-2 border-primary bg-primary/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-primary">
                          <Flame className="h-5 w-5 text-orange-500" />
                          Plan Activo: {currentPlanData.name}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleCancelPlan} className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                      <CardDescription>
                        Día {activePlan.currentDay} de {currentPlanData.readings.length} • {activePlan.completedDays.length} días completados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress
                        value={(activePlan.completedDays.length / currentPlanData.readings.length) * 100}
                        className="h-3"
                      />

                      {/* Lectura del día actual */}
                      {currentPlanData.readings[activePlan.currentDay - 1] && (
                        <div className="bg-background p-4 rounded-lg border">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Lectura de Hoy (Día {activePlan.currentDay})
                          </h4>
                          <div className="space-y-2">
                            {currentPlanData.readings[activePlan.currentDay - 1].passages.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {getBookNameSpanish(p.book)} {p.chapter}{p.verses ? `:${p.verses}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                          {currentPlanData.readings[activePlan.currentDay - 1].reflection && (
                            <p className="text-sm text-muted-foreground mt-3 italic">
                              💭 {currentPlanData.readings[activePlan.currentDay - 1].reflection}
                            </p>
                          )}
                          <Button
                            onClick={() => handleCompleteDayReading(activePlan.currentDay)}
                            disabled={activePlan.completedDays.includes(activePlan.currentDay)}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          >
                            {activePlan.completedDays.includes(activePlan.currentDay) ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                ¡Completado!
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como Leído
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Lista de días */}
                      <div className="grid grid-cols-7 gap-1 mt-4">
                        {currentPlanData.readings.map((_, idx) => {
                          const dayNum = idx + 1;
                          const isCompleted = activePlan.completedDays.includes(dayNum);
                          const isCurrent = dayNum === activePlan.currentDay;
                          return (
                            <div
                              key={dayNum}
                              className={`
                                aspect-square flex items-center justify-center text-xs rounded-md cursor-pointer
                                ${isCompleted ? 'bg-green-500 text-white' : ''}
                                ${isCurrent && !isCompleted ? 'bg-primary text-primary-foreground ring-2 ring-primary' : ''}
                                ${!isCompleted && !isCurrent ? 'bg-muted hover:bg-muted/80' : ''}
                              `}
                              onClick={() => {
                                if (!isCompleted && dayNum <= activePlan.currentDay) {
                                  handleCompleteDayReading(dayNum);
                                }
                              }}
                            >
                              {isCompleted ? <Check className="h-3 w-3" /> : dayNum}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de planes disponibles */}
                {!activePlan && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {READING_PLANS.map(plan => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{plan.name}</CardTitle>
                            <Badge variant="outline">{plan.duration}</Badge>
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground mb-3">
                            {plan.readings.length} lecturas programadas
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStartPlan(plan.id)}
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Comenzar Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Plan Personalizado
                    </CardTitle>
                    <CardDescription>
                      Crea un plan de lectura adaptado a tus necesidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Tema del plan (ej: La vida de David)"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 14, 30].map(d => (
                        <Button
                          key={d}
                          variant={planDuration === d ? 'default' : 'outline'}
                          onClick={() => setPlanDuration(d)}
                          size="sm"
                        >
                          {d} días
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={planAudience === 'individual' ? 'default' : 'outline'}
                        onClick={() => setPlanAudience('individual')}
                        size="sm"
                        className="flex-col h-auto py-2"
                      >
                        <User className="h-4 w-4 mb-1" />
                        Individual
                      </Button>
                      <Button
                        variant={planAudience === 'family' ? 'default' : 'outline'}
                        onClick={() => setPlanAudience('family')}
                        size="sm"
                        className="flex-col h-auto py-2"
                      >
                        <Users className="h-4 w-4 mb-1" />
                        Familia
                      </Button>
                      <Button
                        variant={planAudience === 'group' ? 'default' : 'outline'}
                        onClick={() => setPlanAudience('group')}
                        size="sm"
                        className="flex-col h-auto py-2"
                      >
                        <Users className="h-4 w-4 mb-1" />
                        Grupo
                      </Button>
                    </div>
                    <Button
                      onClick={handleGeneratePlan}
                      disabled={loading || !topic.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Generar Plan con IA
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenLine className="h-5 w-5 text-amber-600" />
                      Mis Notas - {book?.name} {chapter}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Escribe tus reflexiones, observaciones o preguntas..."
                      rows={4}
                    />
                    <Button
                      onClick={handleSaveNote}
                      disabled={!noteContent.trim() || !book}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Guardar Nota
                    </Button>

                    {notes.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="font-medium text-sm text-muted-foreground">Notas guardadas:</h4>
                        {notes.map(note => (
                          <div key={note.id} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reflection Questions Tab */}
              <TabsContent value="questions" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-violet-600" />
                      Preguntas de Reflexión
                    </CardTitle>
                    <CardDescription>
                      Genera preguntas para profundizar en el estudio del pasaje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg">
                      <p className="text-sm text-violet-800 dark:text-violet-200">
                        📖 {book?.name || 'Selecciona un pasaje'} {chapter}
                      </p>
                    </div>
                    <Button
                      onClick={handleReflectionQuestions}
                      disabled={loading || !book}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                      Generar Preguntas
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Response Display */}
              {response && (
                <Card className="mt-6 border-2 border-primary/20">
                  <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      Resultado del Estudio
                      {fromCache && (
                        <Badge variant="secondary" className="ml-2">
                          <Zap className="h-3 w-3 mr-1" />
                          Cache
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {responseTime !== null && (
                        <span className="text-xs text-muted-foreground">
                          {fromCache ? 'Instantáneo' : `${(responseTime / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResponse}
                        className="h-8"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <FormattedAIResponse content={response} />

                    {/* Opciones de Profundización (Sacar de dudas) */}
                    <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in delay-500">
                      <div className="col-span-full mb-2">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          ¿Quieres profundizar más?
                        </h4>
                        <p className="text-sm text-muted-foreground">Selecciona una opción para continuar el estudio</p>
                      </div>

                      <Button variant="outline" className="h-auto py-4 justify-start text-left group hover:border-primary hover:bg-primary/5" onClick={handleReflectionQuestions}>
                        <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Aplicación Práctica</div>
                          <div className="text-xs text-muted-foreground">¿Cómo aplico esto hoy?</div>
                        </div>
                      </Button>

                      <Button variant="outline" className="h-auto py-4 justify-start text-left group hover:border-primary hover:bg-primary/5" onClick={() => {
                        setTopic(`Teología de ${book?.name} ${chapter}`);
                        setActiveTab('thematic');
                      }}>
                        <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Teología Profunda</div>
                          <div className="text-xs text-muted-foreground">Analizar conceptos clave</div>
                        </div>
                      </Button>

                      <Button variant="outline" className="h-auto py-4 justify-start text-left group hover:border-primary hover:bg-primary/5" onClick={handleDevotional}>
                        <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Devocional</div>
                          <div className="text-xs text-muted-foreground">Meditación espiritual</div>
                        </div>
                      </Button>

                      <Button variant="outline" className="h-auto py-4 justify-start text-left group hover:border-primary hover:bg-primary/5" onClick={() => {
                        // Simular "sacar de duda" haciendo una pregunta específica
                        setTopic("Dudas comunes sobre este pasaje");
                        handleThematicStudy();
                      }}>
                        <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Resolver Dudas</div>
                          <div className="text-xs text-muted-foreground">Aclarar puntos difíciles</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
