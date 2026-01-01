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
  Loader2, RefreshCw, Download
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };
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
    <div className="flex-1 bg-background overflow-y-auto scroll-smooth pb-24">
      {/* Header Premium */}
      <header className="sticky top-0 z-30 glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-primary p-2 rounded-xl shadow-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-foreground">Blessed Insight</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Biblia de Estudio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isGenerating && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          <button className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors shadow-elegant">
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 py-6 space-y-8 max-w-2xl mx-auto"
      >
        {/* Bienvenida */}
        {/* Panel Bento Premium */}
        <motion.div variants={item} className="grid grid-cols-4 gap-4">
          {/* Card Principal: Biblia */}
          <button
            onClick={onStartReading}
            className="col-span-4 sm:col-span-2 group relative overflow-hidden h-44 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-7 text-left transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] shadow-premium"
          >
            <div className="absolute -bottom-8 -right-8 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-500">
              <BookOpen size={160} strokeWidth={1} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/15 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-primary-foreground text-2xl font-serif font-bold leading-tight">Sagrada Escritura</h3>
                <p className="text-primary-foreground/60 text-xs font-medium mt-1.5 tracking-wide">Continuar lectura</p>
              </div>
            </div>
          </button>

          {/* Card IA */}
          <button
            onClick={onOpenAI}
            className="col-span-2 sm:col-span-1 group h-44 bg-card rounded-3xl border border-border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-premium hover:border-primary/20 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-elegant">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Asistente IA</p>
              <h4 className="text-lg font-serif font-semibold text-foreground">Biblo</h4>
            </div>
          </button>

          {/* Card Estudio */}
          <button
            onClick={onOpenStudyCenter}
            className="col-span-2 sm:col-span-1 group h-44 bg-card rounded-3xl border border-border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-premium hover:border-primary/20 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-elegant">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Centro de</p>
              <h4 className="text-lg font-serif font-semibold text-foreground">Estudio</h4>
            </div>
          </button>

          {/* Acciones Rápidas */}
          <button onClick={onOpenSearch} className="flex flex-col items-center justify-center gap-2.5 p-4 bg-card rounded-2xl border border-border hover:bg-accent hover:border-primary/20 transition-all duration-200 active:scale-95 shadow-elegant">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Buscar</span>
          </button>

          <button onClick={onOpenFavorites} className="flex flex-col items-center justify-center gap-2.5 p-4 bg-card rounded-2xl border border-border hover:bg-accent hover:border-primary/20 transition-all duration-200 active:scale-95 shadow-elegant">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground">Favoritos</span>
          </button>

          <button onClick={onOpenPlans} className="flex flex-col items-center justify-center gap-2.5 p-4 bg-card rounded-2xl border border-border hover:bg-accent hover:border-primary/20 transition-all duration-200 active:scale-95 shadow-elegant">
            <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
            <span className="text-[10px] font-semibold text-muted-foreground">Planes</span>
          </button>

          <button onClick={onOpenTheme} className="flex flex-col items-center justify-center gap-2.5 p-4 bg-card rounded-2xl border border-border hover:bg-accent hover:border-primary/20 transition-all duration-200 active:scale-95 shadow-elegant">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Ajustes</span>
          </button>

          {/* Banner de Instalación */}
          <AnimatePresence>
            {showInstallBanner && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleInstallClick}
                className="col-span-4 group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-left transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.99]"
              >
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Download className="h-24 w-24" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-primary-foreground font-serif font-semibold text-lg">Instalar Aplicación</h3>
                    <p className="text-primary-foreground/70 text-xs mt-0.5">Acceso rápido desde tu dispositivo</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                    <Download className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Versículo del Día */}
        {currentVerse && (
          <motion.div variants={item}>
            <Card className="rounded-3xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-premium overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
              <CardContent className="p-8 md:p-10 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-white/10 text-white/90 border-white/10 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide">
                    Versículo del Día
                  </Badge>
                  <Sun className="h-5 w-5 text-amber-400/60" />
                </div>
                <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/95 group-hover:text-white transition-colors duration-500">
                  "{currentVerse.text}"
                </blockquote>
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                  <div>
                    <p className="text-[11px] font-medium text-white/40 mb-0.5">Referencia</p>
                    <p className="text-sm font-semibold text-white/90">{currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Insights */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-serif font-semibold text-foreground">Para Tu Reflexión</h2>
            <span className="text-xs text-muted-foreground">{dynamicInsights.length} reflexiones</span>
          </div>
          <AnimatePresence mode="popLayout">
            {dynamicInsights.slice(0, 6).map((insight, idx) => (
              <motion.article
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl p-6 bg-card border border-border shadow-elegant hover:shadow-premium transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-2.5 rounded-xl shadow-sm ${
                    insight.type === 'promise' ? 'bg-primary/10 text-primary' :
                    insight.type === 'fact' ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 
                    'bg-accent text-accent-foreground'
                  }`}>
                    {insight.type === 'promise' ? <Gift className="h-4 w-4" /> :
                      insight.type === 'fact' ? <Zap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {insight.type === 'promise' ? 'Promesa Bíblica' : insight.type === 'fact' ? 'Dato Curioso' : 'Personaje'}
                    </span>
                    <h3 className="font-serif font-semibold text-foreground leading-snug mt-0.5">{insight.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {insight.content}
                </p>
                {insight.reference && (
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <span className="text-xs font-medium px-3 py-1 bg-secondary rounded-full text-secondary-foreground">
                      {insight.reference}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent text-primary">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </section>

        {/* CTA Section */}
        <motion.div variants={item} className="pb-8 pt-2">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-premium relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
              <Microscope size={200} strokeWidth={1} />
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3 text-white">Profundiza en la Palabra</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-md">Descubre el significado exegético de cada pasaje con herramientas de estudio avanzadas.</p>
              <Button 
                onClick={onOpenStudyCenter} 
                className="bg-white text-slate-900 hover:bg-white/90 rounded-xl h-12 px-8 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Comenzar Estudio
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}