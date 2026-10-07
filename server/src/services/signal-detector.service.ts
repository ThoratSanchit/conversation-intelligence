import { Lead } from '../models/lead.model';
import { LeadAttributes } from '../types/lead.types';
import { DetectedSignal } from '../types/intelligence.types';

export type SignalDetectorInput =
  | Lead
  | Partial<Pick<LeadAttributes, 'open_positions' | 'headcount_growth'>>;

export class SignalDetectorService {
  /**
   * Safely parses headcount growth string into a numerical percentage.
   * Handles: "+28%", "28%", "-3%", "14.5%", malformed strings ("unknown", "") and nulls.
   * Returns null if unparseable, empty, or invalid.
   */
  private parseGrowthPercentage(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return isNaN(value) ? null : value;

    const str = String(value).trim();
    if (!str) return null;

    // Remove any spaces inside percentage string, e.g. "+ 28 %" -> "+28%"
    const normalized = str.replace(/\s+/g, '');
    const match = normalized.match(/^([+-]?\d+(?:\.\d+)?)\%?$/);
    if (!match) return null;

    const parsed = parseFloat(match[1]);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Evaluates deterministic factual signals from lead data.
   * Approved Signals:
   * 1. HIRING_SPIKE (open_positions >= 5, HIGH)
   * 2. ACTIVE_HIRING (open_positions >= 2 && < 5, MEDIUM)
   * 3. RAPID_HEADCOUNT_SURGE (headcount_growth >= 20%, HIGH)
   * 4. STEADY_EXPANSION (headcount_growth >= 10% && < 20%, MEDIUM)
   * 5. HEADCOUNT_CONTRACTION (headcount_growth < 0%, LOW)
   */
  detectSignals(lead: SignalDetectorInput): DetectedSignal[] {
    const signals: DetectedSignal[] = [];

    // 1. Hiring Signals (open_positions)
    const openPositions = typeof lead.open_positions === 'number' ? lead.open_positions : null;

    if (openPositions !== null) {
      if (openPositions >= 5) {
        signals.push({
          type: 'HIRING_SPIKE',
          severity: 'HIGH',
          name: 'Hiring Spike',
          description: `Company currently has ${openPositions} open positions.`,
          metadata: {
            open_positions: openPositions,
          },
        });
      } else if (openPositions >= 2) {
        signals.push({
          type: 'ACTIVE_HIRING',
          severity: 'MEDIUM',
          name: 'Active Hiring',
          description: `Company currently has ${openPositions} open positions.`,
          metadata: {
            open_positions: openPositions,
          },
        });
      }
      // open_positions < 2 (e.g. 0, 1) -> no hiring signal
    }

    // 2. Headcount Growth Signals (headcount_growth)
    const growthPercentage = this.parseGrowthPercentage(lead.headcount_growth);

    if (growthPercentage !== null) {
      const rawGrowthStr = String(lead.headcount_growth).trim();

      if (growthPercentage >= 20) {
        signals.push({
          type: 'RAPID_HEADCOUNT_SURGE',
          severity: 'HIGH',
          name: 'Rapid Headcount Surge',
          description: `Company headcount grew by ${growthPercentage}% over the tracking period.`,
          metadata: {
            headcount_growth: growthPercentage,
            raw_value: rawGrowthStr,
          },
        });
      } else if (growthPercentage >= 10) {
        signals.push({
          type: 'STEADY_EXPANSION',
          severity: 'MEDIUM',
          name: 'Steady Expansion',
          description: `Company headcount grew by ${growthPercentage}% over the tracking period.`,
          metadata: {
            headcount_growth: growthPercentage,
            raw_value: rawGrowthStr,
          },
        });
      } else if (growthPercentage < 0) {
        signals.push({
          type: 'HEADCOUNT_CONTRACTION',
          severity: 'LOW',
          name: 'Headcount Contraction',
          description: `Company headcount contracted by ${growthPercentage}%.`,
          metadata: {
            headcount_growth: growthPercentage,
            raw_value: rawGrowthStr,
          },
        });
      }
      // growthPercentage >= 0 && < 10 (e.g. 0%, 5%) -> no growth signal
    }

    return signals;
  }
}

export const signalDetectorService = new SignalDetectorService();
export default signalDetectorService;
