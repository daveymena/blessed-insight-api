import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import conversationsRoutes from './routes/conversations';
import aiRoutes from './routes/ai';
import paymentsRoutes from './routes/payments';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

export const prisma = new PrismaClient();

try {
    dotenv.config();

    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/conversations', conversationsRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/payments', paymentsRoutes);

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date() });
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error: any) {
    fs.writeFileSync('CRITICAL_ERROR.txt', error?.stack || error?.message || String(error));
    process.exit(1);
}
