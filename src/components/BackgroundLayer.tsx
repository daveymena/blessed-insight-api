import { cn } from '@/lib/utils';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useEffect, useState } from 'react';

interface BackgroundLayerProps {
    className?: string;
}

const BACKGROUNDS: Record<string, string> = {
    'misty-mountains': '/images/landscape_misty_mountains.png',
    'calm-ocean': '/images/landscape_calm_ocean.png',
    'warm-clouds': '/images/landscape_warm_clouds.png',
};

const CSS_BACKGROUNDS: Record<string, string> = {
    // Originales de Naturaleza
    'nature-sunset': 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900 via-slate-900 to-slate-950',
    'deep-ocean': 'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950',
    'misty-forest': 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-emerald-900 via-slate-900 to-slate-950',
    'northern-lights': 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
    'desert-dusk': 'bg-gradient-to-tr from-orange-900 via-rose-900 to-slate-900',
    'royal-gold': 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-950 to-slate-950',

    // --- NUEVAS PALETAS SUAVES (20 Opciones) ---
    // Tonos Cálidos y Crema
    'soft-cream': 'bg-[#fdfbf7]',  // Crema muy suave
    'vanilla-bean': 'bg-[#f3e5ab]', // Vainilla clásico
    'almond-milk': 'bg-[#eaddcf]',  // Almendra
    'champagne': 'bg-[#f7e7ce]',    // Champán
    'sandstone': 'bg-[#e6ddc5]',    // Arena suave
    'buttercup': 'bg-[#fdfdc4]',    // Amarillo muy pálido
    'creamy-peach': 'bg-[#f8dcd4]', // Melocotón suave

    // Tonos Rosas y Lilas
    'pale-rose': 'bg-[#ffeef2]',    // Rosa pálido
    'blush-pink': 'bg-[#fddde6]',   // Rosa rubor
    'soft-lilac': 'bg-[#e6e6fa]',   // Lila suave
    'lavender-mist': 'bg-[#e3dfff]', // Niebla lavanda
    'periwinkle': 'bg-[#ccccff]',   // Bígaro suave

    // Tonos Azules y Frescos
    'sky-blue': 'bg-[#e0ffff]',     // Azul cielo
    'baby-blue': 'bg-[#d9efff]',    // Azul bebé
    'arctic-ice': 'bg-[#eafcfc]',   // Hielo ártico (casi blanco cyan)
    'morning-dew': 'bg-[#f0f8ff]',  // Rocío (AliceBlue)
    'cloud-white': 'bg-[#f5f5f5]',  // Blanco nube (gris muy claro)

    // Tonos Verdes y Tierra Suaves
    'mint-breeze': 'bg-[#f5fffa]',  // Menta muy suave
    'matcha-latte': 'bg-[#d5ecd4]', // Matcha claro
    'sage-green': 'bg-[#dce3d5]',   // Verde salvia
    'dusty-miller': 'bg-[#dcdcdc]', // Gris verdoso

    // Abstractos Suaves (Gradientes Ligeros)
    'pearl-gradient': 'bg-gradient-to-br from-[#fdfbf7] to-[#f5f5f5]',
    'dawn-gradient': 'bg-gradient-to-br from-[#fff0f5] to-[#e6e6fa]',
};

export function BackgroundLayer({ className }: BackgroundLayerProps) {
    const { settings } = useThemeSettings();
    const activeBackground = settings.background;
    const shouldRender = activeBackground !== 'none' &&
        (activeBackground in BACKGROUNDS || activeBackground in CSS_BACKGROUNDS);

    if (!shouldRender) return null;

    if (activeBackground in CSS_BACKGROUNDS) {
        return (
            <div className={cn("fixed inset-0 z-0 overflow-hidden pointer-events-none", className)}>
                <div
                    key={activeBackground + '-css'}
                    className={cn(
                        "absolute inset-0 w-full h-full animate-in fade-in duration-1000",
                        CSS_BACKGROUNDS[activeBackground]
                    )}
                >
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("fixed inset-0 z-0 overflow-hidden pointer-events-none", className)}>
            <div
                key={activeBackground}
                className="absolute inset-0 w-full h-full animate-ken-burns bg-cover bg-center"
                style={{ backgroundImage: `url(${BACKGROUNDS[activeBackground]})` }}
            >
                <div className="absolute inset-0 bg-background/20 dark:bg-black/30 backdrop-blur-[0.5px]" />
            </div>
        </div>
    );
}
