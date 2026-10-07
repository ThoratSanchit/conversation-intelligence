import { FastifyInstance } from 'fastify';
import leadController from '../controllers/lead.controller';

export default async function leadRoutes(fastify: FastifyInstance) {
  fastify.post('/import', leadController.importCsv);
  fastify.get('/', leadController.getLeads);
  fastify.get('/:id', leadController.getLeadById);
}
