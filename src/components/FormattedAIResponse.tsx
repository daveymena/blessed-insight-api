import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FormattedAIResponse({ content }: { content: string }) {
    if (!content) return null;

    // Detectar si el contenido ya viene con formato Markdown estructurado (## Título)
    const hasMarkdownHeaders = content.includes('##') || content.includes('###');

    // Si no tiene headers claros, forzamos una estructura de párrafos enriquecidos
    if (!hasMarkdownHeaders && !content.includes('\n\n')) {
        return (
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90 animate-in fade-in duration-500">
                <p
                    dangerouslySetInnerHTML={{
                        __html: content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 dark:text-indigo-400 font-bold">$1</strong>')
                    }}
                />
            </div>
        );
    }

    // Dividir por encabezados de Markdown (## o ###) o líneas que empiezan con Emojis
    // Esta RegEx busca líneas que empiezan con ##, ### o un Emoji seguido de texto
    const rawSections = content.split(/(?=\n#{2,3}\s|\n[\p{Emoji}]{1,2}\s)/u).filter(Boolean);

    // Si aún así no se dividió bien, intentamos por doble salto de línea para tarjetas de párrafos
    const sections = rawSections.length > 1 ? rawSections : content.split(/\n\n+/).filter(Boolean);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {sections.map((section, idx) => {
                const cleanSection = section.trim();
                let title = "";
                let body = cleanSection;
                let icon = "📄";

                // Intentar extraer título de la primera línea
                const lines = cleanSection.split('\n');
                const firstLine = lines[0].trim();

                if (firstLine.startsWith('#') || (firstLine.match(/^[\p{Emoji}]/u) && firstLine.length < 60)) {
                    title = firstLine.replace(/^[#\s]+/, '').replace(/\*\*/g, '');
                    // Intentar sacar icono del título
                    const iconMatch = title.match(/^([\p{Emoji}]{1,2})/u);
                    if (iconMatch) {
                        icon = iconMatch[1];
                        title = title.replace(/^[\p{Emoji}\s]+/, '').trim();
                    }
                    body = lines.slice(1).join('\n');
                }

                // Si no se detectó título, renderizar como tarjeta simple de contenido
                if (!title) {
                    return (
                        <Card key={idx} className="overflow-hidden border-none shadow-sm bg-card/60">
                            <CardContent className="p-4">
                                <p className="text-sm sm:text-base leading-relaxed text-foreground/90"
                                    dangerouslySetInnerHTML={{
                                        __html: cleanSection
                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 dark:text-indigo-400 font-bold">$1</strong>')
                                    }}
                                />
                            </CardContent>
                        </Card>
                    );
                }

                return (
                    <Card key={idx} className="overflow-hidden border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-3 border-b border-indigo-500/10 flex items-center gap-3">
                            <span className="text-xl filter drop-shadow-sm">{icon}</span>
                            <h3 className="text-sm sm:text-base font-bold text-indigo-900 dark:text-indigo-300">
                                {title}
                            </h3>
                        </div>

                        <CardContent className="p-4 space-y-3 bg-card/50">
                            {body.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                // Subtítulos internos (negritas solas o ###)
                                if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
                                    return (
                                        <h4 key={i} className="text-sm font-bold text-foreground/90 mt-3 mb-1 flex items-center gap-2">
                                            {trimmed.replace(/^[#\s]+/, '').replace(/\*\*/g, '')}
                                        </h4>
                                    );
                                }

                                // Listas
                                if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
                                    return (
                                        <div key={i} className="flex gap-2 items-start ml-1 group">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500/60 group-hover:bg-indigo-500 transition-colors shrink-0" />
                                            <p className="text-sm sm:text-base leading-relaxed text-foreground/80 flex-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: trimmed
                                                        .replace(/^[-•\d\.]+\s*/, '')
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                }}
                                            />
                                        </div>
                                    );
                                }

                                // Párrafos normales
                                return (
                                    <p key={i} className="text-sm sm:text-base leading-relaxed text-foreground/80 font-normal mb-2"
                                        dangerouslySetInnerHTML={{
                                            __html: trimmed
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 dark:text-indigo-400 font-bold">$1</strong>')
                                                .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-muted rounded font-mono text-xs text-indigo-600">$1</code>')
                                        }}
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
