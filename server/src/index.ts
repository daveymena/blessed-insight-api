import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import conversationsRoutes from './routes/conversations';
import aiRoutes from './routes/ai';
import paymentsRoutes from './routes/payments';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Registrar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Blessed corriendo en puerto ${PORT}`);
});
