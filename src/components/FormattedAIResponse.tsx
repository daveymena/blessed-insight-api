import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FormattedAIResponse({ content }: { content: string }) {
    if (!content) return null;

    const hasMarkdownHeaders = content.includes('##') || content.includes('###') || content.match(/^\d+\./m);

    if (!hasMarkdownHeaders && !content.includes('\n\n')) {
        return (
            <div className="space-y-4 text-base leading-relaxed text-foreground/90 animate-in fade-in duration-500 font-serif">
                <p dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-extrabold">$1</strong>') }} />
            </div>
        );
    }

    const rawSections = content.split(/(?=\n#{2,3}\s|\n\d+\.\s|\n[\p{Emoji}]{1,2}\s)/u).filter(Boolean);
    const sections = rawSections.length > 1 ? rawSections : content.split(/\n\n+/).filter(Boolean);

    const getSectionStyle = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('contexto')) return { bg: 'bg-amber-50/30 dark:bg-amber-950/10', border: 'border-l-amber-400', icon: '📜', titleColor: 'text-amber-800 dark:text-amber-300' };
        if (t.includes('significado') || t.includes('clave') || t.includes('exégesis')) return { bg: 'bg-blue-50/30 dark:bg-blue-950/10', border: 'border-l-blue-400', icon: '🔍', titleColor: 'text-blue-800 dark:text-blue-300' };
        if (t.includes('enseñanza') || t.includes('práctica')) return { bg: 'bg-emerald-50/30 dark:bg-emerald-950/10', border: 'border-l-emerald-400', icon: '💡', titleColor: 'text-emerald-800 dark:text-emerald-300' };
        if (t.includes('oración') || t.includes('respuesta')) return { bg: 'bg-violet-50/30 dark:bg-violet-950/10', border: 'border-l-violet-400', icon: '🙏', titleColor: 'text-violet-800 dark:text-violet-300' };
        return { bg: 'bg-muted/10', border: 'border-l-primary/40', icon: '✨', titleColor: 'text-foreground' };
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {sections.map((section, idx) => {
                const cleanSection = section.trim();
                const lines = cleanSection.split('\n');
                const firstLine = lines[0].trim();
                let title = "";
                let body = cleanSection;

                if (firstLine.match(/^(#|\d+\.|[\p{Emoji}])/u) && firstLine.length < 80) {
                    title = firstLine.replace(/^[#\d\.\s]+/, '').replace(/^[\p{Emoji}\s]+/u, '').replace(/\*\*/g, '').trim();
                    body = lines.slice(1).join('\n');
                }

                const style = getSectionStyle(title || cleanSection.substring(0, 20));

                if (!title) {
                    return (
                        <div key={idx} className="p-4 rounded-2xl bg-secondary/20 border border-border/40 italic font-serif text-foreground/80 leading-relaxed">
                            <p dangerouslySetInnerHTML={{ __html: cleanSection.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    );
                }

                return (
                    <div key={idx} className={cn("group overflow-hidden border-l-[3px] transition-all duration-300", style.border, style.bg)}>
                        <div className="px-5 pt-4 flex items-center gap-3">
                            <span className="text-xl grayscale-[0.5] group-hover:grayscale-0 transition-all">{style.icon}</span>
                            <h3 className={cn("text-sm font-black uppercase tracking-[0.15em]", style.titleColor)}>
                                {title}
                            </h3>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            {body.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
                                    return <h4 key={i} className="text-xs font-bold opacity-60 mt-4 uppercase tracking-widest">{trimmed.replace(/^[#\s]+|\*\*/g, '')}</h4>;
                                }

                                if (trimmed.match(/^[-•]|\d+\./)) {
                                    return (
                                        <div key={i} className="flex gap-4 items-start pl-1 group/item">
                                            <span className={cn("mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover/item:scale-125", style.titleColor, "bg-current opacity-40")} />
                                            <p className="text-[15px] leading-relaxed text-foreground/80 font-sans" dangerouslySetInnerHTML={{ __html: trimmed.replace(/^[-•\d\.]+\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                                        </div>
                                    );
                                }

                                return (
                                    <p key={i} className="text-[15px] leading-relaxed text-foreground/80 font-sans"
                                        dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
