import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Clock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { bibleBooks, type BibleBook, searchVerses, type BibleVerse } from '@/lib/bibleApi';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: BibleBook, chapter?: number, verse?: number) => void;
}

export function SearchModal({ isOpen, onClose, onSelectBook }: SearchModalProps) {
  const [query, setQuery] = useState('');
  // const [searchType, setSearchType] = useState<'book' | 'text'>('book'); // Removed
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time search for text
  useEffect(() => {
    if (query.length >= 3) { // Simplified condition
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchVerses(query);
        setSearchResults(results?.verses || []);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [query]);

  const filteredBooks = query
    ? bibleBooks.filter(
      (book) =>
        book.name.toLowerCase().includes(query.toLowerCase()) ||
        book.abbrev.toLowerCase().includes(query.toLowerCase())
    )
    : bibleBooks;

  const handleBookSelect = (book: BibleBook) => {
    onSelectBook(book, 1);
    onClose();
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    const book = bibleBooks.find(b => b.id === verse.book_id);
    if (book) {
      onSelectBook(book, verse.chapter, verse.verse);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[85vh] max-h-[85vh] flex flex-col p-0 border-none glass overflow-hidden rounded-[2rem]">
        <div className="p-8 pb-4">
          <DialogTitle className="text-3xl font-serif font-bold flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            Buscador Bíblico
          </DialogTitle>

          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca versículos (ej: Amor, Fe)..."
              className="pl-12 h-14 text-lg bg-secondary/40 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
            )}
          </div>

        </div>

        <div className="flex-1 overflow-hidden px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="text-search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((verse, idx) => (
                      <motion.button
                        key={`${verse.book_id}-${verse.chapter}-${verse.verse}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleVerseSelect(verse)}
                        className="w-full p-5 rounded-[1.5rem] bg-card border border-border/30 hover:border-primary/50 hover:shadow-lg transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-bold text-primary">
                            {verse.book_name} {verse.chapter}:{verse.verse}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2 italic leading-relaxed">
                          "{verse.text}"
                        </p>
                      </motion.button>
                    ))
                  ) : query.length >= 3 && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                      <Search className="h-12 w-12 mb-4" />
                      <p className="font-serif text-xl">Sin resultados</p>
                      <p className="text-sm">Prueba con palabras más comunes</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                      <Clock className="h-12 w-12 mb-4" />
                      <p className="font-serif text-xl">Escribe para buscar</p>
                      <p className="text-sm">Busca mensajes, parábolas o palabras clave</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

