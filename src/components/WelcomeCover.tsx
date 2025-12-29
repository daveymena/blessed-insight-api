import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeCoverProps {
    onEnter: () => void;
}

export function WelcomeCover({ onEnter }: WelcomeCoverProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Pequeño delay para que la transición de entrada se note
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setIsExiting(true);
        // Esperar a que la animación de salida termine
        setTimeout(onEnter, 800);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Fondo con imagen Hero */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear scale-110"
                style={{
                    backgroundImage: "url('/welcome-hero.png')",
                    transform: isVisible && !isExiting ? 'scale(1)' : 'scale(1.1)'
                }}
            >
                {/* Overlays para profundidad y legibilidad */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Contenido Central */}
            <div
                className={`relative z-10 text-center px-6 max-w-3xl transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
            >
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary-foreground text-sm font-medium mb-4 animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        <span>Blessed Insight AI</span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">
                    Biblia de Estudio
                </h1>

                <p className="text-xl md:text-2xl text-white/90 font-serif italic mb-10 leading-relaxed max-w-2xl mx-auto">
                    "Tu palabra es una lámpara a mis pies y una luz en mi camino."
                    <span className="block not-italic text-sm mt-2 opacity-70">— Salmos 119:105</span>
                </p>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        size="lg"
                        onClick={handleStart}
                        className="group relative h-16 px-10 text-xl bg-white text-black hover:bg-white/90 transition-all duration-300 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Comenzar Experiencia
                            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>

                    <p className="text-white/40 text-xs font-sans tracking-widest uppercase mt-4">
                        Explora las escrituras con Inteligencia Artificial
                    </p>
                </div>
            </div>

            {/* Ornamentos visuales */}
            <div className="absolute bottom-10 left-10 hidden md:block">
                <BookOpen className="text-white/10 h-32 w-32" />
            </div>
        </div>
    );
}
