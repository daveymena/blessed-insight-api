import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FormattedAIResponse({ content }: { content: string }) {
    if (!content) return null;

    // Dividir el contenido en secciones lógicas basadas en encabezados
    const sections = content.split(/\n(?=[^\n]*[\p{Emoji}]+\s*[A-ZÁÉÍÓÚÑ]+)/u).filter(Boolean);

    // Si no se detectan secciones claras, intentar formatear línea por línea pero mejorado
    if (sections.length <= 1) {
        return (
            <div className="space-y-4 text-base leading-relaxed text-foreground/90 font-serif">
                {content.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-4" />;
                    return <p key={i} className="mb-2">{line}</p>;
                })}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {sections.map((section, idx) => {
                const lines = section.split('\n');
                const headerLine = lines[0];
                const bodyLines = lines.slice(1);

                // Extraer emoji y título
                const headerMatch = headerLine.match(/^([\p{Emoji}]+)\s*(.+)$/u);
                const icon = headerMatch ? headerMatch[1] : '📄';
                const title = headerMatch ? headerMatch[2] : headerLine;

                return (
                    <Card key={idx} className="overflow-hidden border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-500/5 to-transparent p-3 border-b border-indigo-500/10">
                            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                <span className="text-xl">{icon}</span>
                                {title.replace(/\*\*/g, '')}
                            </h3>
                        </div>

                        <CardContent className="p-4 space-y-3 bg-card/50">
                            {bodyLines.map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                // Subtítulos
                                if (trimmed.startsWith('###') || (trimmed.match(/^[\p{Emoji}]+ /u) && trimmed.length < 50)) {
                                    return (
                                        <h4 key={i} className="text-sm font-bold text-foreground/90 mt-3 mb-1 flex items-center gap-2">
                                            {trimmed.replace(/^[#\s]+/, '').replace(/\*\*/g, '')}
                                        </h4>
                                    );
                                }

                                // Listas con bullets
                                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                                    return (
                                        <div key={i} className="flex gap-2 items-start ml-1 group">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500/60 group-hover:bg-indigo-500 transition-colors shrink-0" />
                                            <p className="text-sm leading-relaxed text-foreground/80 flex-1">
                                                {trimmed.replace(/^[-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                                            </p>
                                        </div>
                                    );
                                }

                                // Párrafos normales con resaltado de negritas
                                return (
                                    <p key={i} className="text-sm leading-relaxed text-foreground/80 font-normal mb-2"
                                        dangerouslySetInnerHTML={{
                                            __html: trimmed
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 dark:text-indigo-400 font-bold">$1</strong>')
                                                .replace(/\(([^)]*(?:hebreo|griego)[^)]*)\)/gi, '<span class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[11px] font-medium mx-1">$1</span>')
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
