import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import env from './config/env';
import { connectDatabase } from './config/database';
import { syncDatabase } from './models';
import apiRoutes from './routes';

const app: FastifyInstance = fastify({
  logger: {
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
  },
});

export async function buildApp(): Promise<FastifyInstance> {
  // Handle empty JSON bodies gracefully
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      if (!body || (typeof body === 'string' && body.trim() === '')) {
        done(null, {});
        return;
      }
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  );

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for CSV
    },
  });

  // Register API routes
  await app.register(apiRoutes, { prefix: '/api' });

  return app;
}

export async function start(): Promise<void> {
  try {
    // 1. Connect to PostgreSQL
    await connectDatabase();

    // 2. Sync models with database
    await syncDatabase();

    // 3. Build Fastify app
    await buildApp();

    // 4. Listen
    await app.listen({ port: env.port, host: env.host });
    console.log(`Server listening on http://${env.host}:${env.port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export default app;
