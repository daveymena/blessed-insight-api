import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./test-ai.ts";
import "./test-ollama.ts";

console.log("Bible App v1.1.0 Loaded - Production Build");
console.log('🔍 Groq Keys Loaded:', [
    import.meta.env.VITE_GROQ_API_KEY,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean).length, '/ 4');
createRoot(document.getElementById('root')!).render(<App />);
