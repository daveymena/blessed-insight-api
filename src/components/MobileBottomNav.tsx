import { BookOpen, Search, Heart, Sparkles, GraduationCap, Sun, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useThemeSettings } from '@/hooks/useThemeSettings';

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onMenuClick: () => void;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onAIClick: () => void;
  onStudyClick: () => void;
  onChatClick?: () => void; // Nuevo
  activeTab: 'home' | 'bible' | 'study' | 'biblo' | 'chat' | 'search' | 'favorites';
}

export function MobileBottomNav({
  onHomeClick,
  onMenuClick,
  onSearchClick,
  onFavoritesClick,
  onAIClick,
  onStudyClick,
  onChatClick,
  activeTab,
}: MobileBottomNavProps) {
  const { activeTheme } = useThemeSettings();
  const items = [
    { id: 'home', icon: Sun, label: 'Inicio', onClick: onHomeClick },
    { id: 'bible', icon: BookOpen, label: 'Biblia', onClick: onMenuClick },
    { id: 'chat', icon: MessageCircle, label: 'Chat', onClick: onChatClick || (() => { }) },
    { id: 'study', icon: GraduationCap, label: 'Planes', onClick: onStudyClick },
    { id: 'search', icon: Search, label: 'Buscar', onClick: onSearchClick },
    { id: 'biblo', icon: Sparkles, label: 'Biblo', onClick: onAIClick, isSpecial: true },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t border-border safe-area-bottom lg:hidden shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-all duration-300",
      activeTheme?.type === 'scenic'
        ? (activeTheme.uiMode === 'dark' ? "bg-black/60 backdrop-blur-2xl border-white/10" : "bg-white/70 backdrop-blur-xl")
        : "bg-card"
    )}>
      <div className="flex items-center justify-around h-16 sm:h-20 px-1 sm:px-4">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 p-1 rounded-xl transition-all duration-300 min-w-[50px] sm:min-w-[60px]",
                isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground",
                item.isSpecial && (isActive ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-400/70 dark:text-indigo-500/70")
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300",
                isActive && "scale-110",
                item.isSpecial && "animate-pulse"
              )} />
              <span className={cn(
                "text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-all duration-300 text-center",
                isActive ? "opacity-100" : "opacity-50"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
