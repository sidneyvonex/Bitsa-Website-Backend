import express ,{Application} from 'express';
import cors from 'cors';
import { swaggerSetup } from './swagger';
import { authRouter } from './Auth/auth.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

export default app;