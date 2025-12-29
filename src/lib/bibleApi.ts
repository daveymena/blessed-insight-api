// Bible API service using bible-api.com with Reina Valera 1960 (Spanish)

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
}

// Complete list of Bible books in Spanish with chapter counts
export const bibleBooks: BibleBook[] = [
  // Antiguo Testamento
  { id: 'genesis', name: 'Génesis', testament: 'old', chapters: 50 },
  { id: 'exodus', name: 'Éxodo', testament: 'old', chapters: 40 },
  { id: 'leviticus', name: 'Levítico', testament: 'old', chapters: 27 },
  { id: 'numbers', name: 'Números', testament: 'old', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old', chapters: 34 },
  { id: 'joshua', name: 'Josué', testament: 'old', chapters: 24 },
  { id: 'judges', name: 'Jueces', testament: 'old', chapters: 21 },
  { id: 'ruth', name: 'Rut', testament: 'old', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', testament: 'old', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', testament: 'old', chapters: 24 },
  { id: '1kings', name: '1 Reyes', testament: 'old', chapters: 22 },
  { id: '2kings', name: '2 Reyes', testament: 'old', chapters: 25 },
  { id: '1chronicles', name: '1 Crónicas', testament: 'old', chapters: 29 },
  { id: '2chronicles', name: '2 Crónicas', testament: 'old', chapters: 36 },
  { id: 'ezra', name: 'Esdras', testament: 'old', chapters: 10 },
  { id: 'nehemiah', name: 'Nehemías', testament: 'old', chapters: 13 },
  { id: 'esther', name: 'Ester', testament: 'old', chapters: 10 },
  { id: 'job', name: 'Job', testament: 'old', chapters: 42 },
  { id: 'psalms', name: 'Salmos', testament: 'old', chapters: 150 },
  { id: 'proverbs', name: 'Proverbios', testament: 'old', chapters: 31 },
  { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old', chapters: 12 },
  { id: 'songofsolomon', name: 'Cantares', testament: 'old', chapters: 8 },
  { id: 'isaiah', name: 'Isaías', testament: 'old', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremías', testament: 'old', chapters: 52 },
  { id: 'lamentations', name: 'Lamentaciones', testament: 'old', chapters: 5 },
  { id: 'ezekiel', name: 'Ezequiel', testament: 'old', chapters: 48 },
  { id: 'daniel', name: 'Daniel', testament: 'old', chapters: 12 },
  { id: 'hosea', name: 'Oseas', testament: 'old', chapters: 14 },
  { id: 'joel', name: 'Joel', testament: 'old', chapters: 3 },
  { id: 'amos', name: 'Amós', testament: 'old', chapters: 9 },
  { id: 'obadiah', name: 'Abdías', testament: 'old', chapters: 1 },
  { id: 'jonah', name: 'Jonás', testament: 'old', chapters: 4 },
  { id: 'micah', name: 'Miqueas', testament: 'old', chapters: 7 },
  { id: 'nahum', name: 'Nahúm', testament: 'old', chapters: 3 },
  { id: 'habakkuk', name: 'Habacuc', testament: 'old', chapters: 3 },
  { id: 'zephaniah', name: 'Sofonías', testament: 'old', chapters: 3 },
  { id: 'haggai', name: 'Hageo', testament: 'old', chapters: 2 },
  { id: 'zechariah', name: 'Zacarías', testament: 'old', chapters: 14 },
  { id: 'malachi', name: 'Malaquías', testament: 'old', chapters: 4 },
  // Nuevo Testamento
  { id: 'matthew', name: 'Mateo', testament: 'new', chapters: 28 },
  { id: 'mark', name: 'Marcos', testament: 'new', chapters: 16 },
  { id: 'luke', name: 'Lucas', testament: 'new', chapters: 24 },
  { id: 'john', name: 'Juan', testament: 'new', chapters: 21 },
  { id: 'acts', name: 'Hechos', testament: 'new', chapters: 28 },
  { id: 'romans', name: 'Romanos', testament: 'new', chapters: 16 },
  { id: '1corinthians', name: '1 Corintios', testament: 'new', chapters: 16 },
  { id: '2corinthians', name: '2 Corintios', testament: 'new', chapters: 13 },
  { id: 'galatians', name: 'Gálatas', testament: 'new', chapters: 6 },
  { id: 'ephesians', name: 'Efesios', testament: 'new', chapters: 6 },
  { id: 'philippians', name: 'Filipenses', testament: 'new', chapters: 4 },
  { id: 'colossians', name: 'Colosenses', testament: 'new', chapters: 4 },
  { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new', chapters: 5 },
  { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new', chapters: 3 },
  { id: '1timothy', name: '1 Timoteo', testament: 'new', chapters: 6 },
  { id: '2timothy', name: '2 Timoteo', testament: 'new', chapters: 4 },
  { id: 'titus', name: 'Tito', testament: 'new', chapters: 3 },
  { id: 'philemon', name: 'Filemón', testament: 'new', chapters: 1 },
  { id: 'hebrews', name: 'Hebreos', testament: 'new', chapters: 13 },
  { id: 'james', name: 'Santiago', testament: 'new', chapters: 5 },
  { id: '1peter', name: '1 Pedro', testament: 'new', chapters: 5 },
  { id: '2peter', name: '2 Pedro', testament: 'new', chapters: 3 },
  { id: '1john', name: '1 Juan', testament: 'new', chapters: 5 },
  { id: '2john', name: '2 Juan', testament: 'new', chapters: 1 },
  { id: '3john', name: '3 Juan', testament: 'new', chapters: 1 },
  { id: 'jude', name: 'Judas', testament: 'new', chapters: 1 },
  { id: 'revelation', name: 'Apocalipsis', testament: 'new', chapters: 22 },
];

const BASE_URL = 'https://bible-api.com';

// Fetch a specific chapter from a book
export async function fetchChapter(
  bookId: string,
  chapter: number,
  translation: string = 'rvr1960'
): Promise<BiblePassage> {
  const response = await fetch(
    `${BASE_URL}/${bookId}+${chapter}?translation=${translation}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter: ${response.statusText}`);
  }

  return response.json();
}

// Fetch a specific verse or range of verses
export async function fetchVerses(
  bookId: string,
  chapter: number,
  startVerse: number,
  endVerse?: number,
  translation: string = 'rvr1960'
): Promise<BiblePassage> {
  const verseRange = endVerse ? `${startVerse}-${endVerse}` : `${startVerse}`;
  const response = await fetch(
    `${BASE_URL}/${bookId}+${chapter}:${verseRange}?translation=${translation}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch verses: ${response.statusText}`);
  }

  return response.json();
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
