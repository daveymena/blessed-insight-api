import { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Settings2, User, UserCircle } from 'lucide-react';
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

  useEffect(() => {
    // Cargar voces (pueden tardar en cargar)
    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    // Reintentar después de un momento si no hay voces
    const timer = setTimeout(loadVoices, 500);

    // Suscribirse a cambios de estado
    speechService.onStateChangeCallback(setState);
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
  };

  const handleVoiceChange = (voiceId: string) => {
    speechService.updateSettings({ voiceId });
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

  // Agrupar voces por género
  const maleVoices = voices.filter(v => v.gender === 'male');
  const femaleVoices = voices.filter(v => v.gender === 'female');
  const otherVoices = voices.filter(v => v.gender === 'unknown');

  if (!speechService.isSupported()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      {/* Controles principales */}
      <div className="flex items-center gap-1">
        {state === 'playing' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePause}
            className="h-9 w-9"
            title="Pausar"
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={handlePlay}
            className="h-9 w-9 bg-primary"
            title="Reproducir"
          >
            <Play className="h-5 w-5" />
          </Button>
        )}
        
        {state !== 'stopped' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="h-9 w-9"
            title="Detener"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Indicador de versículo actual */}
      {currentVerse >= 0 && (
        <span className="text-xs text-muted-foreground px-2">
          v.{currentVerse + 1} / {verses.length}
        </span>
      )}

      {/* Configuración */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 ml-auto" title="Configuración de audio">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Configuración de Audio</h4>
            
            {/* Selector de voz */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Voz</label>
              <Select value={settings.voiceId} onValueChange={handleVoiceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar voz" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {femaleVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1">
                        <UserCircle className="h-3 w-3" /> Femeninas
                      </div>
                      {femaleVoices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            <span className="text-xs text-muted-foreground">({voice.lang})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {maleVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <User className="h-3 w-3" /> Masculinas
                      </div>
                      {maleVoices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            <span className="text-xs text-muted-foreground">({voice.lang})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {otherVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground mt-2">
                        Otras
                      </div>
                      {otherVoices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <span className="flex items-center gap-2">
                            <span>{voice.name}</span>
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
                <label className="text-xs text-muted-foreground">Velocidad</label>
                <span className="text-xs">{settings.rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={handleRateChange}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volumen */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Volumen
                </label>
                <span className="text-xs">{Math.round(settings.volume * 100)}%</span>
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
