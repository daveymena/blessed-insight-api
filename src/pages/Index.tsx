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
  const [activeTab, setActiveTab] = useState<'home' | 'bible' | 'study' | 'biblo' | 'chat' | 'search' | 'favorites'>('home');
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleFullView = (type: 'biblo' | 'study') => {
    setActiveTab(type);
    setShowHome(false);
    setRightPanelOpen(false); // Cerramos el panel lateral si estaba abierto
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
    setRightPanelOpen(false);
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

      <div className="flex-1 flex overflow-hidden relative min-h-0 bg-background">
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
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex min-w-0 h-full relative overflow-hidden">
          {activeTab === 'study' ? (
            <StudyCenter
              book={selectedBook}
              chapter={selectedChapter}
              passage={passage}
              isOpen={true}
              onClose={handleGoHome}
              isSidebar={false}
            />
          ) : activeTab === 'biblo' ? (
            <AIStudyPanel
              book={selectedBook}
              chapter={selectedChapter}
              passage={passage}
              isOpen={true}
              onClose={handleGoHome}
              isSidebar={false}
            />
          ) : (
            <div className="flex-1 overflow-y-auto pb-24 md:pb-4 scroll-smooth overflow-x-hidden custom-scrollbar">
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

          {/* Panel Derecho Persistente (Estilo Logos/Premium) */}
          {/* Panel Lateral removido para usar vista completa centralizada */}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onHomeClick={() => { setActiveTab('home'); setShowHome(true); }}
        onMenuClick={() => { setActiveTab('bible'); setShowHome(false); setSidebarOpen(true); }}
        onSearchClick={() => { setActiveTab('search'); setSearchOpen(true); }}
        onFavoritesClick={() => { setActiveTab('favorites'); setFavoritesOpen(true); }}
        onAIClick={() => toggleFullView('biblo')}
        onStudyClick={() => toggleFullView('study')}
        onChatClick={handleChat}
      />

      {/* Panels and Modals */}
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

      {/* Modales para Móvil (Mismo contenido, diferente presentación) */}
      {/* Modales para Móvil removidos ya que ahora son vistas principales */}

      <ThemeCustomizer
        isOpen={themeOpen}
        onClose={() => setThemeOpen(false)}
      />
    </div>
  );
};

export default Index;
