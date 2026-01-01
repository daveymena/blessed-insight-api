// Servicio de Estudio con IA - OPTIMIZADO
// Usa llamadas paralelas para máxima velocidad

import { callAI, callAIFast, type AIResponse as ProviderResponse } from './aiProvider';

// Contexto de Mentor Bíblico - ORGANIZACIÓN PROFESIONAL
const BIBLE_CONTEXT = `Eres un mentor bíblico erudito y guía espiritual.
Tu misión es facilitar el estudio profundo de las Escrituras de forma organizada.
Usa emojis, negritas y separadores claros.
Tu lenguaje debe ser profesional, inspirador y basado en principios bíblicos sólidos.`;

export interface AIResponse {
  success: boolean;
  content: string;
  source: 'AI' | 'offline' | 'error';
}

// Analizar pasaje (optimizado)
export async function analyzePassage(
  passage: string,
  bookName: string,
  chapter: number,
  customReference?: string
): Promise<AIResponse> {
  const reference = customReference || `${bookName} ${chapter}`;
  const messages = [
    { role: 'system' as const, content: `${BIBLE_CONTEXT} Responde de forma relajada y fluida. Evita dividir con demasiados títulos rígidos.` },
    {
      role: 'user' as const, content: `Realiza un estudio profundo y relajado de ${reference}. 
${passage ? `Texto base: "${passage.substring(0, 1000)}"` : ''}

Presenta la información de forma coherente y natural, integrando el contexto histórico, el análisis de originales y la aplicación práctica en un texto fluido que alimente el espíritu. Basa todo en la Escritura.` }
  ];

  const result = await callAI(messages, 1800); // Aumentado para exégesis completa

  if (result.success) {
    return { success: true, content: result.content, source: 'AI' };
  }
  return getOfflineAnalysis(bookName, chapter);
}

// Preguntas sobre la Biblia (rápido)
export async function askBibleQuestion(
  question: string,
  context: string = ''
): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_CONTEXT },
    { role: 'user' as const, content: `${context ? `Contexto: "${context.substring(0, 500)}"\n\n` : ''}Pregunta: ${question}` }
  ];

  const result = await callAIFast(messages);

  if (result.success) {
    return { success: true, content: result.content, source: 'AI' };
  }
  return { success: false, content: 'No se pudo procesar. Intenta de nuevo.', source: 'error' };
}

// Plan de estudio (optimizado)
export async function generateStudyPlan(
  topic: string,
  duration: string = '7 días'
): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: BIBLE_CONTEXT },
    {
      role: 'user' as const, content: `Crea un PLAN DE ESTUDIO DE ALTO NIVEL sobre "${topic}" para ${duration}.

Estructura la información por días de forma estética:
---
## 📅 PLAN: ${topic.toUpperCase()}
---
### Día [X]: [Título del Día]
*   **📖 Pasaje Key**: [Referencia]
*   **🧠 Reflexión Teológica**: [Análisis corto]
*   **🎯 Desafío Práctico**: [Acción para el día]

[Añadir separadores entre días]` }
  ];

  const result = await callAI(messages, 2500); // Aumentado para planes completos

  if (result.success) {
    return { success: true, content: result.content, source: 'AI' };
  }
  return getOfflineStudyPlan(topic);
}

// Análisis offline cuando no hay API key
function getOfflineAnalysis(bookName: string, chapter: number): AIResponse {
  const bookKey = bookName.toLowerCase().replace(/[0-9\s]/g, '');

  const analyses: Record<string, { context: string; theme: string; application: string }> = {
    génesis: {
      context: 'Génesis es el libro de los orígenes, escrito por Moisés aproximadamente en el 1400 a.C.',
      theme: 'Creación, caída, promesa de redención y los patriarcas.',
      application: 'Dios es el Creador soberano que tiene un plan para la humanidad.',
    },
    salmos: {
      context: 'Los Salmos son una colección de poesía y canciones usadas en la adoración de Israel.',
      theme: 'Alabanza, lamento, sabiduría y profecía mesiánica.',
      application: 'Podemos expresar todas nuestras emociones a Dios en oración.',
    },
    juan: {
      context: 'El Evangelio de Juan fue escrito por el apóstol Juan alrededor del 90 d.C.',
      theme: 'Jesús es el Hijo de Dios, la Palabra hecha carne.',
      application: 'Creer en Jesús nos da vida eterna.',
    },
    apocalipsis: {
      context: 'Apocalipsis fue escrito por Juan en la isla de Patmos, aproximadamente en el 95 d.C.',
      theme: 'La victoria final de Cristo y el establecimiento del Reino eterno.',
      application: 'Podemos tener esperanza porque Dios tiene el control del futuro.',
    },
  };

  const analysis = analyses[bookKey] || {
    context: `${bookName} es parte de las Sagradas Escrituras.`,
    theme: 'Este libro contiene enseñanzas importantes para nuestra fe.',
    application: 'Medita en este pasaje y pide a Dios que te revele su significado.',
  };

  return {
    success: true,
    content: `## Análisis de ${bookName} ${chapter}

### 📜 Contexto Histórico
${analysis.context}

### 📖 Tema Principal
${analysis.theme}

### 💡 Aplicación Práctica
${analysis.application}

---
*Para un análisis más profundo con IA, configura tu API key de Gemini en las variables de entorno (VITE_GEMINI_API_KEY).*`,
    source: 'offline',
  };
}

// Plan de estudio offline
function getOfflineStudyPlan(topic: string): AIResponse {
  return {
    success: true,
    content: `## Plan de Estudio: ${topic}

### Día 1: Introducción
- **Lectura**: Busca pasajes relacionados con "${topic}"
- **Reflexión**: ¿Qué sé actualmente sobre este tema?
- **Aplicación**: Ora pidiendo entendimiento

### Día 2-3: Estudio del Antiguo Testamento
- **Lectura**: Busca referencias en los libros históricos y poéticos
- **Reflexión**: ¿Cómo se desarrolla este tema en la historia de Israel?

### Día 4-5: Estudio del Nuevo Testamento
- **Lectura**: Busca enseñanzas de Jesús y los apóstoles
- **Reflexión**: ¿Cómo Jesús cumple o transforma este tema?

### Día 6-7: Aplicación Personal
- **Lectura**: Revisa los pasajes más significativos
- **Reflexión**: ¿Qué cambios debo hacer en mi vida?
- **Aplicación**: Escribe un compromiso personal

---
*Para planes personalizados con IA, configura tu API key de Gemini.*`,
    source: 'offline',
  };
}
