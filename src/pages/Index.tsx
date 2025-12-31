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

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [studyCenterOpen, setStudyCenterOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'bible' | 'plans' | 'search' | 'favorites'>('home');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inicializar tema al cargar
  useEffect(() => {
    // Verificar si ya se mostró el home en esta sesión
    const homeShown = sessionStorage.getItem('bible_home_dismissed');
    if (homeShown) {
      setShowHome(false);
    }

    // Cargar configuración del tema guardada
    try {
      const saved = localStorage.getItem('bible_theme_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (e) {
      console.error('Error loading theme:', e);
    }
  }, []);

  const handleStartReading = () => {
    setShowHome(false);
    sessionStorage.setItem('bible_home_dismissed', 'true');
  };

  const handleGoHome = () => {
    setShowHome(true);
    sessionStorage.removeItem('bible_home_dismissed');
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
    refetch();
  };

  const handleNavigation = (book: BibleBook, chapter: number, verse?: number) => {
    selectBook(book);
    setTimeout(() => {
      selectChapter(chapter);
      if (verse) {
        // Implementar scroll suave al versículo
        // Damos un poco más de tiempo para que cargue el contenido
        setTimeout(() => {
          const element = document.getElementById(`verse-${verse}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Opcional: Resaltar temporalmente
            element.classList.add('bg-primary/20');
            setTimeout(() => element.classList.remove('bg-primary/20'), 2000);
          }
        }, 300);
      }
    }, 100);
    setNavModalOpen(false);
  };

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden">

      <BackgroundLayer />

      <BibleHeader
        onMenuClick={() => setSidebarOpen(true)}
        onAIClick={() => setAiPanelOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onFavoritesClick={() => setFavoritesOpen(true)}
        onStudyClick={() => setStudyCenterOpen(true)}
        onThemeClick={() => setThemeOpen(true)}
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

      <div className="flex-1 flex overflow-hidden relative">
        <BibleSidebar
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          chapters={chapters}
          onSelectBook={selectBook}
          onSelectChapter={selectChapter}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          <div className="flex-1 overflow-y-auto pb-24 md:pb-8 scroll-smooth overflow-x-hidden">
            {showHome ? (
              <HomeScreen
                onStartReading={handleStartReading}
                onOpenSearch={() => setSearchOpen(true)}
                onOpenStudyCenter={() => setStudyCenterOpen(true)}
                onOpenFavorites={() => setFavoritesOpen(true)}
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
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onHomeClick={() => { setActiveTab('home'); setShowHome(true); }}
        onMenuClick={() => { setActiveTab('bible'); setShowHome(false); setSidebarOpen(true); }}
        onSearchClick={() => { setActiveTab('search'); setSearchOpen(true); }}
        onFavoritesClick={() => { setActiveTab('favorites'); setFavoritesOpen(true); }}
        onAIClick={() => { setAiPanelOpen(true); }}
        onStudyClick={() => { setActiveTab('plans'); setStudyCenterOpen(true); }}
      />

      {/* Panels and Modals */}
      <NavigationModal
        isOpen={navModalOpen}
        onClose={() => setNavModalOpen(false)}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        chapters={chapters}
        onNavigate={handleNavigation}
      />

      <AIStudyPanel
        book={selectedBook}
        chapter={selectedChapter}
        passage={passage}
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectBook={handleSearchSelect}
      />

      <FavoritesPanel
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />

      <StudyCenter
        book={selectedBook}
        chapter={selectedChapter}
        passage={passage}
        isOpen={studyCenterOpen}
        onClose={() => setStudyCenterOpen(false)}
      />

      <ThemeCustomizer
        isOpen={themeOpen}
        onClose={() => setThemeOpen(false)}
      />
    </div>
  );
};

export default Index;
