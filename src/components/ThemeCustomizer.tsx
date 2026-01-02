import { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Image as ImageIcon, Type, AlignLeft, Moon, Sun, Languages } from "lucide-react";

interface ThemeCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: "light", name: "Día", color: "bg-white border-2" },
    { id: "dark", name: "Noche", color: "bg-slate-950 border-2" },
    { id: "sepia", name: "Sepia", color: "bg-[#f4ecd8] border-2 border-[#5b4636]" },
    { id: "navy", name: "Abisal", color: "bg-[#0a192f] border-2 border-blue-400" },
    { id: "slate", name: "Moderno", color: "bg-slate-100 border-2 border-slate-800" },
];

const BACKGROUNDS = [
    { id: "none", name: "Liso" },
    { id: "pure-white", name: "Blanco Puro" },
    { id: "misty-mountains", name: "Montañas" },
    { id: "calm-ocean", name: "Océano" },
    { id: "warm-clouds", name: "Cielos" },
    { id: "nature-sunset", name: "Atardecer" },
    { id: "deep-river", name: "Río Profundo" }, // Nuevo
    { id: "paper", name: "Papel" },
    { id: "soft-cream", name: "Crema" },
    { id: "elegant-gray", name: "Gris Soft" },
];

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
    const [settings, setSettings] = useState({
        theme: "light",
        background: "none",
        fontSize: 18,
        lineHeight: 2,
        font: "serif",
        darkMode: false,
        spanishEquivalent: false,
        textColor: "auto"
    });

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem("bible_theme_settings");
            const darkSaved = localStorage.getItem("bible_darkMode");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings(prev => ({
                        ...prev,
                        ...parsed,
                        darkMode: darkSaved ? JSON.parse(darkSaved) : false
                    }));
                } catch (e) { }
            }
        }
    }, [isOpen]);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (key === "theme") {
            const html = document.documentElement;
            html.classList.remove("dark", "theme-sepia", "theme-navy", "theme-slate");
            if (value === "dark") {
                html.classList.add("dark");
                localStorage.setItem("bible_darkMode", "true");
            } else {
                localStorage.setItem("bible_darkMode", "false");
                if (value !== "light") html.classList.add(`theme-${value}`);
            }
        }

        if (key === "darkMode") {
            const html = document.documentElement;
            if (value) html.classList.add("dark");
            else html.classList.remove("dark");
            localStorage.setItem("bible_darkMode", JSON.stringify(value));
        }

        if (key === "background") {
            const body = document.body;
            body.classList.remove("bg-pattern-dots", "bg-pattern-paper");
            if (value !== "none") body.classList.add(`bg-pattern-${value}`);
        }

        localStorage.setItem("bible_theme_settings", JSON.stringify(newSettings));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('theme-change'));
    };

    const adjustFontSize = (delta: number) => {
        const newSize = Math.max(14, Math.min(60, settings.fontSize + delta));
        updateSetting("fontSize", newSize);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif">Ajustes de Lectura</DialogTitle>
                        <DialogDescription className="text-primary/70">
                            Personaliza tu encuentro con las Escrituras.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="max-h-[80vh] px-6 py-4">
                    <div className="space-y-8 pb-6">

                        {/* Preferencias Generales */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <AlignLeft className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Preferencias</Label>
                            </div>

                            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background rounded-lg shadow-sm">
                                            <Moon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label htmlFor="dark-mode" className="font-medium cursor-pointer">Modo Oscuro</Label>
                                            <span className="text-xs text-muted-foreground">Interfaz nocturna</span>
                                        </div>
                                    </div>
                                    <Switch
                                        id="dark-mode"
                                        checked={settings.darkMode}
                                        onCheckedChange={(v) => updateSetting("darkMode", v)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background rounded-lg shadow-sm">
                                            <Languages className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label htmlFor="spanish-equiv" className="font-medium cursor-pointer">Traducción RVR</Label>
                                            <span className="text-xs text-muted-foreground">Ver en español</span>
                                        </div>
                                    </div>
                                    <Switch
                                        id="spanish-equiv"
                                        checked={settings.spanishEquivalent}
                                        onCheckedChange={(v) => updateSetting("spanishEquivalent", v)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Galería de Temas Visuales */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Galería de Temas</Label>
                            </div>

                            <Tabs defaultValue="soft" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="soft">Suaves</TabsTrigger>
                                    <TabsTrigger value="scenic">Paisajes</TabsTrigger>
                                    <TabsTrigger value="classic">Clásicos</TabsTrigger>
                                </TabsList>

                                <TabsContent value="soft" className="space-y-4">
                                    <p className="text-xs text-muted-foreground mb-2">Paletas pastel para lectura relajada.</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'soft-cream', name: 'Crema', color: '#fdfbf7', text: '#4a4a4a' },
                                            { id: 'vanilla-bean', name: 'Vainilla', color: '#f3e5ab', text: '#5c4033' },
                                            { id: 'almond-milk', name: 'Almendra', color: '#eaddcf', text: '#5d4037' },
                                            { id: 'pale-rose', name: 'Rosa', color: '#ffeef2', text: '#880e4f' },
                                            { id: 'soft-lilac', name: 'Lila', color: '#e6e6fa', text: '#4a148c' },
                                            { id: 'sky-blue', name: 'Cielo', color: '#e0ffff', text: '#01579b' },
                                            { id: 'mint-breeze', name: 'Menta', color: '#f5fffa', text: '#1b5e20' },
                                            { id: 'sage-green', name: 'Salvia', color: '#dce3d5', text: '#33691e' },
                                            { id: 'cloud-white', name: 'Nube', color: '#f5f5f5', text: '#212121' },
                                            { id: 'pearl-gradient', name: 'Perla', color: 'linear-gradient(to bottom right, #fdfbf7, #f5f5f5)', text: '#333' },
                                            { id: 'dawn-gradient', name: 'Alba', color: 'linear-gradient(to bottom right, #fff0f5, #e6e6fa)', text: '#4a148c' },
                                            { id: 'champagne', name: 'Champán', color: '#f7e7ce', text: '#3e2723' },
                                            { id: 'arctic-ice', name: 'Hielo', color: '#eafcfc', text: '#006064' },
                                            { id: 'matcha-latte', name: 'Matcha', color: '#d5ecd4', text: '#1b5e20' },
                                            { id: 'periwinkle', name: 'Bígaro', color: '#ccccff', text: '#311b92' },
                                        ].map((theme) => (
                                            <button
                                                key={theme.id}
                                                onClick={() => {
                                                    updateSetting("background", theme.id);
                                                    updateSetting("darkMode", false);
                                                    updateSetting("textColor", theme.text);
                                                    updateSetting("theme", "light");
                                                }}
                                                className={`
                                                    relative h-16 rounded-lg border transition-all duration-200 overflow-hidden text-center flex items-center justify-center p-1
                                                    ${settings.background === theme.id ? 'border-primary ring-2 ring-primary/20 scale-[1.05]' : 'border-border hover:border-primary/50'}
                                                `}
                                                style={{ background: theme.color }}
                                            >
                                                <span className="font-medium text-[10px]" style={{ color: theme.text }}>{theme.name}</span>
                                                {settings.background === theme.id && (
                                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="scenic">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'nature-sunset', name: 'Atardecer', bgClass: 'bg-gradient-to-tr from-orange-900 to-slate-900' },
                                            { id: 'deep-ocean', name: 'Océano', bgClass: 'bg-gradient-to-br from-blue-900 to-slate-950' },
                                            { id: 'misty-forest', name: 'Bosque', bgClass: 'bg-gradient-to-br from-emerald-900 to-slate-950' },
                                            { id: 'northern-lights', name: 'Aurora', bgClass: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900' },
                                            { id: 'desert-dusk', name: 'Desierto', bgClass: 'bg-gradient-to-tr from-orange-900 via-rose-900 to-slate-900' },
                                            { id: 'royal-gold', name: 'Real', bgClass: 'bg-gradient-to-b from-amber-950 to-black' },
                                        ].map((theme) => (
                                            <button
                                                key={theme.id}
                                                onClick={() => {
                                                    updateSetting("background", theme.id);
                                                    updateSetting("darkMode", true);
                                                    updateSetting("textColor", "#ffffff");
                                                    updateSetting("theme", "dark");
                                                }}
                                                className={`
                                                    relative h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left p-3 flex flex-col justify-end text-white
                                                    ${settings.background === theme.id ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-transparent hover:border-muted/50'}
                                                    ${theme.bgClass}
                                                `}
                                            >
                                                <span className="relative z-10 font-bold text-sm shadow-black drop-shadow-md">{theme.name}</span>
                                                {settings.background === theme.id && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="classic">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'clean-white', name: 'Minimalista', type: 'light', class: 'bg-white border text-slate-900', textColor: '#000000', dark: false },
                                            { id: 'soft-paper', name: 'Papel Antiguo', type: 'sepia', class: 'bg-[#f4f1ea] text-amber-900', textColor: '#5b4636', dark: false },
                                            { id: 'modern-slate', name: 'Pizarra', type: 'dark', class: 'bg-slate-900 text-slate-200', textColor: '#e2e8f0', dark: true },
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => {
                                                    updateSetting("background", theme.id);
                                                    updateSetting("darkMode", theme.dark);
                                                    updateSetting("textColor", theme.textColor);
                                                    updateSetting("theme", theme.type);
                                                }}
                                                className={`
                                                    relative h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left p-3 flex flex-col justify-end
                                                    ${settings.background === theme.id ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-transparent hover:border-muted/50'}
                                                    ${theme.class}
                                                `}
                                            >
                                                <span className="relative z-10 font-bold text-sm">{theme.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Separador */}
                        <div className="h-px bg-border/50" />

                        {/* Tamaño y Lectura */}
                        <div className="space-y-5 bg-muted/30 p-4 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Type className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Tamaño de Texto</Label>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-2"
                                    onClick={() => adjustFontSize(-2)}
                                >
                                    <span className="text-lg font-bold">A-</span>
                                </Button>

                                <div className="flex-1 text-center">
                                    <div className="text-3xl font-serif font-bold text-primary">{settings.fontSize}</div>
                                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground">Píxeles</div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-2"
                                    onClick={() => adjustFontSize(2)}
                                >
                                    <span className="text-xl font-bold">A+</span>
                                </Button>
                            </div>

                            <div className="pt-2">
                                <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                                    <AlignLeft className="h-4 w-4" /> Interlineado (Espacio)
                                </Label>
                                <Slider
                                    value={[settings.lineHeight]}
                                    onValueChange={(v) => updateSetting("lineHeight", v[0])}
                                    min={1.2}
                                    max={3.0}
                                    step={0.1}
                                    className="py-4"
                                />
                            </div>
                        </div>

                        {/* Color de Texto Personalizado (Opcional) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Ajuste Manual de Color</Label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: "auto", name: "Auto", class: "bg-gradient-to-tr from-slate-200 to-slate-800 border" },
                                    { id: "#000000", name: "Negro", class: "bg-black" },
                                    { id: "#ffffff", name: "Blanco", class: "bg-white border" },
                                    { id: "#5b4636", name: "Sepia", class: "bg-[#5b4636]" },
                                ].map((color) => (
                                    <div
                                        key={color.id}
                                        onClick={() => updateSetting("textColor", color.id)}
                                        className={`
                                            cursor-pointer rounded-lg p-2 flex flex-col items-center gap-2 border-2 transition-all
                                            ${settings.textColor === color.id ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}
                                        `}
                                    >
                                        <div className={`w-6 h-6 rounded-full shadow-sm ${color.class}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent >
        </Dialog >
    );
}
