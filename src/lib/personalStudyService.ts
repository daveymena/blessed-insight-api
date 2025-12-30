// Servicio de Estudio Personal Sincronizado (Cloud)
// Lógica para Notas, Historial y Conversaciones persistentes

const API_BASE_URL = '/api';

async function getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

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

export const personalStudyService = {
    // === NOTAS ===
    async getNotes(): Promise<Note[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`, {
                headers: await getHeaders()
            });
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            console.error('Error fetching cloud notes:', e);
            return [];
        }
    },

    async saveNote(note: Omit<Note, 'id' | 'updatedAt'>): Promise<Note | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(note)
            });
            if (!response.ok) return null;
            return response.json();
        } catch (e) {
            console.error('Error saving cloud note:', e);
            return null;
        }
    },

    async deleteNote(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
                method: 'DELETE',
                headers: await getHeaders()
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    },

    // === CONVERSACIONES (IA MEMORY) ===
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/conversations`, {
                headers: await getHeaders()
            });
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            return [];
        }
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
                headers: await getHeaders()
            });
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            return [];
        }
    },

    async saveMessage(data: { conversationId?: string; role: string; content: string; title?: string }): Promise<{ conversationId: string; message: Message } | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/conversations`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) return null;
            return response.json();
        } catch (e) {
            return null;
        }
    }
};
