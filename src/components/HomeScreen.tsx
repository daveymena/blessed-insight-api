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
    <div className="flex-1 overflow-y-auto scroll-smooth pb-20 custom-scrollbar">
      {/* Hero Section - más compacto en móvil */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[480px] overflow-hidden">
        <img
          src={heroSunrise}
          alt="Amanecer sobre Jerusalén"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* Header flotante - más compacto */}
        <header className="absolute top-0 left-0 right-0 z-30 px-4 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/15 backdrop-blur-xl p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-serif font-black text-white drop-shadow-xl tracking-tight italic">Blessed Insight</h1>
              <p className="text-[9px] sm:text-xs text-white/70 font-bold uppercase tracking-widest">Estudio Profundo</p>
            </div>
          </div>
          {isGenerating && (
            <div className="bg-white/20 backdrop-blur-xl rounded-full p-2">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          )}
        </header>

        {/* Contenido del Hero - ajustado para móvil */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 pb-10 sm:pb-14 bg-gradient-to-t from-black/80 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/80 text-[9px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 sm:mb-2">{greeting}</p>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-serif font-black text-white mb-3 sm:mb-6 drop-shadow-2xl leading-[1.15]">
              Tu espacio de<br />encuentro espiritual
            </h2>
            <Button
              onClick={onStartReading}
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl h-11 sm:h-14 px-5 sm:px-8 text-[11px] sm:text-sm font-black uppercase tracking-wider shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Comenzar
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal - mejor espaciado móvil */}
      <div className={cn(
        "px-3 sm:px-5 lg:px-12 py-5 sm:py-8 space-y-5 sm:space-y-8 max-w-2xl lg:max-w-6xl mx-auto -mt-8 sm:-mt-10 relative z-10 w-full overflow-x-hidden",
        hasScenicBackground && (isDarkMode ? "bg-gradient-to-b from-black/30 to-black/70 rounded-t-[2rem] sm:rounded-t-[3rem] backdrop-blur-sm" : "bg-gradient-to-b from-white/20 to-white/50 rounded-t-[2rem] sm:rounded-t-[3rem] backdrop-blur-sm")
      )}>

        {/* Grid de Acciones Principales - más compacto en móvil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-10"
        >
          {/* Card IA Biblo */}
          <button
            onClick={onOpenAI}
            className={cn(
              "group relative overflow-hidden rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] p-3 sm:p-5 lg:p-12 text-left transition-all duration-500 hover:shadow-2xl active:scale-[0.97]",
              cardBaseClass
            )}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} className="sm:w-[100px] sm:h-[100px] lg:w-48 lg:h-48" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-24 lg:h-24 bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-2 sm:mb-4 lg:mb-8 shadow-lg group-hover:rotate-6 transition-transform">
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 lg:h-12 lg:w-12" />
              </div>
              <h3 className="text-base sm:text-xl lg:text-4xl font-serif font-black mb-0.5 lg:mb-2" style={{ color: textColor, textShadow }}>Biblo IA</h3>
              <p className="text-[9px] sm:text-xs lg:text-lg font-semibold opacity-80" style={{ color: textColor, textShadow }}>Asistente Inteligente</p>
            </div>
          </button>

          {/* Card Centro de Estudio */}
          <button
            onClick={onOpenStudyCenter}
            className={cn(
              "group relative overflow-hidden rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] p-3 sm:p-5 lg:p-12 text-left transition-all duration-500 hover:shadow-2xl active:scale-[0.97]",
              cardBaseClass
            )}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap size={80} className="sm:w-[100px] sm:h-[100px] lg:w-48 lg:h-48" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-2 sm:mb-4 lg:mb-8 shadow-lg group-hover:-rotate-6 transition-transform">
                <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 lg:h-12 lg:w-12" />
              </div>
              <h3 className="text-base sm:text-xl lg:text-4xl font-serif font-black mb-0.5 lg:mb-2" style={{ color: textColor, textShadow }}>Estudio</h3>
              <p className="text-[9px] sm:text-xs lg:text-lg font-semibold opacity-80" style={{ color: textColor, textShadow }}>Cursos y Planes</p>
            </div>
          </button>
        </motion.div>

        {/* Quick Actions - horizontal en móvil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex sm:grid sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-8 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible"
        >
          {[
            { icon: Heart, label: 'Favoritos', onClick: onOpenFavorites, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Bookmark, label: 'Planes', onClick: onOpenPlans, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Sun, label: 'Tema', onClick: onOpenTheme, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={cn(
                "flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 lg:p-8 rounded-xl sm:rounded-[2rem] border transition-all active:scale-95 group min-w-[80px] sm:min-w-0 shrink-0",
                cardBaseClass,
                "hover:border-primary/40"
              )}
            >
              <div className={cn("p-2 sm:p-3 lg:p-5 rounded-lg sm:rounded-2xl transition-transform group-hover:scale-110 shadow-inner", action.bg)}>
                <action.icon className={cn("h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8", action.color)} />
              </div>
              <span className="text-[8px] sm:text-[10px] lg:text-sm font-bold uppercase tracking-wider opacity-80" style={{ color: activeTheme.textColor }}>{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Versículo del Día - más compacto en móvil */}
        {currentVerse && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={cn("rounded-2xl sm:rounded-[2.5rem] border-0 overflow-hidden shadow-xl group", cardBaseClass, "bg-transparent")}>
              <div className="relative">
                <img src={bibleStudy} alt="Biblia abierta" className="w-full h-40 sm:h-56 lg:h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                <Badge className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/15 text-white border-white/20 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-amber-400" />
                  Maná del Día
                </Badge>
              </div>
              <CardContent className={cn(
                "p-4 sm:p-6 lg:p-12 relative",
                hasScenicBackground
                  ? (isDarkMode ? "bg-black/70 backdrop-blur-2xl" : "bg-white/85 backdrop-blur-2xl")
                  : "bg-card text-card-foreground"
              )}>
                <blockquote className="text-base sm:text-xl lg:text-3xl font-serif italic leading-relaxed mb-4 sm:mb-8" style={{ color: activeTheme.textColor }}>
                  "{currentVerse.text}"
                </blockquote>
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-black/10">
                  <p className="text-xs sm:text-sm lg:text-lg font-bold uppercase tracking-wider opacity-80" style={{ color: activeTheme.textColor }}>
                    {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                  </p>
                  <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10">
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: activeTheme.textColor }} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sección Reflexiones - más compacta */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-serif font-black tracking-tight" style={{ color: activeTheme.textColor }}>Inspiración</h2>
              <p className="text-[10px] sm:text-xs font-medium opacity-70" style={{ color: activeTheme.textColor }}>Para meditar en tu camino</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
            {dynamicInsights.slice(0, 4).map((insight, idx) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "rounded-xl sm:rounded-2xl p-3 sm:p-5 border transition-all group hover:shadow-lg w-full",
                  cardBaseClass
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={cn(
                    "p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 shadow-md",
                    insight.type === 'promise' ? 'bg-amber-500 text-white' :
                      insight.type === 'fact' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                  )}>
                    {insight.type === 'promise' ? <Gift className="h-4 w-4 sm:h-5 sm:w-5" /> :
                      insight.type === 'fact' ? <Zap className="h-4 w-4 sm:h-5 sm:w-5" /> : <User className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: activeTheme.textColor }}>
                      {insight.type === 'promise' ? 'Promesa' : insight.type === 'fact' ? 'Dato' : 'Personaje'}
                    </span>
                    <h3 className="font-serif font-bold leading-tight mt-0.5 text-sm sm:text-base" style={{ color: activeTheme.textColor }}>{insight.title}</h3>
                    <p className="leading-relaxed text-xs sm:text-sm mt-2 opacity-80 line-clamp-3" style={{ color: activeTheme.textColor }}>
                      {insight.content}
                    </p>
                    {insight.reference && (
                      <span className="inline-block mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider py-1 px-2 bg-white/5 rounded-md border border-white/5" style={{ color: activeTheme.textColor }}>
                        {insight.reference}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CTA Final - más compacto */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="pb-4 sm:pb-8">
          <button
            onClick={onOpenStudyCenter}
            className="w-full group relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 transition-all hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-rose-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-xl sm:text-3xl font-serif font-black text-white mb-1 sm:mb-2 leading-tight">
                  Explora las Profundidades
                </h3>
                <p className="text-white/70 text-[10px] sm:text-sm font-medium uppercase tracking-wider">Centro de Estudio</p>
              </div>
              <div className="bg-white/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/30 group-hover:rotate-12 transition-transform shrink-0">
                <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
