import { Capacitor } from '@capacitor/core';

// En producción (EasyPanel), usamos /api porque Nginx hace el proxy.
// En la APK (Capacitor), no hay Nginx local, así que debemos apuntar a la URL completa.
const PRODUCTION_API_URL = 'https://blessed-insight.easypanel.host/api';

export const API_BASE_URL = Capacitor.isNativePlatform()
    ? PRODUCTION_API_URL
    : '/api';

export const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL;
export const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL;
