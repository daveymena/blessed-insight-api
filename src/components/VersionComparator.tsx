import { useState, useEffect } from 'react';
import { X, Columns, Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPassage, BIBLE_VERSIONS } from '@/lib/bibleApi';
import type { BibleBook, BiblePassage } from '@/lib/bibleApi';

interface VersionComparatorProps {
    book: BibleBook | null;
    chapter: number;
    isOpen: boolean;
    onClose: () => void;
}

export function VersionComparator({ book, chapter, isOpen, onClose }: VersionComparatorProps) {
    const [passages, setPassages] = useState<Record<string, BiblePassage>>({});
    const [loading, setLoading] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<string[]>(['rvr', 'nvi']);

    useEffect(() => {
        if (isOpen && book) {
            loadVersions();
        }
    }, [isOpen, book, chapter, selectedVersions]);

    const loadVersions = async () => {
        if (!book) return;
        setLoading(true);
        const results: Record<string, BiblePassage> = {};

        for (const vId of selectedVersions) {
            try {
                const p = await getPassage(book.id, chapter, vId);
                if (p) results[vId] = p;
            } catch (e) {
                console.error(`Error loading version ${vId}:`, e);
            }
        }

        setPassages(results);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <Columns className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold">Comparador de Versiones</h2>
                            <p className="text-xs text-muted-foreground">{book?.name} {chapter}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted p-1 rounded-lg mr-4">
                            {BIBLE_VERSIONS.slice(0, 4).map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => {
                                        if (selectedVersions.includes(v.id)) {
                                            if (selectedVersions.length > 1) setSelectedVersions(prev => prev.filter(id => id !== v.id));
                                        } else {
                                            if (selectedVersions.length < 3) setSelectedVersions(prev => [...prev, v.id]);
                                        }
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${selectedVersions.includes(v.id)
                                            ? 'bg-background shadow-sm text-foreground font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {v.shortName}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="flex-1 flex overflow-hidden">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground font-serif italic">Sincronizando traducciones sagradas...</p>
                            </div>
                        </div>
                    ) : (
                        <div className={`flex-1 grid grid-cols-1 md:grid-cols-${selectedVersions.length} divide-x divide-border overflow-hidden`}>
                            {selectedVersions.map(vId => (
                                <div key={vId} className="flex flex-col h-full bg-card/50">
                                    <div className="p-3 border-b border-border bg-muted/20 text-center">
                                        <span className="text-xs font-bold tracking-widest uppercase text-primary">
                                            {BIBLE_VERSIONS.find(v => v.id === vId)?.name}
                                        </span>
                                    </div>
                                    <ScrollArea className="flex-1 p-6">
                                        <div className="space-y-6 max-w-prose mx-auto">
                                            {passages[vId]?.verses.map((v, i) => (
                                                <div key={i} className="group relative">
                                                    <sup className="absolute -left-5 top-1 text-[10px] font-bold text-primary/40 group-hover:text-primary transition-colors">
                                                        {v.verse}
                                                    </sup>
                                                    <p className="text-base leading-relaxed font-serif text-foreground/90 first-letter:text-xl first-letter:font-bold">
                                                        {v.text.replace(/<[^>]*>/g, '')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
