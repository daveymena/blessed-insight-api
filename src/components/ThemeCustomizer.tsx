import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

                        {/* Visual y Apariencia */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-primary" />
                                    <Label className="text-lg font-serif">Ambiente y Color</Label>
                                </div>
                            </div>

                            <RadioGroup
                                value={settings.theme}
                                onValueChange={(v) => updateSetting("theme", v)}
                                className="grid grid-cols-3 gap-3"
                            >
                                {THEMES.map((theme) => (
                                    <div key={theme.id}>
                                        <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`theme-${theme.id}`}
                                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary transition-all cursor-pointer h-20"
                                        >
                                            <div className={`w-8 h-8 rounded-full mb-1 ${theme.color} shadow-inner`} />
                                            <span className="text-[10px] font-medium opacity-80">{theme.name}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

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

                        {/* Color de Texto Personalizado */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Color de Letra</Label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: "auto", name: "Auto", class: "bg-gradient-to-tr from-slate-200 to-slate-800 border" },
                                    { id: "#000000", name: "Negro", class: "bg-black" },
                                    { id: "#334155", name: "Gris", class: "bg-slate-700" },
                                    { id: "#ffffff", name: "Blanco", class: "bg-white border" },
                                    { id: "#713f12", name: "Oro", class: "bg-yellow-900" },
                                    { id: "#1e3a8a", name: "Azul", class: "bg-blue-900" },
                                    { id: "#4c0519", name: "Vino", class: "bg-rose-950" },
                                    { id: "#14532d", name: "Verde", class: "bg-green-900" },
                                ].map((color) => (
                                    <div
                                        key={color.id}
                                        onClick={() => updateSetting("textColor", color.id)}
                                        className={`
                                            cursor-pointer rounded-lg p-2 flex flex-col items-center gap-2 border-2 transition-all
                                            ${settings.textColor === color.id ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-full shadow-sm ${color.class}`} />
                                        <span className="text-[10px] font-medium text-center">{color.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Opciones Avanzadas - Fondos Escénicos */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                <Label className="text-lg font-serif">Paisajes y Texturas</Label>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">Selecciona un fondo vivo para tu lectura.</p>
                            <div className="grid grid-cols-2 gap-2">
                                {BACKGROUNDS.map((bg) => (
                                    <Button
                                        key={bg.id}
                                        variant={settings.background === bg.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateSetting("background", bg.id)}
                                        className="h-auto py-2 flex flex-col items-start gap-1 text-left whitespace-normal h-full"
                                    >
                                        <span className="font-semibold">{bg.name}</span>
                                        {["misty-mountains", "calm-ocean", "nature-sunset", "warm-clouds"].includes(bg.id) && (
                                            <span className="text-[10px] opacity-70">Paisaje Natural</span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </DialogContent >
        </Dialog >
    );
}
