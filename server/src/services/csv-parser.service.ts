import { LeadCreationAttributes } from '../models/lead.model';

export class CsvParserService {
  /**
   * Parse CSV stream/buffer and normalize raw SaaSquatch lead data.
   * Implementation pending approval.
   */
  async parseAndNormalize(csvContent: string | Buffer): Promise<LeadCreationAttributes[]> {
    // Skeleton placeholder for CSV parsing and normalization
    return [];
  }
}

export const csvParserService = new CsvParserService();
export default csvParserService;
