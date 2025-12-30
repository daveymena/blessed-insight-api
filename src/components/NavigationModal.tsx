import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookSelector } from './BookSelector';
import { ChapterSelector } from './ChapterSelector';
import type { BibleBook } from '@/lib/bibleApi';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// We need a VerseSelector component as well for the full flow
// For now, we'll implement a simple one here or reuse the grid logic

interface NavigationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedBook: BibleBook | null;
    selectedChapter: number;
    onNavigate: (book: BibleBook, chapter: number, verse?: number) => void;
    chapters: number[];
}

export function NavigationModal({
    isOpen,
    onClose,
    selectedBook,
    selectedChapter,
    onNavigate,
    chapters
}: NavigationModalProps) {
    const [activeTab, setActiveTab] = useState<'book' | 'chapter' | 'verse'>('book');
    const [tempBook, setTempBook] = useState<BibleBook | null>(selectedBook);
    const [tempChapter, setTempChapter] = useState<number>(selectedChapter);

    // Sync props when opening
    useEffect(() => {
        if (isOpen) {
            setTempBook(selectedBook);
            setTempChapter(selectedChapter);
            setActiveTab('book');
        }
    }, [isOpen, selectedBook, selectedChapter]);

    const handleBookSelect = (book: BibleBook) => {
        setTempBook(book);
        setActiveTab('chapter');
    };

    const handleChapterSelect = (chapter: number) => {
        setTempChapter(chapter);
        // If we had verse data, we would go to verse.
        // For now, let's close and navigate directly like existing behavior, 
        // or optionally go to verse selector if user wants specific verse.
        // The user asked for "chapters and verses look", so let's add a simple Verse grid.
        setActiveTab('verse');
    };

    const handleVerseSelect = (verse: number) => {
        if (tempBook) {
            onNavigate(tempBook, tempChapter, verse);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md h-[80vh] p-0 gap-0 overflow-hidden bg-background">
                <div className="flex flex-col h-full">
                    {/* Header with Breadcrumbs */}
                    <div className="p-4 border-b border-border flex items-center justify-center bg-muted/20">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <button
                                onClick={() => setActiveTab('book')}
                                className={cn("px-2 py-1 rounded transition-colors", activeTab === 'book' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {tempBook?.name || 'Seleccionar Libro'}
                            </button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <button
                                onClick={() => tempBook && setActiveTab('chapter')}
                                disabled={!tempBook}
                                className={cn("px-2 py-1 rounded transition-colors", activeTab === 'chapter' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                {tempBook ? `Cap ${tempChapter}` : 'Capítulo'}
                            </button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <button
                                onClick={() => setActiveTab('verse')}
                                disabled={!tempBook}
                                className={cn("px-2 py-1 rounded transition-colors", activeTab === 'verse' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                            >
                                Versículo
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'book' && (
                            <BookSelector
                                selectedBook={tempBook}
                                onSelectBook={handleBookSelect}
                            />
                        )}

                        {activeTab === 'chapter' && tempBook && (
                            <ChapterSelector
                                book={tempBook}
                                chapters={Array.from({ length: tempBook.chapters }, (_, i) => i + 1)}
                                selectedChapter={tempChapter}
                                onSelectChapter={handleChapterSelect}
                            />
                        )}

                        {activeTab === 'verse' && (
                            <VerseSelector
                                count={50} // Approximate, since we don't have verse count in API yet without fetching. 
                                // In a real scenario we'd need exact verse count for the chapter. 
                                // For now, let's assume a generous number or just allow navigation to verse 1.
                                // Wait, useBibleReader gets 'passage' which has content, but we don't know the verse count of a *target* chapter until we fetch it.
                                // YouVersion allows selecting up to common maxs. 
                                // Let's mock it to 50 or use a fixed grid for now.
                                onSelectVerse={handleVerseSelect}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function VerseSelector({ count, onSelectVerse }: { count: number, onSelectVerse: (v: number) => void }) {
    // Common max verses is around 176 (Psalm 119), but text usually 20-50.
    // We'll show a grid of 1-50 for now as a "Practical" placeholder.
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <h3 className="font-serif font-semibold text-center">Selecciona el Versículo</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: 60 }, (_, i) => i + 1).map(v => (
                        <button
                            key={v}
                            onClick={() => onSelectVerse(v)}
                            className="aspect-square flex items-center justify-center rounded-lg bg-secondary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
