import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
    type?: 'banner' | 'large-banner' | 'square' | 'inline';
    className?: string;
}

export function AdPlaceholder({ type = 'banner', className }: AdPlaceholderProps) {
    const heightClass = {
        'banner': 'h-24 md:h-20',
        'large-banner': 'h-32 md:h-48',
        'square': 'aspect-square max-w-[300px]',
        'inline': 'h-24 my-6',
    }[type];

    return (
        <div className={cn(
            "w-full bg-muted/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden group transition-all hover:bg-muted/40",
            heightClass,
            className
        )}>
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-medium uppercase tracking-wider">Publicidad</span>
                <Info className="h-3 w-3" />
            </div>

            <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                <div className="text-sm font-medium">Espacio Reservado para Anuncio</div>
                <div className="text-[10px]">Google AdSense / AdMob</div>
            </div>

            <div className="mt-2">
                <button className="text-[11px] text-primary/60 hover:text-primary underline font-medium">
                    Quitar anuncios con Premium
                </button>
            </div>

            {/* Subtle patterns to make it look less ugly */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
    );
}
