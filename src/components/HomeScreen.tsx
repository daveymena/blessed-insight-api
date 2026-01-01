import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, Menu, UserCircle, Sun, Share2,
  Bookmark, Settings, Microscope, Lightbulb, Compass, Gift,
  Check, Copy, BookOpen, GraduationCap, Flame, Play,
  History, User, Zap, MessageCircle, Heart, Star, ChevronRight, Sparkles,
  Loader2, RefreshCw
} from 'lucide-react';
import {
  getVerseOfTheDay,
  getReadingStats,
  getActivePlan,
  getPlanById,
  getStoredInsights,
  generateDynamicInsight,
  getStoredVerses,
  generateDynamicVerse,
  type DailyInsight
} from '@/lib/studyService';

interface HomeScreenProps {
  onStartReading: () => void;
  onOpenSearch: () => void;
  onOpenStudyCenter: () => void;
  onOpenFavorites: () => void;
  onOpenAI: () => void; // Nuevo
  onOpenPlans: () => void; // Nuevo
  onOpenTheme: () => void; // Nuevo
}

export function HomeScreen({
  onStartReading,
  onOpenSearch,
  onOpenStudyCenter,
  onOpenFavorites,
  onOpenAI,
  onOpenPlans,
  onOpenTheme
}: HomeScreenProps) {
  const [greeting, setGreeting] = useState('');
  const [currentVerse, setCurrentVerse] = useState<any>(null);
  const [dynamicInsights, setDynamicInsights] = useState<DailyInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const stats = getReadingStats();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    // 1. Cargar Versículos Dinámicos
    const savedVerses = getStoredVerses();
    if (savedVerses.length > 0) {
      // Rotar aleatoriamente entre los guardados
      setCurrentVerse(savedVerses[Math.floor(Math.random() * savedVerses.length)]);
    } else {
      // Fallback al estático si no hay nada guardado aún
      setCurrentVerse(getVerseOfTheDay());
    }

    // 2. Cargar Insights Dinámicos
    const cachedInsights = getStoredInsights();
    // Barajar aleatoriamente para que cada vez que entre vea algo distinto
    const shuffled = [...cachedInsights].sort(() => Math.random() - 0.5);
    setDynamicInsights(shuffled);

    // 3. Sistema de Generación Automática (Fondo)
    // Objetivo: tener al menos 15 pepitas de sabiduría guardadas
    const checkAndGenerate = async () => {
      const currentInsights = getStoredInsights();
      const currentVerses = getStoredVerses();

      // Generar si faltan datos o si lo último es muy viejo (> 24h)
      const needsInsights = currentInsights.length < 15;
      const needsVerses = currentVerses.length < 5;

      if (needsInsights || needsVerses) {
        setIsGenerating(true);
        try {
          if (needsInsights) await generateDynamicInsight();
          if (needsVerses) await generateDynamicVerse();

          // Actualizar UI con lo nuevo
          const updated = getStoredInsights();
          setDynamicInsights(prev => [...updated].sort(() => Math.random() - 0.5));
          if (needsVerses) {
            const updatedVerses = getStoredVerses();
            setCurrentVerse(updatedVerses[0]);
          }
        } catch (e) { }
        setIsGenerating(false);
      }
    };

    checkAndGenerate();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto scroll-smooth pb-24">
      {/* Header Minimalista */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">Blessed</h1>
        </div>
        <div className="flex items-center gap-4">
          {isGenerating && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 py-6 space-y-8 max-w-2xl mx-auto"
      >
        {/* Bienvenida */}
        {/* Panel de Control Estilo Bento (Más profesional y ubicado) */}
        <motion.div variants={item} className="grid grid-cols-4 gap-3">
          {/* Acción Principal: Biblia */}
          <button
            onClick={onStartReading}
            className="col-span-4 sm:col-span-2 group relative overflow-hidden h-40 bg-zinc-900 rounded-[2.5rem] p-8 text-left transition-all hover:scale-[0.99] active:scale-[0.97] shadow-xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BookOpen size={120} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter leading-none">Sagrada Escritura</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Continuar Lectura</p>
              </div>
            </div>
          </button>

          {/* Acción Secundaria: IA */}
          <button
            onClick={onOpenAI}
            className="col-span-2 sm:col-span-1 group h-40 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Asistente</p>
              <h4 className="text-lg font-black italic uppercase italic tracking-tighter text-purple-600">IA</h4>
            </div>
          </button>

          {/* Acción Secundaria: Estudio */}
          <button
            onClick={onOpenStudyCenter}
            className="col-span-2 sm:col-span-1 group h-40 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Centro de</p>
              <h4 className="text-lg font-black italic uppercase italic tracking-tighter text-blue-600">Estudio</h4>
            </div>
          </button>

          {/* Fila Inferior de Iconos Compactos */}
          <button onClick={onOpenSearch} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-zinc-900 rounded-[2.2rem] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 transition-colors">
            <Search className="h-5 w-5 text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Buscar</span>
          </button>

          <button onClick={onOpenFavorites} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-zinc-900 rounded-[2.2rem] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 transition-colors">
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Favoritos</span>
          </button>

          <button onClick={onOpenPlans} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-zinc-900 rounded-[2.2rem] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 transition-colors">
            <Check className="h-5 w-5 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Planes</span>
          </button>

          <button onClick={onOpenTheme} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-zinc-900 rounded-[2.2rem] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 transition-colors">
            <Settings className="h-5 w-5 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Ajustes</span>
          </button>
        </motion.div>

        {/* Versículo del Día (Pool Dinámico) */}
        {currentVerse && (
          <motion.div variants={item}>
            <Card className="rounded-[2.5rem] border-none bg-zinc-900 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent opacity-50" />
              <CardContent className="p-10 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Lectura del Día
                  </Badge>
                  <Sun className="h-5 w-5 text-yellow-400 opacity-50" />
                </div>
                <p className="text-2xl md:text-3xl font-serif italic mb-10 leading-relaxed group-hover:scale-[1.01] transition-transform duration-700">
                  "{currentVerse.text}"
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Cita Sagrada</p>
                    <p className="text-sm font-black tracking-tighter uppercase">{currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Insights Generados Automáticamente */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {dynamicInsights.slice(0, 8).map((insight, idx) => (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-[2rem] p-8 border shadow-sm hover:shadow-xl transition-all duration-500 ${insight.type === 'promise' ? 'bg-indigo-50/40 border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/20' :
                  insight.type === 'fact' ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-800/20' :
                    insight.type === 'character' ? 'bg-violet-50/40 border-violet-100 dark:bg-violet-950/10 dark:border-violet-800/20' :
                      'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-2.5 rounded-2xl shadow-lg ${insight.type === 'promise' ? 'bg-indigo-600 text-white' :
                    insight.type === 'fact' ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white'
                    }`}>
                    {insight.type === 'promise' ? <Gift className="h-4 w-4" /> :
                      insight.type === 'fact' ? <Zap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-black uppercase text-[9px] tracking-[0.3em] opacity-40">
                      {insight.type === 'promise' ? 'Tu Promesa' : insight.type === 'fact' ? 'Curiosidad' : 'Personaje'}
                    </span>
                    <h4 className="font-black text-lg tracking-tight leading-none uppercase italic">{insight.title}</h4>
                  </div>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-6 font-serif text-lg tracking-tight">
                  {insight.content}
                </p>
                {insight.reference && (
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <span className="text-[10px] font-black px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full uppercase tracking-widest text-primary">
                      {insight.reference}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-100">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-100 text-primary">
                        <Bookmark className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA Section */}
        <motion.div variants={item} className="pb-12 pt-4">
          <div className="bg-zinc-900 text-white rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Microscope size={220} />
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-3xl font-black mb-4 leading-none uppercase tracking-tighter italic">Análisis Profundo</h3>
              <p className="text-white/40 text-sm font-medium mb-10 max-w-sm">Desbloquea el significado exegético de cualquier pasaje con nuestra tecnología avanzada.</p>
              <Button onClick={onOpenStudyCenter} className="bg-white text-zinc-900 hover:bg-zinc-50 rounded-2xl h-14 px-12 font-black text-xs uppercase tracking-[0.2em] shadow-xl">
                COMENZAR ESTUDIO
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}