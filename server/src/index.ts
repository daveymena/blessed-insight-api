import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import conversationsRoutes from './routes/conversations';
import aiRoutes from './routes/ai';
import paymentsRoutes from './routes/payments';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'main' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Blessed corriendo en puerto ${PORT}`);
});
