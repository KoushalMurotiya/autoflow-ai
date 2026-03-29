/**
 * API base path for fetch(). Set VITE_API_BASE in frontend/.env (must be prefixed with VITE_).
 * Default `/api` is proxied to the backend in dev (see vite.config.js).
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
