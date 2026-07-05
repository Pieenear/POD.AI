import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Secure headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// V1 Routes
app.use('/api/v1', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to launch application server', err);
});
