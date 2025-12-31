import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, ChevronRight, Bookmark, ScrollText } from 'lucide-react';

interface WelcomeCoverProps {
    onEnter: () => void;
}

export function WelcomeCover({ onEnter }: WelcomeCoverProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
        >
            {/* Cinematic Background with Zoom Effect */}
            <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 20, ease: "linear" }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform ease-linear scale-110"
                style={{
                    backgroundImage: "url('/welcome-hero.png')",
                    transitionDuration: '10000ms'
                }}
            >
                {/* Layered Overlays for Luxury Feel */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 0.1, rotate: 0 }}
                transition={{ delay: 1, duration: 2 }}
                className="absolute top-10 left-10 text-white"
            >
                <ScrollText size={180} />
            </motion.div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary-foreground shadow-2xl">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                            Blessed Insight Premium
                        </span>
                    </div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-6xl md:text-8xl font-serif font-black text-white leading-tight drop-shadow-2xl">
                        EXPLORA LA <br />
                        <span className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">VERDAD ETERNA</span>
                    </h1>
                </motion.div>

                {/* Subtitle / Verse */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1.5 }}
                    className="max-w-2xl text-center mb-12"
                >
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-8" />
                    <p className="text-xl md:text-2xl text-white/80 font-serif italic leading-relaxed">
                        "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios."
                    </p>
                    <span className="block mt-4 text-xs font-bold tracking-widest text-primary uppercase">Juan 1:1</span>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    <Button
                        size="lg"
                        onClick={onEnter}
                        className="group relative h-20 px-12 text-2xl bg-white text-black hover:bg-white/95 transition-all duration-500 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-4 font-black">
                            INICIAR ESTUDIO
                            <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-2" />
                        </span>
                    </Button>

                    <div className="flex items-center gap-8 text-white/40">
                        <div className="flex items-center gap-2">
                            <Microscope className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-black tracking-widest">Exégesis IA</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-black tracking-widest">Multi-Versión</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-black tracking-widest">Audio Humano</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Subtle Vignette */}
            <div className="absolute inset-0 pointer-events-none ring-[100px] ring-inset ring-black/40" />
        </motion.div>
    );
}

import { Microscope, Languages, Volume2 } from 'lucide-react';
