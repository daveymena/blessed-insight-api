import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import conversationsRoutes from './routes/conversations';
import aiRoutes from './routes/ai';
import paymentsRoutes from './routes/payments';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

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

    // Auto-seed Admin User
    try {
        const bcrypt = require('bcryptjs');
        const email = 'daveymena16@gmail.com';
        const password = '6715320Dvd.'; // Password con el punto como pidió el usuario
        const hashedPassword = await bcrypt.hash(password, 10);

        await (prisma as any).user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                tier: 'GOLD'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Davey Mena',
                role: 'ADMIN',
                tier: 'GOLD'
            }
        });
        console.log('✅ Admin user ensured');
    } catch (e) {
        console.error('❌ Error ensuring admin user:', e);
    }
});
