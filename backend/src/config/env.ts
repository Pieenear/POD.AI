import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];

for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.warn(`[WARN] Missing required environment variable: ${env}`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/careerflow',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-key-1234',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-jwt-refresh-secret-key-1234',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // SMTP Configs
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.mailtrap.io',
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '2525', 10),
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASS: process.env.MAIL_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@careerflow.ai',

  // Cloudinary Configs
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};
