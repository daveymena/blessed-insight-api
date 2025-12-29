import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { 
  fetchChapter, 
  bibleBooks, 
  getChaptersForBook,
  type BibleBook,
  type BiblePassage
} from '@/lib/bibleApi';

export interface ReaderState {
  selectedBook: BibleBook | null;
  selectedChapter: number;
}

export function useBibleReader() {
  const [state, setState] = useState<ReaderState>({
    selectedBook: bibleBooks.find(b => b.id === 'john') || bibleBooks[0],
    selectedChapter: 1,
  });

  const { selectedBook, selectedChapter } = state;

  const {
    data: passage,
    isLoading,
    error,
    refetch,
  } = useQuery<BiblePassage>({
    queryKey: ['chapter', selectedBook?.id, selectedChapter],
    queryFn: () => fetchChapter(selectedBook!.id, selectedChapter),
    enabled: !!selectedBook,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 2,
  });

  const selectBook = useCallback((book: BibleBook) => {
    setState((prev) => ({
      ...prev,
      selectedBook: book,
      selectedChapter: 1,
    }));
  }, []);

  const selectChapter = useCallback((chapter: number) => {
    setState((prev) => ({
      ...prev,
      selectedChapter: chapter,
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
        setState({
          ...state,
          selectedBook: nextBook,
          selectedChapter: 1,
        });
      }
    }
  }, [selectedBook, selectedChapter, state, selectChapter]);

  const goToPreviousChapter = useCallback(() => {
    if (!selectedBook) return;
    
    if (selectedChapter > 1) {
      selectChapter(selectedChapter - 1);
    } else {
      // Go to previous book
      const currentIndex = bibleBooks.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex > 0) {
        const prevBook = bibleBooks[currentIndex - 1];
        setState({
          ...state,
          selectedBook: prevBook,
          selectedChapter: prevBook.chapters,
        });
      }
    }
  }, [selectedBook, selectedChapter, state, selectChapter]);

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
    goToNextChapter,
    goToPreviousChapter,
    refetch,
  };
}
