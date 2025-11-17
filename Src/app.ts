import express ,{Application} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { swaggerSetup } from './swagger';
import { authRouter } from './Auth/auth.routes';
import { usersRouter } from './Users/users.routes';
import { auditRouter } from './Audit/audit.routes';
import { interestsRouter } from './Interests/interests.routes';
import { projectsRouter } from './Projects/projects.routes';
import { blogsRouter } from './Blogs/blogs.routes';
import { eventsRouter } from './Events/events.routes';
import leadersRouter from './Leaders/leaders.routes';
import communitiesRouter from './Communities/communities.routes';
import partnersRouter from './Partners/partners.routes';
import reportsRouter from './Reports/reports.routes';
import aiRouter from './AI/ai.routes';

const app: Application = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Rate Limiter Midddleware

//Logging Middleware

//Swagger Setup
swaggerSetup(app); 

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the BitSa API');
}); //Default Route

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

//Other Routes 
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', auditRouter);
app.use('/api/interests', interestsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/leaders', leadersRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);

export default app;