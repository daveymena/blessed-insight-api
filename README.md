# Welcome to your Lovable project

## 📖 Blessed Insight - Biblia de Estudio con IA

Una aplicación web completa para leer y estudiar la Biblia con asistencia de Inteligencia Artificial.

## ✨ Características

- 📚 **66 libros completos** - Desde Génesis hasta Apocalipsis (Reina Valera 1909)
- 🔍 **Búsqueda** - Por libro o acceso rápido a referencias populares
- 🤖 **Estudio con IA** - Análisis de pasajes, preguntas y planes de estudio personalizados
- ❤️ **Favoritos** - Guarda tus versículos preferidos
- 🌙 **Modo oscuro** - Para lectura nocturna cómoda
- 📱 **Responsive** - Funciona perfectamente en móvil y escritorio

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🤖 Configurar IA (Opcional)

Para habilitar el análisis con IA:

1. Obtén una API key de [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un archivo `.env` en la raíz del proyecto:

```
VITE_GEMINI_API_KEY=tu_api_key
```

## 📡 APIs de Biblia Integradas

La aplicación usa múltiples APIs públicas gratuitas con fallback automático:

| API | Versión | Características |
|-----|---------|-----------------|
| [HelloAO](https://bible.helloao.org) | RV 1909 | Principal, muy rápida |
| [Bolls.life](https://bolls.life) | RV 1960 | Backup, completa |
| [Bible-API.com](https://bible-api.com) | RV 1960 | Búsqueda de versículos |
| [GetBible.net](https://getbible.net) | RV 1909 | Fallback adicional |

Si una API falla, automáticamente intenta la siguiente.

## 🤖 APIs de IA Soportadas

- **Ollama** (local o remoto) - Modelo gemma2:2b
- **Groq** (cloud) - Modelo llama-3.1-8b-instant

## 🛠️ Tecnologías

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Lucide Icons

---
*"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105*
