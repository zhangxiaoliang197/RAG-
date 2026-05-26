/**
 * local server entry file, for local development
 */
import app from './app.js';
import { getActiveDatabaseConfig, closeActiveDatabase } from './services/databaseService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

let server: any;

async function startServer() {
  try {
    await getActiveDatabaseConfig();
  } catch (error) {
    console.log('No database config found or init failed:', error);
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
    await closeActiveDatabase();
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
    await closeActiveDatabase();
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
