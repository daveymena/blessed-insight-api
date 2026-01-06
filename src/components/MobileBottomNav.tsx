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
      "fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom lg:hidden transition-all duration-300",
      activeTheme?.type === 'scenic'
        ? (activeTheme.uiMode === 'dark' ? "bg-black/80 backdrop-blur-2xl border-white/10" : "bg-white/80 backdrop-blur-xl border-black/5")
        : "bg-card/95 backdrop-blur-xl border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
    )}>
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[48px]",
                isActive ? "text-primary" : "text-muted-foreground active:scale-95",
                item.isSpecial && (isActive ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-400/70")
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-105",
                item.isSpecial && !isActive && "animate-pulse"
              )} />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wide transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
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
