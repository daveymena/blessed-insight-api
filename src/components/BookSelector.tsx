import { useState, useMemo } from 'react';
import { Book, Search, ChevronDown, ChevronUp, Globe, ScrollText, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { bibleBooks, type BibleBook } from '@/lib/bibleApi';
import { motion, AnimatePresence } from 'framer-motion';

interface BookSelectorProps {
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter?: (chapter: number) => void;
  onClose?: () => void;
}

export function BookSelector({ selectedBook, onSelectBook, onSelectChapter, onClose }: BookSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook?.id || null);

  const filteredBooks = useMemo(() => {
    return bibleBooks.filter((book) => {
      return book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbrev.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const oldTestament = useMemo(() => filteredBooks.filter(b => b.testament === 'old'), [filteredBooks]);
  const newTestament = useMemo(() => filteredBooks.filter(b => b.testament === 'new'), [filteredBooks]);

  const renderBookList = (books: BibleBook[], title: string) => (
    <div className="space-y-1 mb-6">
      <div className="flex items-center justify-between px-4 py-2 mb-2 bg-secondary/20 rounded-lg">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{title}</span>
        <span className="text-[10px] font-bold text-primary/60">{books.length}</span>
      </div>

      {books.map((book) => {
        const isExpanded = expandedBook === book.id;

        return (
          <div key={book.id} className="group">
            <button
              onClick={() => setExpandedBook(isExpanded ? null : book.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left border border-transparent mb-1",
                isExpanded || selectedBook?.id === book.id
                  ? "bg-primary/5 text-primary border-primary/10"
                  : "hover:bg-secondary/40 text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase transition-transform group-hover:scale-110",
                  selectedBook?.id === book.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {book.abbrev.substring(0, 3)}
                </div>
                <span className={cn("text-sm font-semibold", selectedBook?.id === book.id && "font-bold")}>{book.name}</span>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 opacity-40" /> : <ChevronDown className="h-4 w-4 opacity-40" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-secondary/10 rounded-xl mb-2 px-2"
                >
                  <div className="grid grid-cols-5 gap-1.5 p-3">
                    {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chap) => (
                      <button
                        key={chap}
                        onClick={() => {
                          onSelectBook(book);
                          if (onSelectChapter) onSelectChapter(chap);
                          onClose?.();
                        }}
                        className="aspect-square flex items-center justify-center rounded-lg text-xs font-bold bg-background/50 hover:bg-primary hover:text-white transition-all border border-border/40"
                      >
                        {chap}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background/30 backdrop-blur-xl">
      <div className="p-4 space-y-4 shrink-0 border-b border-border/10 bg-background/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar libro..."
            className="pl-9 bg-background/50 border-none shadow-inner h-11 rounded-xl text-sm italic"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-12 custom-scrollbar">
        {oldTestament.length > 0 && renderBookList(oldTestament, "Antiguo Testamento")}
        {newTestament.length > 0 && renderBookList(newTestament, "Nuevo Testamento")}

        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Book className="h-12 w-12 mb-4 stroke-[1]" />
            <p className="font-medium text-sm">No se encontraron libros</p>
          </div>
        )}
      </div>
    </div>
  );
}

