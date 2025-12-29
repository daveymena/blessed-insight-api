import { BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BibleHeaderProps {
  onMenuClick: () => void;
}

export function BibleHeader({ onMenuClick }: BibleHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">
                Blessed Insight
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Lectura Bíblica en Español
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            RV 1909
          </span>
        </div>
      </div>
    </header>
  );
}
