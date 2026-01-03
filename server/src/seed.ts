import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'daveymena16@gmail.com';
    const password = '6715320Dvd.';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                tier: 'GOLD',
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Davey Mena',
                role: 'ADMIN',
                tier: 'GOLD',
            },
        });

        console.log('✅ Usuario Administrador creado/actualizado:', user.email);
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
