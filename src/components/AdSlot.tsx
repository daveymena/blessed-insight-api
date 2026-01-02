import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/context/SubscriptionContext';

interface AdSlotProps {
    className?: string;
    variant?: 'banner' | 'box' | 'inline';
    label?: string;
}

export function AdSlot({ className, variant = 'banner', label = 'Publicidad' }: AdSlotProps) {
    const [isVisible, setIsVisible] = useState(true);
    const { isPremium } = useSubscription();

    // Si es premium, ocultamos todos los anuncios automáticamente
    if (isPremium || !isVisible) return null;

    return (
        <div className={cn(
            "relative overflow-hidden bg-muted/30 border border-border/50 rounded-xl flex items-center justify-center transition-all",
            variant === 'banner' && "w-full h-[100px] md:h-[90px]",
            variant === 'box' && "w-full aspect-square md:aspect-video h-auto",
            variant === 'inline' && "w-full h-[250px]",
            className
        )}>
            {/* Etiqueta Discreta */}
            <span className="absolute top-1 right-2 text-[9px] uppercase tracking-wider text-muted-foreground/40 font-medium">
                {label}
            </span>

            {/* Placeholder del Anuncio (Aquí se inyectaría el script del proveedor) */}
            <div className="text-center opacity-30">
                <p className="text-xs font-serif italic text-muted-foreground">Espacio Patrocinado</p>
            </div>

            {/* Botón de cierre opcional (dependiendo de la red de anuncios) */}
            {/* <button 
        onClick={() => setIsVisible(false)} 
        className="absolute top-1 left-1 p-1 opacity-0 hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button> */}
        </div>
    );
}
