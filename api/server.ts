/**
 * local server entry file, for local development
 */
import app from './app.js';
import { loadOracleConfig, initOraclePool, closeOraclePool } from './services/oracleService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

let server: any;

async function startServer() {
  try {
    const oracleConfig = await loadOracleConfig();
    if (oracleConfig) {
      await initOraclePool(oracleConfig);
      console.log('Oracle connection pool initialized');
    }
  } catch (error) {
    console.log('No Oracle config found or init failed:', error);
  }

  server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
  });
}

startServer();

/**
 * close server
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received');
  try {
    await closeOraclePool();
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received');
  try {
    await closeOraclePool();
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;