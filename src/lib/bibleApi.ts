// Bible API service using the free HelloAO Bible API with Reina Valera 1909 (Spanish)

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
  testament: 'old' | 'new';
  chapters: number;
  apiName: string; // Name used in API URL
}

// Complete list of Bible books in Spanish with chapter counts
export const bibleBooks: BibleBook[] = [
  // Antiguo Testamento
  { id: 'genesis', name: 'Génesis', testament: 'old', chapters: 50, apiName: 'GEN' },
  { id: 'exodus', name: 'Éxodo', testament: 'old', chapters: 40, apiName: 'EXO' },
  { id: 'leviticus', name: 'Levítico', testament: 'old', chapters: 27, apiName: 'LEV' },
  { id: 'numbers', name: 'Números', testament: 'old', chapters: 36, apiName: 'NUM' },
  { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old', chapters: 34, apiName: 'DEU' },
  { id: 'joshua', name: 'Josué', testament: 'old', chapters: 24, apiName: 'JOS' },
  { id: 'judges', name: 'Jueces', testament: 'old', chapters: 21, apiName: 'JDG' },
  { id: 'ruth', name: 'Rut', testament: 'old', chapters: 4, apiName: 'RUT' },
  { id: '1samuel', name: '1 Samuel', testament: 'old', chapters: 31, apiName: '1SA' },
  { id: '2samuel', name: '2 Samuel', testament: 'old', chapters: 24, apiName: '2SA' },
  { id: '1kings', name: '1 Reyes', testament: 'old', chapters: 22, apiName: '1KI' },
  { id: '2kings', name: '2 Reyes', testament: 'old', chapters: 25, apiName: '2KI' },
  { id: '1chronicles', name: '1 Crónicas', testament: 'old', chapters: 29, apiName: '1CH' },
  { id: '2chronicles', name: '2 Crónicas', testament: 'old', chapters: 36, apiName: '2CH' },
  { id: 'ezra', name: 'Esdras', testament: 'old', chapters: 10, apiName: 'EZR' },
  { id: 'nehemiah', name: 'Nehemías', testament: 'old', chapters: 13, apiName: 'NEH' },
  { id: 'esther', name: 'Ester', testament: 'old', chapters: 10, apiName: 'EST' },
  { id: 'job', name: 'Job', testament: 'old', chapters: 42, apiName: 'JOB' },
  { id: 'psalms', name: 'Salmos', testament: 'old', chapters: 150, apiName: 'PSA' },
  { id: 'proverbs', name: 'Proverbios', testament: 'old', chapters: 31, apiName: 'PRO' },
  { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old', chapters: 12, apiName: 'ECC' },
  { id: 'songofsolomon', name: 'Cantares', testament: 'old', chapters: 8, apiName: 'SNG' },
  { id: 'isaiah', name: 'Isaías', testament: 'old', chapters: 66, apiName: 'ISA' },
  { id: 'jeremiah', name: 'Jeremías', testament: 'old', chapters: 52, apiName: 'JER' },
  { id: 'lamentations', name: 'Lamentaciones', testament: 'old', chapters: 5, apiName: 'LAM' },
  { id: 'ezekiel', name: 'Ezequiel', testament: 'old', chapters: 48, apiName: 'EZK' },
  { id: 'daniel', name: 'Daniel', testament: 'old', chapters: 12, apiName: 'DAN' },
  { id: 'hosea', name: 'Oseas', testament: 'old', chapters: 14, apiName: 'HOS' },
  { id: 'joel', name: 'Joel', testament: 'old', chapters: 3, apiName: 'JOL' },
  { id: 'amos', name: 'Amós', testament: 'old', chapters: 9, apiName: 'AMO' },
  { id: 'obadiah', name: 'Abdías', testament: 'old', chapters: 1, apiName: 'OBA' },
  { id: 'jonah', name: 'Jonás', testament: 'old', chapters: 4, apiName: 'JON' },
  { id: 'micah', name: 'Miqueas', testament: 'old', chapters: 7, apiName: 'MIC' },
  { id: 'nahum', name: 'Nahúm', testament: 'old', chapters: 3, apiName: 'NAM' },
  { id: 'habakkuk', name: 'Habacuc', testament: 'old', chapters: 3, apiName: 'HAB' },
  { id: 'zephaniah', name: 'Sofonías', testament: 'old', chapters: 3, apiName: 'ZEP' },
  { id: 'haggai', name: 'Hageo', testament: 'old', chapters: 2, apiName: 'HAG' },
  { id: 'zechariah', name: 'Zacarías', testament: 'old', chapters: 14, apiName: 'ZEC' },
  { id: 'malachi', name: 'Malaquías', testament: 'old', chapters: 4, apiName: 'MAL' },
  // Nuevo Testamento
  { id: 'matthew', name: 'Mateo', testament: 'new', chapters: 28, apiName: 'MAT' },
  { id: 'mark', name: 'Marcos', testament: 'new', chapters: 16, apiName: 'MRK' },
  { id: 'luke', name: 'Lucas', testament: 'new', chapters: 24, apiName: 'LUK' },
  { id: 'john', name: 'Juan', testament: 'new', chapters: 21, apiName: 'JHN' },
  { id: 'acts', name: 'Hechos', testament: 'new', chapters: 28, apiName: 'ACT' },
  { id: 'romans', name: 'Romanos', testament: 'new', chapters: 16, apiName: 'ROM' },
  { id: '1corinthians', name: '1 Corintios', testament: 'new', chapters: 16, apiName: '1CO' },
  { id: '2corinthians', name: '2 Corintios', testament: 'new', chapters: 13, apiName: '2CO' },
  { id: 'galatians', name: 'Gálatas', testament: 'new', chapters: 6, apiName: 'GAL' },
  { id: 'ephesians', name: 'Efesios', testament: 'new', chapters: 6, apiName: 'EPH' },
  { id: 'philippians', name: 'Filipenses', testament: 'new', chapters: 4, apiName: 'PHP' },
  { id: 'colossians', name: 'Colosenses', testament: 'new', chapters: 4, apiName: 'COL' },
  { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new', chapters: 5, apiName: '1TH' },
  { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new', chapters: 3, apiName: '2TH' },
  { id: '1timothy', name: '1 Timoteo', testament: 'new', chapters: 6, apiName: '1TI' },
  { id: '2timothy', name: '2 Timoteo', testament: 'new', chapters: 4, apiName: '2TI' },
  { id: 'titus', name: 'Tito', testament: 'new', chapters: 3, apiName: 'TIT' },
  { id: 'philemon', name: 'Filemón', testament: 'new', chapters: 1, apiName: 'PHM' },
  { id: 'hebrews', name: 'Hebreos', testament: 'new', chapters: 13, apiName: 'HEB' },
  { id: 'james', name: 'Santiago', testament: 'new', chapters: 5, apiName: 'JAS' },
  { id: '1peter', name: '1 Pedro', testament: 'new', chapters: 5, apiName: '1PE' },
  { id: '2peter', name: '2 Pedro', testament: 'new', chapters: 3, apiName: '2PE' },
  { id: '1john', name: '1 Juan', testament: 'new', chapters: 5, apiName: '1JN' },
  { id: '2john', name: '2 Juan', testament: 'new', chapters: 1, apiName: '2JN' },
  { id: '3john', name: '3 Juan', testament: 'new', chapters: 1, apiName: '3JN' },
  { id: 'jude', name: 'Judas', testament: 'new', chapters: 1, apiName: 'JUD' },
  { id: 'revelation', name: 'Apocalipsis', testament: 'new', chapters: 22, apiName: 'REV' },
];

// HelloAO Bible API - Free Bible API with Spanish support
const BASE_URL = 'https://bible.helloao.org/api';

// Available Spanish translation
const SPANISH_TRANSLATION = 'spa_rvr'; // Reina Valera

interface HelloAOVerse {
  verse: number;
  text: string;
}

interface HelloAOChapter {
  translation: {
    id: string;
    name: string;
    language: string;
  };
  book: {
    id: string;
    name: string;
  };
  chapter: number;
  verses: HelloAOVerse[];
}

// Fetch a specific chapter from a book
export async function fetchChapter(
  bookId: string,
  chapter: number
): Promise<BiblePassage> {
  const book = getBookById(bookId);
  if (!book) {
    throw new Error(`Book not found: ${bookId}`);
  }

  const response = await fetch(
    `${BASE_URL}/${SPANISH_TRANSLATION}/${book.apiName}/${chapter}.json`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter: ${response.statusText}`);
  }

  const data: HelloAOChapter = await response.json();

  // Transform to our internal format
  return {
    reference: `${book.name} ${chapter}`,
    verses: data.verses.map((v) => ({
      book_id: bookId,
      book_name: book.name,
      chapter: chapter,
      verse: v.verse,
      text: v.text,
    })),
    text: data.verses.map((v) => v.text).join(' '),
    translation_id: data.translation.id,
    translation_name: data.translation.name,
    translation_note: 'Reina Valera',
  };
}

// Get book by ID
export function getBookById(bookId: string): BibleBook | undefined {
  return bibleBooks.find((book) => book.id === bookId);
}

// Get books by testament
export function getBooksByTestament(testament: 'old' | 'new'): BibleBook[] {
  return bibleBooks.filter((book) => book.testament === testament);
}

// Generate chapter array for a book
export function getChaptersForBook(bookId: string): number[] {
  const book = getBookById(bookId);
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}
