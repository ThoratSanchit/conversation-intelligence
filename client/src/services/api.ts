import { API_BASE_URL } from '../lib/api';
import type {
  LeadsResponse,
  LeadDetailResponse,
  GenerateIntelligenceResponse,
  ImportResponse,
} from '../types';

export const apiService = {
  /**
   * Fetches paginated leads from the backend.
   */
  async getLeads(params?: { search?: string; page?: number; limit?: number }): Promise<LeadsResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const url = `${API_BASE_URL}/leads${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to fetch leads' }));
      throw new Error(err.message || 'Failed to fetch leads');
    }
    return response.json();
  },

  /**
   * Fetches a single lead by ID, including its associated intelligence.
   */
  async getLeadById(id: string): Promise<LeadDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Lead not found' }));
      throw new Error(err.message || 'Lead not found');
    }
    return response.json();
  },

  /**
   * Uploads and parses a SaaSquatch-compatible CSV file.
   */
  async importCsv(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/leads/import`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({ message: 'Import failed' }));
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to import CSV file');
    }
    return data;
  },

  /**
   * Generates deterministic signals + Groq AI sales intelligence on demand.
   */
  async generateIntelligence(leadId: string): Promise<GenerateIntelligenceResponse> {
    const response = await fetch(`${API_BASE_URL}/intelligence/${leadId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json().catch(() => ({ message: 'Generation failed' }));
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate intelligence');
    }
    return data;
  },
};

export default apiService;
