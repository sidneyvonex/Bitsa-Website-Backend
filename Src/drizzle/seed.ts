import db from './db';
import { users } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        // Create a superadmin user
        const hashedPassword = bcrypt.hashSync('admin123', bcrypt.genSaltSync(12));

        await db.insert(users).values({
            schoolId: 'ADMIN001',
            isInternal: true,
            schoolName: 'University of Eastern Africa Baraton',
            email: 'admin@bitsa.com',
            passwordHash: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            major: 'Other',
            yearOfStudy: 1,
            role: 'superadmin',
            emailVerified: true,
            isActive: true,
        });

        console.log('✅ Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
