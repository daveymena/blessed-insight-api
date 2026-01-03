import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Microscope, GraduationCap, Calendar, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { analyzePassage, askBibleQuestion, generateStudyPlan } from '@/lib/aiStudyService';
import { FormattedAIResponse } from './FormattedAIResponse';
import { cn } from '@/lib/utils';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';

export interface AIStudyPanelProps {
  book: BibleBook | null;
  chapter: number;
  passage: BiblePassage | undefined;
  isOpen: boolean;
  onClose: () => void;
  isSidebar?: boolean;
}

export function AIStudyPanel({ book, chapter, passage, isOpen, onClose, isSidebar }: AIStudyPanelProps) {
  const [activeTab, setActiveTab] = useState('analyze');
  const [question, setQuestion] = useState('');
  const [customReference, setCustomReference] = useState('');
  const [studyTopic, setStudyTopic] = useState('');
  const [depth, setDepth] = useState<'basic' | 'pastoral' | 'academic'>('pastoral');
  const [response, setResponse] = useState<{ content: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAnalyze = async () => {
    setLoading(true);
    setResponse(null);
    const textToAnalyze = passage?.verses.map(v => v.text).join(' ') || "";
    // Si hay referencia personalizada, el servicio debería manejarla. 
    // Por ahora pasamos la referencia personalizada si existe como parte del prompt o parámetro.
    const ref = customReference.trim() || `${book?.name} ${chapter}`;
    const result = await analyzePassage(textToAnalyze, book?.name || "", chapter, customReference.trim());
    setResponse({ content: result.content, source: result.source });
    setLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);
    const textContext = passage?.verses.map(v => v.text).join(' ') || "";
    const result = await askBibleQuestion(question, textContext);
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

  const panelContent = (
    <div className={cn("flex flex-col h-full bg-card overflow-hidden", isSidebar && "border-none shadow-none")}>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold text-sm sm:text-base">Asistente de Estudio</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-12 bg-muted/20 flex-shrink-0">
          <TabsTrigger value="analyze" className="gap-2 text-[10px] sm:text-xs h-full data-[state=active]:bg-background">
            <Microscope className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Exégesis</span>
          </TabsTrigger>
          <TabsTrigger value="ask" className="gap-2 text-[10px] sm:text-xs h-full data-[state=active]:bg-background">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Sermones</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 text-[10px] sm:text-xs h-full data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Planes</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <TabsContent value="analyze" className="mt-0 space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <p className="text-sm font-serif italic text-indigo-900 dark:text-indigo-200 text-center">
                  "Escudriñad las Escrituras..." - Juan 5:39
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Referencia a Analizar</label>
                <Input
                  value={customReference}
                  onChange={(e) => setCustomReference(e.target.value)}
                  placeholder={`Ej: Juan 3:16 (Predeterminado: ${book?.name || ''} ${chapter})`}
                  className="bg-background/50 text-sm h-10"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Profundidad</label>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  {(['basic', 'pastoral', 'academic'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${depth === d ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {d === 'basic' ? 'Bás.' : d === 'pastoral' ? 'Past.' : 'Acad.'}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAnalyze} disabled={loading || !book} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 font-bold shadow-lg shadow-indigo-500/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Microscope className="h-5 w-5 mr-2" />}
                {loading ? 'Investigando...' : customReference.trim() ? `Estudiar "${customReference.trim()}"` : 'Realizar Exégesis Completa'}
              </Button>
            </TabsContent>

            <TabsContent value="ask" className="mt-0 space-y-4">
              <div className="flex gap-2">
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pregunta sobre el pasaje..." className="h-10 text-sm" />
                <Button onClick={handleAskQuestion} disabled={loading || !question.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="mt-0 space-y-4">
              <Input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="Tema: La fe, El perdón..." className="h-10 text-sm" />
              <Button onClick={handleGeneratePlan} disabled={loading || !studyTopic.trim()} className="w-full h-11 font-bold">
                Generar Plan de 7 Días
              </Button>
            </TabsContent>

            {response && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-6 bg-card rounded-2xl border border-border shadow-xl">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-600/70">Biblo Insight</span>
                          <span className="text-sm font-bold">Análisis Teológico Profundo</span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none 
                      prose-h3:text-lg prose-h3:font-bold prose-h3:font-serif prose-h3:text-primary 
                      prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/80
                      prose-strong:text-foreground prose-strong:font-bold">
                      <FormattedAIResponse content={response.content} />
                    </div>

                    <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground italic">Basado en {response.source}</span>
                      <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-wider hover:bg-primary/5" onClick={() => setResponse(null)}>
                        Nueva Consulta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );

  if (isSidebar) return panelContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
