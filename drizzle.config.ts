import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// This loads your .env file into process.env
dotenv.config();

export default defineConfig({
  schema: './api/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

console.log("DB URL Loaded:", !!process.env.TURSO_DATABASE_URL);
console.log("Auth Token Loaded:", !!process.env.TURSO_AUTH_TOKEN);