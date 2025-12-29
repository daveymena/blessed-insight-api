// Servicio de traducción usando el proveedor de IA con rotación
// Traduce versículos de la Biblia a español con fallback automático

import { callAI } from './aiProvider';

interface TranslationCache {
  [key: string]: string;
}

// Cache de traducciones para no repetir llamadas
const translationCache: TranslationCache = {};

// Cargar cache del localStorage
function loadCache(): void {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bible_translation_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(translationCache, parsed);
      } catch (e) {
        console.error('Error loading translation cache:', e);
      }
    }
  }
}

// Guardar cache en localStorage
function saveCache(): void {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(translationCache);
    if (keys.length > 500) {
      const toDelete = keys.slice(0, keys.length - 500);
      toDelete.forEach(key => delete translationCache[key]);
    }
    localStorage.setItem('bible_translation_cache', JSON.stringify(translationCache));
  }
}

// Inicializar cache
loadCache();

// Prompt del sistema para traducción bíblica
const TRANSLATION_SYSTEM_PROMPT = `Eres un traductor bíblico experto. Traduce el siguiente texto bíblico al español de manera fiel y reverente.
Mantén el estilo solemne y poético apropiado para textos sagrados.
Solo devuelve la traducción, sin explicaciones ni comentarios adicionales.`;

// Traducir un texto al español
export async function translateToSpanish(text: string, context?: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  
  const cacheKey = `es_${text.substring(0, 50)}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  const messages = [
    { role: 'system' as const, content: `${TRANSLATION_SYSTEM_PROMPT}\n${context ? `Contexto: ${context}` : ''}` },
    { role: 'user' as const, content: text }
  ];

  const result = await callAI(messages, 500);

  if (result.success) {
    translationCache[cacheKey] = result.content;
    saveCache();
    return result.content;
  }

  console.warn('⚠️ No se pudo traducir, devolviendo texto original');
  return text;
}

// Prompt para traducción en batch
const BATCH_TRANSLATION_PROMPT = (bookName: string, chapter: number) => 
  `Eres un traductor bíblico experto. Traduce los siguientes versículos de ${bookName} capítulo ${chapter} al español.
Mantén el formato exacto: número de versículo seguido de punto y el texto.
Mantén el estilo solemne y reverente apropiado para la Biblia.
Solo devuelve los versículos traducidos, uno por línea, sin explicaciones.`;

// Parsear versículos traducidos del texto
function parseTranslatedVerses(translatedText: string): Array<{ verse: number; text: string }> | null {
  const lines = translatedText.split('\n').filter((l: string) => l.trim());
  const translatedVerses = lines.map((line: string) => {
    const match = line.match(/^(\d+)\.\s*(.+)$/);
    if (match) {
      return { verse: parseInt(match[1]), text: match[2].trim() };
    }
    return null;
  }).filter(Boolean);

  if (translatedVerses.length > 0) {
    return translatedVerses as Array<{ verse: number; text: string }>;
  }
  return null;
}

// Traducir múltiples versículos en batch
export async function translateVersesToSpanish(
  verses: Array<{ verse: number; text: string }>,
  bookName: string,
  chapter: number
): Promise<Array<{ verse: number; text: string }>> {
  if (verses.length === 0) {
    return verses;
  }

  const cacheKey = `batch_${bookName}_${chapter}`;
  if (typeof window !== 'undefined') {
    const cachedBatch = localStorage.getItem(cacheKey);
    if (cachedBatch) {
      try {
        console.log(`📦 Usando traducción en cache para ${bookName} ${chapter}`);
        return JSON.parse(cachedBatch);
      } catch (e) {
        // Continuar con traducción
      }
    }
  }

  const versesText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
  
  const messages = [
    { role: 'system' as const, content: BATCH_TRANSLATION_PROMPT(bookName, chapter) },
    { role: 'user' as const, content: versesText }
  ];

  console.log(`🔄 Traduciendo ${bookName} ${chapter}...`);
  const result = await callAI(messages, 4000);

  if (result.success) {
    const parsedVerses = parseTranslatedVerses(result.content);
    if (parsedVerses) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(parsedVerses));
      }
      console.log(`✓ Traducción completada con ${result.provider}`);
      return parsedVerses;
    }
  }

  console.warn(`⚠️ No se pudo traducir ${bookName} ${chapter}, devolviendo original`);
  return verses;
}

// Verificar si hay traducción disponible
export function isTranslationAvailable(): boolean {
  return true; // Siempre disponible con el sistema de rotación
}

// Obtener el servicio de traducción activo
export function getActiveTranslationService(): string {
  return 'Ollama + Groq (rotación)';
}

// Limpiar cache de traducciones
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => delete translationCache[key]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bible_translation_cache');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('batch_')) {
        localStorage.removeItem(key);
      }
    });
  }
  console.log('🗑️ Cache de traducciones limpiado');
}
