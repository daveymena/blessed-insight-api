import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  fetchChapter,
  bibleBooks,
  getChaptersForBook,
  getVersion,
  getCurrentVersionInfo,
  type BibleBook,
  type BiblePassage
} from '@/lib/bibleApi';

export interface ReaderState {
  selectedBook: BibleBook | null;
  selectedChapter: number;
  showSpanishEquivalent: boolean;
  currentVersion: string;
}

export function useBibleReader() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ReaderState>({
    selectedBook: bibleBooks[0], // Génesis por defecto
    selectedChapter: 1,
    showSpanishEquivalent: false,
    currentVersion: getVersion(),
  });

  const { selectedBook, selectedChapter, showSpanishEquivalent, currentVersion } = state;
  const versionInfo = getCurrentVersionInfo();
  const isSpanishVersion = versionInfo.languageCode === 'es';

  const {
    data: passage,
    isLoading,
    error,
    refetch,
  } = useQuery<BiblePassage>({
    queryKey: ['chapter', selectedBook?.id, selectedChapter, currentVersion, showSpanishEquivalent],
    queryFn: () => fetchChapter(selectedBook!.id, selectedChapter, currentVersion, showSpanishEquivalent),
    enabled: !!selectedBook,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 2,
  });

  const navigateTo = useCallback((book: BibleBook, chapter: number = 1) => {
    setState((prev) => ({
      ...prev,
      selectedBook: book,
      selectedChapter: chapter,
    }));
  }, []);

  const selectBook = useCallback((book: BibleBook) => {
    navigateTo(book, 1);
  }, [navigateTo]);

  const selectChapter = useCallback((chapter: number) => {
    setState((prev) => ({
      ...prev,
      selectedChapter: chapter,
    }));
  }, []);

  const changeVersion = useCallback(() => {
    const newVersion = getVersion();
    setState(prev => ({ ...prev, currentVersion: newVersion }));
  }, []);

  const setShowSpanishEquivalent = useCallback((show: boolean) => {
    setState((prev) => ({
      ...prev,
      showSpanishEquivalent: show,
    }));
  }, []);

  const goToNextChapter = useCallback(() => {
    if (!selectedBook) return;

    const maxChapters = selectedBook.chapters;
    if (selectedChapter < maxChapters) {
      selectChapter(selectedChapter + 1);
    } else {
      // Go to next book
      const currentIndex = bibleBooks.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex < bibleBooks.length - 1) {
        const nextBook = bibleBooks[currentIndex + 1];
        setState((prev) => ({
          ...prev,
          selectedBook: nextBook,
          selectedChapter: 1,
        }));
      }
    }
  }, [selectedBook, selectedChapter, selectChapter]);

  const goToPreviousChapter = useCallback(() => {
    if (!selectedBook) return;

    if (selectedChapter > 1) {
      selectChapter(selectedChapter - 1);
    } else {
      // Go to previous book
      const currentIndex = bibleBooks.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex > 0) {
        const prevBook = bibleBooks[currentIndex - 1];
        setState((prev) => ({
          ...prev,
          selectedBook: prevBook,
          selectedChapter: prevBook.chapters,
        }));
      }
    }
  }, [selectedBook, selectedChapter, selectChapter]);

  const chapters = selectedBook ? getChaptersForBook(selectedBook.id) : [];

  const canGoNext = selectedBook && (
    selectedChapter < selectedBook.chapters ||
    bibleBooks.findIndex((b) => b.id === selectedBook.id) < bibleBooks.length - 1
  );

  const canGoPrevious = selectedBook && (
    selectedChapter > 1 ||
    bibleBooks.findIndex((b) => b.id === selectedBook.id) > 0
  );

  return {
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
    navigateTo,
    goToNextChapter,
    goToPreviousChapter,
    refetch,
    changeVersion,
    // Propiedades para mostrar equivalente español
    showSpanishEquivalent,
    setShowSpanishEquivalent,
    isSpanishVersion,
  };
}
