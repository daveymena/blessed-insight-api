// Servidor simplificado para probar el proxy de AI
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Solo la ruta de AI para pruebas
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 AI Proxy endpoint: http://localhost:${PORT}/api/ai/ollama/generate`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});
