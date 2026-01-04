import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Only AI routes for now to ensure stability
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'minimal' });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Minimal Server running on port ${PORT}`);
    console.log('✅ AI Routes enabled');
});
