import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import spotRoutes from './routes/spotRoutes';
import expenseRoutes from './routes/expenseRoutes';
import blogRoutes from './routes/blogRoutes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deshitrip';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'DeshiTrip API is running', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`[server]: API Server is active on http://localhost:${port}`);
});

export default app;
