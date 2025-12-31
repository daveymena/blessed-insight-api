import { BookOpen, Search, Heart, Sparkles, GraduationCap, Sun } from 'lucide-react';

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onMenuClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onAIClick: () => void;
  onStudyClick: () => void;
  activeTab: 'home' | 'bible' | 'plans' | 'search' | 'favorites';
}

export function MobileBottomNav({
  onHomeClick,
  onMenuClick,
  onSearchClick,
  onFavoritesClick,
  onAIClick,
  onStudyClick,
  activeTab,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Inicio */}
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all min-w-[60px] ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Sun className={`h-5 w-5 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Inicio</span>
        </button>

        {/* Biblia */}
        <button
          onClick={onMenuClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all min-w-[60px] ${activeTab === 'bible' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <BookOpen className={`h-5 w-5 ${activeTab === 'bible' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Biblia</span>
        </button>

        {/* Planes / Centro de Estudio */}
        <button
          onClick={onStudyClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all min-w-[60px] ${activeTab === 'plans' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <GraduationCap className={`h-5 w-5 ${activeTab === 'plans' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Planes</span>
        </button>

        {/* Buscar */}
        <button
          onClick={onSearchClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all min-w-[60px] ${activeTab === 'search' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Buscar</span>
        </button>

        {/* IA / Más */}
        <button
          onClick={onAIClick}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-muted-foreground transition-all min-w-[60px]"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">IA</span>
        </button>
      </div>
    </nav>
  );
}
