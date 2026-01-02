import { useState, useMemo } from 'react';
import { Book, Search, ChevronRight, Globe, ScrollText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { bibleBooks, type BibleBook } from '@/lib/bibleApi';
import { motion, AnimatePresence } from 'framer-motion';

interface BookSelectorProps {
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  onClose?: () => void;
}

export function BookSelector({ selectedBook, onSelectBook, onClose }: BookSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');

  const filteredBooks = useMemo(() => {
    return bibleBooks.filter((book) => {
      const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbrev.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || book.testament === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {/* Search bar simplified */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar Libro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm rounded-xl"
          />
        </div>

        {/* Minimal Tab Switcher */}
        <div className="flex p-1 bg-secondary/40 rounded-xl">
          {(['all', 'old', 'new'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300",
                activeTab === tab
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {tab === 'all' ? 'Todos' : tab === 'old' ? 'AT' : 'NT'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book, index) => (
              <motion.button
                key={book.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: index * 0.005 }}
                onClick={() => {
                  onSelectBook(book);
                  onClose?.();
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all duration-200 text-left border border-transparent",
                  selectedBook?.id === book.id
                    ? "bg-primary/10 text-primary font-bold border-primary/20"
                    : "hover:bg-secondary/50 text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                   {/* Minimal book abbreviation circle */}
                   <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase",
                     selectedBook?.id === book.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                   )}>
                     {book.abbrev.substring(0, 3)}
                   </div>
                   <span className="text-base font-medium">{book.name}</span>
                </div>
                
                {selectedBook?.id === book.id && (
                  <motion.div layoutId="check" className="text-primary">
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <p className="font-medium text-sm">No se encontraron libros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

