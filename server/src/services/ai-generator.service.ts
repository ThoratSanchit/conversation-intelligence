import Groq from 'groq-sdk';
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

CRITICAL FACTUAL GROUNDING & HYPOTHESIS-DRIVEN RULES:
1. STRICT DISTINCTION: FACT vs. INFERENCE vs. HYPOTHESIS
   - FACT: Must come directly from provided lead data and detected signals.
   - INFERENCE: May explain a reasonable, logical implication of those facts.
   - HYPOTHESIS: If discussing a possible business challenge, operational consideration, or need, explicitly frame it as an open topic or area to explore—NEVER as a confirmed fact, problem, or operational deficit.

2. ABSOLUTELY NO ASSUMED PAIN POINTS OR DEFICITS:
   - Do NOT invent, assume, or assert specific operational problems, pain points, bottlenecks, or tool deficiencies (e.g., do NOT claim they have "developer velocity issues", "engineering bottlenecks", "inefficient workflows", "tooling limits", or "cloud cost problems").
   - Strictly avoid language asserting unverified problems:
     * "they are struggling with..."
     * "their current tools cannot..."
     * "they have bottlenecks..."
     * "their workflow is inefficient..."
     * "they need..."
     * "they are facing challenges with..."
   - Instead, use hypothesis-driven exploratory phrasing:
     * "may become relevant"
     * "could create additional complexity"
     * "may be worth exploring"
     * "could be an area to discuss"
     * "it would be useful to understand whether..."

3. TECHNOLOGY IS CONTEXT ONLY:
   - Listed technologies (e.g. AWS, React, Kubernetes, PostgreSQL) are environmental context ONLY.
   - Do NOT infer or assume technology problems:
     * AWS does NOT mean cloud cost or infrastructure issues.
     * React does NOT mean frontend redesign or frontend problems.
     * Kubernetes does NOT mean DevOps trouble or operational failures.

4. ABSOLUTE PROHIBITION ON EXTERNAL FABRICATION:
   - Do NOT invent funding rounds, amounts, or investors.
   - Do NOT invent customers, client logos, case studies, or partnerships.
   - Do NOT invent revenue figures or financial trends not present in input.
   - Do NOT invent product launches, technical outages, or layoffs.
   - Do NOT invent competitors, buyer intent scores, or software budgets.

5. MISSING DATA HANDLING:
   - If fields are missing (e.g. revenue unknown, open positions missing), work strictly with available data. Never guess or fabricate defaults.

OUTPUT SPECIFICATION:
You must return valid JSON with exactly the following four fields:
1. "why_contact_now":
   Explain the immediate trigger for outreach based directly on factual signals (e.g., hiring spike, steady expansion, contraction). Explain why current timing is relevant without asserting unverified operational failures.
2. "why_it_matters":
   Explain why this situation matters to the specific decision-maker (consider their job title/role if provided). Frame departmental implications cautiously as areas that may gain priority or introduce new coordination needs, without presuming they definitely have a problem.
3. "conversation_angle":
   Must be framed as an exploratory discussion topic or question, NOT an assumed problem or prescribed solution.
   - Example acceptable angle: "Discuss whether onboarding and coordination complexity is increasing as engineering expands."
   - Example unacceptable angle: "Help them solve developer onboarding bottlenecks."
4. "suggested_opening":
   A concise, human-sounding outreach opener (2 to 3 sentences max) tailored to the decision-maker and company context.
   Rules for opener:
   - Reference real company facts naturally.
   - Use an exploratory, peer-to-peer curiosity tone.
   - NO fake familiarity, NO exaggerated flattery ("I noticed your amazing company..."), NO presumption of pain, and NO generic sales pitches ("I help companies like yours...").`;

export class AiGeneratorService {
  private groq: Groq | null = null;

  constructor(customClient?: Groq) {
    if (customClient) {
      this.groq = customClient;
    } else {
      const apiKey = env.groq.apiKey?.trim();
      if (apiKey && apiKey !== 'your_groq_api_key_here') {
        this.groq = new Groq({ apiKey });
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
}

CRITICAL: Ground all fields strictly in the factual data above. Use exploratory hypothesis framing ("may be worth exploring", "could create additional complexity"). Do NOT assume unverified pain points, bottlenecks, or deficits. Technology is context only. Frame conversation_angle as an exploratory topic or question.`;
  }

  /**
   * Generates sales intelligence using Groq API with grounded prompting.
   */
  async generateIntelligence(
    lead: Lead,
    signals: DetectedSignal[]
  ): Promise<GeneratedIntelligenceOutput> {
    if (!this.groq) {
      const apiKey = env.groq.apiKey?.trim();
      if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error(
          'GROQ_API_KEY is not configured in environment variables.'
        );
      }
      this.groq = new Groq({ apiKey });
    }

    const userPrompt = this.buildUserPrompt(lead, signals);
    const model = env.groq.model || 'openai/gpt-oss-120b';

    let completion: any;
    try {
      completion = await this.groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
    } catch (apiErr: any) {
      // Fallback if response_format: { type: 'json_object' } is unsupported by a specific model
      if (
        apiErr?.message?.includes('response_format') ||
        (apiErr?.status === 400 && apiErr?.message?.includes('json_object'))
      ) {
        completion = await this.groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        });
      } else {
        throw apiErr;
      }
    }

    const responseContent = completion.choices?.[0]?.message?.content;
    if (!responseContent || !responseContent.trim()) {
      throw new Error('Groq returned an empty response.');
    }

    // Safely extract JSON text, stripping markdown code block formatting if present
    let cleanedContent = responseContent.trim();
    const codeBlockMatch = cleanedContent.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleanedContent = codeBlockMatch[1].trim();
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanedContent);
    } catch {
      throw new Error('Groq returned malformed JSON that could not be parsed.');
    }

    const validation = IntelligenceSchema.safeParse(parsedJson);
    if (!validation.success) {
      throw new Error(
        `Groq response failed schema validation: ${validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      );
    }

    return validation.data;
  }
}

export const aiGeneratorService = new AiGeneratorService();
export default aiGeneratorService;
