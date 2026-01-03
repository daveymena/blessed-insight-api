import { useState, useEffect } from 'react';
import { Book, LayoutGrid, ArrowLeft, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookSelector } from './BookSelector';
import { ChapterSelector } from './ChapterSelector';
import { VerseSelector } from './VerseSelector';
import { type BibleBook, getVerseCount } from '@/lib/bibleApi';
import { PremiumModal } from './PremiumModal';
import { Crown } from 'lucide-react';

interface BibleSidebarProps {
  selectedBook: BibleBook | null;
  selectedChapter: number;
  chapters: number[];
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter: (chapter: number) => void;
  onSelectVerse?: (verse: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'books' | 'chapters' | 'verses';

export function BibleSidebar({
  selectedBook,
  selectedChapter,
  chapters,
  onSelectBook,
  onSelectChapter,
  onSelectVerse,
  isOpen,
  onClose,
}: BibleSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [verseCount, setVerseCount] = useState(0);
  const [showPremium, setShowPremium] = useState(false);

  // Reset tab to books when sidebar opens if no book is selected
  useEffect(() => {
    if (isOpen && !selectedBook) {
      setActiveTab('books');
    }
  }, [isOpen, selectedBook]);

  // Update verse count when book/chapter changes
  useEffect(() => {
    let mounted = true;
    const loadVerses = async () => {
      if (selectedBook && selectedChapter) {
        const count = await getVerseCount(selectedBook.id, selectedChapter);
        if (mounted) setVerseCount(count);
      }
    };
    loadVerses();
    return () => { mounted = false; };
  }, [selectedBook, selectedChapter]);

  const handleBookSelect = (book: BibleBook) => {
    onSelectBook(book);
    setActiveTab('chapters');
  };

  const handleChapterSelect = (chapter: number) => {
    onSelectChapter(chapter);
    setActiveTab('verses');
  };

  const handleVerseSelect = (verse: number) => {
    if (onSelectVerse) {
      onSelectVerse(verse);
    }
    onClose();
  };

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
          'fixed md:relative top-0 left-0 z-50 md:z-auto',
          'w-80 h-[100dvh] md:h-full bg-card border-r border-border',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col overflow-hidden isolate shadow-xl md:shadow-none',
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
        <div className="flex shrink-0 border-b border-border bg-secondary/5">
          {[
            { id: 'books', icon: Book, label: 'Libros' },
            { id: 'chapters', icon: LayoutGrid, label: 'Caps.' },
            { id: 'verses', icon: MapPin, label: 'Ver.' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              disabled={tab.id !== 'books' && !selectedBook}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative',
                activeTab === tab.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                (tab.id !== 'books' && !selectedBook) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative">
          {activeTab === 'books' && (
            <BookSelector
              selectedBook={selectedBook}
              onSelectBook={handleBookSelect}
              onSelectChapter={(chap) => {
                onSelectChapter(chap);
                setActiveTab('verses');
              }}
            />
          )}

          {activeTab === 'chapters' && (
            <ChapterSelector
              book={selectedBook}
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelectChapter={handleChapterSelect}
            />
          )}

          {activeTab === 'verses' && selectedBook && (
            <VerseSelector
              bookName={selectedBook.name}
              chapter={selectedChapter}
              onSelectVerse={handleVerseSelect}
              verseCount={verseCount}
            />
          )}
        </div>

        {/* Premium Banner */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <button
            onClick={() => setShowPremium(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Crown className="w-5 h-5 fill-white" />
            Hazte Premium
          </button>
        </div>

        <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
      </aside>
    </>
  );
}

