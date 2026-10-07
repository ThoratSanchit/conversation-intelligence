import Lead, { LeadCreationAttributes } from '../models/lead.model';
import LeadIntelligence from '../models/intelligence.model';
import { LeadFilterParams } from '../types/lead.types';

export class LeadService {
  /**
   * List and filter leads.
   */
  async getLeads(filters: LeadFilterParams = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const { rows, count } = await Lead.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: LeadIntelligence,
          as: 'intelligence',
        },
      ],
    });

    return {
      leads: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get single lead by ID with associated intelligence.
   */
  async getLeadById(id: string) {
    return Lead.findByPk(id, {
      include: [
        {
          model: LeadIntelligence,
          as: 'intelligence',
        },
      ],
    });
  }

  /**
   * Bulk insert normalized leads.
   */
  async bulkCreateLeads(leadsData: LeadCreationAttributes[]) {
    return Lead.bulkCreate(leadsData, { ignoreDuplicates: true });
  }
}

export const leadService = new LeadService();
export default leadService;
