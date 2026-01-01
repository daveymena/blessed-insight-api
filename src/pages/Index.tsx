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
  const [rightPanelOpen, setRightPanelOpen] = useState(false); // Nuevo: control de panel derecho
  const [rightPanelType, setRightPanelType] = useState<'biblo' | 'study' | 'none'>('none');
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'bible' | 'plans' | 'search' | 'favorites'>('home');
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleRightPanel = (type: 'biblo' | 'study') => {
    if (rightPanelOpen && rightPanelType === type) {
      setRightPanelOpen(false);
      setRightPanelType('none');
    } else {
      setRightPanelOpen(true);
      setRightPanelType(type);
    }
  };

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
    navigateTo,
    showSpanishEquivalent,
    setShowSpanishEquivalent,
    isSpanishVersion,
    changeVersion,
  } = useBibleReader();

  const handleSearchSelect = (book: BibleBook, chapter?: number) => {
    navigateTo(book, chapter || 1);
    setSearchOpen(false);
  };

  const handleVersionChange = () => {
    changeVersion();
    refetch();
  };

  const handleNavigation = (book: BibleBook, chapter: number, verse?: number) => {
    navigateTo(book, chapter);
    if (verse) {
      // Damos un tiempo para que el componente ScriptureReader renderice el nuevo pasaje
      setTimeout(() => {
        const element = document.getElementById(`verse-${verse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-primary/20');
          setTimeout(() => element.classList.remove('bg-primary/20'), 2000);
        }
      }, 500); // Un poco más de tiempo para asegurar carga
    }
    setNavModalOpen(false);
  };

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden">

      <BackgroundLayer />

      <BibleHeader
        onMenuClick={() => setSidebarOpen(true)}
        onAIClick={() => toggleRightPanel('biblo')}
        onSearchClick={() => setSearchOpen(true)}
        onFavoritesClick={() => setFavoritesOpen(true)}
        onStudyClick={() => toggleRightPanel('study')}
        onThemeClick={() => setThemeOpen(true)}
        onHomeClick={handleGoHome}
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

        <main className="flex-1 flex min-w-0 h-full relative overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-24 md:pb-8 scroll-smooth overflow-x-hidden">
            {showHome ? (
              <HomeScreen
                onStartReading={handleStartReading}
                onOpenSearch={() => setSearchOpen(true)}
                onOpenStudyCenter={() => toggleRightPanel('study')}
                onOpenFavorites={() => setFavoritesOpen(true)}
                onOpenAI={() => toggleRightPanel('biblo')}
                onOpenPlans={() => toggleRightPanel('study')} // O un modal específico si existe
                onOpenTheme={() => setThemeOpen(true)}
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

          {/* Panel Derecho Persistente (Estilo Logos/Premium) */}
          <AnimatePresence>
            {rightPanelOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="hidden lg:block w-[450px] border-l bg-card/80 backdrop-blur-xl z-30 shadow-2xl overflow-hidden"
              >
                {rightPanelType === 'biblo' ? (
                  <AIStudyPanel
                    book={selectedBook}
                    chapter={selectedChapter}
                    passage={passage}
                    isOpen={true}
                    onClose={() => setRightPanelOpen(false)}
                    isSidebar={true}
                  />
                ) : (
                  <StudyCenter
                    book={selectedBook}
                    chapter={selectedChapter}
                    passage={passage}
                    isOpen={true}
                    onClose={() => setRightPanelOpen(false)}
                    isSidebar={true}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onHomeClick={() => { setActiveTab('home'); setShowHome(true); }}
        onMenuClick={() => { setActiveTab('bible'); setShowHome(false); setSidebarOpen(true); }}
        onSearchClick={() => { setActiveTab('search'); setSearchOpen(true); }}
        onFavoritesClick={() => { setActiveTab('favorites'); setFavoritesOpen(true); }}
        onAIClick={() => toggleRightPanel('biblo')}
        onStudyClick={() => toggleRightPanel('study')}
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

      {/* Modales para Móvil (Mismo contenido, diferente presentación) */}
      <div className="lg:hidden">
        <AIStudyPanel
          book={selectedBook}
          chapter={selectedChapter}
          passage={passage}
          isOpen={rightPanelOpen && rightPanelType === 'biblo'}
          onClose={() => setRightPanelOpen(false)}
        />

        <StudyCenter
          book={selectedBook}
          chapter={selectedChapter}
          passage={passage}
          isOpen={rightPanelOpen && rightPanelType === 'study'}
          onClose={() => setRightPanelOpen(false)}
        />
      </div>

      <ThemeCustomizer
        isOpen={themeOpen}
        onClose={() => setThemeOpen(false)}
      />
    </div>
  );
};

export default Index;
