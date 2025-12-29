import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BibleBook } from '@/lib/bibleApi';

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
      <div className="p-4 text-center text-muted-foreground">
        Selecciona un libro primero
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-serif font-semibold text-foreground">{book.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {book.chapters} capítulo{book.chapters > 1 ? 's' : ''}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 grid grid-cols-5 gap-2">
          {chapters.map((chapter) => (
            <button
              key={chapter}
              onClick={() => onSelectChapter(chapter)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
                selectedChapter === chapter
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-secondary/60 text-foreground hover:bg-secondary hover:scale-102'
              )}
            >
              {chapter}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
