// Servicio de Estudio Bíblico Profesional - OPTIMIZADO
// Incluye: Exégesis, Planes de lectura, Devocionales, Estudios temáticos

import { callAI, callAIFast, type AIResponse } from './aiProvider';

// ============ CONTEXTO DEL SISTEMA ============
const BIBLE_SCHOLAR = `Eres un teólogo bíblico de élite con formación académica avanzada. 
Tu enfoque combina la exégesis rigurosa con la aplicación transformadora.
Sigues el estándar de biblias de estudio como la MacArthur o la ESV Study Bible.
Principios: Inerrancia, Sola Scriptura y contexto gramático-histórico.
Responde siempre con estructura clara, usando negritas para enfatizar y emojis para guiar la lectura.`;

const BIBLE_EXPERT_SIMPLE = `Eres un guía bíblico experto. Responde en español con profundidad teológica pero lenguaje pastoral.`;

// ============ EXÉGESIS (VERSIÓN PROFESIONAL) ============
export async function performExegesis(
  passage: string,
  bookName: string,
  chapter: number,
  customReference?: string,
  onProgress?: (content: string) => void
): Promise<AIResponse> {
  const reference = customReference || `${bookName} ${chapter}`;

  const messages = [
    { role: 'system' as const, content: BIBLE_SCHOLAR },
    {
      role: 'user' as const, content: `REALIZA UNA EXÉGESIS PROFUNDA Y ESTRUCTURADA DE ${reference}.

Pasaje clave: ${passage ? `"${passage.substring(0, 1000)}"` : 'Analiza el capítulo completo.'}

Sigue estrictamente este formato de Biblia de Estudio Profesional:

1. 🏛️ CONTEXTO HISTÓRICO Y CULTURAL
   - ¿Quién escribió esto y a quién?
   - ¿Cuál era la situación política/social/espiritual que motivó este escrito?

2. 📐 ESTRUCTURA LITERARIA
   - ¿Cómo encaja este pasaje en el argumento total del libro?
   - Bosquejo rápido del flujo de pensamiento del autor.

3. 🔍 ANÁLISIS EXEGÉTICO (Verso por Verso)
   - Explica los términos clave en sus idiomas originales (Hebreo/Griego) si es relevante.
   - Aclara pasajes difíciles o controversias teológicas.

4. ✝️ SÍNTESIS DOCTRINAL
   - ¿Qué nos enseña este texto sobre el carácter de Dios, la condición humana o la obra de Cristo?
   - Conexiones con el resto de la Biblia (Teología Bíblica).

5. 💡 APLICACIÓN TEOMÉTRICA
   - ¿Cómo cambia este texto nuestra forma de pensar, sentir y actuar hoy?
   - 3 puntos de aplicación radical.

6. 🙏 ORACIÓN LITÚRGICA
   - Una oración basada estrictamente en las verdades de este texto.` }
  ];

  return callAI(messages, 2000, onProgress); // Más tokens para más profundidad
}

// ============ ESTUDIO TEMÁTICO (VERSIÓN PROFESIONAL) ============
export async function thematicStudy(topic: string, onProgress?: (content: string) => void): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_SCHOLAR },
    {
      role: 'user' as const, content: `REALIZA UN ESTUDIO TEOLÓGICO SISTEMÁTICO SOBRE: "${topic}"

Sigue este esquema de investigación académica:

1. 📖 ETIMOLOGÍA Y DEFINICIÓN
   - Raíces en Hebreo (AT) y Griego (NT).
   - Definición teológica formal vs. uso coloquial.

2. 📜 DESARROLLO EN LA HISTORIA DE LA REDENCIÓN
   - Desde el Génesis hasta el Apocalipsis.
   - ¿Cómo se revela este tema progresivamente?

3. 🛡️ PILARES BÍBLICOS (Sedes Doctrinae)
   - Analiza los 5 pasajes más importantes que sostienen este tema.

4. ⛪ PERSPECTIVAS HISTÓRICO-TEOLÓGICAS
   - ¿Cómo ha entendido la iglesia este tema a través de los siglos?
   - Breve mención de posturas si hay debate.

5. ⚠️ ADVERTENCIAS Y HERMENÉUTICA
   - Evita los errores comunes al interpretar este tema.

6. 🌟 APLICACIÓN Y GLORIA
   - Cómo este tema nos lleva a la adoración y madurez cristiana.` }
  ];

  return callAI(messages, 2000, onProgress);
}

// ============ COMPARACIÓN DE VERSÍCULOS ============
export async function comparePassages(
  passages: Array<{ reference: string; text: string }>
): Promise<AIResponse> {
  const passagesList = passages.map(p => `${p.reference}: "${p.text}"`).join('\n');

  const messages = [
    { role: 'system' as const, content: BIBLE_SCHOLAR },
    {
      role: 'user' as const, content: `Compara estos pasajes bíblicos de forma profunda:
${passagesList}

Analiza:
1. Contexto de cada pasaje
2. Similitudes temáticas y lingüísticas
3. Diferencias de énfasis o perspectiva
4. Cómo se complementan entre sí
5. Enseñanza unificada que emerge
6. Aplicación práctica combinada` }
  ];

  return callAIFast(messages);
}

// ============ PREGUNTAS DE REFLEXIÓN ============
export async function generateReflectionQuestions(
  passage: string,
  bookName: string,
  chapter: number,
  onProgress?: (content: string) => void
): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT_SIMPLE },
    {
      role: 'user' as const, content: `PREGUNTAS DE ESTUDIO para ${bookName} ${chapter}:
"${passage.substring(0, 700)}"

Genera 8 preguntas profundas:

📖 OBSERVACIÓN (¿Qué dice el texto?)
1. Pregunta sobre detalles específicos del texto
2. Pregunta sobre personajes, acciones o palabras clave
3. Pregunta sobre la estructura o flujo del pasaje

🔍 INTERPRETACIÓN (¿Qué significa?)
4. Pregunta sobre el significado para la audiencia original
5. Pregunta sobre conexiones con otros pasajes bíblicos
6. Pregunta teológica sobre lo que revela de Dios

💡 APLICACIÓN (¿Cómo me afecta?)
7. Pregunta sobre cambios personales necesarios
8. Pregunta sobre acciones concretas para esta semana

Las preguntas deben provocar reflexión profunda, no respuestas superficiales.` }
  ];

  return callAI(messages, 1200, onProgress);
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

// Planes predefinidos con lecturas reales
export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'gospels-30',
    name: 'Los Evangelios en 30 Días',
    description: 'Conoce la vida de Jesús',
    duration: '30 días',
    type: 'book',
    readings: [
      { day: 1, passages: [{ book: 'matthew', chapter: 1 }, { book: 'matthew', chapter: 2 }], reflection: 'El nacimiento de Jesús' },
      { day: 2, passages: [{ book: 'matthew', chapter: 3 }, { book: 'matthew', chapter: 4 }], reflection: 'Bautismo y tentación' },
      { day: 3, passages: [{ book: 'matthew', chapter: 5 }, { book: 'matthew', chapter: 6 }], reflection: 'Sermón del Monte' },
      { day: 4, passages: [{ book: 'matthew', chapter: 7 }, { book: 'matthew', chapter: 8 }], reflection: 'Enseñanzas y milagros' },
      { day: 5, passages: [{ book: 'matthew', chapter: 9 }, { book: 'matthew', chapter: 10 }], reflection: 'Llamado de los discípulos' },
      { day: 6, passages: [{ book: 'matthew', chapter: 11 }, { book: 'matthew', chapter: 12 }], reflection: 'Jesús y Juan el Bautista' },
      { day: 7, passages: [{ book: 'matthew', chapter: 13 }, { book: 'matthew', chapter: 14 }], reflection: 'Parábolas del Reino' },
      { day: 8, passages: [{ book: 'mark', chapter: 1 }, { book: 'mark', chapter: 2 }], reflection: 'Inicio del ministerio' },
      { day: 9, passages: [{ book: 'mark', chapter: 3 }, { book: 'mark', chapter: 4 }], reflection: 'Parábolas y milagros' },
      { day: 10, passages: [{ book: 'mark', chapter: 5 }, { book: 'mark', chapter: 6 }], reflection: 'Poder sobre la muerte' },
      { day: 11, passages: [{ book: 'mark', chapter: 7 }, { book: 'mark', chapter: 8 }], reflection: 'Fe y tradición' },
      { day: 12, passages: [{ book: 'mark', chapter: 9 }, { book: 'mark', chapter: 10 }], reflection: 'Transfiguración' },
      { day: 13, passages: [{ book: 'mark', chapter: 11 }, { book: 'mark', chapter: 12 }], reflection: 'Entrada triunfal' },
      { day: 14, passages: [{ book: 'mark', chapter: 13 }, { book: 'mark', chapter: 14 }], reflection: 'Profecías y última cena' },
      { day: 15, passages: [{ book: 'luke', chapter: 1 }, { book: 'luke', chapter: 2 }], reflection: 'Nacimiento de Juan y Jesús' },
      { day: 16, passages: [{ book: 'luke', chapter: 3 }, { book: 'luke', chapter: 4 }], reflection: 'Genealogía y tentación' },
      { day: 17, passages: [{ book: 'luke', chapter: 5 }, { book: 'luke', chapter: 6 }], reflection: 'Bienaventuranzas' },
      { day: 18, passages: [{ book: 'luke', chapter: 7 }, { book: 'luke', chapter: 8 }], reflection: 'Fe del centurión' },
      { day: 19, passages: [{ book: 'luke', chapter: 9 }, { book: 'luke', chapter: 10 }], reflection: 'Envío de los 70' },
      { day: 20, passages: [{ book: 'luke', chapter: 11 }, { book: 'luke', chapter: 12 }], reflection: 'El Padre Nuestro' },
      { day: 21, passages: [{ book: 'luke', chapter: 13 }, { book: 'luke', chapter: 14 }], reflection: 'Parábolas de salvación' },
      { day: 22, passages: [{ book: 'luke', chapter: 15 }, { book: 'luke', chapter: 16 }], reflection: 'El hijo pródigo' },
      { day: 23, passages: [{ book: 'luke', chapter: 17 }, { book: 'luke', chapter: 18 }], reflection: 'Fe y oración' },
      { day: 24, passages: [{ book: 'john', chapter: 1 }, { book: 'john', chapter: 2 }], reflection: 'El Verbo hecho carne' },
      { day: 25, passages: [{ book: 'john', chapter: 3 }, { book: 'john', chapter: 4 }], reflection: 'Nicodemo y la samaritana' },
      { day: 26, passages: [{ book: 'john', chapter: 5 }, { book: 'john', chapter: 6 }], reflection: 'Pan de vida' },
      { day: 27, passages: [{ book: 'john', chapter: 7 }, { book: 'john', chapter: 8 }], reflection: 'Luz del mundo' },
      { day: 28, passages: [{ book: 'john', chapter: 9 }, { book: 'john', chapter: 10 }], reflection: 'El buen pastor' },
      { day: 29, passages: [{ book: 'john', chapter: 11 }, { book: 'john', chapter: 12 }], reflection: 'Resurrección de Lázaro' },
      { day: 30, passages: [{ book: 'john', chapter: 13 }, { book: 'john', chapter: 14 }], reflection: 'Yo soy el camino' },
    ]
  },
  {
    id: 'psalms-month',
    name: 'Salmos en un Mes',
    description: '5 Salmos diarios',
    duration: '30 días',
    type: 'book',
    readings: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      passages: Array.from({ length: 5 }, (_, j) => ({ book: 'psalms', chapter: Math.min(i * 5 + j + 1, 150) })),
      reflection: `Salmos ${i * 5 + 1}-${Math.min(i * 5 + 5, 150)}`
    }))
  },
  {
    id: 'proverbs-month',
    name: 'Proverbios en un Mes',
    description: 'Un capítulo diario',
    duration: '31 días',
    type: 'book',
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      passages: [{ book: 'proverbs', chapter: i + 1 }],
      reflection: `Sabiduría del capítulo ${i + 1}`
    }))
  },
  {
    id: 'family-week',
    name: 'Devocional Familiar',
    description: 'Lecturas para toda la familia',
    duration: '7 días',
    type: 'family',
    readings: [
      { day: 1, passages: [{ book: 'genesis', chapter: 1 }], reflection: 'La creación - Dios hizo todo' },
      { day: 2, passages: [{ book: 'genesis', chapter: 6 }, { book: 'genesis', chapter: 7 }], reflection: 'Noé y el arca - Obediencia' },
      { day: 3, passages: [{ book: 'exodus', chapter: 14 }], reflection: 'Cruzando el mar - Dios nos protege' },
      { day: 4, passages: [{ book: 'daniel', chapter: 6 }], reflection: 'Daniel y los leones - Fe valiente' },
      { day: 5, passages: [{ book: 'jonah', chapter: 1 }, { book: 'jonah', chapter: 2 }], reflection: 'Jonás - Segunda oportunidad' },
      { day: 6, passages: [{ book: 'luke', chapter: 2 }], reflection: 'Nacimiento de Jesús - Amor de Dios' },
      { day: 7, passages: [{ book: 'john', chapter: 3, verses: '1-21' }], reflection: 'Dios amó al mundo' },
    ]
  },
  {
    id: 'new-believer',
    name: 'Nuevo Creyente',
    description: 'Fundamentos de la fe cristiana',
    duration: '14 días',
    type: 'thematic',
    readings: [
      { day: 1, passages: [{ book: 'john', chapter: 3 }], reflection: 'Nacer de nuevo' },
      { day: 2, passages: [{ book: 'romans', chapter: 3 }], reflection: 'Todos pecamos' },
      { day: 3, passages: [{ book: 'romans', chapter: 5 }], reflection: 'Justificados por fe' },
      { day: 4, passages: [{ book: 'romans', chapter: 6 }], reflection: 'Muertos al pecado' },
      { day: 5, passages: [{ book: 'romans', chapter: 8 }], reflection: 'Vida en el Espíritu' },
      { day: 6, passages: [{ book: 'ephesians', chapter: 2 }], reflection: 'Salvos por gracia' },
      { day: 7, passages: [{ book: 'ephesians', chapter: 6 }], reflection: 'Armadura de Dios' },
      { day: 8, passages: [{ book: 'philippians', chapter: 4 }], reflection: 'Gozo y paz' },
      { day: 9, passages: [{ book: 'colossians', chapter: 3 }], reflection: 'Nueva vida en Cristo' },
      { day: 10, passages: [{ book: '1john', chapter: 1 }], reflection: 'Comunión con Dios' },
      { day: 11, passages: [{ book: '1john', chapter: 3 }], reflection: 'Hijos de Dios' },
      { day: 12, passages: [{ book: 'james', chapter: 1 }], reflection: 'Fe y obras' },
      { day: 13, passages: [{ book: '1peter', chapter: 2 }], reflection: 'Piedras vivas' },
      { day: 14, passages: [{ book: 'hebrews', chapter: 11 }], reflection: 'Héroes de la fe' },
    ]
  },
  {
    id: 'prayer-week',
    name: 'Semana de Oración',
    description: 'Aprende a orar con la Biblia',
    duration: '7 días',
    type: 'thematic',
    readings: [
      { day: 1, passages: [{ book: 'matthew', chapter: 6, verses: '5-15' }], reflection: 'El Padre Nuestro' },
      { day: 2, passages: [{ book: 'psalms', chapter: 51 }], reflection: 'Oración de arrepentimiento' },
      { day: 3, passages: [{ book: 'psalms', chapter: 23 }], reflection: 'Confianza en Dios' },
      { day: 4, passages: [{ book: 'philippians', chapter: 4, verses: '4-9' }], reflection: 'Oración y paz' },
      { day: 5, passages: [{ book: 'james', chapter: 5, verses: '13-18' }], reflection: 'Oración eficaz' },
      { day: 6, passages: [{ book: '1john', chapter: 5, verses: '14-15' }], reflection: 'Confianza al orar' },
      { day: 7, passages: [{ book: 'psalms', chapter: 103 }], reflection: 'Oración de alabanza' },
    ]
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
    {
      role: 'user' as const, content: `Plan de ${duration} días sobre "${topic}"${audienceNote}.

Para cada día:
- Lectura: Libro Cap:Vers
- Versículo clave
- Reflexión breve (1 línea)

Sé específico con las referencias.` }
  ];

  return callAI(messages, 1000);
}

// ============ DEVOCIONAL DIARIO ============
export async function generateDailyDevotional(
  passage: string,
  bookName: string,
  chapter: number,
  verse?: number,
  onProgress?: (content: string) => void
): Promise<AIResponse> {
  const reference = verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;

  const messages = [
    { role: 'system' as const, content: `Eres un escritor devocional cristiano con profundidad teológica. Escribes de forma cálida y espiritualmente nutritiva. Responde en español.` },
    {
      role: 'user' as const, content: `DEVOCIONAL basado en ${reference}:
"${passage.substring(0, 600)}"

📖 LECTURA: ${reference}

🌅 INTRODUCCIÓN
Una ilustración o situación de la vida real que conecte con el tema

💭 REFLEXIÓN
- Contexto del pasaje
- Qué verdad central comunica Dios aquí
- Cómo se relaciona con el carácter de Dios
- Qué promesa o mandamiento encontramos
(2-3 párrafos sustanciales)

🔑 VERDAD PARA HOY
Una frase memorable que resuma la enseñanza

⚡ DESAFÍO PRÁCTICO
Una acción específica y concreta para hoy

🙏 ORACIÓN
Una oración sincera que responda al texto

📝 VERSÍCULO PARA MEMORIZAR
El versículo más impactante del pasaje` }
  ];

  return callAI(messages, 1500, onProgress);
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

// ============ PLANES DE LECTURA ACTIVOS ============
export interface ActivePlan {
  planId: string;
  startDate: string;
  currentDay: number;
  completedDays: number[];
}

export function startPlan(planId: string): ActivePlan {
  const plan: ActivePlan = {
    planId,
    startDate: new Date().toISOString(),
    currentDay: 1,
    completedDays: [],
  };
  localStorage.setItem('bible_active_plan', JSON.stringify(plan));
  return plan;
}

export function getActivePlan(): ActivePlan | null {
  const saved = localStorage.getItem('bible_active_plan');
  return saved ? JSON.parse(saved) : null;
}

export function updatePlanProgress(day: number, completed: boolean): ActivePlan | null {
  const plan = getActivePlan();
  if (!plan) return null;

  if (completed && !plan.completedDays.includes(day)) {
    plan.completedDays.push(day);
  } else if (!completed) {
    plan.completedDays = plan.completedDays.filter(d => d !== day);
  }

  // Avanzar al siguiente día si completó el actual
  if (completed && day === plan.currentDay) {
    const planData = READING_PLANS.find(p => p.id === plan.planId);
    if (planData && plan.currentDay < planData.readings.length) {
      plan.currentDay = day + 1;
    }
  }

  localStorage.setItem('bible_active_plan', JSON.stringify(plan));
  return plan;
}

export function cancelPlan(): void {
  localStorage.removeItem('bible_active_plan');
}

export function getPlanById(planId: string): ReadingPlan | undefined {
  return READING_PLANS.find(p => p.id === planId);
}

// ============ FEED DINÁMICO POR IA ============
export interface DailyInsight {
  id: string;
  type: 'promise' | 'fact' | 'character' | 'tip';
  title: string;
  content: string;
  reference?: string;
  generatedAt: number;
}

const INSIGHTS_CACHE_KEY = 'bible_daily_insights_v2';
const VERSES_CACHE_KEY = 'bible_daily_verses_v2';

export async function generateDynamicVerse(): Promise<any | null> {
  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT_SIMPLE },
    {
      role: 'user' as const, content: `Genera un "Versículo del Día" inspirador.
    Responde ÚNICAMENTE en JSON:
    {
      "book": "Nombre del Libro",
      "chapter": 1,
      "verse": 1,
      "text": "El texto del versículo"
    }` }
  ];

  try {
    const response = await callAIFast(messages);
    if (response.success) {
      const jsonStr = response.content.replace(/```json|```/g, '').trim();
      const raw = JSON.parse(jsonStr);
      const newVerse = { ...raw, id: `verse_${Date.now()}` };

      const cache = getStoredVerses();
      cache.unshift(newVerse);
      localStorage.setItem(VERSES_CACHE_KEY, JSON.stringify(cache.slice(0, 50)));
      return newVerse;
    }
  } catch (e) { }
  return null;
}

export function getStoredVerses(): any[] {
  try {
    const saved = localStorage.getItem(VERSES_CACHE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export async function generateDynamicInsight(): Promise<DailyInsight | null> {
  const types = ['promesa bíblica', 'curiosidad histórica de la Biblia', 'personaje bíblico poco común', 'tip de estudio teológico', 'lección de vida bíblica'];
  const type = types[Math.floor(Math.random() * types.length)];
  const internalLabel: DailyInsight['type'] = type.includes('promesa') ? 'promise' : type.includes('curiosidad') ? 'fact' : type.includes('personaje') ? 'character' : 'tip';

  const messages = [
    { role: 'system' as const, content: BIBLE_EXPERT_SIMPLE },
    {
      role: 'user' as const, content: `Genera una tarjeta de información bíblica de tipo: ${type}.
    Responde ÚNICAMENTE en JSON:
    {
      "title": "Título llamativo",
      "content": "Contenido profundo (80-120 palabras)",
      "reference": "Referencia si aplica"
    }` }
  ];

  try {
    const response = await callAIFast(messages);
    if (response.success) {
      // Limpiar markdown si existe
      const jsonStr = response.content.replace(/```json|```/g, '').trim();
      const raw = JSON.parse(jsonStr);

      const insight: DailyInsight = {
        id: `insight_${Date.now()}`,
        type: internalLabel,
        title: raw.title,
        content: raw.content,
        reference: raw.reference,
        generatedAt: Date.now()
      };

      // Guardar en cache
      const cache = getStoredInsights();
      cache.unshift(insight);
      localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(cache.slice(0, 50)));

      return insight;
    }
  } catch (e) {
    console.error('Error generating insight:', e);
  }
  return null;
}

export function getStoredInsights(): DailyInsight[] {
  try {
    const saved = localStorage.getItem(INSIGHTS_CACHE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
// ============ PREGUNTAS AL INVESTIGADOR (BIBLO) ============
const BIBLO_PERSONALITY = `Eres el Investigador Bíblico de "Blessed Insight".
Tu especialidad es la teología sistemática, historia de la iglesia y escatología bíblica. 
NO eres una IA, eres un tutor teológico servicial. 
Tus respuestas deben estar profundamente cimentadas en las Escrituras, ser equilibradas y doctrinalmente sólidas. 
Si el tema es escatológico, presenta las visiones clásicas con respeto pero mantente firme en la soberanía de Dios. 
Usa un tono cálido, autoritativo pero humilde. 
Responde siempre en español.`;

export async function askBiblo(question: string, context?: string, onProgress?: (content: string) => void): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLO_PERSONALITY },
    {
      role: 'user' as const, content: `${context ? `Teniendo en cuenta este contexto: "${context}"\n\n` : ''}Pregunta: ${question}
      
      Responde de forma profunda, usando versículos de apoyo y una estructura clara.` }
  ];

  return callAI(messages, 1500, onProgress);
}
