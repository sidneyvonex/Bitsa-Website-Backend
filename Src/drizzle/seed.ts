import db from './db';
import { users, interests } from './schema';
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

        console.log('✅ SuperAdmin user created');

        // Seed interests
        const defaultInterests = [
            'Machine Learning',
            'Artificial Intelligence',
            'Web Development',
            'Mobile App Development',
            'Data Science',
            'Cybersecurity',
            'Cloud Computing',
            'DevOps',
            'Blockchain',
            'Internet of Things (IoT)',
            'Game Development',
            'UI/UX Design',
            'Database Management',
            'Computer Networks',
            'Software Testing',
            'Algorithms',
            'Computer Graphics',
            'Natural Language Processing',
            'Computer Vision',
            'Robotics'
        ];

        for (const interestName of defaultInterests) {
            await db.insert(interests).values({ name: interestName }).onConflictDoNothing();
        }

        console.log('✅ Default interests created');
        console.log('✅ Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
