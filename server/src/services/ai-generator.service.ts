import { Lead } from '../models/lead.model';
import { DetectedSignal } from '../types/intelligence.types';

export interface GeneratedIntelligenceOutput {
  why_contact_now: string;
  why_it_matters: string;
  conversation_angle: string;
  suggested_opening: string;
}

export class AiGeneratorService {
  /**
   * Synthesize conversation intelligence using detected signals and OpenAI API.
   * Implementation pending approval.
   */
  async generateIntelligence(
    lead: Lead,
    signals: DetectedSignal[]
  ): Promise<GeneratedIntelligenceOutput> {
    // LLM synthesis to be implemented upon approval
    return {
      why_contact_now: '',
      why_it_matters: '',
      conversation_angle: '',
      suggested_opening: '',
    };
  }
}

export const aiGeneratorService = new AiGeneratorService();
export default aiGeneratorService;
