import { useState, useEffect } from 'react';
import { Book, LayoutGrid, ArrowLeft, MapPin, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BookSelector } from './BookSelector';
import { ChapterSelector } from './ChapterSelector';
import { VerseSelector } from './VerseSelector';
import { VersionSelector } from './VersionSelector';
import { type BibleBook, getVerseCount } from '@/lib/bibleApi';
import { PremiumModal } from './PremiumModal';
import { Crown } from 'lucide-react';
import { useThemeSettings } from '@/hooks/useThemeSettings';

interface BibleSidebarProps {
  selectedBook: BibleBook | null;
  selectedChapter: number;
  chapters: number[];
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter: (chapter: number) => void;
  onSelectVerse?: (verse: number) => void;
  onVersionChange?: () => void;
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
  onVersionChange,
  isOpen,
  onClose,
}: BibleSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [verseCount, setVerseCount] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  const { activeTheme } = useThemeSettings();

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
      {/* Mobile Overlay - Only show if sidebar is technically an overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/10 backdrop-blur-[2px] z-30 md:hidden pointer-events-auto"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - TRANSLUCENT PREMIUM GLASS */}
      <aside
        className={cn(
          'fixed md:relative top-0 left-0 z-50 md:z-auto',
          'w-80 h-[100dvh] md:h-full border-r border-border shadow-2xl md:shadow-none',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col overflow-hidden isolate',
          activeTheme.type === 'scenic'
            ? (activeTheme.uiMode === 'dark' ? 'bg-black/60 backdrop-blur-2xl' : 'bg-white/75 backdrop-blur-xl')
            : 'bg-sidebar',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Mobile Header with Close Button */}
        <div className={cn("flex-center justify-between p-5 border-b border-border md:hidden", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-sidebar')}>
          <span className="font-serif font-black text-xl tracking-tight">Menú Bíblico</span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
          >
            <span className="text-xs font-black uppercase tracking-widest">Cerrar</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-border bg-muted/20">
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
                'flex-1 flex flex-col items-center justify-center gap-1.5 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative',
                activeTab === tab.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                (tab.id !== 'books' && !selectedBook) && 'opacity-30 cursor-not-allowed grayscale'
              )}
            >
              <tab.icon className={cn("h-5 w-5", activeTab === tab.id && "animate-pulse")} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={cn("flex-1 min-h-0 relative", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-sidebar')}>
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

        {/* Version Selector */}
        <div className={cn("p-4 border-t border-border", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-sidebar')}>
          <div className="flex items-center gap-2 mb-3">
            <Languages className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Versión Bíblica</span>
          </div>
          <VersionSelector onVersionChange={onVersionChange} />
        </div>

        {/* Premium Banner */}
        <div className={cn("p-5 border-t border-border shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]", activeTheme.type === 'scenic' ? 'bg-transparent' : 'bg-sidebar')}>
          <button
            onClick={() => setShowPremium(true)}
            className="w-full group relative overflow-hidden rounded-2xl h-14 transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <div className="relative flex items-center justify-center gap-3 text-white">
              <Crown className="w-5 h-5 fill-white animate-bounce" />
              <span className="font-serif font-black text-sm uppercase tracking-widest">Hacerse Premium</span>
            </div>
          </button>
        </div>

        <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
      </aside>
    </>
  );
}
