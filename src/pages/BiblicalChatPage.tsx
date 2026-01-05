import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { callAI, AIMessage } from '../lib/aiProvider';

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
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

        try {
            // Construir contexto de conversación
            const conversationHistory: AIMessage[] = [
                {
                    role: 'system',
                    content: `Eres un asistente bíblico experto y amigable. Tu propósito es ayudar a las personas a comprender mejor la Biblia y responder sus preguntas sobre fe cristiana.

DIRECTRICES:
- Responde SIEMPRE en español de manera clara y accesible
- Cita versículos bíblicos cuando sea relevante (formato: Libro Capítulo:Versículo)
- Sé respetuoso, compasivo y alentador
- Si no estás seguro de algo, admítelo honestamente
- Mantén un tono conversacional pero profesional
- Proporciona contexto histórico y cultural cuando sea útil
- Evita debates teológicos controversiales; presenta diferentes perspectivas cuando existan
- Enfócate en la edificación espiritual del usuario

Tu objetivo es ser un guía confiable para el estudio bíblico y el crecimiento espiritual.`
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
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
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
