import { FastifyInstance } from 'fastify';
import leadRoutes from './lead.routes';
import intelligenceRoutes from './intelligence.routes';

export default async function apiRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  await fastify.register(leadRoutes, { prefix: '/leads' });
  await fastify.register(intelligenceRoutes, { prefix: '/intelligence' });
}
