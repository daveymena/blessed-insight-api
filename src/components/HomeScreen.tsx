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

interface HomeScreenProps {
  onStartReading: () => void;
  onOpenSearch: () => void;
  onOpenStudyCenter: () => void;
  onOpenFavorites: () => void;
  onOpenAI: () => void;
  onOpenPlans: () => void;
  onOpenTheme: () => void;
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

  return (
    <div className="flex-1 bg-background overflow-y-auto scroll-smooth pb-24">
      {/* Hero Section con imagen real */}
      <div className="relative h-[420px] md:h-[480px] overflow-hidden">
        <img 
          src={heroSunrise} 
          alt="Amanecer sobre Jerusalén" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
        
        {/* Header flotante */}
        <header className="absolute top-0 left-0 right-0 z-30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 dark:bg-black/80 backdrop-blur-xl p-2.5 rounded-2xl shadow-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white drop-shadow-lg">Blessed Insight</h1>
              <p className="text-[11px] text-white/80 font-medium">Biblia de Estudio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="bg-white/20 backdrop-blur-xl rounded-full p-2">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
            <button 
              onClick={onOpenSearch}
              className="bg-white/95 dark:bg-black/80 backdrop-blur-xl h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </header>

        {/* Contenido del Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/80 text-sm font-medium mb-1">{greeting}</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 drop-shadow-lg">
              Tu espacio de<br />encuentro espiritual
            </h2>
            <Button
              onClick={onStartReading}
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90 rounded-2xl h-14 px-8 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Comenzar a Leer
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="px-5 py-6 space-y-8 max-w-2xl mx-auto -mt-6 relative z-10">
        
        {/* Grid de Acciones Principales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Card IA Biblo */}
          <button
            onClick={onOpenAI}
            className="group relative overflow-hidden bg-card rounded-3xl border border-border p-5 text-left transition-all duration-300 hover:shadow-xl hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-serif font-bold text-foreground mb-1">Biblo IA</h3>
              <p className="text-xs text-muted-foreground">Tu asistente bíblico inteligente</p>
            </div>
          </button>

          {/* Card Centro de Estudio */}
          <button
            onClick={onOpenStudyCenter}
            className="group relative overflow-hidden bg-card rounded-3xl border border-border p-5 text-left transition-all duration-300 hover:shadow-xl hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-serif font-bold text-foreground mb-1">Estudio</h3>
              <p className="text-xs text-muted-foreground">Planes y herramientas</p>
            </div>
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { icon: Heart, label: 'Favoritos', onClick: onOpenFavorites, color: 'text-rose-500' },
            { icon: Bookmark, label: 'Planes', onClick: onOpenPlans, color: 'text-emerald-500' },
            { icon: Search, label: 'Buscar', onClick: onOpenSearch, color: 'text-blue-500' },
            { icon: Sun, label: 'Tema', onClick: onOpenTheme, color: 'text-amber-500' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-2xl border border-border hover:bg-accent hover:border-primary/20 transition-all active:scale-95"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Banner de Instalación */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleInstallClick}
              className="w-full group relative overflow-hidden rounded-2xl transition-all hover:shadow-xl active:scale-[0.99]"
            >
              <img src={spiritDove} alt="Instalar App" className="w-full h-32 object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent rounded-2xl" />
              <div className="absolute inset-0 p-5 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-white font-serif font-bold text-lg">Instalar Aplicación</h3>
                  <p className="text-white/70 text-xs">Acceso rápido desde tu dispositivo</p>
                </div>
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl border border-white/30">
                  <Download className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Versículo del Día */}
        {currentVerse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-3xl border-0 overflow-hidden shadow-xl group">
              <div className="relative">
                <img src={bibleStudy} alt="Biblia abierta" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30" />
                <Badge className="absolute top-4 left-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium">
                  <Sun className="h-3.5 w-3.5 mr-1.5" />
                  Versículo del Día
                </Badge>
              </div>
              <CardContent className="bg-slate-900 p-6 relative">
                <blockquote className="text-xl font-serif italic leading-relaxed text-white/95 mb-4">
                  "{currentVerse.text}"
                </blockquote>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-white/90">
                    {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                  </p>
                  <Button size="icon" variant="ghost" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sección Reflexiones */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">Para Tu Reflexión</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Inspiración diaria para tu camino</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {dynamicInsights.length} reflexiones
            </Badge>
          </div>

          <div className="grid gap-4">
            {dynamicInsights.slice(0, 4).map((insight, idx) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    insight.type === 'promise' 
                      ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400' 
                      : insight.type === 'fact' 
                        ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {insight.type === 'promise' ? <Gift className="h-5 w-5" /> :
                      insight.type === 'fact' ? <Zap className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {insight.type === 'promise' ? 'Promesa Bíblica' : insight.type === 'fact' ? 'Dato Curioso' : 'Personaje'}
                    </span>
                    <h3 className="font-serif font-bold text-foreground leading-snug mt-0.5 text-[15px]">{insight.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                  {insight.content}
                </p>
                {insight.reference && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs font-medium px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground">
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
          </div>
        </section>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pb-8"
        >
          <button
            onClick={onOpenStudyCenter}
            className="w-full group relative overflow-hidden rounded-3xl transition-all hover:shadow-2xl active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 p-8 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-serif font-bold text-primary-foreground mb-2">
                  Profundiza en la Palabra
                </h3>
                <p className="text-primary-foreground/70 text-sm max-w-[250px]">
                  Herramientas avanzadas de estudio bíblico a tu alcance
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform">
                <ArrowRight className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
