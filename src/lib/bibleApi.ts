// Bible API service - Múltiples versiones de la Biblia
// OPTIMIZADO: Lazy loading para cargar solo la versión necesaria
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
  abbrev: string;
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

// Versiones disponibles
export const bibleVersions: BibleVersion[] = [
  { id: 'rvr', name: 'Reina Valera 1909', shortName: 'RVR', language: 'Español', languageCode: 'es', description: 'Versión clásica en español' },
  ...onlineVersions.map(v => ({
    id: v.id,
    name: v.name,
    shortName: v.shortName,
    language: v.language,
    languageCode: v.languageCode,
    description: '🌐 Online',
    isOnline: true,
  })),
  { id: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'English', languageCode: 'en', description: 'Versión clásica en inglés' },
  { id: 'bbe', name: 'Bible in Basic English', shortName: 'BBE', language: 'English', languageCode: 'en', description: 'Inglés simplificado' },
  { id: 'nvi_pt', name: 'Almeida Revisada', shortName: 'ARA', language: 'Português', languageCode: 'pt', description: 'Versión en portugués' },
];

export const BIBLE_VERSIONS = bibleVersions;

// Agrupar versiones por idioma
export function getVersionsByLanguage(): Record<string, BibleVersion[]> {
  return bibleVersions.reduce((acc, version) => {
    if (!acc[version.language]) acc[version.language] = [];
    acc[version.language].push(version);
    return acc;
  }, {} as Record<string, BibleVersion[]>);
}

// ============ LAZY LOADING ============
type BibleData = Array<{ abbrev: string; chapters: string[][]; name: string }>;
const loadedBibles: Record<string, BibleData> = {};
const bibleImports: Record<string, () => Promise<BibleData>> = {
  rvr: () => import('@/data/bible_es_rvr.json').then(m => m.default as BibleData),
  kjv: () => import('@/data/bible_en_kjv.json').then(m => m.default as BibleData),
  nvi_pt: () => import('@/data/bible_pt_nvi.json').then(m => m.default as BibleData),
  bbe: () => import('@/data/bible_en_bbe.json').then(m => m.default as BibleData),
};

async function loadBibleVersion(versionId: string): Promise<BibleData | null> {
  if (loadedBibles[versionId]) return loadedBibles[versionId];
  if (!bibleImports[versionId]) return null;
  try {
    const data = await bibleImports[versionId]();
    loadedBibles[versionId] = data;
    return data;
  } catch (error) {
    console.error(`Error cargando versión ${versionId}:`, error);
    return null;
  }
}

export function preloadDefaultBible(): void {
  setTimeout(() => loadBibleVersion('rvr'), 100);
}

let currentVersion = 'rvr';

export const bibleBooks: BibleBook[] = [
  { id: 'genesis', name: 'Génesis', abbrev: 'Gén', nameEn: 'Genesis', testament: 'old', chapters: 50, index: 0 },
  { id: 'exodus', name: 'Éxodo', abbrev: 'Éxo', nameEn: 'Exodus', testament: 'old', chapters: 40, index: 1 },
  { id: 'leviticus', name: 'Levítico', abbrev: 'Lev', nameEn: 'Leviticus', testament: 'old', chapters: 27, index: 2 },
  { id: 'numbers', name: 'Números', abbrev: 'Núm', nameEn: 'Numbers', testament: 'old', chapters: 36, index: 3 },
  { id: 'deuteronomy', name: 'Deuteronomio', abbrev: 'Deu', nameEn: 'Deuteronomy', testament: 'old', chapters: 34, index: 4 },
  { id: 'joshua', name: 'Josué', abbrev: 'Jos', nameEn: 'Joshua', testament: 'old', chapters: 24, index: 5 },
  { id: 'judges', name: 'Jueces', abbrev: 'Jue', nameEn: 'Judges', testament: 'old', chapters: 21, index: 6 },
  { id: 'ruth', name: 'Rut', abbrev: 'Rut', nameEn: 'Ruth', testament: 'old', chapters: 4, index: 7 },
  { id: '1samuel', name: '1 Samuel', abbrev: '1 Sam', nameEn: '1 Samuel', testament: 'old', chapters: 31, index: 8 },
  { id: '2samuel', name: '2 Samuel', abbrev: '2 Sam', nameEn: '2 Samuel', testament: 'old', chapters: 24, index: 9 },
  { id: '1kings', name: '1 Reyes', abbrev: '1 Rey', nameEn: '1 Kings', testament: 'old', chapters: 22, index: 10 },
  { id: '2kings', name: '2 Reyes', abbrev: '2 Rey', nameEn: '2 Kings', testament: 'old', chapters: 25, index: 11 },
  { id: '1chronicles', name: '1 Crónicas', abbrev: '1 Cró', nameEn: '1 Chronicles', testament: 'old', chapters: 29, index: 12 },
  { id: '2chronicles', name: '2 Crónicas', abbrev: '2 Cró', nameEn: '2 Chronicles', testament: 'old', chapters: 36, index: 13 },
  { id: 'ezra', name: 'Esdras', abbrev: 'Esd', nameEn: 'Ezra', testament: 'old', chapters: 10, index: 14 },
  { id: 'nehemiah', name: 'Nehemías', abbrev: 'Neh', nameEn: 'Nehemiah', testament: 'old', chapters: 13, index: 15 },
  { id: 'esther', name: 'Ester', abbrev: 'Est', nameEn: 'Esther', testament: 'old', chapters: 10, index: 16 },
  { id: 'job', name: 'Job', abbrev: 'Job', nameEn: 'Job', testament: 'old', chapters: 42, index: 17 },
  { id: 'psalms', name: 'Salmos', abbrev: 'Sal', nameEn: 'Psalms', testament: 'old', chapters: 150, index: 18 },
  { id: 'proverbs', name: 'Proverbios', abbrev: 'Pro', nameEn: 'Proverbs', testament: 'old', chapters: 31, index: 19 },
  { id: 'ecclesiastes', name: 'Eclesiastés', abbrev: 'Ecl', nameEn: 'Ecclesiastes', testament: 'old', chapters: 12, index: 20 },
  { id: 'songofsolomon', name: 'Cantares', abbrev: 'Cant', nameEn: 'Song of Solomon', testament: 'old', chapters: 8, index: 21 },
  { id: 'isaiah', name: 'Isaías', abbrev: 'Isa', nameEn: 'Isaiah', testament: 'old', chapters: 66, index: 22 },
  { id: 'jeremiah', name: 'Jeremías', abbrev: 'Jer', nameEn: 'Jeremiah', testament: 'old', chapters: 52, index: 23 },
  { id: 'lamentations', name: 'Lamentaciones', abbrev: 'Lam', nameEn: 'Lamentations', testament: 'old', chapters: 5, index: 24 },
  { id: 'ezekiel', name: 'Ezequiel', abbrev: 'Eze', nameEn: 'Ezekiel', testament: 'old', chapters: 48, index: 25 },
  { id: 'daniel', name: 'Daniel', abbrev: 'Dan', nameEn: 'Daniel', testament: 'old', chapters: 12, index: 26 },
  { id: 'hosea', name: 'Oseas', abbrev: 'Ose', nameEn: 'Hosea', testament: 'old', chapters: 14, index: 27 },
  { id: 'joel', name: 'Joel', abbrev: 'Joe', nameEn: 'Joel', testament: 'old', chapters: 3, index: 28 },
  { id: 'amos', name: 'Amós', abbrev: 'Amó', nameEn: 'Amos', testament: 'old', chapters: 9, index: 29 },
  { id: 'obadiah', name: 'Abdías', abbrev: 'Abd', nameEn: 'Obadiah', testament: 'old', chapters: 1, index: 30 },
  { id: 'jonah', name: 'Jonás', abbrev: 'Jon', nameEn: 'Jonah', testament: 'old', chapters: 4, index: 31 },
  { id: 'micah', name: 'Miqueas', abbrev: 'Miq', nameEn: 'Micah', testament: 'old', chapters: 7, index: 32 },
  { id: 'nahum', name: 'Nahúm', abbrev: 'Nah', nameEn: 'Nahum', testament: 'old', chapters: 3, index: 33 },
  { id: 'habakkuk', name: 'Habacuc', abbrev: 'Hab', nameEn: 'Habakkuk', testament: 'old', chapters: 3, index: 34 },
  { id: 'zephaniah', name: 'Sofonías', abbrev: 'Sof', nameEn: 'Zephaniah', testament: 'old', chapters: 3, index: 35 },
  { id: 'haggai', name: 'Hageo', abbrev: 'Hag', nameEn: 'Haggai', testament: 'old', chapters: 2, index: 36 },
  { id: 'zechariah', name: 'Zacarías', abbrev: 'Zac', nameEn: 'Zechariah', testament: 'old', chapters: 14, index: 37 },
  { id: 'malachi', name: 'Malaquías', abbrev: 'Mal', nameEn: 'Malachi', testament: 'old', chapters: 4, index: 38 },
  { id: 'matthew', name: 'Mateo', abbrev: 'Mat', nameEn: 'Matthew', testament: 'new', chapters: 28, index: 39 },
  { id: 'mark', name: 'Marcos', abbrev: 'Mar', nameEn: 'Mark', testament: 'new', chapters: 16, index: 40 },
  { id: 'luke', name: 'Lucas', abbrev: 'Luc', nameEn: 'Luke', testament: 'new', chapters: 24, index: 41 },
  { id: 'john', name: 'Juan', abbrev: 'Jua', nameEn: 'John', testament: 'new', chapters: 21, index: 42 },
  { id: 'acts', name: 'Hechos', abbrev: 'Hec', nameEn: 'Acts', testament: 'new', chapters: 28, index: 43 },
  { id: 'romans', name: 'Romanos', abbrev: 'Rom', nameEn: 'Romans', testament: 'new', chapters: 16, index: 44 },
  { id: '1corinthians', name: '1 Corintios', abbrev: '1 Cor', nameEn: '1 Corinthians', testament: 'new', chapters: 16, index: 45 },
  { id: '2corinthians', name: '2 Corintios', abbrev: '2 Cor', nameEn: '2 Corinthians', testament: 'new', chapters: 13, index: 46 },
  { id: 'galatians', name: 'Gálatas', abbrev: 'Gál', nameEn: 'Galatians', testament: 'new', chapters: 6, index: 47 },
  { id: 'ephesians', name: 'Efesios', abbrev: 'Efe', nameEn: 'Ephesians', testament: 'new', chapters: 6, index: 48 },
  { id: 'philippians', name: 'Filipenses', abbrev: 'Fil', nameEn: 'Philippians', testament: 'new', chapters: 4, index: 49 },
  { id: 'colossians', name: 'Colosenses', abbrev: 'Col', nameEn: 'Colossians', testament: 'new', chapters: 4, index: 50 },
  { id: '1thessalonians', name: '1 Tesalonicenses', abbrev: '1 Tes', nameEn: '1 Thessalonians', testament: 'new', chapters: 5, index: 51 },
  { id: '2thessalonians', name: '2 Tesalonicenses', abbrev: '2 Tes', nameEn: '2 Thessalonians', testament: 'new', chapters: 3, index: 52 },
  { id: '1timothy', name: '1 Timoteo', abbrev: '1 Tim', nameEn: '1 Timothy', testament: 'new', chapters: 6, index: 53 },
  { id: '2timothy', name: '2 Timoteo', abbrev: '2 Tim', nameEn: '2 Timothy', testament: 'new', chapters: 4, index: 54 },
  { id: 'titus', name: 'Tito', abbrev: 'Tit', nameEn: 'Titus', testament: 'new', chapters: 3, index: 55 },
  { id: 'philemon', name: 'Filemón', abbrev: 'Flm', nameEn: 'Philemon', testament: 'new', chapters: 1, index: 56 },
  { id: 'hebrews', name: 'Hebreos', abbrev: 'Heb', nameEn: 'Hebrews', testament: 'new', chapters: 13, index: 57 },
  { id: 'james', name: 'Santiago', abbrev: 'San', nameEn: 'James', testament: 'new', chapters: 5, index: 58 },
  { id: '1peter', name: '1 Pedro', abbrev: '1 Ped', nameEn: '1 Peter', testament: 'new', chapters: 5, index: 59 },
  { id: '2peter', name: '2 Pedro', abbrev: '2 Ped', nameEn: '2 Peter', testament: 'new', chapters: 3, index: 60 },
  { id: '1john', name: '1 Juan', abbrev: '1 Jua', nameEn: '1 John', testament: 'new', chapters: 5, index: 61 },
  { id: '2john', name: '2 Juan', abbrev: '2 Jua', nameEn: '2 John', testament: 'new', chapters: 1, index: 62 },
  { id: '3john', name: '3 Juan', abbrev: '3 Jua', nameEn: '3 John', testament: 'new', chapters: 1, index: 63 },
  { id: 'jude', name: 'Judas', abbrev: 'Jud', nameEn: 'Jude', testament: 'new', chapters: 1, index: 64 },
  { id: 'revelation', name: 'Apocalipsis', abbrev: 'Apo', nameEn: 'Revelation', testament: 'new', chapters: 22, index: 65 },
];

export function setVersion(v: string) { currentVersion = v; }
export function getVersion() { return currentVersion || 'rvr'; }
export function getCurrentVersionInfo() { return bibleVersions.find(v => v.id === getVersion()) || bibleVersions[0]; }

export async function fetchChapter(bookId: string, chapter: number, versionId?: string): Promise<BiblePassage> {
  const version = versionId || getVersion();
  const versionInfo = bibleVersions.find(v => v.id === version) || bibleVersions[0];
  const book = getBookById(bookId);
  if (!book) throw new Error(`Libro no encontrado: ${bookId}`);

  if (isOnlineVersion(version)) {
    const versesData = await fetchOnlineChapter(version, book.index, chapter);
    const verses = versesData.map((text, i) => ({
      book_id: book.id, book_name: book.name, chapter, verse: i + 1, text: text.trim(),
    }));
    return {
      reference: `${book.name} ${chapter}`,
      verses,
      text: verses.map(v => v.text).join(' '),
      translation_id: version,
      translation_name: versionInfo.name,
      translation_note: 'Online',
    };
  }

  const bibleData = await loadBibleVersion(version);
  if (!bibleData) throw new Error(`Versión no cargada: ${version}`);
  const chapterData = bibleData[book.index].chapters[chapter - 1];
  const verses = chapterData.map((text, i) => ({
    book_id: book.id, book_name: book.name, chapter, verse: i + 1, text: text.trim(),
  }));
  return {
    reference: `${book.name} ${chapter}`,
    verses,
    text: verses.map(v => v.text).join(' '),
    translation_id: version,
    translation_name: versionInfo.name,
    translation_note: versionInfo.language,
  };
}

export const getPassage = fetchChapter;

export function getBookById(id: string) { return bibleBooks.find(b => b.id === id); }
export function getAllBooks() { return bibleBooks; }
export function getChaptersForBook(id: string) { return Array.from({ length: getBookById(id)?.chapters || 0 }, (_, i) => i + 1); }
export function getBooksByTestament(testament: 'old' | 'new') { return bibleBooks.filter(b => b.testament === testament); }

export async function searchVerses(query: string, versionId?: string): Promise<BiblePassage | null> {
  const version = versionId || getVersion();
  const bibleData = await loadBibleVersion(version);
  if (!bibleData) return null;
  const results: BibleVerse[] = [];
  const searchTerm = query.toLowerCase();
  for (let bIdx = 0; bIdx < bibleData.length && results.length < 20; bIdx++) {
    const book = bibleBooks[bIdx];
    const bData = bibleData[bIdx];
    for (let cIdx = 0; cIdx < bData.chapters.length && results.length < 20; cIdx++) {
      const cData = bData.chapters[cIdx];
      for (let vIdx = 0; vIdx < cData.length && results.length < 20; vIdx++) {
        if (cData[vIdx].toLowerCase().includes(searchTerm)) {
          results.push({
            book_id: book.id, book_name: book.name, chapter: cIdx + 1, verse: vIdx + 1, text: cData[vIdx]
          });
        }
      }
    }
  }
  if (results.length === 0) return null;
  return {
    reference: `Búsqueda: ${query}`,
    verses: results,
    text: results.map(v => v.text).join(' '),
    translation_id: version,
    translation_name: version,
    translation_note: ''
  };
}

export async function getVerseOfTheDay(): Promise<BiblePassage | null> {
  const version = getVersion();
  const book = bibleBooks[0]; // Génesis por defecto si falla algo
  return fetchChapter(book.id, 1);
}
