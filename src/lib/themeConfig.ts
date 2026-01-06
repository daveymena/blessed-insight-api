export interface ThemeConfig {
    id: string;
    name: string;
    type: 'scenic' | 'texture' | 'solid';
    background: string; // URL for images, CSS for solids/gradients
    textColor: string;
    uiMode: 'light' | 'dark';
    accentColor: string;
    overlayOpacity: number;
    blurAmount: string;
}

export const BIBLE_THEMES: ThemeConfig[] = [
    // --- PAISAJES (SCENIC) ---
    {
        id: 'judaean-desert',
        name: 'Desierto de Judea',
        type: 'scenic',
        background: '/images/judaean_desert.png',
        textColor: '#2d241c', // Marrón oscuro profundo
        uiMode: 'light',
        accentColor: '#b45309',
        overlayOpacity: 0.55,
        blurAmount: '0px'
    },
    {
        id: 'galilee-mountains',
        name: 'Montes de Galilea',
        type: 'scenic',
        background: '/images/galilee_mountains.png',
        textColor: '#f8fafc', // Letras Blancas
        uiMode: 'dark',       // Fondo más oscuro para contrastar
        accentColor: '#10b981',
        overlayOpacity: 0.65,  // Más velo oscuro
        blurAmount: '0px'
    },
    {
        id: 'olive-garden',
        name: 'Huerto de Olivos',
        type: 'scenic',
        background: '/images/olive_garden.png',
        textColor: '#1c1917', // Letras Negras
        uiMode: 'light',
        accentColor: '#84cc16',
        overlayOpacity: 0.5,
        blurAmount: '0px'
    },
    {
        id: 'misty-mountains',
        name: 'Montañas de Sión',
        type: 'scenic',
        background: '/images/landscape_misty_mountains.png',
        textColor: '#f1f5f9', // Letras Blancas
        uiMode: 'dark',
        accentColor: '#3b82f6',
        overlayOpacity: 0.75,
        blurAmount: '1px'
    },
    {
        id: 'golden-jerusalem',
        name: 'Jerusalén Dorada',
        type: 'scenic',
        background: 'https://images.unsplash.com/photo-1549419139-49c63c5d63f0?q=80&w=1600',
        textColor: '#1e293b',
        uiMode: 'light',
        accentColor: '#eab308',
        overlayOpacity: 0.6,
        blurAmount: '0px'
    },

    // --- TEXTURAS (TEXTURES) ---
    {
        id: 'ancient-paper',
        name: 'Papiro Antiguo',
        type: 'texture',
        background: 'https://www.transparenttextures.com/patterns/parchment.png',
        textColor: '#4a3728',
        uiMode: 'light',
        accentColor: '#8b4513',
        overlayOpacity: 1,
        blurAmount: '0px'
    },

    // --- SÓLIDOS (SOLIDS) ---
    {
        id: 'pure-light',
        name: 'Blanco Puro',
        type: 'solid',
        background: '#ffffff',
        textColor: '#020617',
        uiMode: 'light',
        accentColor: '#1e293b',
        overlayOpacity: 1,
        blurAmount: '0px'
    },
    {
        id: 'royal-sepia',
        name: 'Sepia Real',
        type: 'solid',
        background: '#fdf6e3',
        textColor: '#433422',
        uiMode: 'light',
        accentColor: '#92400e',
        overlayOpacity: 1,
        blurAmount: '0px'
    },
    {
        id: 'deep-night',
        name: 'Noche Profunda',
        type: 'solid',
        background: '#020617',
        textColor: '#f8fafc',
        uiMode: 'dark',
        accentColor: '#94a3b8',
        overlayOpacity: 1,
        blurAmount: '0px'
    }
];
