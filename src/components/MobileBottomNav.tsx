import { BookOpen, Search, Heart, Sparkles, GraduationCap } from 'lucide-react';

interface MobileBottomNavProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onAIClick: () => void;
  onStudyClick: () => void;
}

export function MobileBottomNav({
  onMenuClick,
  onSearchClick,
  onFavoritesClick,
  onAIClick,
  onStudyClick,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Libros */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors min-w-[60px]"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-[10px] text-muted-foreground">Libros</span>
        </button>

        {/* Buscar */}
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors min-w-[60px]"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Buscar</span>
        </button>

        {/* Centro de Estudio - Botón principal */}
        <button
          onClick={onStudyClick}
          className="flex flex-col items-center justify-center gap-1 p-3 -mt-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl active:scale-95 transition-all min-w-[64px]"
        >
          <GraduationCap className="h-6 w-6 text-white" />
        </button>

        {/* Favoritos */}
        <button
          onClick={onFavoritesClick}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors min-w-[60px]"
        >
          <Heart className="h-5 w-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Favoritos</span>
        </button>

        {/* IA */}
        <button
          onClick={onAIClick}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors min-w-[60px]"
        >
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="text-[10px] text-muted-foreground">IA</span>
        </button>
      </div>
    </nav>
  );
}
