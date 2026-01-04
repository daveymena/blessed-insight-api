import { cn } from '@/lib/utils';

export function FormattedAIResponse({ content }: { content: string }) {
    if (!content) return null;

    // Detectar si tiene estructura de secciones
    const hasMarkdownHeaders = content.includes('##') || content.includes('###') || content.match(/^\d+\./m);

    // Respuesta simple sin secciones
    if (!hasMarkdownHeaders && !content.includes('\n\n')) {
        return (
            <div className="scripture-response space-y-6 animate-in fade-in duration-500">
                <p 
                    className="text-lg leading-[2.2] tracking-wide text-foreground/90"
                    dangerouslySetInnerHTML={{ 
                        __html: content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                            .replace(/\n/g, '<br/><br/>') 
                    }} 
                />
            </div>
        );
    }

    // Dividir en secciones
    const rawSections = content.split(/(?=\n#{2,3}\s|\n\d+\.\s|\n[\p{Emoji}]{1,2}\s)/u).filter(Boolean);
    const sections = rawSections.length > 1 ? rawSections : content.split(/\n\n+/).filter(Boolean);

    // Estilos por tipo de sección
    const getSectionStyle = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('contexto') || t.includes('histórico')) 
            return { bg: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-700', icon: '📜', accent: 'text-amber-700 dark:text-amber-400' };
        if (t.includes('significado') || t.includes('clave') || t.includes('exégesis') || t.includes('análisis')) 
            return { bg: 'bg-sky-50/50 dark:bg-sky-950/20', border: 'border-sky-300 dark:border-sky-700', icon: '🔍', accent: 'text-sky-700 dark:text-sky-400' };
        if (t.includes('enseñanza') || t.includes('práctica') || t.includes('aplicación')) 
            return { bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-300 dark:border-emerald-700', icon: '💡', accent: 'text-emerald-700 dark:text-emerald-400' };
        if (t.includes('oración') || t.includes('reflexión') || t.includes('meditación')) 
            return { bg: 'bg-violet-50/50 dark:bg-violet-950/20', border: 'border-violet-300 dark:border-violet-700', icon: '🙏', accent: 'text-violet-700 dark:text-violet-400' };
        if (t.includes('versículo') || t.includes('cita') || t.includes('escritura')) 
            return { bg: 'bg-rose-50/50 dark:bg-rose-950/20', border: 'border-rose-300 dark:border-rose-700', icon: '📖', accent: 'text-rose-700 dark:text-rose-400' };
        return { bg: 'bg-slate-50/50 dark:bg-slate-900/30', border: 'border-slate-200 dark:border-slate-700', icon: '✦', accent: 'text-primary' };
    };

    return (
        <div className="scripture-response space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
            {sections.map((section, idx) => {
                const cleanSection = section.trim();
                const lines = cleanSection.split('\n');
                const firstLine = lines[0].trim();
                let title = "";
                let body = cleanSection;

                // Extraer título si existe
                if (firstLine.match(/^(#|\d+\.|[\p{Emoji}])/u) && firstLine.length < 100) {
                    title = firstLine
                        .replace(/^[#\d\.\s]+/, '')
                        .replace(/^[\p{Emoji}\s]+/u, '')
                        .replace(/\*\*/g, '')
                        .trim();
                    body = lines.slice(1).join('\n');
                }

                const style = getSectionStyle(title || cleanSection.substring(0, 30));

                // Sección sin título - párrafo simple con estilo elegante
                if (!title) {
                    return (
                        <div 
                            key={idx} 
                            className={cn(
                                "relative py-6 px-8 rounded-2xl",
                                "bg-gradient-to-br from-slate-50/80 to-slate-100/50",
                                "dark:from-slate-900/50 dark:to-slate-800/30",
                                "border-l-4 border-primary/30",
                                "shadow-sm"
                            )}
                        >
                            <p 
                                className="text-lg leading-[2.2] tracking-wide text-foreground/85"
                                dangerouslySetInnerHTML={{ 
                                    __html: cleanSection
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                                        .replace(/\n/g, '<br/><br/>') 
                                }} 
                            />
                        </div>
                    );
                }

                // Sección con título - tarjeta decorada
                return (
                    <div 
                        key={idx} 
                        className={cn(
                            "group rounded-2xl overflow-hidden",
                            "border-2 shadow-md hover:shadow-lg transition-shadow duration-300",
                            style.border
                        )}
                    >
                        {/* Encabezado de sección */}
                        <div className={cn("px-6 py-5 border-b", style.bg, style.border)}>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow-sm">{style.icon}</span>
                                <div className="flex-1">
                                    <h3 className={cn(
                                        "text-xl font-semibold tracking-wide",
                                        style.accent
                                    )}>
                                        {title}
                                    </h3>
                                    <div className="mt-2 h-0.5 w-16 bg-current opacity-30 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Contenido de la sección */}
                        <div className="px-8 py-8 space-y-6 bg-background/60">
                            {body.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return <div key={i} className="h-4" />; // Espaciado entre párrafos

                                // Subtítulo
                                if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
                                    return (
                                        <div key={i} className="flex items-center gap-3 mt-8 mb-4 pt-4 border-t border-border/30">
                                            <span className={cn("text-lg", style.accent)}>❧</span>
                                            <h4 className={cn(
                                                "text-base font-semibold tracking-wide",
                                                style.accent
                                            )}>
                                                {trimmed.replace(/^[#\s]+|\*\*/g, '')}
                                            </h4>
                                        </div>
                                    );
                                }

                                // Lista con viñetas
                                if (trimmed.match(/^[-•]|\d+\./)) {
                                    return (
                                        <div key={i} className="flex gap-5 items-start pl-2 py-2">
                                            <span className={cn(
                                                "mt-2 text-lg leading-none",
                                                style.accent
                                            )}>
                                                ✦
                                            </span>
                                            <p 
                                                className="flex-1 text-lg leading-[2] tracking-wide text-foreground/85"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: trimmed
                                                        .replace(/^[-•\d\.]+\s*/, '')
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>') 
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                // Párrafo normal
                                return (
                                    <p 
                                        key={i} 
                                        className="text-lg leading-[2.2] tracking-wide text-foreground/85 first-letter:text-2xl first-letter:font-semibold first-letter:text-primary/80"
                                        dangerouslySetInnerHTML={{ 
                                            __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>') 
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* Decoración inferior */}
                        <div className={cn("h-1.5", style.bg)} />
                    </div>
                );
            })}

            {/* Separador final decorativo */}
            <div className="flex justify-center pt-6">
                <span className="text-2xl text-muted-foreground/40">✝</span>
            </div>
        </div>
    );
}
