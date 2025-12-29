// API para cargar versiones de la Biblia en línea desde bolls.life
// Versiones disponibles: NVI, RV1960, NTV, PDT, LBLA, BTX3

const BOLLS_API = 'https://bolls.life';

// Versiones en español disponibles en bolls.life
export const onlineVersions = [
  { id: 'NVI', name: 'Nueva Versión Internacional', shortName: 'NVI', language: 'Español', languageCode: 'es' },
  { id: 'RV1960', name: 'Reina Valera 1960', shortName: 'RV60', language: 'Español', languageCode: 'es' },
  { id: 'NTV', name: 'Nueva Traducción Viviente', shortName: 'NTV', language: 'Español', languageCode: 'es' },
  { id: 'PDT', name: 'Palabra de Dios para Todos', shortName: 'PDT', language: 'Español', languageCode: 'es' },
  { id: 'LBLA', name: 'La Biblia de las Américas', shortName: 'LBLA', language: 'Español', languageCode: 'es' },
  { id: 'BTX3', name: 'Biblia Textual 3ra Ed.', shortName: 'BTX', language: 'Español', languageCode: 'es' },
];

// Cache para versículos descargados
const verseCache = new Map<string, string[]>();

// Mapeo de índice de libro a ID de bolls.life
const bookIdMap: Record<number, number> = {
  0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10,
  10: 11, 11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: 20,
  20: 21, 21: 22, 22: 23, 23: 24, 24: 25, 25: 26, 26: 27, 27: 28, 28: 29, 29: 30,
  30: 31, 31: 32, 32: 33, 33: 34, 34: 35, 35: 36, 36: 37, 37: 38, 38: 39,
  39: 40, 40: 41, 41: 42, 42: 43, 43: 44, 44: 45, 45: 46, 46: 47, 47: 48, 48: 49,
  49: 50, 50: 51, 51: 52, 52: 53, 53: 54, 54: 55, 55: 56, 56: 57, 57: 58, 58: 59,
  59: 60, 60: 61, 61: 62, 62: 63, 63: 64, 64: 65, 65: 66
};

interface BollsVerse {
  pk: number;
  verse: number;
  text: string;
}

// Obtener capítulo de una versión en línea
export async function fetchOnlineChapter(
  versionId: string,
  bookIndex: number,
  chapter: number
): Promise<string[] | null> {
  const cacheKey = `${versionId}_${bookIndex}_${chapter}`;
  
  // Verificar cache
  if (verseCache.has(cacheKey)) {
    return verseCache.get(cacheKey)!;
  }

  // Verificar localStorage
  const localKey = `bible_${cacheKey}`;
  const cached = localStorage.getItem(localKey);
  if (cached) {
    const verses = JSON.parse(cached);
    verseCache.set(cacheKey, verses);
    return verses;
  }

  try {
    const bookId = bookIdMap[bookIndex];
    const url = `${BOLLS_API}/get-text/${versionId}/${bookId}/${chapter}/`;
    
    console.log(`📥 Descargando ${versionId} libro ${bookId} cap ${chapter}...`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BlessedInsight/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: BollsVerse[] = await response.json();
    
    // Limpiar texto (quitar <br> y notas)
    const verses = data.map(v => 
      v.text
        .replace(/<br>/g, ' ')
        .replace(/\[\d+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );

    // Guardar en cache
    verseCache.set(cacheKey, verses);
    localStorage.setItem(localKey, JSON.stringify(verses));
    
    console.log(`✓ Descargado ${verses.length} versículos`);
    return verses;

  } catch (error) {
    console.error(`Error descargando ${versionId}:`, error);
    return null;
  }
}

// Verificar si una versión está disponible en línea
export function isOnlineVersion(versionId: string): boolean {
  return onlineVersions.some(v => v.id === versionId);
}

// Limpiar cache
export function clearOnlineCache(): void {
  verseCache.clear();
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('bible_')) {
      localStorage.removeItem(key);
    }
  });
}
