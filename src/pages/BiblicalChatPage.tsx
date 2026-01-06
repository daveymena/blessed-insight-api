import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Sparkles, Loader2, MessageCircle, X } from 'lucide-react';
import { callAI, AIMessage } from '../lib/aiProvider';
import { fetchChapter, bibleBooks } from '../lib/bibleApi';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function BiblicalChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Bienvenido! Soy tu asistente bíblico personal. Puedo ayudarte con:\n\n📖 Preguntas sobre versículos y pasajes\n🙏 Consultas teológicas y doctrinales\n💡 Interpretación de textos bíblicos\n❓ Dudas sobre historias y personajes bíblicos\n✝️ Orientación espiritual basada en las Escrituras\n\n¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const scrollToBottom = (force = false) => {
        if (shouldAutoScroll || force) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Detectar si el usuario sube manualmente
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
        setShouldAutoScroll(isAtBottom);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');
        setShouldAutoScroll(true); // Forzar scroll al enviar mensaje nuevo

        // --- SISTEMA DE GROUNDING (Detección de Referencias) ---
        let groundingContext = '';
        try {
            // Regex para capturar Libro Capítulo:Versículo-Versículo
            const refRegex = /([1-3]?\s*[A-ZÁÉÍÓÚa-záéíóú]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g;
            const matches = [...input.matchAll(refRegex)];

            for (const match of matches) {
                const bookQuery = match[1].toLowerCase().trim();
                const chapterNum = parseInt(match[2]);

                // Buscar el libro por nombre o abreviatura
                const book = bibleBooks.find(b =>
                    b.name.toLowerCase().includes(bookQuery) ||
                    b.abbrev.toLowerCase().includes(bookQuery)
                );

                if (book && chapterNum > 0 && chapterNum <= book.chapters) {
                    const passage = await fetchChapter(book.id, chapterNum);
                    if (passage && passage.verses.length > 0) {
                        let textToInject = `TEXTO REAL DE ${passage.reference}:\n`;

                        const startVerse = match[3] ? parseInt(match[3]) : 1;
                        const endVerse = match[4] ? parseInt(match[4]) : (match[3] ? parseInt(match[3]) : passage.verses.length);

                        const filteredVerses = passage.verses.filter(v =>
                            v.verse >= startVerse && v.verse <= endVerse
                        );

                        if (filteredVerses.length > 0) {
                            textToInject += filteredVerses.map(v => `${v.verse}. ${v.text}`).join('\n');
                            groundingContext += `\n\n${textToInject}`;
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Error en grounding:', err);
        }
        // ----------------------------------------------------

        try {
            // Construir contexto de conversación
            const conversationHistory: AIMessage[] = [
                {
                    role: 'system',
                    content: `Eres un asistente bíblico sabio y conocedor. Tu misión es responder preguntas sobre la Biblia de forma clara, precisa y basada en las Escrituras.

REGLAS FUNDAMENTALES:
1. RESPONDE DIRECTAMENTE A LA PREGUNTA. Si preguntan "¿Quién fue David?", responde sobre David, no sobre un Salmo.
2. BASA TUS RESPUESTAS EN LA BIBLIA. Cita versículos específicos cuando sea relevante.
3. SÉ CONCISO pero completo. No divagues ni añadas información no solicitada.
4. USA UN TONO CÁLIDO Y ACCESIBLE, como un maestro bíblico experimentado.

TIPOS DE RESPUESTA:

📌 PREGUNTAS SOBRE PERSONAJES (ej: "¿Quién fue David?", "¿Quién fue Moisés?"):
- Responde con datos biográficos bíblicos concretos
- Menciona los libros donde aparece
- Destaca su importancia en la historia bíblica
- Cita versículos clave sobre esa persona

📌 PREGUNTAS SOBRE PASAJES (ej: "¿Qué significa Juan 3:16?"):
- Explica el contexto del pasaje
- Analiza el significado de las palabras clave
- Ofrece aplicación práctica

📌 PREGUNTAS DOCTRINALES (ej: "¿Qué dice la Biblia sobre el perdón?"):
- Presenta múltiples versículos relevantes
- Explica el concepto bíblico
- Mantén neutralidad entre denominaciones

📌 PREGUNTAS DE ORIENTACIÓN (ej: "¿Cómo puedo fortalecer mi fe?"):
- Ofrece consejos basados en principios bíblicos
- Cita versículos de apoyo
- Sé empático y alentador

${groundingContext ? `\nTEXTO BÍBLICO DE REFERENCIA:\n${groundingContext}` : ''}

FORMATO:
- Usa emojis con moderación para hacer la lectura agradable
- Separa las ideas en párrafos claros
- Cuando cites versículos, usa el formato: "Texto" (Libro Capítulo:Versículo)
- NO uses el formato rígido de "Explicación de pasaje" a menos que específicamente te pidan explicar un pasaje`
                },
                // Incluir últimos 5 mensajes para contexto
                ...messages.slice(-5).map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                })),
                {
                    role: 'user',
                    content: userMessage.content
                }
            ];

            // Llamar a la IA con streaming
            const response = await callAI(
                conversationHistory,
                6000, // Tokens generosos para respuestas completas
                (content) => {
                    setStreamingContent(content);
                }
            );

            if (response.success) {
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.content,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: '❌ Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Error en chat:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setStreamingContent('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedQuestions = [
        "¿Qué significa Juan 3:16?",
        "¿Quién fue el rey David?",
        "¿Cómo puedo fortalecer mi fe?",
        "Explícame el Sermón del Monte",
        "¿Qué dice la Biblia sobre el perdón?",
        "¿Cuál es el mensaje central del Evangelio?"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Chat Bíblico
                        </h1>
                        <p className="text-sm text-gray-600">Tu asistente para consultas cristianas</p>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 88px)' }}>
                {/* Messages Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
                >
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                    : 'bg-white text-gray-800 border border-purple-100'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2 text-purple-600">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Asistente Bíblico</span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Streaming Message */}
                    {isLoading && streamingContent && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="max-w-[80%] rounded-2xl px-5 py-3 shadow-md bg-white text-gray-800 border border-purple-100">
                                <div className="flex items-center gap-2 mb-2 text-purple-600">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Asistente Bíblico</span>
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed">{streamingContent}</div>
                                <div className="flex items-center gap-1 mt-2 text-purple-500">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-xs">Escribiendo...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && !streamingContent && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-purple-100">
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions (only show when no messages) */}
                {messages.length === 1 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2 font-medium">💡 Preguntas sugeridas:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {suggestedQuestions.map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(question)}
                                    className="text-left px-4 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-sm text-gray-700 transition-all hover:shadow-md hover:scale-[1.02]"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-4">
                    <div className="flex gap-3 items-end">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu pregunta bíblica aquí..."
                            className="flex-1 resize-none border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32 text-gray-800"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Sparkles className="w-3 h-3" />
                        <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
