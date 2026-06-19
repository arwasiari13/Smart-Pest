import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
  PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  LOCAL_UPLOAD_DIR: z.string().default('uploads'),
  UPLOAD_PROVIDER: z.enum(['local', 'firebase', 's3']).default('local'),
  SMS_PROVIDER: z.string().default('disabled'),

  // Firebase Admin SDK credentials (from Firebase Console → Project Settings → Service Accounts)
  // Leave empty to start the server without Firebase (push notifications disabled)
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),

  // Frontend Firebase Web SDK credentials (same project, different SDK)
  FIREBASE_API_KEY: z.string().optional(),
  FIREBASE_AUTH_DOMAIN: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  FIREBASE_APP_ID: z.string().optional(),

  // Admin setup key – required to call POST /auth/setup/admin
  ADMIN_SETUP_KEY: z.string().default('change-this-before-production'),

  // IoT device shared secret
  IOT_API_KEY: z.string().default('smartpest-iot-secret-key-change-in-production'),

  // S3 (optional)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export const corsOrigins = env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((o) => o.trim());
