// Home Screen estilo YouVersion
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Sparkles, ChevronRight, Calendar, Heart, 
  Search, GraduationCap, Flame, Play, Share2, Copy, Check,
  Sun, Moon, Clock, TrendingUp, BookMarked, Users
} from 'lucide-react';
import { getVerseOfTheDay, getActivePlan, getPlanById, getReadingStats, READING_PLANS } from '@/lib/studyService';

interface HomeScreenProps {
  onStartReading: () => void;
  onOpenSearch: () => void;
  onOpenStudyCenter: () => void;
  onOpenFavorites: () => void;
}

export function HomeScreen({ onStartReading, onOpenSearch, onOpenStudyCenter, onOpenFavorites }: HomeScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [greeting, setGreeting] = useState('');
  const verseOfDay = getVerseOfTheDay();
  const activePlan = getActivePlan();
  const planData = activePlan ? getPlanById(activePlan.planId) : null;
  const stats = getReadingStats();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Determinar saludo según hora
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
    
    return () => clearTimeout(timer);
  }, []);

  const handleCopyVerse = () => {
    const text = `"${verseOfDay.text}" - ${getBookNameSpanish(verseOfDay.book)} ${verseOfDay.chapter}:${verseOfDay.verse}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareVerse = async () => {
    const text = `"${verseOfDay.text}" - ${getBookNameSpanish(verseOfDay.book)} ${verseOfDay.chapter}:${verseOfDay.verse}`;
    if (navigator.share) {
      await navigator.share({ title: 'Versículo del día', text });
    } else {
      handleCopyVerse();
    }
  };

  const getBookNameSpanish = (bookId: string): string => {
    const bookNames: Record<string, string> = {
      'genesis': 'Génesis', 'exodus': 'Éxodo', 'psalms': 'Salmos', 'proverbs': 'Proverbios',
      'isaiah': 'Isaías', 'jeremiah': 'Jeremías', 'matthew': 'Mateo', 'john': 'Juan',
      'romans': 'Romanos', 'philippians': 'Filipenses', 'hebrews': 'Hebreos',
      '1corinthians': '1 Corintios', '2timothy': '2 Timoteo', '1peter': '1 Pedro',
      'joshua': 'Josué', 'galatians': 'Gálatas', 'ephesians': 'Efesios', 'revelation': 'Apocalipsis',
      '1john': '1 Juan', 'james': 'Santiago'
    };
    return bookNames[bookId.toLowerCase()] || bookId;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      {/* Header con gradiente */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative px-4 pt-12 pb-8">
          {/* Saludo */}
          <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-1">
              {new Date().getHours() < 18 ? <Sun className="h-5 w-5 text-yellow-300" /> : <Moon className="h-5 w-5 text-yellow-200" />}
              <span className="text-white/80 text-sm">{greeting}</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Blessed Insight</h1>
            <p className="text-white/70 text-sm">Tu compañero de estudio bíblico</p>
          </div>

          {/* Stats rápidos */}
          {stats.streak > 0 && (
            <div className={`mt-4 flex gap-4 transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Flame className="h-4 w-4 text-orange-300" />
                <span className="text-sm font-medium">{stats.streak} días</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <BookOpen className="h-4 w-4 text-blue-200" />
                <span className="text-sm font-medium">{stats.totalChapters} capítulos</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 -mt-4 pb-8 space-y-6">
        {/* Versículo del día */}
        <Card className={`overflow-hidden shadow-lg transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-1">
            <div className="flex items-center gap-2 px-3 py-1">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Versículo del Día</span>
            </div>
          </div>
          <CardContent className="p-5">
            <blockquote className="text-lg leading-relaxed mb-3 font-serif italic text-foreground/90">
              "{verseOfDay.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">
              — {getBookNameSpanish(verseOfDay.book)} {verseOfDay.chapter}:{verseOfDay.verse}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleCopyVerse} className="flex-1">
                {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareVerse} className="flex-1">
                <Share2 className="h-4 w-4 mr-1" />
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón principal de lectura */}
        <Button 
          onClick={onStartReading}
          className={`w-full h-16 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <BookOpen className="h-6 w-6 mr-3" />
          Leer la Biblia
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>

        {/* Plan activo */}
        {activePlan && planData && (
          <Card className={`border-2 border-primary/30 transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    Plan Activo
                  </Badge>
                  <h3 className="font-semibold">{planData.name}</h3>
                  <p className="text-sm text-muted-foreground">Día {activePlan.currentDay} de {planData.readings.length}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{Math.round((activePlan.completedDays.length / planData.readings.length) * 100)}%</span>
                </div>
              </div>
              <Progress value={(activePlan.completedDays.length / planData.readings.length) * 100} className="h-2 mb-3" />
              <Button variant="outline" size="sm" onClick={onOpenStudyCenter} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Continuar Lectura
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Accesos rápidos */}
        <div className={`grid grid-cols-2 gap-3 transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenSearch}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium text-sm">Buscar</span>
              <span className="text-xs text-muted-foreground">Versículos y temas</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenStudyCenter}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-medium text-sm">Estudiar</span>
              <span className="text-xs text-muted-foreground">Centro de estudio</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenFavorites}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-rose-600" />
              </div>
              <span className="font-medium text-sm">Favoritos</span>
              <span className="text-xs text-muted-foreground">Versículos guardados</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenStudyCenter}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="font-medium text-sm">Planes</span>
              <span className="text-xs text-muted-foreground">Lectura guiada</span>
            </CardContent>
          </Card>
        </div>

        {/* Planes sugeridos */}
        {!activePlan && (
          <div className={`transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Planes Populares
              </h2>
              <Button variant="ghost" size="sm" onClick={onOpenStudyCenter}>
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {READING_PLANS.slice(0, 3).map(plan => (
                <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenStudyCenter}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <BookMarked className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.duration}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Comunidad / Tip */}
        <Card className={`bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Tip del día</p>
              <p className="text-xs text-muted-foreground">Usa el asistente de IA para profundizar en cualquier pasaje bíblico</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}