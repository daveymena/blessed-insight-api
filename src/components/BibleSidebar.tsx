import { useState, useEffect } from 'react';
import { Book, LayoutGrid, ArrowLeft, MapPin, Languages, X } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && !selectedBook) {
      setActiveTab('books');
    }
  }, [isOpen, selectedBook]);

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Limpio y espacioso */}
      <aside
        className={cn(
          'fixed md:relative top-0 left-0 z-50 md:z-auto',
          'w-[85vw] max-w-[320px] h-[100dvh] md:h-full border-r border-border',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col overflow-hidden',
          activeTheme.type === 'scenic'
            ? (activeTheme.uiMode === 'dark' ? 'bg-black/90 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-xl')
            : 'bg-background',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header móvil - Simple */}
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <span className="font-serif font-bold text-lg">Navegación</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs - Compactos */}
        <div className="flex shrink-0 border-b border-border">
          {[
            { id: 'books', icon: Book, label: 'Libros' },
            { id: 'chapters', icon: LayoutGrid, label: 'Caps' },
            { id: 'verses', icon: MapPin, label: 'Vers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              disabled={tab.id !== 'books' && !selectedBook}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-bold uppercase tracking-wider transition-all relative',
                activeTab === tab.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground',
                (tab.id !== 'books' && !selectedBook) && 'opacity-30 cursor-not-allowed'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content - Área principal con scroll */}
        <div className="flex-1 min-h-0 overflow-hidden">
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

        {/* Footer - Version + Premium compacto */}
        <div className="shrink-0 border-t border-border p-3 space-y-3">
          {/* Version Selector - Inline */}
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <VersionSelector onVersionChange={onVersionChange} />
            </div>
          </div>

          {/* Premium Button - Compacto */}
          <button
            onClick={() => setShowPremium(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-transform"
          >
            <Crown className="w-4 h-4" />
            Premium
          </button>
        </div>

        <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
      </aside>
    </>
  );
}
