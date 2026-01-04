import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// REGISTER
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    // Validaciones básicas
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Este correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                tier: 'FREE',
                role: 'USER',
            },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier } });
    } catch (error: any) {
        console.error('[Auth] Error en registro:', error);
        
        // Errores específicos de Prisma
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Este correo ya está registrado' });
        }
        if (error.code === 'P1001' || error.code === 'P1002') {
            return res.status(503).json({ error: 'No se pudo conectar a la base de datos. Intenta más tarde.' });
        }
        
        res.status(500).json({ error: 'Error al crear la cuenta. Intenta de nuevo.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'No existe una cuenta con este correo' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier } });
    } catch (error: any) {
        console.error('[Auth] Error en login:', error);
        
        if (error.code === 'P1001' || error.code === 'P1002') {
            return res.status(503).json({ error: 'No se pudo conectar a la base de datos. Intenta más tarde.' });
        }
        
        res.status(500).json({ error: 'Error al iniciar sesión. Intenta de nuevo.' });
    }
});

export default router;
