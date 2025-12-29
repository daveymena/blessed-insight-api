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
  type StudyNote
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const passageText = passage?.verses?.map(v => v.text).join(' ') || '';
  const verseOfDay = getVerseOfTheDay();

  useEffect(() => {
    if (book && isOpen) {
      setNotes(getNotesForPassage(book.id, chapter));
      setStats(getReadingStats());
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
                <div className="grid gap-4 md:grid-cols-2">
                  {READING_PLANS.map(plan => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <Badge variant="outline">{plan.duration}</Badge>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Comenzar Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

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
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{response}</div>
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
