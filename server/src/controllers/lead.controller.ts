import { FastifyRequest, FastifyReply } from 'fastify';
import leadService, { LeadService } from '../services/lead.service';
import csvParserService, { CsvParserService } from '../services/csv-parser.service';
import { LeadFilterParams } from '../types/lead.types';

export class LeadController {
  constructor(
    private leadSvc: LeadService = leadService,
    private csvSvc: CsvParserService = csvParserService
  ) {}

  importCsv = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let csvContent: string | Buffer | null = null;

      if (request.isMultipart()) {
        const file = await request.file();
        if (file) {
          csvContent = await file.toBuffer();
        }
      } else if (typeof request.body === 'string') {
        csvContent = request.body;
      } else if (typeof (request.body as any)?.csv === 'string') {
        csvContent = (request.body as any).csv;
      }

      if (!csvContent) {
        return reply.status(400).send({
          success: false,
          message: 'CSV file or content is required.',
        });
      }

      const { validLeads, stats } = await this.csvSvc.parseAndNormalize(csvContent);

      if (validLeads.length > 0) {
        await this.leadSvc.bulkCreateLeads(validLeads);
      }

      return reply.status(201).send({
        success: true,
        message: `CSV import complete: ${stats.imported} imported, ${stats.skipped} skipped out of ${stats.total_rows} total rows.`,
        stats: {
          total_rows: stats.total_rows,
          imported: stats.imported,
          skipped: stats.skipped,
          errors: stats.errors,
        },
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: error.message || 'CSV import failed.',
      });
    }
  };

  getLeads = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as LeadFilterParams;
      const result = await this.leadSvc.getLeads(query);
      return reply.status(200).send({ success: true, ...result });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to fetch leads.' });
    }
  };

  getLeadById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const lead = await this.leadSvc.getLeadById(id);

      if (!lead) {
        return reply.status(404).send({ success: false, message: 'Lead not found.' });
      }

      return reply.status(200).send({ success: true, lead });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to fetch lead.' });
    }
  };
}

export const leadController = new LeadController();
export default leadController;
