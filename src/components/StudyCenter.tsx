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
function FormattedAIResponse({ content }: { content: string }) {
  // Función para procesar el texto y convertirlo en elementos formateados
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detectar encabezados con emojis (📜 1. TÍTULO)
      const headerMatch = trimmedLine.match(/^([\p{Emoji}]+)\s*(\d+\.?\s*)?(.+)$/u);
      const isMainHeader = headerMatch && (
        trimmedLine.includes('CONTEXTO') ||
        trimmedLine.includes('ANÁLISIS') ||
        trimmedLine.includes('INTERPRETACIÓN') ||
        trimmedLine.includes('APLICACIÓN') ||
        trimmedLine.includes('CONEXIONES') ||
        trimmedLine.includes('SIGNIFICADO') ||
        trimmedLine.includes('DEFINICIÓN') ||
        trimmedLine.includes('DESARROLLO') ||
        trimmedLine.includes('PERSPECTIVAS') ||
        trimmedLine.includes('ERRORES') ||
        trimmedLine.includes('PREGUNTAS') ||
        trimmedLine.includes('LECTURA') ||
        trimmedLine.includes('REFLEXIÓN') ||
        trimmedLine.includes('VERDAD') ||
        trimmedLine.includes('DESAFÍO') ||
        trimmedLine.includes('ORACIÓN') ||
        trimmedLine.includes('VERSÍCULO') ||
        trimmedLine.includes('OBSERVACIÓN') ||
        trimmedLine.includes('INTRODUCCIÓN')
      );

      if (isMainHeader && headerMatch) {
        elements.push(
          <div key={currentIndex++} className="mt-6 mb-3 first:mt-0">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg border-l-4 border-primary">
              <span className="text-2xl">{headerMatch[1]}</span>
              <h3 className="text-lg font-bold text-primary">
                {headerMatch[2] || ''}{headerMatch[3]}
              </h3>
            </div>
          </div>
        );
      }
      // Detectar sub-encabezados (con emoji al inicio pero no mayúsculas completas)
      else if (headerMatch && !isMainHeader) {
        elements.push(
          <div key={currentIndex++} className="mt-4 mb-2">
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="text-xl">{headerMatch[1]}</span>
              {headerMatch[2] || ''}{headerMatch[3]}
            </h4>
          </div>
        );
      }
      // Detectar listas con guiones o asteriscos
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const listContent = trimmedLine.replace(/^[-•*]\s*/, '');
        elements.push(
          <div key={currentIndex++} className="flex gap-2 my-1.5 ml-2">
            <span className="text-primary mt-1">•</span>
            <span className="text-foreground/90 leading-relaxed">{listContent}</span>
          </div>
        );
      }
      // Detectar listas numeradas
      else if (/^\d+[\.\)]\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)[\.\)]\s*(.+)$/);
        if (match) {
          elements.push(
            <div key={currentIndex++} className="flex gap-3 my-2 ml-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {match[1]}
              </span>
              <span className="text-foreground/90 leading-relaxed flex-1">{match[2]}</span>
            </div>
          );
        }
      }
      // Detectar citas bíblicas (texto entre comillas con referencia)
      else if (trimmedLine.startsWith('"') || trimmedLine.startsWith('«')) {
        elements.push(
          <blockquote key={currentIndex++} className="my-3 pl-4 border-l-4 border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-r-lg italic text-foreground/80">
            {trimmedLine}
          </blockquote>
        );
      }
      // Detectar líneas vacías (espaciado)
      else if (trimmedLine === '') {
        elements.push(<div key={currentIndex++} className="h-2" />);
      }
      // Texto normal
      else {
        // Resaltar palabras en hebreo/griego (entre paréntesis con caracteres especiales)
        const formattedLine = trimmedLine
          .replace(/\(([^)]*(?:hebreo|griego|hebrea|griega)[^)]*)\)/gi, 
            '<span class="bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 text-sm font-medium">($1)</span>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        elements.push(
          <p 
            key={currentIndex++} 
            className="my-2 text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-1">
      {formatContent(content)}
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
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <GraduationCap className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Centro de Estudio</h1>
            <p className="text-xs text-white/80">Biblia de Estudio Profesional</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
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

      {/* Loading indicator */}
      {loading && (
        <div className="bg-primary/10 px-4 py-2 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm">Generando respuesta...</span>
          <span className="text-xs text-muted-foreground">{(loadingTime / 1000).toFixed(1)}s</span>
          <Progress value={Math.min((loadingTime / 10000) * 100, 95)} className="flex-1 h-2" />
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
