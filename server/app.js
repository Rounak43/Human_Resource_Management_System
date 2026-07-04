import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static profile pictures (future scalable module uploads)
app.use('/uploads', express.static('uploads'));

// API Routes mounting point
app.use('/api', apiRouter);

// Centralized error handling wrapper
app.use(errorHandler);

export default app;
