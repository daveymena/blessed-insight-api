import { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Settings2, User, UserCircle, Sparkles, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { speechService, type VoiceOption } from '@/lib/speechService';

interface AudioPlayerProps {
  verses: string[];
  onVerseHighlight?: (index: number) => void;
}

export function AudioPlayer({ verses, onVerseHighlight }: AudioPlayerProps) {
  const [state, setState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [settings, setSettings] = useState(speechService.getSettings());
  const [currentVerse, setCurrentVerse] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    const timer = setTimeout(loadVoices, 500);

    speechService.onStateChangeCallback((newState) => {
      setState(newState);
      if (newState === 'playing') setIsLoading(false);
    });
    speechService.onVerseChangeCallback((index) => {
      setCurrentVerse(index);
      onVerseHighlight?.(index);
    });

    return () => {
      clearTimeout(timer);
      speechService.stop();
    };
  }, [onVerseHighlight]);

  const handlePlay = () => {
    if (state === 'paused') {
      speechService.resume();
    } else {
      setIsLoading(true);
      speechService.speakVerses(
        verses,
        (index) => {
          setCurrentVerse(index);
          onVerseHighlight?.(index);
        },
        () => {
          setCurrentVerse(-1);
          onVerseHighlight?.(-1);
        }
      );
    }
  };

  const handlePause = () => {
    speechService.pause();
  };

  const handleStop = () => {
    speechService.stop();
    setCurrentVerse(-1);
    onVerseHighlight?.(-1);
    setIsLoading(false);
  };

  const handleVoiceChange = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    speechService.updateSettings({
      voiceId,
      provider: voice?.provider || 'edge'
    });
    setSettings(speechService.getSettings());
  };

  const handleRateChange = (value: number[]) => {
    speechService.updateSettings({ rate: value[0] });
    setSettings(speechService.getSettings());
  };

  const handleVolumeChange = (value: number[]) => {
    speechService.updateSettings({ volume: value[0] });
    setSettings(speechService.getSettings());
  };

  // Separar voces Edge (naturales) y del navegador
  const edgeVoices = voices.filter(v => v.provider === 'edge');
  const browserVoices = voices.filter(v => v.provider === 'browser');

  // Agrupar voces Edge por idioma
  const edgeSpanish = edgeVoices.filter(v => v.lang.startsWith('es'));
  const edgeEnglish = edgeVoices.filter(v => v.lang.startsWith('en'));
  const edgePortuguese = edgeVoices.filter(v => v.lang.startsWith('pt'));

  if (!speechService.isSupported()) {
    return null;
  }

  const selectedVoice = voices.find(v => v.id === settings.voiceId);

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      {/* Controles principales */}
      <div className="flex items-center gap-1">
        {state === 'playing' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePause}
            className="h-10 w-10"
            title="Pausar"
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={handlePlay}
            className="h-10 w-10 bg-primary"
            title="Reproducir"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        )}

        {state !== 'stopped' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="h-10 w-10"
            title="Detener"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Info de voz y versículo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {selectedVoice?.provider === 'edge' && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              Voz Natural
            </span>
          )}
          {currentVerse >= 0 && (
            <span className="text-sm text-muted-foreground">
              Versículo {currentVerse + 1} de {verses.length}
            </span>
          )}
        </div>
        {selectedVoice && (
          <p className="text-xs text-muted-foreground truncate">
            {selectedVoice.name}
          </p>
        )}
      </div>

      {/* Configuración */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10" title="Configuración de audio">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Configuración de Audio</h4>
            </div>

            {/* Selector de voz */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Voz del Narrador</label>
              <Select value={settings.voiceId} onValueChange={handleVoiceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar voz" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {/* Voces Edge - Naturales */}
                  <div className="px-2 py-1.5 text-xs font-medium text-primary flex items-center gap-1 bg-primary/5">
                    <Sparkles className="h-3 w-3" /> Voces Naturales (Recomendadas)
                  </div>

                  {edgeSpanish.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        🇪🇸 Español
                      </div>
                      {edgeSpanish.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            {voice.gender === 'female' ? <UserCircle className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            <span>{voice.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {edgeEnglish.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground mt-1">
                        🇺🇸 English
                      </div>
                      {edgeEnglish.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            {voice.gender === 'female' ? <UserCircle className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            <span>{voice.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {edgePortuguese.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground mt-1">
                        🇧🇷 Português
                      </div>
                      {edgePortuguese.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            {voice.gender === 'female' ? <UserCircle className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            <span>{voice.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {/* Voces del navegador */}
                  {browserVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1 bg-muted/50 mt-2">
                        <Monitor className="h-3 w-3" /> Voces del Sistema
                      </div>
                      {browserVoices.slice(0, 10).map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            <span className="truncate">{voice.name}</span>
                            <span className="text-xs text-muted-foreground">({voice.lang})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Velocidad */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs text-muted-foreground">Velocidad de lectura</label>
                <span className="text-xs font-medium">{settings.rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={handleRateChange}
                min={0.5}
                max={1.5}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lento</span>
                <span>Rápido</span>
              </div>
            </div>

            {/* Volumen */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Volumen
                </label>
                <span className="text-xs font-medium">{Math.round(settings.volume * 100)}%</span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              💡 Las voces naturales usan IA de Microsoft para una lectura más humana y agradable.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
