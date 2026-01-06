import { useState, useMemo } from 'react';
import { Book, Search, ChevronDown, ChevronUp, Globe, ScrollText, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { bibleBooks, type BibleBook } from '@/lib/bibleApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeSettings } from '@/hooks/useThemeSettings';

interface BookSelectorProps {
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter?: (chapter: number) => void;
  onClose?: () => void;
}

export function BookSelector({ selectedBook, onSelectBook, onSelectChapter, onClose }: BookSelectorProps) {
  const { activeTheme } = useThemeSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook?.id || null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Pentateuco": true,
    "Evangelios": true
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const filteredBooks = useMemo(() => {
    return bibleBooks.filter((book) => {
      return book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbrev.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const oldTestament = useMemo(() => filteredBooks.filter(b => b.testament === 'old'), [filteredBooks]);
  const newTestament = useMemo(() => filteredBooks.filter(b => b.testament === 'new'), [filteredBooks]);

  const renderBookList = (books: BibleBook[], title: string) => {
    // Agrupar libros por su campo 'group'
    const groupedBooks = books.reduce((acc, book) => {
      if (!acc[book.group]) acc[book.group] = [];
      acc[book.group].push(book);
      return acc;
    }, {} as Record<string, BibleBook[]>);

    return (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between px-4 py-2 mb-2 bg-primary/10 rounded-lg border border-primary/5">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{title}</span>
          <span className="text-xs font-bold text-primary/60">{books.length}</span>
        </div>

        {Object.entries(groupedBooks).map(([groupName, groupBooks]) => {
          const isGroupExpanded = expandedGroups[groupName] || !!searchQuery;

          return (
            <div key={groupName} className="space-y-1 mb-2 border-b border-border/5 pb-2">
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-secondary/20 rounded-lg transition-colors group/groupheader"
              >
                <h4 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest flex items-center gap-2">
                  <span className={cn(
                    "w-1.5 h-4 bg-primary/40 rounded-full transition-transform",
                    isGroupExpanded ? "scale-y-100" : "scale-y-50 opacity-50"
                  )} />
                  {groupName}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground/40">{groupBooks.length} libros</span>
                  {isGroupExpanded ?
                    <ChevronUp className="h-3 w-3 text-muted-foreground/40" /> :
                    <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
                  }
                </div>
              </button>

              <AnimatePresence>
                {isGroupExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-1 pt-1"
                  >
                    {groupBooks.map((book) => {
                      const isBookExpanded = expandedBook === book.id;

                      return (
                        <div key={book.id} className="group px-1">
                          <button
                            onClick={() => setExpandedBook(isBookExpanded ? null : book.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left border border-transparent mb-1",
                              isBookExpanded || selectedBook?.id === book.id
                                ? "bg-primary/5 text-primary border-primary/10 shadow-sm"
                                : "hover:bg-secondary/40 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase transition-transform group-hover:scale-110 shadow-sm",
                                selectedBook?.id === book.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                              )}>
                                {book.abbrev.substring(0, 3)}
                              </div>
                              <span className={cn("text-sm font-semibold", selectedBook?.id === book.id && "font-bold")}>{book.name}</span>
                            </div>
                            {isBookExpanded ? <ChevronUp className="h-4 w-4 opacity-40" /> : <ChevronDown className="h-4 w-4 opacity-40" />}
                          </button>

                          <AnimatePresence>
                            {isBookExpanded && (
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
                                      className="aspect-square flex items-center justify-center rounded-lg text-xs font-bold bg-background/50 hover:bg-primary hover:text-white transition-all border border-border/40 shadow-sm"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full transition-colors duration-500", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-background/30 backdrop-blur-xl')}>
      <div className={cn("p-4 space-y-4 shrink-0 border-b border-border/10", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-background/50')}>
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
        {!searchQuery ? (
          <>
            {oldTestament.length > 0 && renderBookList(oldTestament, "Antiguo Testamento")}
            {newTestament.length > 0 && renderBookList(newTestament, "Nuevo Testamento")}
          </>
        ) : (
          renderBookList(filteredBooks, "Resultados de búsqueda")
        )}

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

