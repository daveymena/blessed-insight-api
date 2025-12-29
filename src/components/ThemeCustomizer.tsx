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
import { Check, Moon, Sun, Palette, Image as ImageIcon } from "lucide-react";

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
    const [currentTheme, setCurrentTheme] = useState("light");
    const [currentBg, setCurrentBg] = useState("none");

    useEffect(() => {
        if (isOpen) {
            // Leer estado actual del DOM
            const html = document.documentElement;
            const body = document.body;

            // Detectar tema
            if (html.classList.contains("theme-sepia")) setCurrentTheme("sepia");
            else if (html.classList.contains("theme-navy")) setCurrentTheme("navy");
            else if (html.classList.contains("theme-slate")) setCurrentTheme("slate");
            else if (html.classList.contains("dark")) setCurrentTheme("dark");
            else setCurrentTheme("light");

            // Detectar fondo
            if (body.classList.contains("bg-pattern-dots")) setCurrentBg("dots");
            else if (body.classList.contains("bg-pattern-paper")) setCurrentBg("paper");
            else setCurrentBg("none");
        }
    }, [isOpen]);

    const applyTheme = (theme: string) => {
        setCurrentTheme(theme);
        const html = document.documentElement;

        // Resetear clases
        html.classList.remove("dark", "theme-sepia", "theme-navy", "theme-slate");

        if (theme === "dark") html.classList.add("dark");
        else if (theme !== "light") html.classList.add(`theme-${theme}`);

        // Persistir
        const settings = JSON.parse(localStorage.getItem("bible_theme_settings") || "{}");
        settings.theme = theme;
        localStorage.setItem("bible_theme_settings", JSON.stringify(settings));
    };

    const applyBackground = (bg: string) => {
        setCurrentBg(bg);
        const body = document.body;

        // Resetear fondos
        body.classList.remove("bg-pattern-dots", "bg-pattern-paper");

        if (bg !== "none") body.classList.add(`bg-pattern-${bg}`);

        // Persistir
        const settings = JSON.parse(localStorage.getItem("bible_theme_settings") || "{}");
        settings.background = bg;
        localStorage.setItem("bible_theme_settings", JSON.stringify(settings));
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

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">

                        {/* Selector de Tema */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-muted-foreground" />
                                <Label className="text-base font-semibold">Tema de Color</Label>
                            </div>
                            <RadioGroup value={currentTheme} onValueChange={applyTheme} className="grid grid-cols-2 gap-4">
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

                        {/* Selector de Fondo */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <Label className="text-base font-semibold">Fondo / Textura</Label>
                            </div>
                            <RadioGroup value={currentBg} onValueChange={applyBackground} className="grid grid-cols-3 gap-3">
                                {BACKGROUNDS.map((bg) => (
                                    <div key={bg.id}>
                                        <RadioGroupItem value={bg.id} id={`bg-${bg.id}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`bg-${bg.id}`}
                                            className="flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer h-20 transition-all"
                                        >
                                            {bg.id === "none" && <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />}
                                            {bg.id === "dots" && <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded mb-1 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />}
                                            {bg.id === "paper" && <div className="w-full h-full bg-[#f4ecd8] rounded mb-1 border" />}
                                            <span className="text-xs mt-2 font-medium">{bg.name}</span>
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
