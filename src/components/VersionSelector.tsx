import { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bibleVersions, getVersion, setVersion, type BibleVersion } from '@/lib/bibleApi';

interface VersionSelectorProps {
  onVersionChange?: (version: BibleVersion) => void;
}

export function VersionSelector({ onVersionChange }: VersionSelectorProps) {
  const [currentVersionId, setCurrentVersionId] = useState('rvr');

  useEffect(() => {
    // Inicializar con la versión guardada o RVR por defecto
    const savedVersion = getVersion();
    setCurrentVersionId(savedVersion);
  }, []);

  const currentVersion = bibleVersions.find(v => v.id === currentVersionId) || bibleVersions[0];

  const handleVersionChange = (version: BibleVersion) => {
    setVersion(version.id);
    setCurrentVersionId(version.id);
    // Notificar al padre para que recargue
    if (onVersionChange) {
      onVersionChange(version);
    }
    // Forzar recarga de la página para limpiar cache
    window.location.reload();
  };

  // Agrupar por idioma - separando locales y online
  const spanishLocal = bibleVersions.filter(v => v.languageCode === 'es' && !v.isOnline);
  const spanishOnline = bibleVersions.filter(v => v.languageCode === 'es' && v.isOnline);
  const englishVersions = bibleVersions.filter(v => v.languageCode === 'en');
  const portugueseVersions = bibleVersions.filter(v => v.languageCode === 'pt');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentVersion.shortName}</span>
          {currentVersion.isOnline && <Wifi className="h-3 w-3 text-blue-500" />}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Versión de la Biblia
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Español - Locales */}
        {spanishLocal.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              🇪🇸 Español (Offline)
            </DropdownMenuLabel>
            {spanishLocal.map((version) => (
              <DropdownMenuItem
                key={version.id}
                onClick={() => handleVersionChange(version)}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{version.shortName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{version.name}</span>
                </div>
                {currentVersionId === version.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Español - Online */}
        {spanishOnline.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
              🇪🇸 Español <Wifi className="h-3 w-3 text-blue-500" /> Online
            </DropdownMenuLabel>
            {spanishOnline.map((version) => (
              <DropdownMenuItem
                key={version.id}
                onClick={() => handleVersionChange(version)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1">
                  <span className="font-medium">{version.shortName}</span>
                  <Wifi className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground ml-1">{version.name}</span>
                </div>
                {currentVersionId === version.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Inglés */}
        {englishVersions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              🇺🇸 English
            </DropdownMenuLabel>
            {englishVersions.map((version) => (
              <DropdownMenuItem
                key={version.id}
                onClick={() => handleVersionChange(version)}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{version.shortName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{version.name}</span>
                </div>
                {currentVersionId === version.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Portugués */}
        {portugueseVersions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              🇧🇷 Português
            </DropdownMenuLabel>
            {portugueseVersions.map((version) => (
              <DropdownMenuItem
                key={version.id}
                onClick={() => handleVersionChange(version)}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{version.shortName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{version.name}</span>
                </div>
                {currentVersionId === version.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3 inline text-blue-500" /> = Requiere internet
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
