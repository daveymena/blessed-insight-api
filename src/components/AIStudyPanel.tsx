import { useState } from 'react';
import { X, Sparkles, Send, BookOpen, Lightbulb, Calendar, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzePassage, askBibleQuestion, generateStudyPlan } from '@/lib/aiStudyService';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { AdPlaceholder } from './AdPlaceholder';
import { PremiumBanner } from './PremiumBanner';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AIStudyPanelProps {
  book: BibleBook | null;
  chapter: number;
  passage: BiblePassage | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function AIStudyPanel({ book, chapter, passage, isOpen, onClose }: AIStudyPanelProps) {
  const [activeTab, setActiveTab] = useState('analyze');
  const [question, setQuestion] = useState('');
  const [studyTopic, setStudyTopic] = useState('');
  const [response, setResponse] = useState<{ content: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const { user } = useAuth();

  const isFreeTier = !user || user.tier === 'FREE';
  const limitReached = isFreeTier && usageCount >= 3;

  const passageText = passage?.verses?.map((v) => v.text).join(' ') || '';

  const handleAnalyze = async () => {
    if (!book) return;
    if (limitReached) {
      toast.error('Límite de análisis diario alcanzado para cuenta gratuita');
      return;
    }
    setLoading(true);
    setResponse(null);
    const result = await analyzePassage(passageText, book.name, chapter);
    setResponse({ content: result.content, source: result.source });
    setUsageCount(prev => prev + 1);
    setLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);
    const context = book ? `${book.name} ${chapter}: ${passageText.substring(0, 500)}` : '';
    const result = await askBibleQuestion(question, context);
    setResponse({ content: result.content, source: result.source });
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!studyTopic.trim()) return;
    setLoading(true);
    setResponse(null);
    const result = await generateStudyPlan(studyTopic);
    setResponse({ content: result.content, source: result.source });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Estudio con IA</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="analyze" className="gap-1 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Analizar</span>
          </TabsTrigger>
          <TabsTrigger value="ask" className="gap-1 text-xs sm:text-sm">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Preguntar</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Analyze Tab */}
            <TabsContent value="analyze" className="mt-0 space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Pasaje actual:</strong> {book?.name || 'Ninguno'} {chapter}
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !book}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analizar este capítulo
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Ask Tab */}
            <TabsContent value="ask" className="mt-0 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Haz cualquier pregunta sobre la Biblia o el pasaje que estás leyendo.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="¿Qué significa este pasaje?"
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                />
                <Button onClick={handleAskQuestion} disabled={loading || !question.trim()} size="icon">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Preguntas sugeridas:</p>
                {['¿Cuál es el contexto histórico?', '¿Qué enseñanza principal tiene?', '¿Cómo aplicar esto hoy?'].map(
                  (q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setQuestion(q)}
                    >
                      {q}
                    </Button>
                  )
                )}
              </div>
            </TabsContent>

            {/* Study Plan Tab */}
            <TabsContent value="plan" className="mt-0 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Genera un plan de estudio personalizado sobre cualquier tema bíblico.
                </p>
              </div>

              <Input
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Ej: La fe, El amor, La oración..."
              />

              <Button
                onClick={handleGeneratePlan}
                disabled={loading || !studyTopic.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando plan...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generar Plan de 7 Días
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Temas populares:</p>
                <div className="flex flex-wrap gap-2">
                  {['La fe', 'El perdón', 'La oración', 'El amor', 'La esperanza'].map((topic, i) => (
                    <Button key={i} variant="secondary" size="sm" onClick={() => setStudyTopic(topic)}>
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Response */}
            {response && (
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">
                    Respuesta de IA
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground">{response.content}</div>
                </div>
              </div>
            )}

            {/* Premium Upsell for Free Users */}
            {isFreeTier && (
              <div className="mt-8">
                <PremiumBanner />
              </div>
            )}

            {/* Ad Placement: Bottom of AI Panel */}
            <div className="mt-8 pt-4 border-t border-border/50">
              <AdPlaceholder type="banner" />
            </div>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
