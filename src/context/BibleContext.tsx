import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllBooks, fetchChapter } from '@/lib/bibleApi';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';

interface BibleContextType {
    selectedBook: BibleBook | null;
    selectedChapter: number;
    passage: BiblePassage | undefined;
    isLoading: boolean;
    error: any;
    books: BibleBook[];
    selectBook: (book: BibleBook) => void;
    selectChapter: (chapter: number) => void;
    goToNextChapter: () => void;
    goToPreviousChapter: () => void;
    refetch: () => void;
    version: string;
    setVersion: (v: string) => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: React.ReactNode }) {
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [passage, setPassage] = useState<BiblePassage | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [version, setVersion] = useState('rvr');

    // Cargar libros - Síncrono desde bibleApi
    useEffect(() => {
        const loadedBooks = getAllBooks();
        setBooks(loadedBooks);
        if (loadedBooks.length > 0 && !selectedBook) {
            const firstBook = loadedBooks.find(b => b.id === 'genesis') || loadedBooks[0];
            setSelectedBook(firstBook);
        }
    }, [version]);

    // Función de carga de pasaje
    const fetchCurrentPassage = useCallback(async () => {
        if (!selectedBook) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchChapter(selectedBook.id, selectedChapter, version);
            setPassage(data);
        } catch (err) {
            console.error("Error fetching passage:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBook, selectedChapter, version]);

    useEffect(() => {
        fetchCurrentPassage();
    }, [fetchCurrentPassage]);

    const handleSelectBook = (book: BibleBook) => {
        setSelectedBook(book);
        setSelectedChapter(1);
    };

    const handleSelectChapter = (chapter: number) => {
        setSelectedChapter(chapter);
    };

    const handleNextChapter = () => {
        if (!selectedBook) return;
        if (selectedChapter < selectedBook.chapters) {
            setSelectedChapter(prev => prev + 1);
        } else {
            const idx = books.findIndex(b => b.id === selectedBook.id);
            if (idx >= 0 && idx < books.length - 1) {
                handleSelectBook(books[idx + 1]);
            }
        }
    };

    const handlePrevChapter = () => {
        if (!selectedBook) return;
        if (selectedChapter > 1) {
            setSelectedChapter(prev => prev - 1);
        } else {
            const idx = books.findIndex(b => b.id === selectedBook.id);
            if (idx > 0) {
                const prevB = books[idx - 1];
                setSelectedBook(prevB);
                setSelectedChapter(prevB.chapters);
            }
        }
    };

    const contextValue: BibleContextType = {
        selectedBook,
        selectedChapter,
        passage,
        isLoading,
        error,
        books,
        selectBook: handleSelectBook,
        selectChapter: handleSelectChapter,
        goToNextChapter: handleNextChapter,
        goToPreviousChapter: handlePrevChapter,
        refetch: fetchCurrentPassage,
        version,
        setVersion
    };

    return (
        <BibleContext.Provider value={contextValue}>
            {children}
        </BibleContext.Provider>
    );
}

export function useBibleContext() {
    const context = useContext(BibleContext);
    if (!context) throw new Error('useBibleContext must be used within a BibleProvider');
    return context;
}
