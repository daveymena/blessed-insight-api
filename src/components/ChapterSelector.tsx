import { cn } from '@/lib/utils';
import type { BibleBook } from '@/lib/bibleApi';
import { motion } from 'framer-motion';

interface ChapterSelectorProps {
  book: BibleBook | null;
  chapters: number[];
  selectedChapter: number;
  onSelectChapter: (chapter: number) => void;
}

export function ChapterSelector({
  book,
  chapters,
  selectedChapter,
  onSelectChapter,
}: ChapterSelectorProps) {
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 mb-4" />
        <p className="font-serif">Selecciona un libro para continuar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border/10 bg-secondary/5 flex items-center justify-center">
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Selecciona un Capítulo
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {chapters.map((chapter, index) => (
            <motion.button
              key={chapter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.3) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectChapter(chapter)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-2xl text-base font-bold transition-all duration-300 relative overflow-hidden',
                selectedChapter === chapter
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-card text-foreground hover:bg-secondary hover:shadow-md border border-border/50'
              )}
            >
              {selectedChapter === chapter && (
                <motion.div
                  layoutId="activeChapter"
                  className="absolute inset-0 bg-primary-foreground/10"
                />
              )}
              <span className="relative z-10">{chapter}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

