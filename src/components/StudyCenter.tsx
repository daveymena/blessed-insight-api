// Centro de Estudio Bíblico Profesional
import { useState, useEffect, useRef } from 'react';
import {
  X, BookOpen, GraduationCap, Calendar, Heart, MessageSquare,
  Sparkles, Loader2, ChevronRight, Users, User, BookMarked,
  PenLine, Clock, Flame, Target, FileText, Zap, Copy, Check, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FormattedAIResponse } from './FormattedAIResponse';
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
  askBiblo,
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

// El componente FormattedAIResponse ahora se importa externamente

interface StudyCenterProps {
  book: BibleBook | null;
  chapter: number;
  passage: BiblePassage | undefined;
  isOpen: boolean;
  onClose: () => void;
  isSidebar?: boolean;
}

export function StudyCenter({ book, chapter, passage, isOpen, onClose, isSidebar }: StudyCenterProps) {
  const [activeTab, setActiveTab] = useState('menu');
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  // Respuestas separadas por cada tipo de estudio
  const [exegesisResponse, setExegesisResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });
  const [thematicResponse, setThematicResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });
  const [devotionalResponse, setDevotionalResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });
  const [questionsResponse, setQuestionsResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });
  const [planResponse, setPlanResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });
  const [bibloResponse, setBibloResponse] = useState<{ content: string | null; time: number | null; fromCache: boolean }>({ content: null, time: null, fromCache: false });

  const [topic, setTopic] = useState('');
  const [bibloQuestion, setBibloQuestion] = useState('');
  const [customReference, setCustomReference] = useState(''); // Nueva: referencia personalizada para exégesis
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [planDuration, setPlanDuration] = useState(7);
  const [planAudience, setPlanAudience] = useState<'individual' | 'family' | 'group'>('individual');
  const [stats, setStats] = useState({ totalChapters: 0, streak: 0, lastRead: null as Date | null });
  const [copied, setCopied] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [currentPlanData, setCurrentPlanData] = useState<ReadingPlan | null>(null);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null); // null = checking, true = ok, false = error
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const passageText = passage?.verses?.map(v => v.text).join(' ') || '';
  const verseOfDay = getVerseOfTheDay();

  // Manejo de navegación interna para evitar salir de la app
  const navigateTo = (tab: string) => {
    setTabHistory(prev => [...prev, activeTab]);
    setActiveTab(tab);
  };

  const goBack = () => {
    if (tabHistory.length > 0) {
      const lastTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      setActiveTab(lastTab);
    } else {
      onClose();
    }
  };

  // Verificar salud de la IA al abrir
  useEffect(() => {
    if (isOpen) {
      const checkAI = async () => {
        try {
          const resp = await fetch('/api/ai/ollama/health');
          const data = await resp.json();
          setAiOnline(data.status === 'ok');
        } catch (e) {
          setAiOnline(false);
        }
      };
      checkAI();
    }
  }, [isOpen]);

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

    // Usar referencia personalizada si está disponible
    const textToAnalyze = customReference.trim() ? customReference : passageText;
    const cacheKey = `exegesis_${customReference.trim() || `${book.id}_${chapter}`}`;

    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setExegesisResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setExegesisResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await performExegesis(
      textToAnalyze,
      book.name,
      chapter,
      customReference.trim(),
      (content) => {
        setExegesisResponse(prev => ({ ...prev, content }));
        // Quitar el overlay de carga pesada cuando empezamos a recibir texto
        if (content.length > 5) setLoading(false);
      }
    );

    setExegesisResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleThematicStudy = async () => {
    if (!topic.trim()) return;
    const cacheKey = `thematic_${topic.toLowerCase()}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setThematicResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setThematicResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await thematicStudy(topic, (content) => {
      setThematicResponse(prev => ({ ...prev, content }));
      if (content.length > 5) setLoading(false);
    });

    setThematicResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleReflectionQuestions = async () => {
    if (!book) return;
    const cacheKey = `questions_${book.id}_${chapter}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setQuestionsResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setQuestionsResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await generateReflectionQuestions(passageText, book.name, chapter, (content) => {
      setQuestionsResponse(prev => ({ ...prev, content }));
      if (content.length > 5) setLoading(false);
    });

    setQuestionsResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleDevotional = async () => {
    if (!book) return;
    const cacheKey = `devotional_${book.id}_${chapter}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setDevotionalResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setDevotionalResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await generateDailyDevotional(passageText, book.name, chapter, undefined, (content) => {
      setDevotionalResponse(prev => ({ ...prev, content }));
      if (content.length > 5) setLoading(false);
    });

    setDevotionalResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!topic.trim()) return;
    const cacheKey = `plan_${topic.toLowerCase()}_${planDuration}_${planAudience}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setPlanResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setPlanResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await generateCustomReadingPlan(topic, planDuration, planAudience);

    setPlanResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
    setCachedResponse(cacheKey, result.content);
    setLoading(false);
  };

  const handleAskBiblo = async () => {
    if (!bibloQuestion.trim()) return;
    const cacheKey = `biblo_${bibloQuestion.toLowerCase()}`;
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      setBibloResponse({ content: cached, time: 0, fromCache: true });
      return;
    }

    setLoading(true);
    setBibloResponse({ content: null, time: null, fromCache: false });
    const startTime = Date.now();

    const result = await askBiblo(bibloQuestion, passageText, (content) => {
      setBibloResponse(prev => ({ ...prev, content }));
      if (content.length > 5) setLoading(false);
    });

    setBibloResponse({ content: result.content, time: Date.now() - startTime, fromCache: false });
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

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const panelContent = (
    <div className={cn("flex flex-col h-full bg-background overflow-hidden", isSidebar && "border-none")}>
      {/* Header Mejorado */}
      <header className={cn(
        "bg-gradient-to-r from-primary via-primary/90 to-primary/80 flex items-center justify-between shadow-xl z-10 relative overflow-hidden",
        isSidebar ? "p-3" : "p-5"
      )}>
        <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
        <div className="flex items-center gap-3 text-primary-foreground relative z-10">
          {activeTab !== 'menu' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="text-primary-foreground hover:bg-white/20 rounded-full h-8 w-8 transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
          )}
          <div className={cn("bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner", isSidebar ? "p-1.5" : "p-2.5")}>
            <GraduationCap className={cn(isSidebar ? "h-5 w-5" : "h-7 w-7")} />
          </div>
          <div>
            <h1 className={cn("font-bold font-serif tracking-wide", isSidebar ? "text-lg" : "text-2xl")}>
              {activeTab === 'menu' ? 'Centro de Estudio' :
                activeTab === 'exegesis' ? 'Exégesis' :
                  activeTab === 'thematic' ? 'Temático' :
                    activeTab === 'devotional' ? 'Devocional' :
                      activeTab === 'plans' ? 'Planes' :
                        activeTab === 'notes' ? 'Notas' : 'Investigador'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {!isSidebar && activeTab === 'menu' && (
                <p className="text-xs text-primary-foreground/80 font-medium uppercase tracking-wider">Investigación Teológica y Exegética</p>
              )}
              <span className="text-[10px] flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  aiOnline === true ? "bg-green-400" : aiOnline === false ? "bg-red-400" : "bg-yellow-400"
                )} />
                <span className="text-white/90">
                  {aiOnline === true ? 'AI Online' : aiOnline === false ? 'AI Offline' : 'Checking AI...'}
                </span>
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20 rounded-full h-8 w-8 sm:h-10 sm:w-10 transition-transform hover:scale-105 active:scale-95"
          title={isSidebar ? "Cerrar" : "Volver a Inicio"}
        >
          {isSidebar ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Home className="h-5 w-5 sm:h-6 sm:w-6" />}
        </Button>
      </header>

      {/* Stats Bar (Simple en Sidebar) */}
      <div className="bg-muted/50 border-b px-3 py-1.5 flex items-center justify-between text-[10px] sm:text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span><strong>{stats.streak}</strong> días</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-blue-500" />
            <span><strong>{stats.totalChapters}</strong> cap.</span>
          </div>
        </div>
        {book && (
          <div className="flex items-center gap-1 font-semibold text-primary/80">
            <BookMarked className="h-3 w-3" />
            <span>{book.abbrev} {chapter}</span>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className={cn(
            "grid rounded-none border-b h-auto p-0 flex-shrink-0",
            isSidebar ? "grid-cols-3" : "grid-cols-6"
          )}>
            {[
              { id: 'exegesis', icon: GraduationCap, label: 'Exégesis' },
              { id: 'thematic', icon: Target, label: 'Temático' },
              { id: 'devotional', icon: Heart, label: 'Devocional' },
              { id: 'plans', icon: Calendar, label: 'Planes' },
              { id: 'notes', icon: PenLine, label: 'Notas' },
              { id: 'biblo', icon: MessageSquare, label: 'Investigador' },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col gap-1 py-2 sm:py-3 rounded-none data-[state=active]:bg-primary/10",
                  isSidebar && "text-[10px]"
                )}
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className={cn(isSidebar ? "truncate px-1" : "text-xs")}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1">
            <div className={cn("p-4 sm:p-6 mx-auto", isSidebar ? "w-full" : "max-w-4xl")}>
              {/* Menu Tab (Dashboard) */}
              <TabsContent value="menu" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'exegesis', icon: GraduationCap, label: 'Exégesis Profunda', desc: 'Análisis gramático, histórico y doctrinal del texto.', color: 'indigo' },
                    { id: 'biblo', icon: MessageSquare, label: 'Biblo (Investigador)', desc: 'Preguntas teológicas complejas y escatología.', color: 'violet' },
                    { id: 'thematic', icon: Target, label: 'Estudio Temático', desc: 'Explora temas desde Génesis hasta Apocalipsis.', color: 'emerald' },
                    { id: 'devotional', icon: Heart, label: 'Devocional Personal', desc: 'Reflexión y oración basada en el pasaje.', color: 'rose' },
                    { id: 'plans', icon: Calendar, label: 'Planes de Lectura', desc: 'Sigue o crea planes guiados por la IA.', color: 'blue' },
                    { id: 'notes', icon: PenLine, label: 'Mis Diarios y Notas', desc: 'Registra tus descubrimientos personales.', color: 'amber' },
                  ].map(tool => (
                    <Card
                      key={tool.id}
                      className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]"
                      onClick={() => navigateTo(tool.id)}
                    >
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl transition-colors",
                          tool.color === 'indigo' && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30",
                          tool.color === 'violet' && "bg-violet-100 text-violet-600 dark:bg-violet-900/30",
                          tool.color === 'emerald' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
                          tool.color === 'rose' && "bg-rose-100 text-rose-600 dark:bg-rose-900/30",
                          tool.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
                          tool.color === 'amber' && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
                        )}>
                          <tool.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base group-hover:text-primary transition-colors">{tool.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 self-center group-hover:translate-x-1 transition-transform" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Tu Progreso de Estudio</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-background/60 p-3 rounded-xl border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Racha</p>
                      <p className="text-xl font-serif font-black">{stats.streak} días</p>
                    </div>
                    <div className="bg-background/60 p-3 rounded-xl border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Capítulos</p>
                      <p className="text-xl font-serif font-black">{stats.totalChapters}</p>
                    </div>
                    <div className="bg-background/60 p-3 rounded-xl border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Notas</p>
                      <p className="text-xl font-serif font-black">{notes.length}</p>
                    </div>
                    <div className="bg-background/60 p-3 rounded-xl border text-primary">
                      <p className="text-[10px] opacity-70 uppercase font-bold text-primary">Nivel</p>
                      <p className="text-xl font-serif font-black uppercase">Beréano</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

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
                  <CardContent className="space-y-6">
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

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Pasaje o pregunta específica
                      </label>
                      <Input
                        value={customReference}
                        onChange={(e) => setCustomReference(e.target.value)}
                        placeholder={`Ej: Juan 3:16, o pregunta sobre ${book?.name || 'este pasaje'}...`}
                        className="bg-background/50 h-11 border-indigo-200 dark:border-indigo-800"
                      />
                      <p className="text-[10px] text-muted-foreground italic">
                        💡 Puedes analizar cualquier versículo o hacer una pregunta específica del texto.
                      </p>
                    </div>

                    <Button
                      onClick={handleExegesis}
                      disabled={loading || !book}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all font-semibold"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {loading ? 'Analizando...' : customReference.trim() ? `Analizar "${customReference.trim()}"` : 'Realizar Exégesis Completa'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Respuesta de Exégesis */}
                {exegesisResponse.content && (
                  <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20 flex flex-row items-center justify-between py-3">
                      <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-base">
                        <GraduationCap className="h-4 w-4" />
                        Análisis Exegético
                        {exegesisResponse.fromCache && <Badge variant="secondary" className="ml-2 text-xs"><Zap className="h-3 w-3 mr-1" />Cache</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {exegesisResponse.time !== null && <span className="text-xs text-muted-foreground">{exegesisResponse.fromCache ? 'Instantáneo' : `${(exegesisResponse.time / 1000).toFixed(1)}s`}</span>}
                        <Button variant="ghost" size="sm" onClick={() => handleCopyResponse(exegesisResponse.content!)} className="h-7">
                          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <FormattedAIResponse content={exegesisResponse.content} />
                    </CardContent>
                  </Card>
                )}
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

                {/* Respuesta de Estudio Temático */}
                {thematicResponse.content && (
                  <Card className="border-2 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 flex flex-row items-center justify-between py-3">
                      <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-base">
                        <Target className="h-4 w-4" />
                        Estudio Temático: {topic}
                        {thematicResponse.fromCache && <Badge variant="secondary" className="ml-2 text-xs"><Zap className="h-3 w-3 mr-1" />Cache</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {thematicResponse.time !== null && <span className="text-xs text-muted-foreground">{thematicResponse.fromCache ? 'Instantáneo' : `${(thematicResponse.time / 1000).toFixed(1)}s`}</span>}
                        <Button variant="ghost" size="sm" onClick={() => handleCopyResponse(thematicResponse.content!)} className="h-7">
                          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <FormattedAIResponse content={thematicResponse.content} />
                    </CardContent>
                  </Card>
                )}
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

                {/* Respuesta de Devocional */}
                {devotionalResponse.content && (
                  <Card className="border-2 border-rose-200 dark:border-rose-800">
                    <CardHeader className="bg-rose-50 dark:bg-rose-900/20 flex flex-row items-center justify-between py-3">
                      <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-base">
                        <Heart className="h-4 w-4" />
                        Devocional
                        {devotionalResponse.fromCache && <Badge variant="secondary" className="ml-2 text-xs"><Zap className="h-3 w-3 mr-1" />Cache</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {devotionalResponse.time !== null && <span className="text-xs text-muted-foreground">{devotionalResponse.fromCache ? 'Instantáneo' : `${(devotionalResponse.time / 1000).toFixed(1)}s`}</span>}
                        <Button variant="ghost" size="sm" onClick={() => handleCopyResponse(devotionalResponse.content!)} className="h-7">
                          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <FormattedAIResponse content={devotionalResponse.content} />
                    </CardContent>
                  </Card>
                )}
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

                    {/* Respuesta de Plan Personalizado */}
                    {planResponse.content && (
                      <Card className="mt-4 border-2 border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 flex flex-row items-center justify-between py-3">
                          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-base">
                            <Calendar className="h-4 w-4" />
                            Plan Generado
                            {planResponse.fromCache && <Badge variant="secondary" className="ml-2 text-xs"><Zap className="h-3 w-3 mr-1" />Cache</Badge>}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {planResponse.time !== null && <span className="text-xs text-muted-foreground">{planResponse.fromCache ? 'Instantáneo' : `${(planResponse.time / 1000).toFixed(1)}s`}</span>}
                            <Button variant="ghost" size="sm" onClick={() => handleCopyResponse(planResponse.content!)} className="h-7">
                              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <FormattedAIResponse content={planResponse.content} />
                        </CardContent>
                      </Card>
                    )}
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


              {/* Biblo Tab */}

              {/* Biblo Tab */}
              <TabsContent value="biblo" className="mt-0 space-y-6">
                <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/10 dark:to-background">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-serif">Biblo: Investigador Bíblico</CardTitle>
                        <CardDescription>
                          Consultas teológicas, escatología y hermenéutica profunda.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-violet-100/50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-800">
                      <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-widest mb-2">Área de Investigación</p>
                      <p className="text-sm text-violet-800 dark:text-violet-200 leading-relaxed italic">
                        "Cualquier duda teológica o escatológica que tengas, puedes preguntarla aquí. Mis respuestas se basan estrictamente en la ortodoxia bíblica."
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Input
                        value={bibloQuestion}
                        onChange={(e) => setBibloQuestion(e.target.value)}
                        placeholder="Escribe tu pregunta bíblica aquí..."
                        className="h-14 text-base border-violet-200 dark:border-violet-800 focus-visible:ring-violet-500 rounded-xl"
                        onKeyDown={(e) => e.key === 'Enter' && handleAskBiblo()}
                      />

                      <div className="flex flex-wrap gap-2">
                        {[
                          '¿Cuál es la importancia del pacto abrahámico?',
                          'Explica el mileniarismo de forma sencilla',
                          '¿Qué significa la Sola Scriptura?',
                          '¿Cómo entender la soberanía de Dios y el hombre?'
                        ].map(q => (
                          <button
                            key={q}
                            onClick={() => { setBibloQuestion(q); }}
                            className="text-[10px] sm:text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-full hover:bg-violet-200 transition-colors border border-violet-200/50 dark:border-violet-800/50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleAskBiblo}
                      disabled={loading || !bibloQuestion.trim()}
                      className="w-full h-12 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none text-white font-bold rounded-xl"
                    >
                      {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                      Consultar al Investigador
                    </Button>
                  </CardContent>
                </Card>

                {/* Respuesta de Biblo */}
                {bibloResponse.content && (
                  <Card className="border-2 border-violet-200 dark:border-violet-800 overflow-hidden rounded-2xl shadow-xl">
                    <CardHeader className="bg-violet-600 text-white flex flex-row items-center justify-between py-4 px-6">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 opacity-80" />
                        <CardTitle className="text-base font-serif">Respuesta del Investigador</CardTitle>
                      </div>
                      <div className="flex items-center gap-3">
                        {bibloResponse.time !== null && <span className="text-[10px] opacity-70">{bibloResponse.fromCache ? 'Instantáneo' : `${(bibloResponse.time / 1000).toFixed(1)}s`}</span>}
                        <Button variant="ghost" size="sm" onClick={() => handleCopyResponse(bibloResponse.content!)} className="h-8 w-8 p-0 hover:bg-white/20 text-white">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white dark:bg-slate-950">
                      <FormattedAIResponse content={bibloResponse.content} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

            </div>
          </ScrollArea>
        </Tabs>
        {/* Loading indicator Educativo */}
        {loading && (
          <div className="absolute inset-0 z-40 bg-background/95 backdrop-blur-sm flex items-center justify-center">
            <StudyLoadingState time={loadingTime} />
          </div>
        )}
      </div>
    </div>
  );

  if (isSidebar) return panelContent;

  return (
    <div className={cn("flex flex-col h-full w-full bg-background animate-in fade-in duration-500", !isOpen && "hidden")}>
      {panelContent}
    </div>
  );
}
