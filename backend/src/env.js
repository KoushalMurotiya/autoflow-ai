/**
 * Loads environment variables from `backend/.env` before other modules read `process.env`.
 * Keeps secrets out of source control; copy `.env.example` from the repo root to `backend/.env`.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
