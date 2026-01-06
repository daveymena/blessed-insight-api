import { useThemeSettings } from '@/hooks/useThemeSettings';
import { cn } from '@/lib/utils';

export function BackgroundLayer() {
    const { activeTheme } = useThemeSettings();

    if (!activeTheme) return null;

    const isDarkMode = activeTheme.uiMode === 'dark';

    // Para paisajes (SCENIC) - AHORA GLOBAL PARA OCUPAR TODO EL CONTENIDO
    if (activeTheme.type === 'scenic') {
        return (
            <div className="absolute inset-0 z-0 overflow-hidden bg-background">
                {/* Imagen Real de fondo que ocupa toda la aplicación */}
                <div
                    className="absolute inset-0 animate-ken-burns bg-cover bg-center scale-110"
                    style={{
                        backgroundImage: `url(${activeTheme.background})`,
                        filter: `blur(${activeTheme.blurAmount})`
                    }}
                />

                {/* Baño de Luz o Sombra según el modo del tema para garantir contraste */}
                <div
                    className={cn(
                        "absolute inset-0 transition-all duration-1000",
                        isDarkMode ? "bg-black" : "bg-white"
                    )}
                    style={{ opacity: activeTheme.overlayOpacity }}
                />
            </div>
        );
    }

    // Para SÓLIDOS
    if (activeTheme.type === 'solid') {
        return (
            <div
                className="absolute inset-0 transition-colors duration-1000"
                style={{ backgroundColor: activeTheme.background }}
            />
        );
    }

    // Para TEXTURAS
    if (activeTheme.type === 'texture') {
        const textureBg = isDarkMode ? '#050505' : '#ffffff';
        return (
            <div
                className="absolute inset-0 transition-colors duration-1000"
                style={{ backgroundColor: textureBg }}
            >
                <div
                    className="absolute inset-0 opacity-20 bg-repeat"
                    style={{ backgroundImage: `url(${activeTheme.background})`, backgroundSize: '200px' }}
                />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: activeTheme.accentColor }}
                />
            </div>
        );
    }

    return null;
}
