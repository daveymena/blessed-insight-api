import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BibleBook } from '@/lib/bibleApi';

interface VerseSelectorProps {
    bookName: string;
    chapter: number;
    onSelectVerse: (verse: number) => void;
    // En el futuro, podríamos pasar la cantidad real de versículos si la API lo provee
    verseCount?: number;
}

export function VerseSelector({ bookName, chapter, onSelectVerse, verseCount = 60 }: VerseSelectorProps) {
    // Generamos un array basado en el conteo estimado o real
    const verses = Array.from({ length: verseCount }, (_, i) => i + 1);

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border/10 bg-secondary/5 flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Selecciona un Versículo
                </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                    {verses.map((v, index) => (
                        <motion.button
                            key={v}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15, delay: Math.min(index * 0.005, 0.3) }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelectVerse(v)}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200",
                                "bg-card/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                            )}
                        >
                            {v}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
