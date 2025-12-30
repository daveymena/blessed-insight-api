// Servicio de Text-to-Speech para lectura de la Biblia
// Soporta: Web Speech API (local) y Edge TTS (voces naturales de Microsoft)

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'unknown';
  provider: 'browser' | 'edge' | 'openai';
  native?: SpeechSynthesisVoice;
}

export interface SpeechSettings {
  rate: number;      // 0.5 - 2 (velocidad)
  pitch: number;     // 0 - 2 (tono)
  volume: number;    // 0 - 1
  voiceId: string;
  provider: 'browser' | 'edge' | 'openai';
}

const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 0.95,
  pitch: 1,
  volume: 1,
  voiceId: 'es-ES-AlvaroNeural',
  provider: 'edge',
};

// Voces de Edge TTS (Microsoft) - Muy naturales y gratuitas
const EDGE_VOICES: VoiceOption[] = [
  // Español España
  { id: 'es-ES-AlvaroNeural', name: 'Álvaro (España)', lang: 'es-ES', gender: 'male', provider: 'edge' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (España)', lang: 'es-ES', gender: 'female', provider: 'edge' },
  // Español México
  { id: 'es-MX-JorgeNeural', name: 'Jorge (México)', lang: 'es-MX', gender: 'male', provider: 'edge' },
  { id: 'es-MX-DaliaNeural', name: 'Dalia (México)', lang: 'es-MX', gender: 'female', provider: 'edge' },
  // Español Argentina
  { id: 'es-AR-TomasNeural', name: 'Tomás (Argentina)', lang: 'es-AR', gender: 'male', provider: 'edge' },
  { id: 'es-AR-ElenaNeural', name: 'Elena (Argentina)', lang: 'es-AR', gender: 'female', provider: 'edge' },
  // Español Colombia
  { id: 'es-CO-GonzaloNeural', name: 'Gonzalo (Colombia)', lang: 'es-CO', gender: 'male', provider: 'edge' },
  { id: 'es-CO-SalomeNeural', name: 'Salomé (Colombia)', lang: 'es-CO', gender: 'female', provider: 'edge' },
  // Inglés
  { id: 'en-US-GuyNeural', name: 'Guy (US)', lang: 'en-US', gender: 'male', provider: 'edge' },
  { id: 'en-US-JennyNeural', name: 'Jenny (US)', lang: 'en-US', gender: 'female', provider: 'edge' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', lang: 'en-GB', gender: 'male', provider: 'edge' },
];

// Voces de OpenAI TTS - Calidad Humana Superior
const OPENAI_VOICES: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy (Urbana)', lang: 'es-ES', gender: 'male', provider: 'openai' },
  { id: 'echo', name: 'Echo (Profunda)', lang: 'es-ES', gender: 'male', provider: 'openai' },
  { id: 'fable', name: 'Fable (Narrativa)', lang: 'es-ES', gender: 'male', provider: 'openai' },
  { id: 'onyx', name: 'Onyx (Autoritaria)', lang: 'es-ES', gender: 'male', provider: 'openai' },
  { id: 'nova', name: 'Nova (Clara)', lang: 'es-ES', gender: 'female', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer (Suave)', lang: 'es-ES', gender: 'female', provider: 'openai' },
];

class SpeechService {
  private synth: SpeechSynthesis;
  private browserVoices: VoiceOption[] = [];
  private settings: SpeechSettings;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isPaused = false;
  private onStateChange?: (state: 'playing' | 'paused' | 'stopped') => void;
  private onVerseChange?: (verseIndex: number) => void;
  private audioCache = new Map<string, string>();

  constructor() {
    this.synth = window.speechSynthesis;
    this.settings = this.loadSettings();
    this.loadBrowserVoices();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadBrowserVoices();
    }
  }

  private loadBrowserVoices(): void {
    const rawVoices = this.synth.getVoices();

    this.browserVoices = rawVoices
      .filter(v => v.lang.startsWith('es') || v.lang.startsWith('en') || v.lang.startsWith('pt'))
      .map(v => ({
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
        gender: this.detectGender(v.name),
        provider: 'browser' as const,
        native: v,
      }))
      .sort((a, b) => {
        if (a.lang.startsWith('es') && !b.lang.startsWith('es')) return -1;
        if (!a.lang.startsWith('es') && b.lang.startsWith('es')) return 1;
        return a.name.localeCompare(b.name);
      });

    console.log(`🔊 ${this.browserVoices.length} voces del navegador + ${EDGE_VOICES.length} voces Edge TTS`);
  }

  private detectGender(name: string): 'male' | 'female' | 'unknown' {
    const lowerName = name.toLowerCase();
    const femaleNames = ['female', 'mujer', 'femenin', 'mónica', 'paulina', 'helena', 'lucia', 'maria', 'carmen', 'rosa', 'ana', 'elena', 'sara', 'laura', 'marta', 'isabel', 'google español', 'microsoft helena', 'microsoft sabina', 'microsoft laura'];
    const maleNames = ['male', 'hombre', 'masculin', 'jorge', 'pablo', 'diego', 'carlos', 'juan', 'pedro', 'miguel', 'antonio', 'jose', 'david', 'microsoft pablo'];

    if (femaleNames.some(n => lowerName.includes(n))) return 'female';
    if (maleNames.some(n => lowerName.includes(n))) return 'male';
    return 'unknown';
  }

  private loadSettings(): SpeechSettings {
    try {
      const saved = localStorage.getItem('bible_speech_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading speech settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    localStorage.setItem('bible_speech_settings', JSON.stringify(this.settings));
  }

  // Obtener todas las voces (OpenAI + Edge + Browser)
  getVoices(): VoiceOption[] {
    return [...OPENAI_VOICES, ...EDGE_VOICES, ...this.browserVoices];
  }

  // Obtener solo voces Edge (más naturales)
  getEdgeVoices(): VoiceOption[] {
    return EDGE_VOICES;
  }

  // Obtener voces del navegador
  getBrowserVoices(): VoiceOption[] {
    return this.browserVoices;
  }

  getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<SpeechSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSelectedVoice(): VoiceOption | undefined {
    const allVoices = this.getVoices();
    if (this.settings.voiceId) {
      return allVoices.find(v => v.id === this.settings.voiceId);
    }
    return OPENAI_VOICES[0] || EDGE_VOICES[0]; // Prioridad OpenAI
  }

  // Limpiar texto de etiquetas HTML y optimizar para TTS (Human-friendly)
  private cleanText(text: string, removeVerseNumbers: boolean = true): string {
    if (!text) return '';

    let cleaned = text
      // Eliminar etiquetas HTML
      .replace(/<[^>]*>/g, ' ');

    // Si detectamos patrones como "1 ", "2 ", o al inicio, los removemos para que no lea "Uno..."
    if (removeVerseNumbers) {
      // Intenta detectar si el texto empieza con un número de versículo (ej: "1 En el principio...")
      cleaned = cleaned.replace(/^\s*\d+[\s\.]*/, '');
    }

    return cleaned
      // Eliminar espacios antes de signos de puntuación
      .replace(/\s+([,.!?;:])/g, '$1')
      // Reemplazar saltos de línea y múltiples espacios
      .replace(/\s+/g, ' ')
      // Asegurar que haya espacio después de puntuación si falta
      .replace(/([,:;?!)])([^\s])/g, '$1 $2')
      // Reemplazar abreviaturas comunes para que se lean completas
      .replace(/\bcap\./gi, 'capítulo')
      .replace(/\bv\./gi, 'versículo')
      .trim();
  }

  // Generar audio con Edge TTS
  private async generateEdgeAudio(text: string, voiceId: string): Promise<string> {
    const cleanedText = this.cleanText(text);
    const cacheKey = `${voiceId}_${cleanedText.substring(0, 50)}`;

    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Usar servicio proxy de Edge TTS
    const rate = Math.round((this.settings.rate - 1) * 100);
    const rateStr = rate >= 0 ? `+${rate}%` : `${rate}%`;

    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId}&text=${encodeURIComponent(cleanedText)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Edge TTS error');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Cache limitado (últimos 20)
      if (this.audioCache.size > 20) {
        const firstKey = this.audioCache.keys().next().value;
        if (firstKey) {
          URL.revokeObjectURL(this.audioCache.get(firstKey)!);
          this.audioCache.delete(firstKey);
        }
      }
      this.audioCache.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error('Edge TTS error, falling back to browser:', error);
      throw error;
    }
  }

  // Reproducir con Edge TTS
  private async speakWithEdge(text: string, onEnd?: () => void): Promise<void> {
    const voice = this.getSelectedVoice();
    if (!voice || voice.provider !== 'edge') {
      this.speakWithBrowser(text, onEnd);
      return;
    }

    try {
      const audioUrl = await this.generateEdgeAudio(text, voice.id);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = this.settings.volume;
      this.currentAudio.playbackRate = this.settings.rate;

      this.currentAudio.onplay = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.onStateChange?.('playing');
      };

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.onStateChange?.('stopped');
        onEnd?.();
      };

      this.currentAudio.onerror = () => {
        console.error('Audio playback error, falling back to browser');
        this.speakWithBrowser(text, onEnd);
      };

      await this.currentAudio.play();
    } catch (error) {
      this.speakWithBrowser(text, onEnd);
    }
  }

  // Generar audio con OpenAI TTS (Alta Fidelidad)
  private async speakWithOpenAI(text: string, onEnd?: () => void): Promise<void> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API Key not found, falling back to Edge');
      this.speakWithEdge(text, onEnd);
      return;
    }

    const voice = this.getSelectedVoice();
    const cleanedText = this.cleanText(text, true);

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: voice?.id || 'alloy',
          input: cleanedText,
          speed: this.settings.rate
        })
      });

      if (!response.ok) throw new Error('OpenAI TTS error');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = this.settings.volume;
      this.currentAudio.onplay = () => this.onStateChange?.('playing');
      this.currentAudio.onended = () => {
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };
      await this.currentAudio.play();
    } catch (error) {
      console.error('OpenAI TTS failed:', error);
      this.speakWithEdge(text, onEnd);
    }
  }

  // Reproducir con Web Speech API (fallback)
  private speakWithBrowser(text: string, onEnd?: () => void): void {
    this.synth.cancel();

    const cleanedText = this.cleanText(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const voice = this.getSelectedVoice();

    if (voice?.native) {
      utterance.voice = voice.native;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'es-ES';
    }

    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.onStateChange?.('playing');
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange?.('stopped');
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      this.isPlaying = false;
      this.onStateChange?.('stopped');
    };

    this.synth.speak(utterance);
  }

  // Reproducir texto
  speak(text: string, onEnd?: () => void): void {
    this.stop();

    const voice = this.getSelectedVoice();
    if (voice?.provider === 'openai') {
      this.speakWithOpenAI(text, onEnd);
    } else if (voice?.provider === 'edge') {
      this.speakWithEdge(text, onEnd);
    } else {
      this.speakWithBrowser(text, onEnd);
    }
  }

  // Reproducir versículos uno por uno con flujo natural
  speakVerses(verses: string[], onVerseStart?: (index: number) => void, onComplete?: () => void): void {
    this.stop();

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= verses.length) {
        this.onStateChange?.('stopped');
        onComplete?.();
        return;
      }

      onVerseStart?.(currentIndex);
      this.onVerseChange?.(currentIndex);

      // Limpiamos el texto eliminando el número de versículo para que la lectura sea humana
      const rawText = verses[currentIndex];
      const textToSpeak = this.cleanText(rawText, true);

      const onEnd = () => {
        currentIndex++;
        // Pausa muy breve para que se sienta natural pero no fragmentado
        setTimeout(speakNext, 150);
      };

      const voice = this.getSelectedVoice();
      if (voice?.provider === 'openai') {
        this.speakWithOpenAI(textToSpeak, onEnd);
      } else if (voice?.provider === 'edge') {
        this.speakWithEdge(textToSpeak, onEnd);
      } else {
        this.speakWithBrowser(textToSpeak, onEnd);
      }
    };

    speakNext();
  }

  pause(): void {
    if (this.currentAudio && this.isPlaying && !this.isPaused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.onStateChange?.('paused');
    } else if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.onStateChange?.('paused');
    }
  }

  resume(): void {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
      this.onStateChange?.('playing');
    } else if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.onStateChange?.('playing');
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.onStateChange?.('stopped');
  }

  toggle(): void {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
  }

  getState(): 'playing' | 'paused' | 'stopped' {
    if (this.isPaused) return 'paused';
    if (this.isPlaying) return 'playing';
    return 'stopped';
  }

  onStateChangeCallback(callback: (state: 'playing' | 'paused' | 'stopped') => void): void {
    this.onStateChange = callback;
  }

  onVerseChangeCallback(callback: (verseIndex: number) => void): void {
    this.onVerseChange = callback;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window || typeof Audio !== 'undefined';
  }
}

export const speechService = new SpeechService();
