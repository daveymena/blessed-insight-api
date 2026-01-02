import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BookSelector } from './BookSelector';
import { ChapterSelector } from './ChapterSelector';
import { VerseSelector } from './VerseSelector';
import type { BibleBook } from '@/lib/bibleApi';
import { ChevronRight, Hash, Bookmark, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
        setActiveTab('verse');
    };

    const handleVerseSelect = (verse: number) => {
        if (tempBook) {
            onNavigate(tempBook, tempChapter, verse);
            onClose();
        }
    };

    const steps = [
        { id: 'book', label: tempBook?.name || 'Libro', emoji: '📖' },
        { id: 'chapter', label: tempBook ? `Capítulo ${tempChapter}` : 'Capítulo', emoji: '🔖' },
        { id: 'verse', label: 'Versículo', emoji: '📍' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg h-[80vh] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-transparent">
                <div className="flex flex-col h-full overflow-hidden glass rounded-[2rem] border border-white/20">
                    {/* Header: Navigation Steps */}
                    <div className="p-6 bg-secondary/20 border-b border-border/50">
                        <div className="flex items-center justify-between gap-1 p-1 bg-background/50 backdrop-blur-md rounded-2xl border border-border/40">
                            {steps.map((step, idx) => {
                                const isActive = activeTab === step.id;
                                const isLocked = (step.id === 'chapter' && !tempBook) || (step.id === 'verse' && !tempBook);

                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setActiveTab(step.id as any)}
                                            className={cn(
                                                "relative flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-xl transition-all duration-500",
                                                isActive ? "text-primary font-bold scale-105" : "text-muted-foreground hover:text-foreground",
                                                isLocked && "opacity-30 cursor-not-allowed"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="step-bg"
                                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="text-lg leading-none">{step.emoji}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{step.label}</span>
                                        </button>
                                        {idx < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content View */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="h-full"
                            >
                                {activeTab === 'book' && (
                                    <BookSelector selectedBook={tempBook} onSelectBook={handleBookSelect} />
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
                                        bookName={tempBook?.name || ''}
                                        chapter={tempChapter}
                                        onSelectVerse={handleVerseSelect}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

