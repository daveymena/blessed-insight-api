import { useEffect, useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/context/SubscriptionContext';

interface AdSlotProps {
    className?: string;
    variant?: 'banner' | 'box' | 'inline';
    label?: string;
    slotId?: string;
}

export const AdSlot = memo(({ className, variant = 'banner', label = 'Publicidad', slotId }: AdSlotProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const { isPremium } = useSubscription();

    useEffect(() => {
        // Intentar cargar anuncio si window.adsbygoogle existe
        if (!isPremium && isVisible) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense push error:", e);
            }
        }
    }, [isPremium, isVisible]);

    // Si es premium, ocultamos todos los anuncios automáticamente
    if (isPremium || !isVisible) return null;

    return (
        <div className={cn(
            "relative overflow-hidden bg-muted/20 border border-border/30 rounded-xl flex flex-col items-center justify-center transition-all min-h-[50px]",
            variant === 'banner' && "w-full min-h-[100px] md:min-h-[90px]",
            variant === 'box' && "w-full aspect-square md:aspect-video",
            variant === 'inline' && "w-full min-h-[250px]",
            className
        )}>
            {/* Etiqueta Discreta */}
            <span className="absolute top-1 right-2 text-[8px] uppercase tracking-widest text-muted-foreground/30 font-bold select-none">
                {label}
            </span>

            {/* Google AdSense Display Area */}
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Reemplazar con tu ID
                data-ad-slot={slotId || "0000000000"} // Reemplazar con tu ID de slot
                data-ad-format="auto"
                data-full-width-responsive="true">
            </ins>

            {/* Fallback visual si el anuncio no carga o en desarrollo */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10 pointer-events-none">
                <p className="text-[10px] font-sans uppercase tracking-[0.2em]">{label}</p>
            </div>
        </div>
    );
});
