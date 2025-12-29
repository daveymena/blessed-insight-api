import { useState } from 'react';
import { Book, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { bibleBooks, type BibleBook, getBooksByTestament } from '@/lib/bibleApi';

interface BookSelectorProps {
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  onClose?: () => void;
}

export function BookSelector({ selectedBook, onSelectBook, onClose }: BookSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTestament, setExpandedTestament] = useState<'old' | 'new' | null>('new');

  const oldTestament = getBooksByTestament('old');
  const newTestament = getBooksByTestament('new');

  const filterBooks = (books: BibleBook[]) => {
    if (!searchQuery) return books;
    return books.filter((book) =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSelectBook = (book: BibleBook) => {
    onSelectBook(book);
    onClose?.();
  };

  const filteredOld = filterBooks(oldTestament);
  const filteredNew = filterBooks(newTestament);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-serif font-semibold mb-3 text-foreground">
          Libros de la Biblia
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar libro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* Nuevo Testamento */}
          <div className="mb-2">
            <button
              onClick={() => setExpandedTestament(expandedTestament === 'new' ? null : 'new')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {expandedTestament === 'new' ? (
                <ChevronDown className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm text-foreground">Nuevo Testamento</span>
              <span className="ml-auto text-xs text-muted-foreground">{newTestament.length}</span>
            </button>
            {expandedTestament === 'new' && (
              <div className="mt-1 ml-2 space-y-0.5 animate-fade-in">
                {filteredNew.map((book) => (
                  <BookItem
                    key={book.id}
                    book={book}
                    isSelected={selectedBook?.id === book.id}
                    onSelect={handleSelectBook}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Antiguo Testamento */}
          <div>
            <button
              onClick={() => setExpandedTestament(expandedTestament === 'old' ? null : 'old')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {expandedTestament === 'old' ? (
                <ChevronDown className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm text-foreground">Antiguo Testamento</span>
              <span className="ml-auto text-xs text-muted-foreground">{oldTestament.length}</span>
            </button>
            {expandedTestament === 'old' && (
              <div className="mt-1 ml-2 space-y-0.5 animate-fade-in">
                {filteredOld.map((book) => (
                  <BookItem
                    key={book.id}
                    book={book}
                    isSelected={selectedBook?.id === book.id}
                    onSelect={handleSelectBook}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookItemProps {
  book: BibleBook;
  isSelected: boolean;
  onSelect: (book: BibleBook) => void;
}

function BookItem({ book, isSelected, onSelect }: BookItemProps) {
  return (
    <button
      onClick={() => onSelect(book)}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg transition-all duration-200',
        isSelected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'hover:bg-secondary text-foreground'
      )}
    >
      <Book className={cn('h-4 w-4', isSelected ? 'text-primary-foreground' : 'text-primary')} />
      <span className="text-sm font-medium">{book.name}</span>
      <span className={cn(
        'ml-auto text-xs',
        isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
      )}>
        {book.chapters} cap.
      </span>
    </button>
  );
}
