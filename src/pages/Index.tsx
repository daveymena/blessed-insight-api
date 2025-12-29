import { useState } from 'react';
import { BibleHeader } from '@/components/BibleHeader';
import { BibleSidebar } from '@/components/BibleSidebar';
import { ScriptureReader } from '@/components/ScriptureReader';
import { useBibleReader } from '@/hooks/useBibleReader';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  } = useBibleReader();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BibleHeader onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
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
    </div>
  );
};

export default Index;
