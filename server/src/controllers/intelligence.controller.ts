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

  generateIntelligence = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { leadId?: string; id?: string };
    const leadId = params.leadId || params.id;

    if (!leadId) {
      return reply.status(400).send({ success: false, message: 'leadId parameter is required.' });
    }

    try {
      // 1. Load lead
      const lead = await this.leadSvc.getLeadById(leadId);
      if (!lead) {
        return reply.status(404).send({ success: false, message: 'Lead not found.' });
      }

      // 2. Detect deterministic signals
      const signals = this.signalSvc.detectSignals(lead);

      // 3. Generate AI intelligence
      try {
        const aiOutput = await this.aiSvc.generateIntelligence(lead, signals);

        // 4. Persist successful intelligence
        const [intelligence] = await LeadIntelligence.upsert({
          lead_id: lead.id,
          status: 'COMPLETED',
          signals,
          why_contact_now: aiOutput.why_contact_now,
          why_it_matters: aiOutput.why_it_matters,
          conversation_angle: aiOutput.conversation_angle,
          suggested_opening: aiOutput.suggested_opening,
          error_message: null,
        });

        // 5. Return completed intelligence
        return reply.status(200).send({
          success: true,
          data: {
            id: intelligence.id,
            lead_id: intelligence.lead_id,
            status: intelligence.status,
            signals: intelligence.signals,
            why_contact_now: intelligence.why_contact_now,
            why_it_matters: intelligence.why_it_matters,
            conversation_angle: intelligence.conversation_angle,
            suggested_opening: intelligence.suggested_opening,
          },
        });
      } catch (aiError: any) {
        request.log.error(aiError.message || aiError);

        // Persist FAILED status with error_message while preserving detected signals
        const [failedRecord] = await LeadIntelligence.upsert({
          lead_id: lead.id,
          status: 'FAILED',
          signals,
          why_contact_now: null,
          why_it_matters: null,
          conversation_angle: null,
          suggested_opening: null,
          error_message: aiError.message || 'AI intelligence generation failed',
        });

        return reply.status(500).send({
          success: false,
          message: `AI intelligence generation failed: ${aiError.message || 'Internal AI error'}`,
          data: {
            id: failedRecord.id,
            lead_id: failedRecord.lead_id,
            status: failedRecord.status,
            signals: failedRecord.signals,
            error_message: failedRecord.error_message,
          },
        });
      }
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Operation failed.' });
    }
  };
}

export const intelligenceController = new IntelligenceController();
export default intelligenceController;
