// Servicio de Estudio Personal Sincronizado (Local Fallback)
// Lógica para Notas, Historial y Conversaciones persistentes usando LocalStorage

export interface Note {
    id: string;
    bookId: string;
    chapter: number;
    verse?: number;
    content: string;
    color?: string;
    updatedAt: string;
}

export interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
}

const STORAGE_KEYS = {
    NOTES: 'bible_study_notes_v2',
    CONVERSATIONS: 'bible_conversations_v1',
    MESSAGES: 'bible_messages_v1',
};

export const personalStudyService = {
    // === NOTAS ===
    async getNotes(): Promise<Note[]> {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error fetching notes:', e);
            return [];
        }
    },

    async saveNote(note: Omit<Note, 'id' | 'updatedAt'>): Promise<Note | null> {
        try {
            const notes = await this.getNotes();

            // Buscar si ya existe una nota para este versículo
            const existingIndex = notes.findIndex(n =>
                n.bookId === note.bookId &&
                n.chapter === note.chapter &&
                n.verse === note.verse
            );

            const updatedNote: Note = {
                ...note,
                id: existingIndex >= 0 ? notes[existingIndex].id : `note_${Date.now()}`,
                updatedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                notes[existingIndex] = updatedNote;
            } else {
                notes.push(updatedNote);
            }

            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
            return updatedNote;
        } catch (e) {
            console.error('Error saving note:', e);
            return null;
        }
    },

    async deleteNote(id: string): Promise<boolean> {
        try {
            const notes = await this.getNotes();
            const filtered = notes.filter(n => n.id !== id);
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
            return true;
        } catch (e) {
            return false;
        }
    },

    // === CONVERSACIONES ===
    async getConversations(): Promise<Conversation[]> {
        const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        return saved ? JSON.parse(saved) : [];
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        const allMessages: Message[] = saved ? JSON.parse(saved) : [];
        return allMessages.filter(m => m.conversationId === conversationId);
    },

    async saveMessage(data: { conversationId?: string; role: string; content: string; title?: string }): Promise<{ conversationId: string; message: Message } | null> {
        try {
            const convId = data.conversationId || `conv_${Date.now()}`;

            // Guardar/Actualizar Conversación
            const conversations = await this.getConversations();
            if (!conversations.find(c => c.id === convId)) {
                conversations.push({
                    id: convId,
                    title: data.title || (data.content.substring(0, 30) + '...'),
                    updatedAt: new Date().toISOString()
                });
                localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
            }

            // Guardar Mensaje
            const messages = await this.getMessages(convId);
            const newMessage: Message = {
                id: `msg_${Date.now()}`,
                conversationId: convId,
                role: data.role as 'user' | 'assistant',
                content: data.content
            };

            const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
            const allMessages: Message[] = savedMessages ? JSON.parse(savedMessages) : [];
            allMessages.push(newMessage);
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

            return { conversationId: convId, message: newMessage };
        } catch (e) {
            return null;
        }
    }
};
