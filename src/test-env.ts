// Test rápido de variables de entorno
console.log('🔍 Verificación de Variables de Entorno en Vite:');
console.log('VITE_GROQ_API_KEY:', import.meta.env.VITE_GROQ_API_KEY ? '✓ PRESENTE' : '✗ AUSENTE');
console.log('VITE_GROQ_API_KEY_2:', import.meta.env.VITE_GROQ_API_KEY_2 ? '✓ PRESENTE' : '✗ AUSENTE');
console.log('VITE_GROQ_API_KEY_3:', import.meta.env.VITE_GROQ_API_KEY_3 ? '✓ PRESENTE' : '✗ AUSENTE');
console.log('VITE_GROQ_API_KEY_4:', import.meta.env.VITE_GROQ_API_KEY_4 ? '✓ PRESENTE' : '✗ AUSENTE');
console.log('VITE_OLLAMA_BASE_URL:', import.meta.env.VITE_OLLAMA_BASE_URL ? '✓ PRESENTE' : '✗ AUSENTE');
console.log('Total de llaves Groq:', [
    import.meta.env.VITE_GROQ_API_KEY,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean).length);
