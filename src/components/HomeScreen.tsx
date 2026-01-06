import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, BookOpen, Sparkles, GraduationCap,
  Heart, Share2, ChevronRight, Sun,
  Loader2, Download, Gift, Zap, User,
  Bookmark, ArrowRight
} from 'lucide-react';
import {
  getVerseOfTheDay,
  getReadingStats,
  getStoredInsights,
  generateDynamicInsight,
  getStoredVerses,
  generateDynamicVerse,
  type DailyInsight
} from '@/lib/studyService';

// Importar imágenes
import heroSunrise from '@/assets/hero-sunrise.jpg';
import bibleStudy from '@/assets/bible-study.jpg';
import spiritDove from '@/assets/spirit-dove.jpg';
import { AdSlot } from './AdSlot';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn } from '@/lib/utils';

interface HomeScreenProps {
  onStartReading: () => void;
  onOpenSearch: () => void;
  onOpenStudyCenter: () => void;
  onOpenFavorites: () => void;
  onOpenAI: () => void;
  onOpenPlans: () => void;
  onOpenTheme: () => void;
  onOpenMenu?: () => void;
}

export function HomeScreen({
  onStartReading,
  onOpenSearch,
  onOpenStudyCenter,
  onOpenFavorites,
  onOpenAI,
  onOpenPlans,
  onOpenTheme,
  onOpenMenu
}: HomeScreenProps) {
  const [greeting, setGreeting] = useState('');
  const [currentVerse, setCurrentVerse] = useState<any>(null);
  const [dynamicInsights, setDynamicInsights] = useState<DailyInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const { activeTheme, hasScenicBackground } = useThemeSettings();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const stats = getReadingStats();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    const savedVerses = getStoredVerses();
    if (savedVerses.length > 0) {
      setCurrentVerse(savedVerses[Math.floor(Math.random() * savedVerses.length)]);
    } else {
      setCurrentVerse(getVerseOfTheDay());
    }

    const cachedInsights = getStoredInsights();
    const shuffled = [...cachedInsights].sort(() => Math.random() - 0.5);
    setDynamicInsights(shuffled);

    const checkAndGenerate = async () => {
      const currentInsights = getStoredInsights();
      const currentVerses = getStoredVerses();
      const needsInsights = currentInsights.length < 15;
      const needsVerses = currentVerses.length < 5;

      if (needsInsights || needsVerses) {
        setIsGenerating(true);
        try {
          if (needsInsights) await generateDynamicInsight();
          if (needsVerses) await generateDynamicVerse();
          const updated = getStoredInsights();
          setDynamicInsights([...updated].sort(() => Math.random() - 0.5));
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

  const isDarkMode = activeTheme?.uiMode === 'dark';
  const isScenic = activeTheme?.type === 'scenic';
  
  // Para fondos escénicos siempre usar blanco
  const textColor = isScenic ? '#FFFFFF' : activeTheme?.textColor || '#000000';
  const textShadow = isScenic ? '0 2px 8px rgba(0,0,0,0.8)' : 'none';
  
  const cardBaseClass = hasScenicBackground
    ? isDarkMode
      ? "bg-black/50 backdrop-blur-2xl border-white/10 shadow-2xl"
      : "bg-white/75 backdrop-blur-2xl border-white/40 shadow-lg"
    : "bg-card border-border";

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth pb-24 custom-scrollbar">
      {/* Hero Section con imagen real */}
      <div className="relative h-[420px] md:h-[480px] overflow-hidden">
        <img
          src={heroSunrise}
          alt="Amanecer sobre Jerusalén"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Header flotante */}
        <header className="absolute top-0 left-0 right-0 z-30 px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/20 shadow-2xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black text-white drop-shadow-xl tracking-tight italic">Blessed Insight</h1>
              <p className="text-xs text-white/70 font-black uppercase tracking-widest">Estudio Profundo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="bg-white/20 backdrop-blur-xl rounded-full p-2">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
          </div>
        </header>

        {/* Contenido del Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-14 bg-gradient-to-t from-black/60 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-2">{greeting}</p>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-serif font-black text-white mb-4 sm:mb-6 drop-shadow-2xl leading-[1.1]">
              Tu espacio de<br />encuentro espiritual
            </h2>
            <Button
              onClick={onStartReading}
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl sm:rounded-2xl h-12 sm:h-16 px-6 sm:px-10 text-xs sm:text-base font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              Comenzar
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className={cn(
        "px-4 sm:px-5 py-8 space-y-8 md:space-y-10 max-w-2xl mx-auto -mt-12 sm:-mt-10 relative z-10 w-full overflow-x-hidden",
        hasScenicBackground && (isDarkMode ? "bg-gradient-to-b from-black/20 to-black/60 rounded-t-[2.5rem] sm:rounded-t-[3rem] backdrop-blur-sm" : "bg-gradient-to-b from-white/10 to-white/40 rounded-t-[2.5rem] sm:rounded-t-[3rem] backdrop-blur-sm")
      )}>

        {/* Grid de Acciones Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-5"
        >
          {/* Card IA Biblo */}
          <button
            onClick={onOpenAI}
            className={cn(
              "group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 text-left transition-all duration-500 hover:shadow-2xl active:scale-[0.97]",
              cardBaseClass
            )}
          >
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-6 shadow-xl group-hover:rotate-6 transition-transform">
                <Sparkles className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-lg sm:text-2xl font-serif font-black mb-0.5 sm:mb-1" style={{ color: activeTheme.textColor }}>Biblo IA</h3>
              <p className="text-[10px] sm:text-sm font-bold opacity-90" style={{ color: activeTheme.textColor }}>Asistente Inteligente</p>
            </div>
          </button>

          {/* Card Centro de Estudio */}
          <button
            onClick={onOpenStudyCenter}
            className={cn(
              "group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 text-left transition-all duration-500 hover:shadow-2xl active:scale-[0.97]",
              cardBaseClass
            )}
          >
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-6 shadow-xl group-hover:-rotate-6 transition-transform">
                <GraduationCap className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-lg sm:text-2xl font-serif font-black mb-0.5 sm:mb-1" style={{ color: activeTheme.textColor }}>Estudio</h3>
              <p className="text-[10px] sm:text-sm font-bold opacity-90" style={{ color: activeTheme.textColor }}>Cursos y Planes</p>
            </div>
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {[
            { icon: Heart, label: 'Favoritos', onClick: onOpenFavorites, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Bookmark, label: 'Planes', onClick: onOpenPlans, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Sun, label: 'Apariencia', onClick: onOpenTheme, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={cn(
                "flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-3 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border transition-all active:scale-95 group",
                cardBaseClass,
                "hover:border-primary/40"
              )}
            >
              <div className={cn("p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-transform group-hover:scale-110 shadow-inner shrink-0", action.bg)}>
                <action.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", action.color)} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: activeTheme.textColor }}>{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Versículo del Día */}
        {currentVerse && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={cn("rounded-[2.5rem] border-0 overflow-hidden shadow-2xl group", cardBaseClass, "bg-transparent")}>
              <div className="relative">
                <img src={bibleStudy} alt="Biblia abierta" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Badge className="absolute top-6 left-6 bg-white/10 text-white border-white/20 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Sun className="h-3.5 w-3.5 mr-2 text-amber-400" />
                  Maná del Día
                </Badge>
              </div>
              <CardContent className={cn(
                "p-6 sm:p-8 relative",
                hasScenicBackground
                  ? (isDarkMode ? "bg-black/60 backdrop-blur-2xl" : "bg-white/80 backdrop-blur-2xl")
                  : "bg-card text-card-foreground"
              )}>
                <blockquote className="text-xl sm:text-2xl font-serif italic leading-[1.4] mb-8" style={{ color: activeTheme.textColor }}>
                  "{currentVerse.text}"
                </blockquote>
                <div className="flex items-center justify-between pt-6 border-t border-black/10">
                  <p className="text-base font-black uppercase tracking-widest opacity-80" style={{ color: activeTheme.textColor }}>
                    {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                  </p>
                  <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10 text-white">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sección Reflexiones */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-serif font-black tracking-tight drop-shadow-lg" style={{ color: activeTheme.textColor }}>Inspiración</h2>
              <p className="text-xs font-bold opacity-80 drop-shadow-md" style={{ color: activeTheme.textColor }}>Para meditar en tu camino</p>
            </div>
          </div>

          <div className="grid gap-5">
            {dynamicInsights.slice(0, 4).map((insight, idx) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border transition-all group hover:shadow-xl w-full",
                  cardBaseClass
                )}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className={cn(
                    "p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 shadow-xl",
                    insight.type === 'promise' ? 'bg-amber-500 text-white' :
                      insight.type === 'fact' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                  )}>
                    {insight.type === 'promise' ? <Gift className="h-5 w-5 sm:h-6 sm:w-6" /> :
                      insight.type === 'fact' ? <Zap className="h-5 w-5 sm:h-6 sm:w-6" /> : <User className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase tracking-widest opacity-70" style={{ color: activeTheme.textColor }}>
                      {insight.type === 'promise' ? 'Promesa' : insight.type === 'fact' ? 'Dato' : 'Personaje'}
                    </span>
                    <h3 className="font-serif font-black leading-tight mt-1 text-lg" style={{ color: activeTheme.textColor }}>{insight.title}</h3>
                    <p className="leading-relaxed text-sm mt-3 font-medium" style={{ color: activeTheme.textColor }}>
                      {insight.content}
                    </p>
                    {insight.reference && (
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-white/5 rounded-full border border-white/5" style={{ color: activeTheme.textColor }}>
                          {insight.reference}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/5" style={{ color: activeTheme.textColor }}>
                            <Heart className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/5" style={{ color: activeTheme.textColor }}>
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="pb-8">
          <button
            onClick={onOpenStudyCenter}
            className="w-full group relative overflow-hidden rounded-[2.5rem] p-10 transition-all hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-rose-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-serif font-black text-white mb-2 leading-tight">
                  Explora las<br />Profundidades
                </h3>
                <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Centro de Estudio Avanzado</p>
              </div>
              <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md border border-white/30 group-hover:rotate-12 transition-transform">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
            </div>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
