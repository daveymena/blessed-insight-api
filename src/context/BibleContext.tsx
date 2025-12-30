import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';
import { getBooks, getChapter } from '@/lib/bibleApi';

interface BibleContextType {
    selectedBook: BibleBook | null;
    selectedChapter: number;
    passage: BiblePassage | undefined;
    isLoading: boolean;
    error: Error | null;
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
    const [error, setError] = useState<Error | null>(null);
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [version, setVersion] = useState('rvr');

    // Cargar libros al inicio
    useEffect(() => {
        async function loadBooks() {
            try {
                const loadedBooks = await getBooks(version);
                setBooks(loadedBooks);
                if (loadedBooks.length > 0 && !selectedBook) {
                    // Auto-load Genesis
                    const genesis = loadedBooks.find(b => b.id === 'GEN') || loadedBooks[0];
                    setSelectedBook(genesis);
                }
            } catch (err) {
                console.error('Error loading books:', err);
            }
        }
        loadBooks();
    }, [version]);

    // Cargar pasaje cuando cambia libro/capítulo/versión
    const fetchPassage = async () => {
        if (!selectedBook) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await getChapter(version, selectedBook.id, selectedChapter);
            setPassage(data);
        } catch (err: any) {
            console.error('Error fetching passage:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPassage();
    }, [selectedBook, selectedChapter, version]);

    const selectBook = (book: BibleBook) => {
        setSelectedBook(book);
        setSelectedChapter(1); // Reset to chapter 1 on book change
    };

    const selectChapter = (chapter: number) => {
        setSelectedChapter(chapter);
    };

    const goToNextChapter = () => {
        if (!selectedBook) return;
        if (selectedChapter < selectedBook.chapters) {
            setSelectedChapter(c => c + 1);
        } else {
            // Intentar ir al siguiente libro
            const currentIndex = books.findIndex(b => b.id === selectedBook.id);
            if (currentIndex < books.length - 1) {
                selectBook(books[currentIndex + 1]);
            }
        }
    };

    const goToPreviousChapter = () => {
        if (selectedChapter > 1) {
            setSelectedChapter(c => c - 1);
        } else {
            // Intentar ir al libro anterior
            const currentIndex = books.findIndex(b => b.id === selectedBook?.id);
            if (currentIndex > 0) {
                const prevBook = books[currentIndex - 1];
                setSelectedBook(prevBook);
                setSelectedChapter(prevBook.chapters);
            }
        }
    };

    return (
        <BibleContext.Provider value={{
            selectedBook,
            selectedChapter,
            passage,
            isLoading,
            error,
            books,
            selectBook,
            selectChapter,
            goToNextChapter,
            goToPreviousChapter,
            refetch: fetchPassage,
            version,
            setVersion
        }}>
            {children}
        </BibleContext.Provider>
    );
}

export function useBibleContext() {
    const context = useContext(BibleContext);
    if (context === undefined) {
        throw new Error('useBibleContext must be used within a BibleProvider');
    }
    return context;
}
