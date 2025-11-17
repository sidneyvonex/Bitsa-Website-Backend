import db from './db';
import { users, interests, blogs, events, projects, leaders, communities, partners, reports, userInterests, blogTranslations, eventTranslations, reportTranslations } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        // ============================================
        // 0. CLEAR EXISTING DATA (in reverse order of dependencies)
        // ============================================
        console.log('🗑️  Clearing existing data...');
        await db.delete(reportTranslations);
        await db.delete(eventTranslations);
        await db.delete(blogTranslations);
        await db.delete(userInterests);
        await db.delete(reports);
        await db.delete(partners);
        await db.delete(communities);
        await db.delete(leaders);
        await db.delete(projects);
        await db.delete(events);
        await db.delete(blogs);
        await db.delete(interests);
        await db.delete(users);
        console.log('✅ Existing data cleared');

        // ============================================
        // 1. CREATE USERS
        // ============================================
        const hashedPassword = bcrypt.hashSync('admin123', bcrypt.genSaltSync(12));
        const studentPassword = bcrypt.hashSync('student123', bcrypt.genSaltSync(12));

        const [superAdmin] = await db.insert(users).values({
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
            preferredLanguage: 'en',
        }).returning();

        const [adminUser] = await db.insert(users).values({
            schoolId: 'ADMIN002',
            isInternal: true,
            schoolName: 'University of Eastern Africa Baraton',
            email: 'john.admin@bitsa.com',
            passwordHash: hashedPassword,
            firstName: 'John',
            lastName: 'Administrator',
            major: 'Computer Science',
            yearOfStudy: 4,
            role: 'admin',
            emailVerified: true,
            isActive: true,
            preferredLanguage: 'en',
        }).returning();

        const [student1] = await db.insert(users).values({
            schoolId: 'SCT211-0001/2021',
            isInternal: true,
            schoolName: 'University of Eastern Africa Baraton',
            email: 'john.doe@student.ueab.ac.ke',
            passwordHash: studentPassword,
            firstName: 'John',
            lastName: 'Doe',
            major: 'Software Engineering',
            yearOfStudy: 3,
            role: 'student',
            emailVerified: true,
            isActive: true,
            preferredLanguage: 'en',
        }).returning();

        const [student2] = await db.insert(users).values({
            schoolId: 'SCT211-0002/2021',
            isInternal: true,
            schoolName: 'University of Eastern Africa Baraton',
            email: 'jane.smith@student.ueab.ac.ke',
            passwordHash: studentPassword,
            firstName: 'Jane',
            lastName: 'Smith',
            major: 'Data Science',
            yearOfStudy: 2,
            role: 'student',
            emailVerified: true,
            isActive: true,
            preferredLanguage: 'sw',
        }).returning();

        const [student3] = await db.insert(users).values({
            schoolId: 'SCT211-0003/2022',
            isInternal: true,
            schoolName: 'University of Eastern Africa Baraton',
            email: 'michael.johnson@student.ueab.ac.ke',
            passwordHash: studentPassword,
            firstName: 'Michael',
            lastName: 'Johnson',
            major: 'Cybersecurity',
            yearOfStudy: 1,
            role: 'student',
            emailVerified: true,
            isActive: true,
            preferredLanguage: 'fr',
        }).returning();

        console.log('✅ Users created (1 superadmin, 1 admin, 3 students)');

        // ============================================
        // 2. SEED INTERESTS
        // ============================================
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

        const createdInterests = [];
        for (const interestName of defaultInterests) {
            const [interest] = await db.insert(interests).values({ name: interestName }).onConflictDoNothing().returning();
            if (interest) createdInterests.push(interest);
        }

        console.log('✅ Default interests created');

        // Assign interests to students
        if (createdInterests.length > 0) {
            await db.insert(userInterests).values([
                { userId: student1.id, interestId: createdInterests[0].id }, // ML
                { userId: student1.id, interestId: createdInterests[2].id }, // Web Dev
                { userId: student2.id, interestId: createdInterests[4].id }, // Data Science
                { userId: student2.id, interestId: createdInterests[1].id }, // AI
                { userId: student3.id, interestId: createdInterests[5].id }, // Cybersecurity
            ]).onConflictDoNothing();

            console.log('✅ User interests assigned');
        }

        // ============================================
        // 3. SEED BLOGS
        // ============================================
        const [blog1] = await db.insert(blogs).values({
            title: 'Introduction to Artificial Intelligence',
            slug: 'introduction-to-artificial-intelligence',
            content: 'Artificial Intelligence (AI) is revolutionizing the way we interact with technology. From voice assistants to autonomous vehicles, AI is transforming industries and creating new opportunities for innovation. In this blog post, we explore the fundamentals of AI, its applications, and future trends.',
            category: 'Technology',
            authorId: adminUser.id,
            coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
            language: 'en',
            readTime: 5,
        }).returning();

        const [blog2] = await db.insert(blogs).values({
            title: 'Getting Started with Web Development',
            slug: 'getting-started-with-web-development',
            content: 'Web development is one of the most in-demand skills in the tech industry. Whether you want to build personal projects or pursue a career as a developer, learning web development opens countless opportunities. This guide covers HTML, CSS, JavaScript, and modern frameworks.',
            category: 'Web Development',
            authorId: adminUser.id,
            coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            language: 'en',
            readTime: 8,
        }).returning();

        const [blog3] = await db.insert(blogs).values({
            title: 'Cybersecurity Best Practices for Students',
            slug: 'cybersecurity-best-practices-for-students',
            content: 'In an increasingly digital world, cybersecurity is more important than ever. Students need to protect their personal information, academic work, and online accounts. Learn essential cybersecurity practices including password management, two-factor authentication, and recognizing phishing attempts.',
            category: 'Cybersecurity',
            authorId: superAdmin.id,
            coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
            language: 'en',
            readTime: 6,
        }).returning();

        console.log('✅ Blogs created');

        // Add Swahili translations for blog1
        await db.insert(blogTranslations).values({
            blogId: blog1.id,
            language: 'sw',
            title: 'Utangulizi wa Akili Bandia',
            slug: 'utangulizi-wa-akili-bandia',
            content: 'Akili Bandia (AI) inaleta mapinduzi katika jinsi tunavyoingiliana na teknolojia. Kutoka kwa wasaidizi wa sauti hadi magari ya kujiendesha, AI inabadilisha tasnia na kuunda fursa mpya za ubunifu.',
        }).onConflictDoNothing();

        // Add French translation for blog2
        await db.insert(blogTranslations).values({
            blogId: blog2.id,
            language: 'fr',
            title: 'Débuter avec le Développement Web',
            slug: 'debuter-avec-le-developpement-web',
            content: 'Le développement web est l\'une des compétences les plus demandées dans l\'industrie technologique. Que vous souhaitiez créer des projets personnels ou poursuivre une carrière de développeur, apprendre le développement web ouvre d\'innombrables opportunités.',
        }).onConflictDoNothing();

        console.log('✅ Blog translations added');

        // ============================================
        // 4. SEED EVENTS
        // ============================================
        const [event1] = await db.insert(events).values({
            title: 'BITSA Tech Summit 2024',
            description: 'Join us for the biggest tech event of the year! The BITSA Tech Summit brings together students, industry professionals, and tech enthusiasts for a day of networking, workshops, and keynote speeches. Topics include AI, Cloud Computing, Cybersecurity, and Career Development.',
            startDate: new Date('2024-11-25T09:00:00'),
            endDate: new Date('2024-11-25T17:00:00'),
            locationName: 'UEAB Main Auditorium',
            latitude: '-0.2921',
            longitude: '35.0826',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            language: 'en',
            createdBy: adminUser.id,
        }).returning();

        const [event2] = await db.insert(events).values({
            title: 'Hackathon: Build the Future',
            description: '48-hour coding marathon where teams compete to build innovative solutions to real-world problems. Categories include HealthTech, EduTech, FinTech, and Smart Cities. Prizes worth $5000 and mentorship opportunities with industry leaders.',
            startDate: new Date('2024-12-10T18:00:00'),
            endDate: new Date('2024-12-12T18:00:00'),
            locationName: 'BITSA Innovation Lab',
            latitude: '-0.2921',
            longitude: '35.0826',
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
            language: 'en',
            createdBy: adminUser.id,
        }).returning();

        const [event3] = await db.insert(events).values({
            title: 'Web Development Workshop for Beginners',
            description: 'Learn the basics of web development in this hands-on workshop. We\'ll cover HTML, CSS, and JavaScript fundamentals. Build your first website and deploy it online. No prior experience required! Bring your laptop and enthusiasm.',
            startDate: new Date('2024-11-30T14:00:00'),
            endDate: new Date('2024-11-30T17:00:00'),
            locationName: 'Computer Lab A',
            latitude: '-0.2921',
            longitude: '35.0826',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
            language: 'en',
            createdBy: adminUser.id,
        }).returning();

        console.log('✅ Events created');

        // Add translations for events
        await db.insert(eventTranslations).values({
            eventId: event1.id,
            language: 'sw',
            title: 'Mkutano wa Teknolojia wa BITSA 2024',
            description: 'Jiunge nasi katika tukio kubwa zaidi la teknolojia la mwaka! Mkutano wa Teknolojia wa BITSA unaleta pamoja wanafunzi, wataalamu wa tasnia, na wapenda teknolojia kwa siku ya kujenga mitandao, warsha, na hotuba muhimu.',
            locationName: 'Ukumbi Mkuu wa UEAB',
        }).onConflictDoNothing();

        console.log('✅ Event translations added');

        // ============================================
        // 5. SEED PROJECTS
        // ============================================
        await db.insert(projects).values([
            {
                userId: student1.id,
                title: 'Smart Campus Navigation System',
                description: 'An AI-powered mobile application that helps students navigate the campus using augmented reality. The app provides real-time directions to classrooms, offices, and facilities.',
                problemStatement: 'New students often get lost on campus, wasting time finding their classes and missing important meetings.',
                proposedSolution: 'Develop a mobile app with AR navigation, indoor mapping, and real-time location tracking.',
                techStack: 'React Native, TensorFlow, Firebase, Google Maps API',
                githubUrl: 'https://github.com/johndoe/smart-campus-nav',
                status: 'in-progress',
            },
            {
                userId: student2.id,
                title: 'Student Mental Health Support Platform',
                description: 'A web platform that connects students with mental health resources, peer support groups, and counseling services. Includes AI chatbot for 24/7 support.',
                problemStatement: 'Students face mental health challenges but often don\'t know where to seek help or feel uncomfortable reaching out.',
                proposedSolution: 'Create an anonymous, accessible platform with AI-powered support, resource directory, and appointment booking.',
                techStack: 'Next.js, Python, OpenAI API, PostgreSQL',
                githubUrl: 'https://github.com/janesmith/mental-health-platform',
                status: 'submitted',
            },
            {
                userId: student3.id,
                title: 'Blockchain-Based Certificate Verification',
                description: 'A decentralized system for issuing and verifying academic certificates using blockchain technology, preventing fraud and enabling instant verification.',
                problemStatement: 'Academic certificate fraud is common, and verification processes are slow and costly.',
                proposedSolution: 'Implement blockchain-based certificate issuance with QR codes for instant verification.',
                techStack: 'Ethereum, Solidity, React, IPFS',
                githubUrl: 'https://github.com/michaelj/certificate-blockchain',
                status: 'completed',
            },
        ]);

        console.log('✅ Projects created');

        // ============================================
        // 6. SEED LEADERS
        // ============================================
        await db.insert(leaders).values([
            {
                fullName: 'Sarah Kimani',
                position: 'President',
                academicYear: '2024/2025',
                email: 'sarah.kimani@bitsa.com',
                phone: '+254712345678',
                profilePicture: 'https://i.pravatar.cc/300?img=1',
                isCurrent: true,
            },
            {
                fullName: 'David Omondi',
                position: 'Vice President',
                academicYear: '2024/2025',
                email: 'david.omondi@bitsa.com',
                phone: '+254723456789',
                profilePicture: 'https://i.pravatar.cc/300?img=12',
                isCurrent: true,
            },
            {
                fullName: 'Grace Wanjiru',
                position: 'Secretary',
                academicYear: '2024/2025',
                email: 'grace.wanjiru@bitsa.com',
                phone: '+254734567890',
                profilePicture: 'https://i.pravatar.cc/300?img=5',
                isCurrent: true,
            },
            {
                fullName: 'James Mwangi',
                position: 'President',
                academicYear: '2023/2024',
                email: 'james.mwangi@alumni.bitsa.com',
                profilePicture: 'https://i.pravatar.cc/300?img=15',
                isCurrent: false,
            },
        ]);

        console.log('✅ Leaders created');

        // ============================================
        // 7. SEED COMMUNITIES
        // ============================================
        await db.insert(communities).values([
            {
                name: 'Web Development Community',
                description: 'A community for students passionate about building modern web applications. Share projects, ask questions, and collaborate on web development initiatives.',
                whatsappLink: 'https://chat.whatsapp.com/webdev123',
            },
            {
                name: 'Data Science & AI Community',
                description: 'Explore machine learning, data analysis, and artificial intelligence. Join weekly discussions, kaggle competitions, and AI project collaborations.',
                whatsappLink: 'https://chat.whatsapp.com/datascience456',
            },
            {
                name: 'Cybersecurity Community',
                description: 'Learn about ethical hacking, network security, and cybersecurity best practices. Participate in CTF challenges and security workshops.',
                whatsappLink: 'https://chat.whatsapp.com/cybersec789',
            },
            {
                name: 'Mobile App Development',
                description: 'Build iOS and Android applications. Share tips on React Native, Flutter, Swift, and Kotlin. Collaborate on mobile projects.',
                whatsappLink: 'https://chat.whatsapp.com/mobiledev101',
            },
        ]);

        console.log('✅ Communities created');

        // ============================================
        // 8. SEED PARTNERS
        // ============================================
        await db.insert(partners).values([
            {
                name: 'Google Developer Student Club',
                logo: 'https://developers.google.com/static/community/dsc/images/dsc-logo.png',
                website: 'https://developers.google.com/community/dsc',
            },
            {
                name: 'Microsoft Learn Student Ambassador',
                logo: 'https://docs.microsoft.com/learn/media/learn-banner-logo.svg',
                website: 'https://studentambassadors.microsoft.com/',
            },
            {
                name: 'GitHub Campus Program',
                logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
                website: 'https://education.github.com/',
            },
        ]);

        console.log('✅ Partners created');

        // ============================================
        // 9. SEED REPORTS
        // ============================================
        const [report1] = await db.insert(reports).values({
            title: 'BITSA Annual Report 2023/2024',
            content: 'This comprehensive report highlights BITSA\'s achievements during the 2023/2024 academic year. Key accomplishments include: organizing 12 tech events with 800+ participants, launching 3 community initiatives, partnering with 5 tech companies, and supporting 45 student projects. Member growth increased by 40%, and we successfully secured funding for our innovation lab.',
            language: 'en',
            createdBy: superAdmin.id,
        }).returning();

        const [report2] = await db.insert(reports).values({
            title: 'Tech Summit 2024: Event Report',
            content: 'The BITSA Tech Summit 2024 was a resounding success with 250 attendees, 8 keynote speakers from leading tech companies, and 15 interactive workshops. Participant feedback rated the event 4.8/5 stars. The summit generated significant interest in AI and cybersecurity careers.',
            language: 'en',
            createdBy: adminUser.id,
        }).returning();

        console.log('✅ Reports created');

        // Add report translation
        await db.insert(reportTranslations).values({
            reportId: report1.id,
            language: 'sw',
            title: 'Ripoti ya Kila Mwaka ya BITSA 2023/2024',
            content: 'Ripoti hii ya kina inaangazia mafanikio ya BITSA katika mwaka wa masomo 2023/2024. Mafanikio muhimu ni pamoja na: kuandaa matukio 12 ya teknolojia na washiriki 800+, kuzindua mipango 3 ya jamii, kushirikiana na makampuni 5 ya teknolojia, na kusaidia miradi 45 ya wanafunzi.',
        }).onConflictDoNothing();

        console.log('✅ Report translations added');

        // ============================================
        console.log('');
        console.log('✅ ✅ ✅ Seeding completed successfully! ✅ ✅ ✅');
        console.log('');
        console.log('📊 Summary:');
        console.log('   - 5 Users (1 superadmin, 1 admin, 3 students)');
        console.log('   - 20 Interests');
        console.log('   - 3 Blogs (with translations)');
        console.log('   - 3 Events (with translations)');
        console.log('   - 3 Projects');
        console.log('   - 4 Leaders (3 current, 1 past)');
        console.log('   - 4 Communities');
        console.log('   - 3 Partners');
        console.log('   - 2 Reports (with translations)');
        console.log('');
        console.log('🔐 Login Credentials:');
        console.log('   SuperAdmin: admin@bitsa.com / admin123');
        console.log('   Admin: john.admin@bitsa.com / admin123');
        console.log('   Student: john.doe@student.ueab.ac.ke / student123');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
