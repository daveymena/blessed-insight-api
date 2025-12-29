import { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { bibleBooks, type BibleBook } from '@/lib/bibleApi';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: BibleBook, chapter?: number) => void;
}

export function SearchModal({ isOpen, onClose, onSelectBook }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('book');

  const filteredBooks = query
    ? bibleBooks.filter(
        (book) =>
          book.name.toLowerCase().includes(query.toLowerCase()) ||
          book.id.toLowerCase().includes(query.toLowerCase())
      )
    : bibleBooks;

  const handleBookSelect = (book: BibleBook) => {
    onSelectBook(book, 1);
    onClose();
  };

  const popularReferences = [
    { ref: 'Juan 3:16', book: 'john', chapter: 3 },
    { ref: 'Salmos 23', book: 'psalms', chapter: 23 },
    { ref: 'Génesis 1', book: 'genesis', chapter: 1 },
    { ref: 'Romanos 8', book: 'romans', chapter: 8 },
    { ref: 'Filipenses 4', book: 'philippians', chapter: 4 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Buscar en la Biblia
          </DialogTitle>
        </DialogHeader>

        <Tabs value={searchType} onValueChange={setSearchType} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="book">Por Libro</TabsTrigger>
            <TabsTrigger value="quick">Acceso Rápido</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="flex-1 flex flex-col min-h-0 mt-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar libro..."
              className="mb-4"
            />

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-4">
                {filteredBooks.map((book) => (
                  <Button
                    key={book.id}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-start"
                    onClick={() => handleBookSelect(book)}
                  >
                    <span className="font-medium">{book.name}</span>
                    <span className="text-xs text-muted-foreground">{book.chapters} capítulos</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="quick" className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Referencias populares:</p>
              <div className="flex flex-wrap gap-2">
                {popularReferences.map((item, i) => (
                  <Button
                    key={i}
                    variant="secondary"
                    onClick={() => {
                      const book = bibleBooks.find((b) => b.id === item.book);
                      if (book) {
                        onSelectBook(book, item.chapter);
                        onClose();
                      }
                    }}
                  >
                    {item.ref}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Antiguo Testamento:</p>
              <div className="flex flex-wrap gap-2">
                {bibleBooks
                  .filter((b) => b.testament === 'old')
                  .slice(0, 10)
                  .map((book) => (
                    <Button key={book.id} variant="outline" size="sm" onClick={() => handleBookSelect(book)}>
                      {book.name}
                    </Button>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Nuevo Testamento:</p>
              <div className="flex flex-wrap gap-2">
                {bibleBooks
                  .filter((b) => b.testament === 'new')
                  .slice(0, 10)
                  .map((book) => (
                    <Button key={book.id} variant="outline" size="sm" onClick={() => handleBookSelect(book)}>
                      {book.name}
                    </Button>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
