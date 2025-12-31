import { useState } from 'react';
import { Book, LayoutGrid, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookSelector } from './BookSelector';
import { ChapterSelector } from './ChapterSelector';
import type { BibleBook } from '@/lib/bibleApi';

interface BibleSidebarProps {
  selectedBook: BibleBook | null;
  selectedChapter: number;
  chapters: number[];
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter: (chapter: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'books' | 'chapters';

export function BibleSidebar({
  selectedBook,
  selectedChapter,
  chapters,
  onSelectBook,
  onSelectChapter,
  isOpen,
  onClose,
}: BibleSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('books');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 md:z-auto',
          'w-80 h-screen bg-card border-r border-border',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <span className="font-bold text-lg">Navegación</span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <span className="text-xs font-medium">Cerrar</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('books')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
              activeTab === 'books'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Book className="h-4 w-4" />
            Libros
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
              activeTab === 'chapters'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Capítulos
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'books' ? (
            <BookSelector
              selectedBook={selectedBook}
              onSelectBook={(book) => {
                onSelectBook(book);
                setActiveTab('chapters');
              }}
              onClose={onClose}
            />
          ) : (
            <ChapterSelector
              book={selectedBook}
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelectChapter={(chapter) => {
                onSelectChapter(chapter);
                onClose();
              }}
            />
          )}
        </div>
      </aside>
    </>
  );
}
