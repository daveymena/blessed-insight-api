const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
    const connectionString = "postgresql://Postgres:6715320Dvd@164.68.122.5:5433/biblia-estudio?sslmode=disable";
    const client = new Client({ connectionString });

    const email = 'daveymena16@gmail.com';
    const password = '6715320Dvd.';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await client.connect();
        console.log('Connected to database');

        // Check if table exists
        const tableCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'User'");
        if (tableCheck.rowCount === 0) {
            console.error('Table "User" does not exist. Please run prisma push first.');
            return;
        }

        const id = 'admin-user-id-01'; // Fixed ID for stability
        const now = new Date();

        await client.query(`
            INSERT INTO "User" (id, email, password, name, role, tier, "createdAt", "updatedAt", "trialUsed")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (email) DO UPDATE SET
            password = $3,
            role = $5,
            tier = $6,
            "updatedAt" = $8
        `, [id, email, hashedPassword, 'Davey Mena', 'ADMIN', 'GOLD', now, now, false]);

        console.log('✅ Admin user daveymena16@gmail.com created/updated successfully');
    } catch (err) {
        console.error('Error seeding user:', err);
    } finally {
        await client.end();
    }
}

seed();
