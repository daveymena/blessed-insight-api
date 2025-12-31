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
    'nature-sunset': 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900 via-slate-900 to-slate-950',
    'deep-river': 'bg-gradient-to-t from-cyan-900 via-blue-950 to-slate-950',
};

export function BackgroundLayer({ className }: BackgroundLayerProps) {
    const { settings } = useThemeSettings();
    const activeBackground = settings.background;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(
            activeBackground !== 'none' &&
            (activeBackground in BACKGROUNDS || activeBackground in CSS_BACKGROUNDS)
        );
    }, [activeBackground]);

    if (!isVisible) return null;

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
