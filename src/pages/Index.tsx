import { useState } from 'react';
import { BibleHeader } from '@/components/BibleHeader';
import { BibleSidebar } from '@/components/BibleSidebar';
import { ScriptureReader } from '@/components/ScriptureReader';
import { AIStudyPanel } from '@/components/AIStudyPanel';
import { SearchModal } from '@/components/SearchModal';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { StudyCenter } from '@/components/StudyCenter';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useBibleReader } from '@/hooks/useBibleReader';
import type { BibleBook } from '@/lib/bibleApi';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [studyCenterOpen, setStudyCenterOpen] = useState(false);

  const {
    selectedBook,
    selectedChapter,
    passage,
    isLoading,
    error,
    chapters,
    canGoNext,
    canGoPrevious,
    selectBook,
    selectChapter,
    goToNextChapter,
    goToPreviousChapter,
    refetch,
    showSpanishEquivalent,
    setShowSpanishEquivalent,
    isSpanishVersion,
  } = useBibleReader();

  const handleSearchSelect = (book: BibleBook, chapter?: number) => {
    selectBook(book);
    if (chapter) {
      setTimeout(() => selectChapter(chapter), 100);
    }
  };

  const handleVersionChange = () => {
    // Recargar el capítulo actual con la nueva versión
    refetch();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BibleHeader 
        onMenuClick={() => setSidebarOpen(true)}
        onAIClick={() => setAiPanelOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onFavoritesClick={() => setFavoritesOpen(true)}
        onStudyClick={() => setStudyCenterOpen(true)}
        onVersionChange={handleVersionChange}
        showSpanishEquivalent={showSpanishEquivalent}
        onSpanishToggle={setShowSpanishEquivalent}
        isSpanishVersion={isSpanishVersion}
      />
      
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        <BibleSidebar
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          chapters={chapters}
          onSelectBook={selectBook}
          onSelectChapter={selectChapter}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-h-0">
          <ScriptureReader
            book={selectedBook}
            chapter={selectedChapter}
            passage={passage}
            isLoading={isLoading}
            error={error as Error | null}
            canGoNext={!!canGoNext}
            canGoPrevious={!!canGoPrevious}
            onNext={goToNextChapter}
            onPrevious={goToPreviousChapter}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onFavoritesClick={() => setFavoritesOpen(true)}
        onAIClick={() => setAiPanelOpen(true)}
        onStudyClick={() => setStudyCenterOpen(true)}
      />

      {/* AI Study Panel */}
      <AIStudyPanel
        book={selectedBook}
        chapter={selectedChapter}
        passage={passage}
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectBook={handleSearchSelect}
      />

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />

      {/* Study Center */}
      <StudyCenter
        book={selectedBook}
        chapter={selectedChapter}
        passage={passage}
        isOpen={studyCenterOpen}
        onClose={() => setStudyCenterOpen(false)}
      />
    </div>
  );
};

export default Index;
