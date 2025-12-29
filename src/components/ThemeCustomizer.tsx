import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Palette, Image as ImageIcon, Type, AlignLeft } from "lucide-react";

interface ThemeCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: "light", name: "Claro (Sistema)", color: "bg-white border-2" },
    { id: "dark", name: "Oscuro", color: "bg-slate-950 border-2" },
    { id: "sepia", name: "Lectura (Sepia)", color: "bg-[#f4ecd8] border-2 border-[#5b4636]" },
    { id: "navy", name: "Royal Navy", color: "bg-[#0a192f] border-2 border-blue-400" },
    { id: "slate", name: "Slate Modern", color: "bg-slate-100 border-2 border-slate-800" },
];

const BACKGROUNDS = [
    { id: "none", name: "Sólido (Default)" },
    { id: "dots", name: "Puntos Sutiles" },
    { id: "paper", name: "Papel Texturizado" },
];

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
    const [settings, setSettings] = useState({
        theme: "light",
        background: "none",
        fontSize: 18,
        lineHeight: 2,
        font: "serif"
    });

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem("bible_theme_settings");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings(prev => ({ ...prev, ...parsed }));
                } catch (e) { }
            }
        }
    }, [isOpen]);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        // Aplicar tema si es la clave de tema
        if (key === "theme") {
            const html = document.documentElement;
            html.classList.remove("dark", "theme-sepia", "theme-navy", "theme-slate");
            if (value === "dark") html.classList.add("dark");
            else if (value !== "light") html.classList.add(`theme-${value}`);
        }

        // Aplicar fondo si es la clave de fondo
        if (key === "background") {
            const body = document.body;
            body.classList.remove("bg-pattern-dots", "bg-pattern-paper");
            if (value !== "none") body.classList.add(`bg-pattern-${value}`);
        }

        localStorage.setItem("bible_theme_settings", JSON.stringify(newSettings));

        // Dispatch event to notify Other components (ScriptureReader)
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Personalizar Experiencia</DialogTitle>
                    <DialogDescription>
                        Elige el ambiente perfecto para tu estudio.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6 py-2">

                        {/* Selector de Tema */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-primary" />
                                <Label className="text-base font-semibold">Tema de Color</Label>
                            </div>
                            <RadioGroup value={settings.theme} onValueChange={(v) => updateSetting("theme", v)} className="grid grid-cols-2 gap-4">
                                {THEMES.map((theme) => (
                                    <div key={theme.id}>
                                        <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`theme-${theme.id}`}
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <div className={`w-full h-12 rounded-md mb-3 ${theme.color} shadow-sm`} />
                                            <span className="font-medium">{theme.name}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="w-full border-t my-4" />

                        {/* Tipografía y Tamaño (Separación de texto) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                <Label className="text-base font-semibold">Tipografía y Lectura</Label>
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Type className="h-3 w-3" /> Tamaño de letra
                                    </span>
                                    <span className="font-medium">{settings.fontSize}px</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    onValueChange={(v) => updateSetting("fontSize", v[0])}
                                    min={14}
                                    max={32}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <AlignLeft className="h-3 w-3" /> Separación (Interlineado)
                                    </span>
                                    <span className="font-medium">{settings.lineHeight.toFixed(1)}x</span>
                                </div>
                                <Slider
                                    value={[settings.lineHeight]}
                                    onValueChange={(v) => updateSetting("lineHeight", v[0])}
                                    min={1.2}
                                    max={3.0}
                                    step={0.1}
                                />
                            </div>
                        </div>

                        <div className="w-full border-t my-4" />

                        {/* Selector de Fondo */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                <Label className="text-base font-semibold">Fondo / Textura</Label>
                            </div>
                            <RadioGroup value={settings.background} onValueChange={(v) => updateSetting("background", v)} className="grid grid-cols-3 gap-3">
                                {BACKGROUNDS.map((bg) => (
                                    <div key={bg.id}>
                                        <RadioGroupItem value={bg.id} id={`bg-${bg.id}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`bg-${bg.id}`}
                                            className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer h-20 transition-all font-medium"
                                        >
                                            {bg.id === "none" && <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />}
                                            {bg.id === "dots" && <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded mb-1 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />}
                                            {bg.id === "paper" && <div className="w-full h-full bg-[#f4ecd8] rounded mb-1 border" />}
                                            <span className="text-xs mt-auto">{bg.name}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
