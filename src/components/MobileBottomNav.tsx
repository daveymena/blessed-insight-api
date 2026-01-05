import { BookOpen, Search, Heart, Sparkles, GraduationCap, Sun, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const items = [
    { id: 'home', icon: Sun, label: 'Inicio', onClick: onHomeClick },
    { id: 'bible', icon: BookOpen, label: 'Biblia', onClick: onMenuClick },
    { id: 'chat', icon: MessageCircle, label: 'Chat', onClick: onChatClick || (() => { }) },
    { id: 'study', icon: GraduationCap, label: 'Planes', onClick: onStudyClick },
    { id: 'search', icon: Search, label: 'Buscar', onClick: onSearchClick },
    { id: 'biblo', icon: Sparkles, label: 'Biblo', onClick: onAIClick, isSpecial: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-area-bottom md:hidden border-t border-white/10 shadow-[0_-8px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-20 px-4">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 min-w-[64px]",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground",
                item.isSpecial && "text-purple-600 dark:text-purple-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn(
                "h-6 w-6 transition-transform duration-300",
                isActive && "scale-110",
                item.isSpecial && "animate-pulse"
              )} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70"
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

