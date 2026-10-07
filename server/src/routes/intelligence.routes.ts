import { FastifyInstance } from 'fastify';
import intelligenceController from '../controllers/intelligence.controller';

export default async function intelligenceRoutes(fastify: FastifyInstance) {
  fastify.post('/analyze/:id', intelligenceController.analyzeLead);
}
