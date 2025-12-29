// Servicio de Text-to-Speech para lectura de la Biblia
// Usa Web Speech API (gratis, integrado en navegadores)

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'unknown';
  native: SpeechSynthesisVoice;
}

export interface SpeechSettings {
  rate: number;      // 0.5 - 2 (velocidad)
  pitch: number;     // 0 - 2 (tono)
  volume: number;    // 0 - 1
  voiceId: string;
}

const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 0.9,
  pitch: 1,
  volume: 1,
  voiceId: '',
};

class SpeechService {
  private synth: SpeechSynthesis;
  private voices: VoiceOption[] = [];
  private settings: SpeechSettings;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isPaused = false;
  private onStateChange?: (state: 'playing' | 'paused' | 'stopped') => void;
  private onVerseChange?: (verseIndex: number) => void;

  constructor() {
    this.synth = window.speechSynthesis;
    this.settings = this.loadSettings();
    this.loadVoices();
    
    // Las voces pueden cargar de forma asíncrona
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    const rawVoices = this.synth.getVoices();
    
    // Filtrar voces en español (preferidas) e inglés
    this.voices = rawVoices
      .filter(v => v.lang.startsWith('es') || v.lang.startsWith('en'))
      .map(v => ({
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
        gender: this.detectGender(v.name),
        native: v,
      }))
      .sort((a, b) => {
        // Priorizar español
        if (a.lang.startsWith('es') && !b.lang.startsWith('es')) return -1;
        if (!a.lang.startsWith('es') && b.lang.startsWith('es')) return 1;
        return a.name.localeCompare(b.name);
      });

    console.log(`🔊 ${this.voices.length} voces disponibles`);
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

  // Obtener voces disponibles
  getVoices(): VoiceOption[] {
    return this.voices;
  }

  // Obtener voces por género
  getVoicesByGender(gender: 'male' | 'female'): VoiceOption[] {
    return this.voices.filter(v => v.gender === gender);
  }

  // Obtener voces en español
  getSpanishVoices(): VoiceOption[] {
    return this.voices.filter(v => v.lang.startsWith('es'));
  }

  // Obtener configuración actual
  getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  // Actualizar configuración
  updateSettings(newSettings: Partial<SpeechSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Obtener voz seleccionada
  getSelectedVoice(): VoiceOption | undefined {
    if (this.settings.voiceId) {
      return this.voices.find(v => v.id === this.settings.voiceId);
    }
    // Por defecto, primera voz en español
    return this.voices.find(v => v.lang.startsWith('es')) || this.voices[0];
  }

  // Reproducir texto
  speak(text: string, onEnd?: () => void): void {
    this.stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getSelectedVoice();
    
    if (voice) {
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
      this.currentUtterance = null;
      this.onStateChange?.('stopped');
      onEnd?.();
    };
    
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      this.isPlaying = false;
      this.isPaused = false;
      this.onStateChange?.('stopped');
    };
    
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  // Reproducir versículos uno por uno
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
      
      const text = verses[currentIndex];
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getSelectedVoice();
      
      if (voice) {
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
        currentIndex++;
        speakNext();
      };
      
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        this.isPlaying = false;
        this.onStateChange?.('stopped');
      };
      
      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    };
    
    speakNext();
  }

  // Pausar
  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.onStateChange?.('paused');
    }
  }

  // Reanudar
  resume(): void {
    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.onStateChange?.('playing');
    }
  }

  // Detener
  stop(): void {
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.onStateChange?.('stopped');
  }

  // Toggle play/pause
  toggle(): void {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
  }

  // Estado actual
  getState(): 'playing' | 'paused' | 'stopped' {
    if (this.isPaused) return 'paused';
    if (this.isPlaying) return 'playing';
    return 'stopped';
  }

  // Suscribirse a cambios de estado
  onStateChangeCallback(callback: (state: 'playing' | 'paused' | 'stopped') => void): void {
    this.onStateChange = callback;
  }

  // Suscribirse a cambios de versículo
  onVerseChangeCallback(callback: (verseIndex: number) => void): void {
    this.onVerseChange = callback;
  }

  // Verificar si el navegador soporta TTS
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Singleton
export const speechService = new SpeechService();
