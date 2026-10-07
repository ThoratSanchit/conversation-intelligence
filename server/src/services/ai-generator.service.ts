import OpenAI from 'openai';
import { z } from 'zod';
import env from '../config/env';
import { Lead } from '../models/lead.model';
import { DetectedSignal, GeneratedIntelligenceOutput } from '../types/intelligence.types';

const IntelligenceSchema = z.object({
  why_contact_now: z
    .string()
    .min(10, 'why_contact_now must be at least 10 characters'),
  why_it_matters: z
    .string()
    .min(10, 'why_it_matters must be at least 10 characters'),
  conversation_angle: z
    .string()
    .min(10, 'conversation_angle must be at least 10 characters'),
  suggested_opening: z
    .string()
    .min(10, 'suggested_opening must be at least 10 characters'),
});

const SYSTEM_PROMPT = `You are a B2B Conversation Intelligence Analyst.
Your task is to convert factual company lead data and deterministic business signals into actionable sales intelligence for an outbound sales representative.

CRITICAL FACTUAL GROUNDING RULES:
1. Strictly ground every statement in the provided factual lead data and signals.
2. DO NOT FABRICATE or assume facts absent from the input:
   - Do NOT invent funding rounds, funding amounts, or investor names.
   - Do NOT invent customers, client logos, case studies, or partnerships.
   - Do NOT invent revenue numbers or financial changes not present in the input.
   - Do NOT invent product launches, technical outages, or layoffs.
   - Do NOT invent competitors, buyer intent scores, or software budgets.
   - Do NOT invent technology usage not listed in the input technology field.
   - Do NOT invent specific business problems unsupported by the data.
3. Distinguish FACT from INFERENCE:
   - When citing evidence, reference explicit data points (e.g. "12 open positions", "28% headcount growth").
   - When interpreting implications, use consultative, cautious language: "may", "could", "suggests", "appears to", "likely relevant".
4. If fields are missing (e.g., no open positions, revenue unknown), work only with what is available. Do not guess replacements.

OUTPUT SPECIFICATION:
You must return valid JSON with exactly the following four fields:
1. "why_contact_now":
   Explain the immediate trigger for outreach based on factual events/signals (e.g., hiring spike, rapid expansion, steady growth, or contraction). Do NOT simply repeat the signal name; explain why the current timing is relevant.
2. "why_it_matters":
   Explain why this situation matters to the specific decision-maker (consider their job title/role if provided). Explain the operational or strategic implications for their department without presuming they definitely have a problem.
3. "conversation_angle":
   Provide a consultative discussion direction for the salesperson. Answer: "What should the salesperson actually talk about?" Focus on exploratory, consultative themes (e.g., scaling processes, team bandwidth, infrastructure reliability). NOT a generic sales pitch.
4. "suggested_opening":
   A concise, human-sounding outreach opener (2 to 3 sentences max) tailored to the decision-maker and company context.
   Rules for opener:
   - Reference real company facts naturally.
   - NO fake familiarity, exaggerated compliments ("I noticed your amazing company..."), or generic claims ("I help companies like yours...").
   - Maintain a consultative, peer-to-peer tone.`;

export class AiGeneratorService {
  private openai: OpenAI | null = null;

  constructor(customClient?: OpenAI) {
    if (customClient) {
      this.openai = customClient;
    } else {
      const apiKey = env.openai.apiKey?.trim();
      if (apiKey && apiKey !== 'your_openai_api_key_here') {
        this.openai = new OpenAI({ apiKey });
      }
    }
  }

  /**
   * Builds the formatted user prompt from normalized lead fields and signals.
   * Sends only relevant normalized fields, never raw unmapped data.
   */
  private buildUserPrompt(lead: Lead, signals: DetectedSignal[]): string {
    const formattedSignals =
      signals.length > 0
        ? signals
            .map(
              (s) =>
                `- [${s.severity}] ${s.name} (${s.type}): ${s.description}`
            )
            .join('\n')
        : 'None detected (No significant hiring or headcount growth triggers).';

    return `FACTUAL LEAD DATA:
- Company Name: ${lead.company_name}
- Industry: ${lead.industry || 'Not specified'}
- Location: ${lead.location || 'Not specified'}
- Website: ${lead.website || 'Not specified'}
- Estimated Revenue: ${lead.revenue || 'Not specified'}
- Employee Count: ${lead.employees !== null && lead.employees !== undefined ? lead.employees : 'Not specified'}
- Founded Year: ${lead.year_founded || 'Not specified'}
- Decision Maker Name: ${lead.owner_name || 'Not specified'}
- Decision Maker Title: ${lead.owner_title || 'Not specified'}
- Technology Stack: ${lead.technology || 'Not specified'}
- Headcount Growth: ${lead.headcount_growth || 'Not specified'}
- Open Positions: ${lead.open_positions !== null && lead.open_positions !== undefined ? lead.open_positions : 'Not specified'}

DETERMINISTIC SIGNALS:
${formattedSignals}

Generate the 4 intelligence fields in strict JSON format:
{
  "why_contact_now": "...",
  "why_it_matters": "...",
  "conversation_angle": "...",
  "suggested_opening": "..."
}`;
  }

  /**
   * Generates sales intelligence using OpenAI API with grounded prompting.
   */
  async generateIntelligence(
    lead: Lead,
    signals: DetectedSignal[]
  ): Promise<GeneratedIntelligenceOutput> {
    if (!this.openai) {
      const apiKey = env.openai.apiKey?.trim();
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error(
          'OPENAI_API_KEY is not configured in environment variables.'
        );
      }
      this.openai = new OpenAI({ apiKey });
    }

    const userPrompt = this.buildUserPrompt(lead, signals);

    const completion = await this.openai.chat.completions.create({
      model: env.openai.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI returned an empty response.');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseContent);
    } catch {
      throw new Error('OpenAI returned malformed JSON that could not be parsed.');
    }

    const validation = IntelligenceSchema.safeParse(parsedJson);
    if (!validation.success) {
      throw new Error(
        `OpenAI response failed schema validation: ${validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      );
    }

    return validation.data;
  }
}

export const aiGeneratorService = new AiGeneratorService();
export default aiGeneratorService;
