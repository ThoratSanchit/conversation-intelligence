import { FastifyInstance } from 'fastify';
import intelligenceController from '../controllers/intelligence.controller';

export default async function intelligenceRoutes(fastify: FastifyInstance) {
  // Preferred endpoint per architecture directive
  fastify.post('/:leadId/generate', intelligenceController.generateIntelligence);
  // Alias for compatibility
  fastify.post('/analyze/:leadId', intelligenceController.generateIntelligence);
}
