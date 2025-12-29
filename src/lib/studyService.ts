// Servicio de Estudio Bíblico Profesional - OPTIMIZADO
// Incluye: Exégesis, Planes de lectura, Devocionales, Estudios temáticos

import { callAI, callAIFast, callAIDetailed, type AIResponse } from './aiProvider';

// ============ CONTEXTO DEL SISTEMA (más corto = más rápido) ============
const BIBLE_EXPERT = `Eres un teólogo experto en hebreo, griego, historia bíblica y hermenéutica.
Responde en español, de forma clara y concisa. Sé profundo pero breve.`;

// ============ EXÉGESIS (optimizada) ============
export async function performExegesis(
  passage: string,
  bookName: string,
  chapter: number,
  verses?: string
): Promise<AIResponse> {
  const reference = verses ? `${bookName} ${chapter}:${verses}` : `${bookName} ${chapter}`;
  
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT },
    { role: 'user' as const, content: `Exégesis de ${reference}:
"${passage.substring(0, 1000)}"

Responde BREVEMENTE:
1. Contexto histórico (2-3 líneas)
2. Significado del texto
3. Palabras clave en hebreo/griego
4. Aplicación práctica` }
  ];

  return callAIDetailed(messages);
}

// ============ ESTUDIO TEMÁTICO (optimizado) ============
export async function thematicStudy(topic: string): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT },
    { role: 'user' as const, content: `Estudio bíblico sobre: "${topic}"

Incluye:
1. Definición bíblica
2. 5 pasajes clave con breve explicación
3. Aplicación práctica

Sé conciso pero profundo.` }
  ];

  return callAI(messages, 1000);
}

// ============ COMPARACIÓN DE VERSÍCULOS ============
export async function comparePassages(
  passages: Array<{ reference: string; text: string }>
): Promise<AIResponse> {
  const passagesList = passages.map(p => `${p.reference}: "${p.text}"`).join('\n');
  
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT },
    { role: 'user' as const, content: `Compara estos pasajes:
${passagesList}

Analiza: similitudes, diferencias y enseñanza unificada.` }
  ];

  return callAIFast(messages);
}

// ============ PREGUNTAS DE REFLEXIÓN (rápido) ============
export async function generateReflectionQuestions(
  passage: string,
  bookName: string,
  chapter: number
): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT },
    { role: 'user' as const, content: `Genera 6 preguntas de reflexión para ${bookName} ${chapter}:
"${passage.substring(0, 800)}"

2 de observación, 2 de interpretación, 2 de aplicación.` }
  ];

  return callAIFast(messages);
}


// ============ PLANES DE LECTURA ============
export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  type: 'chronological' | 'thematic' | 'book' | 'family' | 'custom';
  readings: Array<{
    day: number;
    passages: Array<{ book: string; chapter: number; verses?: string }>;
    reflection?: string;
  }>;
}

// Planes predefinidos
export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'bible-year',
    name: 'La Biblia en un Año',
    description: 'Lee toda la Biblia en 365 días',
    duration: '365 días',
    type: 'chronological',
    readings: []
  },
  {
    id: 'gospels-30',
    name: 'Los Evangelios en 30 Días',
    description: 'Conoce la vida de Jesús',
    duration: '30 días',
    type: 'book',
    readings: []
  },
  {
    id: 'psalms-month',
    name: 'Salmos en un Mes',
    description: '5 Salmos diarios',
    duration: '30 días',
    type: 'book',
    readings: []
  },
  {
    id: 'proverbs-month',
    name: 'Proverbios en un Mes',
    description: 'Un capítulo diario',
    duration: '31 días',
    type: 'book',
    readings: []
  },
  {
    id: 'family-week',
    name: 'Devocional Familiar',
    description: 'Lecturas para toda la familia',
    duration: '7 días',
    type: 'family',
    readings: []
  }
];

// Generar plan personalizado (optimizado)
export async function generateCustomReadingPlan(
  topic: string,
  duration: number,
  audience: 'individual' | 'family' | 'group'
): Promise<AIResponse> {
  const audienceNote = audience === 'family' ? ' (incluir actividades para niños)' : 
                       audience === 'group' ? ' (incluir preguntas de discusión)' : '';

  const messages = [
    { role: 'system' as const, content: `Eres un pastor que crea planes de lectura bíblica. Responde en español.` },
    { role: 'user' as const, content: `Plan de ${duration} días sobre "${topic}"${audienceNote}.

Para cada día:
- Lectura: Libro Cap:Vers
- Versículo clave
- Reflexión breve (1 línea)

Sé específico con las referencias.` }
  ];

  return callAI(messages, 1000);
}

// ============ DEVOCIONAL DIARIO (optimizado) ============
export async function generateDailyDevotional(
  passage: string,
  bookName: string,
  chapter: number,
  verse?: number
): Promise<AIResponse> {
  const reference = verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;
  
  const messages = [
    { role: 'system' as const, content: `Eres un escritor devocional cristiano. Escribe en español, de forma cálida y personal.` },
    { role: 'user' as const, content: `Devocional de ${reference}:
"${passage.substring(0, 500)}"

Incluye:
📖 Lectura: ${reference}
💭 Reflexión (2 párrafos)
🔑 Verdad central (1 frase)
🙏 Oración breve
✨ Aplicación práctica` }
  ];

  return callAIFast(messages);
}

// ============ VERSÍCULO DEL DÍA ============
const VERSES_OF_THE_DAY = [
  { book: 'john', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo...' },
  { book: 'psalms', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
  { book: 'philippians', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' },
  { book: 'jeremiah', chapter: 29, verse: 11, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros...' },
  { book: 'romans', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien...' },
  { book: 'isaiah', chapter: 41, verse: 10, text: 'No temas, porque yo estoy contigo...' },
  { book: 'proverbs', chapter: 3, verse: 5, text: 'Fíate de Jehová de todo tu corazón...' },
  { book: 'matthew', chapter: 11, verse: 28, text: 'Venid a mí todos los que estáis trabajados y cargados...' },
  { book: 'psalms', chapter: 46, verse: 1, text: 'Dios es nuestro amparo y fortaleza...' },
  { book: 'joshua', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente...' },
  { book: 'romans', chapter: 12, verse: 2, text: 'No os conforméis a este siglo...' },
  { book: 'hebrews', chapter: 11, verse: 1, text: 'Es, pues, la fe la certeza de lo que se espera...' },
  { book: 'psalms', chapter: 119, verse: 105, text: 'Lámpara es a mis pies tu palabra...' },
  { book: 'matthew', chapter: 6, verse: 33, text: 'Mas buscad primeramente el reino de Dios...' },
  { book: '1corinthians', chapter: 13, verse: 4, text: 'El amor es sufrido, es benigno...' },
  { book: 'galatians', chapter: 5, verse: 22, text: 'Mas el fruto del Espíritu es amor, gozo, paz...' },
  { book: 'ephesians', chapter: 2, verse: 8, text: 'Porque por gracia sois salvos por medio de la fe...' },
  { book: '2timothy', chapter: 1, verse: 7, text: 'Porque no nos ha dado Dios espíritu de cobardía...' },
  { book: '1peter', chapter: 5, verse: 7, text: 'Echando toda vuestra ansiedad sobre él...' },
  { book: 'revelation', chapter: 21, verse: 4, text: 'Enjugará Dios toda lágrima de los ojos de ellos...' },
];

export function getVerseOfTheDay(): { book: string; chapter: number; verse: number; text: string } {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return VERSES_OF_THE_DAY[dayOfYear % VERSES_OF_THE_DAY.length];
}

// ============ NOTAS DE ESTUDIO ============
export interface StudyNote {
  id: string;
  bookId: string;
  chapter: number;
  verse?: number;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Guardar nota en localStorage
export function saveStudyNote(note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>): StudyNote {
  const notes = getStudyNotes();
  const newNote: StudyNote = {
    ...note,
    id: `note_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(newNote);
  localStorage.setItem('bible_study_notes', JSON.stringify(notes));
  return newNote;
}

export function getStudyNotes(): StudyNote[] {
  const saved = localStorage.getItem('bible_study_notes');
  return saved ? JSON.parse(saved) : [];
}

export function getNotesForPassage(bookId: string, chapter: number): StudyNote[] {
  return getStudyNotes().filter(n => n.bookId === bookId && n.chapter === chapter);
}

export function deleteStudyNote(id: string): void {
  const notes = getStudyNotes().filter(n => n.id !== id);
  localStorage.setItem('bible_study_notes', JSON.stringify(notes));
}

// ============ HISTORIAL DE LECTURA ============
export interface ReadingHistory {
  bookId: string;
  chapter: number;
  readAt: Date;
  duration?: number; // minutos
}

export function saveReadingHistory(bookId: string, chapter: number, duration?: number): void {
  const history = getReadingHistory();
  history.push({ bookId, chapter, readAt: new Date(), duration });
  // Mantener solo los últimos 100 registros
  if (history.length > 100) history.shift();
  localStorage.setItem('bible_reading_history', JSON.stringify(history));
}

export function getReadingHistory(): ReadingHistory[] {
  const saved = localStorage.getItem('bible_reading_history');
  return saved ? JSON.parse(saved) : [];
}

export function getReadingStats(): { totalChapters: number; streak: number; lastRead: Date | null } {
  const history = getReadingHistory();
  if (history.length === 0) return { totalChapters: 0, streak: 0, lastRead: null };

  // Calcular racha de días consecutivos
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const readDates = [...new Set(history.map(h => {
    const d = new Date(h.readAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  for (let i = 0; i < readDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    if (readDates[i] === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalChapters: history.length,
    streak,
    lastRead: history.length > 0 ? new Date(history[history.length - 1].readAt) : null,
  };
}
