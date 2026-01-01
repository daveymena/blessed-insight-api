import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FormattedAIResponse({ content }: { content: string }) {
    if (!content) return null;

    // Detectar si hay headers o estructura numérica (1. Título)
    const hasMarkdownHeaders = content.includes('##') || content.includes('###') || content.match(/^\d+\./m);

    if (!hasMarkdownHeaders && !content.includes('\n\n')) {
        return (
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90 animate-in fade-in duration-500 font-serif">
                <p dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-bold">$1</strong>') }} />
            </div>
        );
    }

    // Split robusto por headers markdown, números con punto (1.) o emojis al inicio
    const rawSections = content.split(/(?=\n#{2,3}\s|\n\d+\.\s|\n[\p{Emoji}]{1,2}\s)/u).filter(Boolean);
    const sections = rawSections.length > 1 ? rawSections : content.split(/\n\n+/).filter(Boolean);

    // Mapeo Visual: Iconos y Colores según el título
    const getSectionStyle = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('contexto')) return { bg: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-l-amber-500', icon: '📜', titleColor: 'text-amber-700 dark:text-amber-400' };
        if (t.includes('significado') || t.includes('clave')) return { bg: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-l-blue-500', icon: '🔍', titleColor: 'text-blue-700 dark:text-blue-400' };
        if (t.includes('enseñanza') || t.includes('práctica')) return { bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-l-emerald-500', icon: '💡', titleColor: 'text-emerald-700 dark:text-emerald-400' };
        if (t.includes('oración') || t.includes('respuesta')) return { bg: 'bg-violet-50/50 dark:bg-violet-950/20', border: 'border-l-violet-500', icon: '🙏', titleColor: 'text-violet-700 dark:text-violet-400' };
        return { bg: 'bg-card/40 backdrop-blur-sm', border: 'border-l-indigo-500', icon: '✨', titleColor: 'text-foreground' };
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
            {sections.map((section, idx) => {
                const cleanSection = section.trim();
                const lines = cleanSection.split('\n');
                const firstLine = lines[0].trim();
                let title = "";
                let body = cleanSection;

                // Extraer título limpio
                if (firstLine.match(/^(#|\d+\.|[\p{Emoji}])/u) && firstLine.length < 80) {
                    title = firstLine.replace(/^[#\d\.\s]+/, '').replace(/^[\p{Emoji}\s]+/u, '').replace(/\*\*/g, '').trim();
                    body = lines.slice(1).join('\n');
                }

                const style = getSectionStyle(title || cleanSection.substring(0, 20));

                if (!title) {
                    return (
                        <Card key={idx} className="border-none shadow-sm bg-muted/20">
                            <CardContent className="p-4">
                                <p className="text-base leading-relaxed opacity-90 font-serif" dangerouslySetInnerHTML={{ __html: cleanSection }} />
                            </CardContent>
                        </Card>
                    );
                }

                return (
                    <Card key={idx} className={cn("overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all", style.border, style.bg)}>
                        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                            <span className="text-2xl filter drop-shadow-sm">{style.icon}</span>
                            <h3 className={cn("text-lg font-bold tracking-tight font-serif", style.titleColor)}>
                                {title}
                            </h3>
                        </div>

                        <CardContent className="p-5 space-y-4">
                            {body.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                // Subtítulos
                                if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
                                    return <h4 key={i} className="text-sm font-bold opacity-80 mt-2 uppercase tracking-wide">{trimmed.replace(/^[#\s]+|\*\*/g, '')}</h4>;
                                }

                                // Listas
                                if (trimmed.match(/^[-•]|\d+\./)) {
                                    return (
                                        <div key={i} className="flex gap-3 items-start pl-1">
                                            <span className={cn("mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-60", style.titleColor)} />
                                            <p className="text-base leading-relaxed opacity-90 font-sans" dangerouslySetInnerHTML={{ __html: trimmed.replace(/^[-•\d\.]+\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </div>
                                    );
                                }

                                return (
                                    <p key={i} className="text-base leading-relaxed opacity-90 font-sans"
                                        dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    />
                                );
                            })}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
