import express ,{Application} from 'express';
import cors from 'cors';
import { swaggerSetup } from './swagger';


const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter Midddleware

//Logging Middleware

//Swagger Setup
swaggerSetup(app); 

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the BitSa API');
}); //Default Route

//Other Routes 

export default app;