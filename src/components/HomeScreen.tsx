import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Sparkles, GraduationCap,
  Heart, Share2, Sun,
  Loader2, Gift, Zap, User,
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

import heroSunrise from '@/assets/hero-sunrise.jpg';
import bibleStudy from '@/assets/bible-study.jpg';
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
}: HomeScreenProps) {
  const [greeting, setGreeting] = useState('');
  const [currentVerse, setCurrentVerse] = useState<any>(null);
  const [dynamicInsights, setDynamicInsights] = useState<DailyInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { activeTheme, hasScenicBackground } = useThemeSettings();

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
    setDynamicInsights([...cachedInsights].sort(() => Math.random() - 0.5));

    const checkAndGenerate = async () => {
      const currentInsights = getStoredInsights();
      const currentVerses = getStoredVerses();
      if (currentInsights.length < 15 || currentVerses.length < 5) {
        setIsGenerating(true);
        try {
          if (currentInsights.length < 15) await generateDynamicInsight();
          if (currentVerses.length < 5) await generateDynamicVerse();
          setDynamicInsights([...getStoredInsights()].sort(() => Math.random() - 0.5));
          if (currentVerses.length < 5) setCurrentVerse(getStoredVerses()[0]);
        } catch (e) { }
        setIsGenerating(false);
      }
    };
    checkAndGenerate();
  }, []);

  const isDarkMode = activeTheme?.uiMode === 'dark';
  const isScenic = activeTheme?.type === 'scenic';
  const textColor = isScenic ? '#FFFFFF' : activeTheme?.textColor || '#1a1a1a';
  const textShadow = isScenic ? '0 2px 8px rgba(0,0,0,0.7)' : 'none';
  
  const cardClass = hasScenicBackground
    ? isDarkMode
      ? "bg-black/40 backdrop-blur-xl border-white/10"
      : "bg-white/60 backdrop-blur-xl border-white/30"
    : "bg-card border-border";

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[320px] max-h-[420px] overflow-hidden">
        <img
          src={heroSunrise}
          alt="Amanecer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

        {/* Logo */}
        <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white">Blessed Insight</h1>
              <p className="text-[10px] text-white/70 uppercase tracking-widest">Estudio Bíblico</p>
            </div>
          </div>
          {isGenerating && (
            <Loader2 className="h-5 w-5 text-white/70 animate-spin" />
          )}
        </header>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2">{greeting}</p>
            <h2 className="text-3xl font-serif font-bold text-white mb-5 leading-tight">
              Tu espacio de<br />encuentro espiritual
            </h2>
            <Button
              onClick={onStartReading}
              className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-8 font-semibold shadow-xl"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Comenzar a Leer
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "px-4 py-6 space-y-6 -mt-6 relative z-10",
        hasScenicBackground && "bg-gradient-to-b from-transparent to-black/20 rounded-t-3xl"
      )}>
        
        {/* Main Actions - 2 Cards grandes */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onOpenAI}
            className={cn(
              "relative overflow-hidden rounded-3xl p-5 text-left border transition-all active:scale-[0.98]",
              cardClass
            )}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-serif font-bold mb-1" style={{ color: textColor, textShadow }}>
              Biblo IA
            </h3>
            <p className="text-xs opacity-70" style={{ color: textColor, textShadow }}>
              Asistente Inteligente
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onOpenStudyCenter}
            className={cn(
              "relative overflow-hidden rounded-3xl p-5 text-left border transition-all active:scale-[0.98]",
              cardClass
            )}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-serif font-bold mb-1" style={{ color: textColor, textShadow }}>
              Estudio
            </h3>
            <p className="text-xs opacity-70" style={{ color: textColor, textShadow }}>
              Cursos y Planes
            </p>
          </motion.button>
        </div>

        {/* Quick Actions - Horizontal scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        >
          {[
            { icon: Heart, label: 'Favoritos', onClick: onOpenFavorites, gradient: 'from-rose-500 to-pink-600' },
            { icon: Bookmark, label: 'Planes', onClick: onOpenPlans, gradient: 'from-emerald-500 to-teal-600' },
            { icon: Sun, label: 'Tema', onClick: onOpenTheme, gradient: 'from-amber-500 to-yellow-600' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all active:scale-95",
                cardClass
              )}
            >
              <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white", action.gradient)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium" style={{ color: textColor }}>{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Verse of the Day */}
        {currentVerse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className={cn("rounded-3xl overflow-hidden border-0 shadow-xl", cardClass)}>
              <div className="relative h-36">
                <img src={bibleStudy} alt="Biblia" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-white/20 text-white border-0 backdrop-blur-md">
                  <Sun className="h-3 w-3 mr-1.5 text-amber-400" />
                  Versículo del Día
                </Badge>
              </div>
              <CardContent className="p-5">
                <blockquote className="text-lg font-serif italic leading-relaxed mb-4" style={{ color: textColor }}>
                  "{currentVerse.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold opacity-70" style={{ color: textColor }}>
                    {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                  </p>
                  <Button size="icon" variant="ghost" className="rounded-full h-9 w-9">
                    <Share2 className="h-4 w-4" style={{ color: textColor }} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Inspiration Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold px-1" style={{ color: textColor, textShadow }}>
            Inspiración Diaria
          </h2>

          <div className="space-y-3">
            {dynamicInsights.slice(0, 3).map((insight, idx) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn("rounded-2xl p-4 border", cardClass)}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl shrink-0 text-white",
                    insight.type === 'promise' ? 'bg-amber-500' :
                    insight.type === 'fact' ? 'bg-emerald-500' : 'bg-blue-500'
                  )}>
                    {insight.type === 'promise' ? <Gift className="h-5 w-5" /> :
                     insight.type === 'fact' ? <Zap className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5" style={{ color: textColor }}>
                      {insight.type === 'promise' ? 'Promesa' : insight.type === 'fact' ? 'Dato' : 'Personaje'}
                    </p>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: textColor }}>{insight.title}</h3>
                    <p className="text-xs opacity-80 line-clamp-2" style={{ color: textColor }}>
                      {insight.content}
                    </p>
                    {insight.reference && (
                      <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-md bg-black/5 dark:bg-white/5" style={{ color: textColor }}>
                        {insight.reference}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          onClick={onOpenStudyCenter}
          className="w-full relative overflow-hidden rounded-3xl p-6 text-left active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-white mb-1">
                Explora más
              </h3>
              <p className="text-white/70 text-sm">Centro de Estudio</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.button>

      </div>
    </div>
  );
}
