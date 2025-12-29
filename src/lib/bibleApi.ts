// Bible API service - Múltiples versiones de la Biblia
// OPTIMIZADO: Lazy loading para cargar solo la versión necesaria
// Versiones en Español, Inglés y Portugués
// Incluye versiones online de bolls.life (NVI, NTV, RV1960, etc.)

// Importar API online
import { fetchOnlineChapter, isOnlineVersion, onlineVersions } from './onlineBibleApi';

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassage {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface BibleBook {
  id: string;
  name: string;
  nameEn: string;
  testament: 'old' | 'new';
  chapters: number;
  index: number;
}

export interface BibleVersion {
  id: string;
  name: string;
  shortName: string;
  language: string;
  languageCode: string;
  description?: string;
  isOnline?: boolean;
}

// Versiones disponibles - Organizadas por idioma
export const bibleVersions: BibleVersion[] = [
  // ===== ESPAÑOL - Versiones Locales =====
  { id: 'rvr', name: 'Reina Valera 1909', shortName: 'RVR', language: 'Español', languageCode: 'es', description: 'Versión clásica en español' },

  // ===== ESPAÑOL - Versiones Online (bolls.life) =====
  ...onlineVersions.map(v => ({
    id: v.id,
    name: v.name,
    shortName: v.shortName,
    language: v.language,
    languageCode: v.languageCode,
    description: '🌐 Online',
    isOnline: true,
  })),

  // ===== INGLÉS =====
  { id: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'English', languageCode: 'en', description: 'Versión clásica en inglés (1611)' },
  { id: 'bbe', name: 'Bible in Basic English', shortName: 'BBE', language: 'English', languageCode: 'en', description: 'Inglés simplificado' },

  // ===== PORTUGUÉS =====
  { id: 'nvi_pt', name: 'Almeida Revisada', shortName: 'ARA', language: 'Português', languageCode: 'pt', description: 'Versión en portugués' },
];

// Agrupar versiones por idioma
export function getVersionsByLanguage(): Record<string, BibleVersion[]> {
  return bibleVersions.reduce((acc, version) => {
    if (!acc[version.language]) {
      acc[version.language] = [];
    }
    acc[version.language].push(version);
    return acc;
  }, {} as Record<string, BibleVersion[]>);
}

// ============ LAZY LOADING DE BIBLIAS ============
type BibleData = Array<{ abbrev: string; chapters: string[][]; name: string }>;

// Cache en memoria para versiones cargadas
const loadedBibles: Record<string, BibleData> = {};

// Mapeo de versiones a archivos (lazy import)
const bibleImports: Record<string, () => Promise<BibleData>> = {
  rvr: () => import('@/data/bible_es_rvr.json').then(m => m.default as BibleData),
  kjv: () => import('@/data/bible_en_kjv.json').then(m => m.default as BibleData),
  nvi_pt: () => import('@/data/bible_pt_nvi.json').then(m => m.default as BibleData),
  bbe: () => import('@/data/bible_en_bbe.json').then(m => m.default as BibleData),
};

// Cargar una versión de la Biblia bajo demanda
async function loadBibleVersion(versionId: string): Promise<BibleData | null> {
  // Si ya está cargada, retornar del cache
  if (loadedBibles[versionId]) {
    return loadedBibles[versionId];
  }

  // Si no existe el import, retornar null
  if (!bibleImports[versionId]) {
    return null;
  }

  try {
    console.log(`📚 Cargando versión ${versionId}...`);
    const data = await bibleImports[versionId]();
    loadedBibles[versionId] = data;
    console.log(`✓ Versión ${versionId} cargada`);
    return data;
  } catch (error) {
    console.error(`Error cargando versión ${versionId}:`, error);
    return null;
  }
}

// Pre-cargar RVR en segundo plano (versión por defecto)
let preloadStarted = false;
export function preloadDefaultBible(): void {
  if (preloadStarted) return;
  preloadStarted = true;

  // Cargar después de que la UI esté lista
  setTimeout(() => {
    loadBibleVersion('rvr');
  }, 100);
}

// Versión actual (por defecto Reina Valera)
let currentVersion = 'rvr';

// Lista completa de los 66 libros de la Biblia
export const bibleBooks: BibleBook[] = [
  // Antiguo Testamento (39 libros)
  { id: 'genesis', name: 'Génesis', nameEn: 'Genesis', testament: 'old', chapters: 50, index: 0 },
  { id: 'exodus', name: 'Éxodo', nameEn: 'Exodus', testament: 'old', chapters: 40, index: 1 },
  { id: 'leviticus', name: 'Levítico', nameEn: 'Leviticus', testament: 'old', chapters: 27, index: 2 },
  { id: 'numbers', name: 'Números', nameEn: 'Numbers', testament: 'old', chapters: 36, index: 3 },
  { id: 'deuteronomy', name: 'Deuteronomio', nameEn: 'Deuteronomy', testament: 'old', chapters: 34, index: 4 },
  { id: 'joshua', name: 'Josué', nameEn: 'Joshua', testament: 'old', chapters: 24, index: 5 },
  { id: 'judges', name: 'Jueces', nameEn: 'Judges', testament: 'old', chapters: 21, index: 6 },
  { id: 'ruth', name: 'Rut', nameEn: 'Ruth', testament: 'old', chapters: 4, index: 7 },
  { id: '1samuel', name: '1 Samuel', nameEn: '1 Samuel', testament: 'old', chapters: 31, index: 8 },
  { id: '2samuel', name: '2 Samuel', nameEn: '2 Samuel', testament: 'old', chapters: 24, index: 9 },
  { id: '1kings', name: '1 Reyes', nameEn: '1 Kings', testament: 'old', chapters: 22, index: 10 },
  { id: '2kings', name: '2 Reyes', nameEn: '2 Kings', testament: 'old', chapters: 25, index: 11 },
  { id: '1chronicles', name: '1 Crónicas', nameEn: '1 Chronicles', testament: 'old', chapters: 29, index: 12 },
  { id: '2chronicles', name: '2 Crónicas', nameEn: '2 Chronicles', testament: 'old', chapters: 36, index: 13 },
  { id: 'ezra', name: 'Esdras', nameEn: 'Ezra', testament: 'old', chapters: 10, index: 14 },
  { id: 'nehemiah', name: 'Nehemías', nameEn: 'Nehemiah', testament: 'old', chapters: 13, index: 15 },
  { id: 'esther', name: 'Ester', nameEn: 'Esther', testament: 'old', chapters: 10, index: 16 },
  { id: 'job', name: 'Job', nameEn: 'Job', testament: 'old', chapters: 42, index: 17 },
  { id: 'psalms', name: 'Salmos', nameEn: 'Psalms', testament: 'old', chapters: 150, index: 18 },
  { id: 'proverbs', name: 'Proverbios', nameEn: 'Proverbs', testament: 'old', chapters: 31, index: 19 },
  { id: 'ecclesiastes', name: 'Eclesiastés', nameEn: 'Ecclesiastes', testament: 'old', chapters: 12, index: 20 },
  { id: 'songofsolomon', name: 'Cantares', nameEn: 'Song of Solomon', testament: 'old', chapters: 8, index: 21 },
  { id: 'isaiah', name: 'Isaías', nameEn: 'Isaiah', testament: 'old', chapters: 66, index: 22 },
  { id: 'jeremiah', name: 'Jeremías', nameEn: 'Jeremiah', testament: 'old', chapters: 52, index: 23 },
  { id: 'lamentations', name: 'Lamentaciones', nameEn: 'Lamentations', testament: 'old', chapters: 5, index: 24 },
  { id: 'ezekiel', name: 'Ezequiel', nameEn: 'Ezekiel', testament: 'old', chapters: 48, index: 25 },
  { id: 'daniel', name: 'Daniel', nameEn: 'Daniel', testament: 'old', chapters: 12, index: 26 },
  { id: 'hosea', name: 'Oseas', nameEn: 'Hosea', testament: 'old', chapters: 14, index: 27 },
  { id: 'joel', name: 'Joel', nameEn: 'Joel', testament: 'old', chapters: 3, index: 28 },
  { id: 'amos', name: 'Amós', nameEn: 'Amos', testament: 'old', chapters: 9, index: 29 },
  { id: 'obadiah', name: 'Abdías', nameEn: 'Obadiah', testament: 'old', chapters: 1, index: 30 },
  { id: 'jonah', name: 'Jonás', nameEn: 'Jonah', testament: 'old', chapters: 4, index: 31 },
  { id: 'micah', name: 'Miqueas', nameEn: 'Micah', testament: 'old', chapters: 7, index: 32 },
  { id: 'nahum', name: 'Nahúm', nameEn: 'Nahum', testament: 'old', chapters: 3, index: 33 },
  { id: 'habakkuk', name: 'Habacuc', nameEn: 'Habakkuk', testament: 'old', chapters: 3, index: 34 },
  { id: 'zephaniah', name: 'Sofonías', nameEn: 'Zephaniah', testament: 'old', chapters: 3, index: 35 },
  { id: 'haggai', name: 'Hageo', nameEn: 'Haggai', testament: 'old', chapters: 2, index: 36 },
  { id: 'zechariah', name: 'Zacarías', nameEn: 'Zechariah', testament: 'old', chapters: 14, index: 37 },
  { id: 'malachi', name: 'Malaquías', nameEn: 'Malachi', testament: 'old', chapters: 4, index: 38 },
  // Nuevo Testamento (27 libros)
  { id: 'matthew', name: 'Mateo', nameEn: 'Matthew', testament: 'new', chapters: 28, index: 39 },
  { id: 'mark', name: 'Marcos', nameEn: 'Mark', testament: 'new', chapters: 16, index: 40 },
  { id: 'luke', name: 'Lucas', nameEn: 'Luke', testament: 'new', chapters: 24, index: 41 },
  { id: 'john', name: 'Juan', nameEn: 'John', testament: 'new', chapters: 21, index: 42 },
  { id: 'acts', name: 'Hechos', nameEn: 'Acts', testament: 'new', chapters: 28, index: 43 },
  { id: 'romans', name: 'Romanos', nameEn: 'Romans', testament: 'new', chapters: 16, index: 44 },
  { id: '1corinthians', name: '1 Corintios', nameEn: '1 Corinthians', testament: 'new', chapters: 16, index: 45 },
  { id: '2corinthians', name: '2 Corintios', nameEn: '2 Corinthians', testament: 'new', chapters: 13, index: 46 },
  { id: 'galatians', name: 'Gálatas', nameEn: 'Galatians', testament: 'new', chapters: 6, index: 47 },
  { id: 'ephesians', name: 'Efesios', nameEn: 'Ephesians', testament: 'new', chapters: 6, index: 48 },
  { id: 'philippians', name: 'Filipenses', nameEn: 'Philippians', testament: 'new', chapters: 4, index: 49 },
  { id: 'colossians', name: 'Colosenses', nameEn: 'Colossians', testament: 'new', chapters: 4, index: 50 },
  { id: '1thessalonians', name: '1 Tesalonicenses', nameEn: '1 Thessalonians', testament: 'new', chapters: 5, index: 51 },
  { id: '2thessalonians', name: '2 Tesalonicenses', nameEn: '2 Thessalonians', testament: 'new', chapters: 3, index: 52 },
  { id: '1timothy', name: '1 Timoteo', nameEn: '1 Timothy', testament: 'new', chapters: 6, index: 53 },
  { id: '2timothy', name: '2 Timoteo', nameEn: '2 Timothy', testament: 'new', chapters: 4, index: 54 },
  { id: 'titus', name: 'Tito', nameEn: 'Titus', testament: 'new', chapters: 3, index: 55 },
  { id: 'philemon', name: 'Filemón', nameEn: 'Philemon', testament: 'new', chapters: 1, index: 56 },
  { id: 'hebrews', name: 'Hebreos', nameEn: 'Hebrews', testament: 'new', chapters: 13, index: 57 },
  { id: 'james', name: 'Santiago', nameEn: 'James', testament: 'new', chapters: 5, index: 58 },
  { id: '1peter', name: '1 Pedro', nameEn: '1 Peter', testament: 'new', chapters: 5, index: 59 },
  { id: '2peter', name: '2 Pedro', nameEn: '2 Peter', testament: 'new', chapters: 3, index: 60 },
  { id: '1john', name: '1 Juan', nameEn: '1 John', testament: 'new', chapters: 5, index: 61 },
  { id: '2john', name: '2 Juan', nameEn: '2 John', testament: 'new', chapters: 1, index: 62 },
  { id: '3john', name: '3 Juan', nameEn: '3 John', testament: 'new', chapters: 1, index: 63 },
  { id: 'jude', name: 'Judas', nameEn: 'Jude', testament: 'new', chapters: 1, index: 64 },
  { id: 'revelation', name: 'Apocalipsis', nameEn: 'Revelation', testament: 'new', chapters: 22, index: 65 },
];

// ============ Gestión de versiones ============
export function setVersion(versionId: string): void {
  if (bibleImports[versionId] || isOnlineVersion(versionId)) {
    currentVersion = versionId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible_version', versionId);
    }
  }
}

export function getVersion(): string {
  const saved = localStorage.getItem('bible_version');
  if (saved && (bibleImports[saved] || isOnlineVersion(saved))) {
    currentVersion = saved;
  } else {
    // Forzar RVR como versión por defecto si no hay nada guardado
    currentVersion = 'rvr';
    localStorage.setItem('bible_version', 'rvr');
  }
} else {
  currentVersion = 'rvr';
}
return currentVersion;
}

export function getCurrentVersionInfo(): BibleVersion {
  return bibleVersions.find(v => v.id === getVersion()) || bibleVersions[0];
}

// ============ Función principal (ASYNC con lazy loading) ============
export async function fetchChapter(
  bookId: string,
  chapter: number,
  versionId?: string,
  showSpanishEquivalent: boolean = false
): Promise<BiblePassage> {
  const version = versionId || getVersion();
  const versionInfo = bibleVersions.find(v => v.id === version) || bibleVersions[0];

  const book = getBookById(bookId);
  if (!book) {
    throw new Error(`Libro no encontrado: ${bookId}`);
  }

  console.log(`📖 Cargando ${book.name} ${chapter} (${versionInfo.shortName})...`);

  const bookName = book.name;
  const isSpanishVersion = versionInfo.languageCode === 'es';

  // ===== VERSIONES ONLINE (bolls.life) =====
  if (isOnlineVersion(version)) {
    console.log(`  🌐 Descargando desde bolls.life...`);

    const onlineVerses = await fetchOnlineChapter(version, book.index, chapter);

    if (!onlineVerses || onlineVerses.length === 0) {
      throw new Error(`No se pudo cargar ${book.name} ${chapter} desde ${versionInfo.name}`);
    }

    const verses: BibleVerse[] = onlineVerses.map((text, index) => ({
      book_id: book.id,
      book_name: bookName,
      chapter: chapter,
      verse: index + 1,
      text: text.trim(),
    }));

    console.log(`  ✓ Cargado ${bookName} ${chapter} (${verses.length} versículos) [Online]`);

    return {
      reference: `${bookName} ${chapter}`,
      verses,
      text: verses.map((v) => v.text).join(' '),
      translation_id: version,
      translation_name: versionInfo.name,
      translation_note: `${versionInfo.language} 🌐`,
    };
  }

  // ===== VERSIONES LOCALES (lazy loading) =====
  const bibleData = await loadBibleVersion(version);

  if (!bibleData) {
    throw new Error(`Versión no encontrada: ${version}`);
  }

  const bookData = bibleData[book.index];

  if (!bookData || !bookData.chapters) {
    throw new Error(`No se encontraron datos para ${book.name}`);
  }

  const chapterData = bookData.chapters[chapter - 1];

  if (!chapterData || chapterData.length === 0) {
    throw new Error(`Capítulo ${chapter} no encontrado en ${book.name}`);
  }

  // Si se solicita equivalente en español y no es versión española, usar RVR
  let versesData = chapterData;
  let actualVersion = versionInfo;

  if (showSpanishEquivalent && !isSpanishVersion) {
    const spanishData = await loadBibleVersion('rvr');
    if (spanishData) {
      const spanishBookData = spanishData[book.index];
      if (spanishBookData?.chapters?.[chapter - 1]) {
        versesData = spanishBookData.chapters[chapter - 1];
        actualVersion = bibleVersions.find(v => v.id === 'rvr') || versionInfo;
        console.log(`  → Mostrando equivalente en español (RVR)`);
      }
    }
  }

  const verses: BibleVerse[] = versesData.map((text, index) => ({
    book_id: book.id,
    book_name: bookName,
    chapter: chapter,
    verse: index + 1,
    text: text.trim(),
  }));

  console.log(`  ✓ Cargado ${bookName} ${chapter} (${verses.length} versículos)`);

  return {
    reference: `${bookName} ${chapter}`,
    verses,
    text: verses.map((v) => v.text).join(' '),
    translation_id: showSpanishEquivalent && !isSpanishVersion ? 'rvr' : version,
    translation_name: actualVersion.name,
    translation_note: showSpanishEquivalent && !isSpanishVersion
      ? `Equivalente en español (${versionInfo.shortName} → RVR)`
      : versionInfo.language,
  };
}

// ============ Comparar versiones ============
export async function compareVersions(
  bookId: string,
  chapter: number,
  verse: number
): Promise<Array<{ version: BibleVersion; text: string }>> {
  const results: Array<{ version: BibleVersion; text: string }> = [];
  const book = getBookById(bookId);

  if (!book) return results;

  // Solo comparar versiones locales cargadas
  for (const versionId of Object.keys(bibleImports)) {
    const bibleData = await loadBibleVersion(versionId);
    if (!bibleData) continue;

    const bookData = bibleData[book.index];
    if (!bookData?.chapters) continue;

    const chapterData = bookData.chapters[chapter - 1];
    if (!chapterData) continue;

    const verseText = chapterData[verse - 1];
    if (verseText) {
      const version = bibleVersions.find(v => v.id === versionId);
      if (version) {
        results.push({
          version,
          text: verseText.trim(),
        });
      }
    }
  }

  return results;
}

// ============ Búsqueda ============
export async function searchVerses(query: string, versionId?: string): Promise<BiblePassage | null> {
  const version = versionId || getVersion();
  const bibleData = await loadBibleVersion(version);
  const versionInfo = bibleVersions.find(v => v.id === version) || bibleVersions[0];

  if (!bibleData) return null;

  const results: BibleVerse[] = [];
  const searchTerm = query.toLowerCase();

  for (let bookIndex = 0; bookIndex < bibleData.length && results.length < 20; bookIndex++) {
    const bookData = bibleData[bookIndex];
    const book = bibleBooks[bookIndex];

    if (!bookData?.chapters || !book) continue;

    const bookName = book.name;

    for (let chapterIndex = 0; chapterIndex < bookData.chapters.length && results.length < 20; chapterIndex++) {
      const chapter = bookData.chapters[chapterIndex];

      for (let verseIndex = 0; verseIndex < chapter.length && results.length < 20; verseIndex++) {
        const verseText = chapter[verseIndex];

        if (verseText.toLowerCase().includes(searchTerm)) {
          results.push({
            book_id: book.id,
            book_name: bookName,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
            text: verseText,
          });
        }
      }
    }
  }

  if (results.length === 0) return null;

  return {
    reference: `Búsqueda: "${query}"`,
    verses: results,
    text: results.map((v) => `${v.book_name} ${v.chapter}:${v.verse} - ${v.text}`).join('\n'),
    translation_id: version,
    translation_name: versionInfo.name,
    translation_note: `${results.length} resultados encontrados`,
  };
}

// ============ Versículo del día ============
export async function getVerseOfTheDay(): Promise<BiblePassage | null> {
  const popularVerses = [
    { book: 'john', chapter: 3, verse: 16 },
    { book: 'psalms', chapter: 23, verse: 1 },
    { book: 'philippians', chapter: 4, verse: 13 },
    { book: 'jeremiah', chapter: 29, verse: 11 },
    { book: 'romans', chapter: 8, verse: 28 },
    { book: 'isaiah', chapter: 41, verse: 10 },
    { book: 'proverbs', chapter: 3, verse: 5 },
    { book: 'matthew', chapter: 11, verse: 28 },
    { book: 'psalms', chapter: 46, verse: 1 },
    { book: 'joshua', chapter: 1, verse: 9 },
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const verseData = popularVerses[dayOfYear % popularVerses.length];

  const version = getVersion();
  const bibleData = await loadBibleVersion(version);
  const versionInfo = bibleVersions.find(v => v.id === version) || bibleVersions[0];

  const book = getBookById(verseData.book);
  if (!book || !bibleData) return null;

  const bookData = bibleData[book.index];
  if (!bookData?.chapters) return null;

  const chapterData = bookData.chapters[verseData.chapter - 1];
  if (!chapterData) return null;

  const verseText = chapterData[verseData.verse - 1];
  if (!verseText) return null;

  const bookName = book.name;

  return {
    reference: `${bookName} ${verseData.chapter}:${verseData.verse}`,
    verses: [{
      book_id: book.id,
      book_name: bookName,
      chapter: verseData.chapter,
      verse: verseData.verse,
      text: verseText,
    }],
    text: verseText,
    translation_id: version,
    translation_name: versionInfo.name,
    translation_note: 'Versículo del día',
  };
}

// ============ Utilidades ============
export function getBookById(bookId: string): BibleBook | undefined {
  return bibleBooks.find((book) => book.id === bookId);
}

export function getBooksByTestament(testament: 'old' | 'new'): BibleBook[] {
  return bibleBooks.filter((book) => book.testament === testament);
}

export function getChaptersForBook(bookId: string): number[] {
  const book = getBookById(bookId);
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}

export function getAllBooks(): BibleBook[] {
  return bibleBooks;
}

export const bibleStats = {
  totalBooks: 66,
  oldTestamentBooks: 39,
  newTestamentBooks: 27,
  totalChapters: 1189,
  totalVerses: 31102,
};
