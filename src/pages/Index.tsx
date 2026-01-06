import { useState, useEffect } from 'react';
import { BibleHeader } from '@/components/BibleHeader';
import { BibleSidebar } from '@/components/BibleSidebar';
import { ScriptureReader } from '@/components/ScriptureReader';
import { AIStudyPanel } from '@/components/AIStudyPanel';
import { SearchModal } from '@/components/SearchModal';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { StudyCenter } from '@/components/StudyCenter';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { BackgroundLayer } from '@/components/BackgroundLayer';
import { HomeScreen } from '@/components/HomeScreen';
import { WelcomeCover } from '@/components/WelcomeCover';
import { NavigationModal } from '@/components/NavigationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useBibleReader } from '@/hooks/useBibleReader';
import type { BibleBook } from '@/lib/bibleApi';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useThemeSettings } from '@/hooks/useThemeSettings';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelType, setRightPanelType] = useState<'biblo' | 'study' | 'none'>('none');
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'bible' | 'study' | 'biblo' | 'chat' | 'search' | 'favorites'>('home');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeTheme } = useThemeSettings();

  const toggleFullView = (type: 'biblo' | 'study') => {
    setActiveTab(type);
    setShowHome(false);
  };

  useEffect(() => {
    const homeShown = sessionStorage.getItem('bible_home_dismissed');
    if (homeShown) {
      setShowHome(false);
      setActiveTab('bible');
    }
  }, []);

  const handleStartReading = () => {
    if (!selectedBook) {
      setNavModalOpen(true);
    } else {
      setShowHome(false);
      setActiveTab('bible');
      sessionStorage.setItem('bible_home_dismissed', 'true');
    }
  };

  const handleGoHome = () => {
    setShowHome(true);
    setActiveTab('home');
    sessionStorage.removeItem('bible_home_dismissed');
  };

  const handleChat = () => {
    navigate('/chat');
  };

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
    navigateTo,
    showSpanishEquivalent,
    setShowSpanishEquivalent,
    isSpanishVersion,
    changeVersion,
  } = useBibleReader();

  const handleSearchSelect = (book: BibleBook, chapter?: number) => {
    navigateTo(book, chapter || 1);
    setActiveTab('bible');
    setShowHome(false);
    setSearchOpen(false);
  };

  const handleVersionChange = () => {
    changeVersion();
    refetch();
  };

  const handleNavigation = (book: BibleBook, chapter: number, verse?: number) => {
    navigateTo(book, chapter);
    if (verse) {
      setTimeout(() => {
        const element = document.getElementById(`verse-${verse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
    setNavModalOpen(false);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden bg-transparent">
      {/* 1. Capa de Fondo Base (Provee luz/oscuridad fuera) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundLayer />
      </div>

      {/* 2. Encabezado (Visible fuera de la Home) */}
      {!showHome && (
        <BibleHeader
          onMenuClick={() => setSidebarOpen(true)}
          onAIClick={() => toggleFullView('biblo')}
          onSearchClick={() => setSearchOpen(true)}
          onFavoritesClick={() => setFavoritesOpen(true)}
          onStudyClick={() => toggleFullView('study')}
          onThemeClick={() => setThemeOpen(true)}
          onHomeClick={handleGoHome}
          onChatClick={handleChat}
          onVersionChange={handleVersionChange}
          showSpanishEquivalent={showSpanishEquivalent}
          onSpanishToggle={setShowSpanishEquivalent}
          isSpanishVersion={isSpanishVersion}
          user={user}
          onLoginClick={() => navigate('/login')}
          onTitleClick={() => setNavModalOpen(true)}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
        />
      )}

      {/* 3. Área Principal */}
      <div className="flex-1 flex min-h-0 relative z-10 overflow-hidden">
        <BibleSidebar
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          chapters={chapters}
          onSelectBook={selectBook}
          onSelectChapter={selectChapter}
          onSelectVerse={(verse) => {
            if (selectedBook) {
              handleNavigation(selectedBook, selectedChapter, verse);
              if (showHome) handleStartReading();
            } else {
              setSidebarOpen(false);
            }
          }}
          onVersionChange={handleVersionChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'study' ? (
              <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-background">
                <StudyCenter
                  book={selectedBook}
                  chapter={selectedChapter}
                  passage={passage}
                  isOpen={true}
                  onClose={handleGoHome}
                  isSidebar={false}
                />
              </motion.div>
            ) : activeTab === 'biblo' ? (
              <motion.div key="biblo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-background">
                <AIStudyPanel
                  book={selectedBook}
                  chapter={selectedChapter}
                  passage={passage}
                  isOpen={true}
                  onClose={handleGoHome}
                  isSidebar={false}
                />
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {showHome || activeTab === 'home' ? (
                  <HomeScreen
                    onStartReading={handleStartReading}
                    onOpenSearch={() => setSearchOpen(true)}
                    onOpenStudyCenter={() => toggleFullView('study')}
                    onOpenFavorites={() => setFavoritesOpen(true)}
                    onOpenAI={() => toggleFullView('biblo')}
                    onOpenPlans={() => toggleFullView('study')}
                    onOpenTheme={() => setThemeOpen(true)}
                    onOpenMenu={() => setSidebarOpen(true)}
                  />
                ) : (
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
                    onVersionChange={handleVersionChange}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onHomeClick={handleGoHome}
        onMenuClick={() => { setActiveTab('bible'); setShowHome(false); setSidebarOpen(true); }}
        onSearchClick={() => { setActiveTab('search'); setSearchOpen(true); }}
        onFavoritesClick={() => { setActiveTab('favorites'); setFavoritesOpen(true); }}
        onAIClick={() => toggleFullView('biblo')}
        onStudyClick={() => toggleFullView('study')}
        onChatClick={handleChat}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectBook={handleSearchSelect}
      />

      <NavigationModal
        isOpen={navModalOpen}
        onClose={() => setNavModalOpen(false)}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        chapters={chapters}
        onNavigate={handleNavigation}
      />

      <ThemeCustomizer
        isOpen={themeOpen}
        onClose={() => setThemeOpen(false)}
      />
    </div>
  );
};

export default Index;
