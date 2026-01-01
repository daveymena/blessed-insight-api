import { Router } from 'express';

const router = Router();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';

// Proxy para Ollama - evita problemas de CORS
router.post('/ollama/generate', async (req, res) => {
  try {
    const { prompt, system, maxTokens = 2000 } = req.body;
    
    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json() as { response: string };
    res.json({ 
      success: true, 
      content: data.response,
      provider: 'ollama'
    });
  } catch (error) {
    console.error('Ollama proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'ollama'
    });
  }
});

// Health check para Ollama
router.get('/ollama/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json() as { models: Array<{ name: string }> };
      res.json({ status: 'ok', models: data.models?.map((m) => m.name) || [] });
    } else {
      res.status(500).json({ status: 'error', message: 'Ollama not responding' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Cannot connect to Ollama' });
  }
});

export default router;
