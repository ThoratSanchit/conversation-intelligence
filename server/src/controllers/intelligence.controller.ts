import { FastifyRequest, FastifyReply } from 'fastify';
import leadService, { LeadService } from '../services/lead.service';
import signalDetectorService, { SignalDetectorService } from '../services/signal-detector.service';
import aiGeneratorService, { AiGeneratorService } from '../services/ai-generator.service';
import LeadIntelligence from '../models/intelligence.model';

export class IntelligenceController {
  constructor(
    private leadSvc: LeadService = leadService,
    private signalSvc: SignalDetectorService = signalDetectorService,
    private aiSvc: AiGeneratorService = aiGeneratorService
  ) {}

  analyzeLead = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const lead = await this.leadSvc.getLeadById(id);

      if (!lead) {
        return reply.status(404).send({ success: false, message: 'Lead not found.' });
      }

      // 1. Deterministic signal detection
      const signals = this.signalSvc.detectSignals(lead);

      // 2. AI generation of angles & opening
      const aiOutput = await this.aiSvc.generateIntelligence(lead, signals);

      // 3. Upsert into database
      const [intelligence] = await LeadIntelligence.upsert({
        lead_id: lead.id,
        status: 'COMPLETED',
        signals,
        why_contact_now: aiOutput.why_contact_now,
        why_it_matters: aiOutput.why_it_matters,
        conversation_angle: aiOutput.conversation_angle,
        suggested_opening: aiOutput.suggested_opening,
      });

      return reply.status(200).send({
        success: true,
        message: 'Intelligence analysis completed.',
        intelligence,
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Analysis failed.' });
    }
  };
}

export const intelligenceController = new IntelligenceController();
export default intelligenceController;
