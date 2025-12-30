import { useState } from 'react';
import { X, Sparkles, Send, BookOpen, Lightbulb, Calendar, Loader2, Crown, ScrollText, Microscope, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzePassage, askBibleQuestion, generateStudyPlan } from '@/lib/aiStudyService';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { AdPlaceholder } from './AdPlaceholder';
import { PremiumBanner } from './PremiumBanner';
import { useAuth } from '@/context/AuthContext';
import { personalStudyService } from '@/lib/personalStudyService';
import { toast } from 'sonner';

// Componente para renderizar la respuesta de IA con formato bonito
function FormattedAIResponse({ content }: { content: string }) {
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Detectar encabezados con emojis
      const headerMatch = trimmedLine.match(/^([\p{Emoji}]+)\s*(\d+\.?\s*)?(.+)$/u);
      const isMainHeader = headerMatch && (
        trimmedLine.includes('CONTEXTO') || trimmedLine.includes('ANÁLISIS') ||
        trimmedLine.includes('INTERPRETACIÓN') || trimmedLine.includes('APLICACIÓN') ||
        trimmedLine.includes('CONEXIONES') || trimmedLine.includes('SIGNIFICADO') ||
        trimmedLine.includes('DEFINICIÓN') || trimmedLine.includes('DESARROLLO') ||
        trimmedLine.includes('PERSPECTIVAS') || trimmedLine.includes('ERRORES') ||
        trimmedLine.includes('PREGUNTAS') || trimmedLine.includes('LECTURA') ||
        trimmedLine.includes('REFLEXIÓN') || trimmedLine.includes('VERDAD') ||
        trimmedLine.includes('DESAFÍO') || trimmedLine.includes('ORACIÓN') ||
        trimmedLine.includes('VERSÍCULO') || trimmedLine.includes('OBSERVACIÓN') ||
        trimmedLine.includes('INTRODUCCIÓN') || trimmedLine.includes('HISTÓRICO') ||
        trimmedLine.includes('LITERARIO') || trimmedLine.includes('TEOLÓGIC')
      );

      if (isMainHeader && headerMatch) {
        elements.push(
          <div key={currentIndex++} className="mt-5 mb-2 first:mt-0">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent p-2.5 rounded-lg border-l-4 border-primary">
              <span className="text-xl">{headerMatch[1]}</span>
              <h3 className="text-sm font-bold text-primary">
                {headerMatch[2] || ''}{headerMatch[3]}
              </h3>
            </div>
          </div>
        );
      } else if (headerMatch && !isMainHeader) {
        elements.push(
          <div key={currentIndex++} className="mt-3 mb-1.5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">{headerMatch[1]}</span>
              {headerMatch[2] || ''}{headerMatch[3]}
            </h4>
          </div>
        );
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const listContent = trimmedLine.replace(/^[-•*]\s*/, '');
        elements.push(
          <div key={currentIndex++} className="flex gap-2 my-1 ml-2">
            <span className="text-primary text-xs mt-1">●</span>
            <span className="text-foreground/90 text-sm leading-relaxed">{listContent}</span>
          </div>
        );
      } else if (/^\d+[\.\)]\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)[\.\)]\s*(.+)$/);
        if (match) {
          elements.push(
            <div key={currentIndex++} className="flex gap-2 my-1.5 ml-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                {match[1]}
              </span>
              <span className="text-foreground/90 text-sm leading-relaxed flex-1">{match[2]}</span>
            </div>
          );
        }
      } else if (trimmedLine.startsWith('"') || trimmedLine.startsWith('«')) {
        elements.push(
          <blockquote key={currentIndex++} className="my-2 pl-3 border-l-3 border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded-r-lg italic text-foreground/80 text-sm">
            {trimmedLine}
          </blockquote>
        );
      } else if (trimmedLine === '') {
        elements.push(<div key={currentIndex++} className="h-1.5" />);
      } else {
        elements.push(
          <p key={currentIndex++} className="my-1.5 text-foreground/90 text-sm leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    return elements;
  };

  return <div className="space-y-0.5">{formatContent(content)}</div>;
}

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
  const [depth, setDepth] = useState<'basic' | 'pastoral' | 'academic'>('pastoral');
  const [response, setResponse] = useState<{ content: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
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

    if (user) {
      const conv = await personalStudyService.saveMessage({
        conversationId,
        role: 'user',
        content: `Analiza ${book.name} ${chapter}`,
        title: `Estudio de ${book.name} ${chapter}`
      });
      if (conv) {
        setConversationId(conv.conversationId);
        await personalStudyService.saveMessage({
          conversationId: conv.conversationId,
          role: 'assistant',
          content: result.content
        });
      }
    }
    setLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);
    const context = book ? `${book.name} ${chapter}: ${passageText.substring(0, 500)}` : '';
    const result = await askBibleQuestion(question, context);
    setResponse({ content: result.content, source: result.source });

    if (user) {
      const conv = await personalStudyService.saveMessage({
        conversationId,
        role: 'user',
        content: question,
        title: question.substring(0, 30)
      });
      if (conv) {
        setConversationId(conv.conversationId);
        await personalStudyService.saveMessage({
          conversationId: conv.conversationId,
          role: 'assistant',
          content: result.content
        });
      }
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Estudio con IA</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-14 bg-muted/20">
          <TabsTrigger value="analyze" className="gap-2 text-xs h-full data-[state=active]:bg-background">
            <Microscope className="h-4 w-4" />
            <span className="font-semibold">Exégesis</span>
          </TabsTrigger>
          <TabsTrigger value="ask" className="gap-2 text-xs h-full data-[state=active]:bg-background">
            <GraduationCap className="h-4 w-4" />
            <span className="font-semibold">Sermones</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 text-xs h-full data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold">Planes</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <TabsContent value="analyze" className="mt-0 space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <p className="text-sm font-serif italic text-indigo-900 dark:text-indigo-200">
                  "Escudriñad las Escrituras; porque a vosotros os parece que en ellas tenéis la vida eterna..." - Juan 5:39
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profundidad</label>
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                  {(['basic', 'pastoral', 'academic'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${depth === d ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {d === 'basic' ? 'Básico' : d === 'pastoral' ? 'Pastoral' : 'Académico'}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAnalyze} disabled={loading || !book} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Microscope className="h-5 w-5 mr-2" />}
                {loading ? 'Analizando...' : 'Realizar Exégesis'}
              </Button>
            </TabsContent>

            <TabsContent value="ask" className="mt-0 space-y-4">
              <div className="flex gap-2">
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Qué significa este pasaje?" />
                <Button onClick={handleAskQuestion} disabled={loading || !question.trim()} size="icon">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="mt-0 space-y-4">
              <Input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="Ej: La fe, El perdón..." />
              <Button onClick={handleGeneratePlan} disabled={loading || !studyTopic.trim()} className="w-full">
                Generar Plan de 7 Días
              </Button>
            </TabsContent>

            {response && (
              <div className="mt-6 p-4 bg-card rounded-2xl border border-border shadow-inner bg-gradient-to-b from-transparent to-muted/5">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Resultados del Análisis</span>
                </div>
                <FormattedAIResponse content={response.content} />
              </div>
            )}

            {isFreeTier && <PremiumBanner />}
            <AdPlaceholder type="banner" />
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
