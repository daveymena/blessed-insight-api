import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Palette, Image as ImageIcon, Type, AlignLeft, Check } from "lucide-react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { BIBLE_THEMES } from "@/lib/themeConfig";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
    const { settings, activeTheme, updateTheme, updateSettings } = useThemeSettings();

    const scenicThemes = BIBLE_THEMES.filter(t => t.type === 'scenic');
    const textureThemes = BIBLE_THEMES.filter(t => t.type === 'texture');
    const solidThemes = BIBLE_THEMES.filter(t => t.type === 'solid');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                <div className="bg-primary/5 p-6 border-b border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif">Personalizar Experiencia</DialogTitle>
                        <DialogDescription>
                            Elige el entorno perfecto para tu estudio de la Palabra.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="max-h-[80vh] px-6 py-4">
                    <div className="space-y-8 pb-6">

                        {/* Selección de Fondo/Tema */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Ambiente Galería</Label>
                            </div>

                            <Tabs defaultValue="scenic" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="scenic">Paisajes</TabsTrigger>
                                    <TabsTrigger value="solid">Básicos</TabsTrigger>
                                    <TabsTrigger value="texture">Papel</TabsTrigger>
                                </TabsList>

                                <TabsContent value="scenic" className="grid grid-cols-2 gap-3">
                                    {scenicThemes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateTheme(theme.id)}
                                            className={cn(
                                                "relative h-28 rounded-2xl overflow-hidden border-2 transition-all group",
                                                activeTheme.id === theme.id ? "border-primary ring-4 ring-primary/20 scale-[1.02]" : "border-transparent hover:border-primary/40"
                                            )}
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${theme.background})` }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                            <div className="absolute bottom-3 left-3 text-white text-left">
                                                <p className="font-bold text-xs uppercase tracking-widest drop-shadow-md">{theme.name}</p>
                                            </div>
                                            {activeTheme.id === theme.id && (
                                                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </TabsContent>

                                <TabsContent value="solid" className="grid grid-cols-3 gap-3">
                                    {solidThemes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateTheme(theme.id)}
                                            className={cn(
                                                "relative h-20 rounded-xl border-2 transition-all p-3 flex flex-col justify-end",
                                                activeTheme.id === theme.id ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/30"
                                            )}
                                            style={{ backgroundColor: theme.background }}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: theme.textColor }}>
                                                {theme.name}
                                            </span>
                                            {activeTheme.id === theme.id && (
                                                <Check className="absolute top-2 right-2 h-3 w-3" style={{ color: theme.accentColor }} />
                                            )}
                                        </button>
                                    ))}
                                </TabsContent>

                                <TabsContent value="texture" className="grid grid-cols-2 gap-3">
                                    {textureThemes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateTheme(theme.id)}
                                            className={cn(
                                                "relative h-20 rounded-xl border-2 transition-all overflow-hidden",
                                                activeTheme.id === theme.id ? "border-primary" : "border-border"
                                            )}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-40 bg-repeat"
                                                style={{ backgroundImage: `url(${theme.background})`, backgroundSize: '100px' }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                                <span className="font-bold text-xs" style={{ color: theme.textColor }}>{theme.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Ajustes de Lectura */}
                        <div className="space-y-5 bg-muted/30 p-5 rounded-3xl border border-border/50">
                            <div className="flex items-center gap-2">
                                <Type className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Legibilidad</Label>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Tamaño de Fuente</Label>
                                        <span className="text-primary font-bold">{settings.fontSize}px</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="sm" onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}>A-</Button>
                                        <Slider
                                            value={[settings.fontSize]}
                                            onValueChange={(v) => updateSettings({ fontSize: v[0] })}
                                            min={12}
                                            max={48}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => updateSettings({ fontSize: Math.min(64, settings.fontSize + 1) })}>A+</Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Espaciado</Label>
                                        <span className="text-primary font-bold">{settings.lineHeight}</span>
                                    </div>
                                    <Slider
                                        value={[settings.lineHeight]}
                                        onValueChange={(v) => updateSettings({ lineHeight: v[0] })}
                                        min={1.2}
                                        max={3}
                                        step={0.1}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fuente */}
                        <div className="space-y-3">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold px-1">Tipografía</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['serif', 'sans'].map((f) => (
                                    <Button
                                        key={f}
                                        variant={settings.font === f ? "default" : "outline"}
                                        onClick={() => updateSettings({ font: f })}
                                        className={cn("rounded-2xl h-12", f === 'serif' ? 'font-serif' : 'font-sans')}
                                    >
                                        {f === 'serif' ? 'Serif (Clásica)' : 'Sans (Moderna)'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
                    <Button onClick={onClose} className="rounded-xl px-8">Guardar Ajustes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
