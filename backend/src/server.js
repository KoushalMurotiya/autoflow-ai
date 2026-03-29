/**
 * HTTP entrypoint. Loads env, binds Express to PORT (default 5000).
 */
import './env.js';
import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  // Startup signal for operators (not verbose request logging)
  console.log(`HTTP server listening on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, closing server`);
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
