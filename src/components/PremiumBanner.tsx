import { Crown, Zap, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PremiumBannerProps {
    onClose?: () => void;
}

export function PremiumBanner({ onClose }: PremiumBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-xl animate-fade-in">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-white/20">
                        <Crown className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                    </div>
                    <span className="font-bold text-lg">Eleva tu Estudio a Premium</span>
                    {onClose && (
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                onClose();
                            }}
                            className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <p className="text-white/90 text-sm mb-6 leading-relaxed">
                    Libera todo el poder de nuestras herramientas de estudio avanzada, elimina anuncios y accede a recursos exclusivos para profundizar en la Palabra.
                </p>

                <div className="space-y-3 mb-6">
                    <FeatureItem icon={<Zap className="h-4 w-4" />} text="Analítica Bíblica Ilimitada" />
                    <FeatureItem icon={<Sparkles className="h-4 w-4" />} text="Sin anuncios en toda la app" />
                    <FeatureItem icon={<Crown className="h-4 w-4" />} text="Temas y Escenarios exclusivos" />
                </div>

                <Button className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg py-6 rounded-xl">
                    ¡Mejorar Ahora!
                </Button>
                <p className="text-center text-[10px] mt-4 text-white/70 italic">
                    Solo $4.99/mes - Cancela cuando quieras
                </p>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
        </div>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm font-medium">
            <div className="text-white/80">{icon}</div>
            <span>{text}</span>
        </div>
    );
}
