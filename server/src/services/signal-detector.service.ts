import { Lead } from '../models/lead.model';
import { DetectedSignal } from '../types/intelligence.types';

export class SignalDetectorService {
  /**
   * Deterministic signal detection based on lead data attributes.
   * Implementation pending approval.
   */
  detectSignals(lead: Lead): DetectedSignal[] {
    const signals: DetectedSignal[] = [];
    // Deterministic signal rules to be implemented upon approval
    return signals;
  }
}

export const signalDetectorService = new SignalDetectorService();
export default signalDetectorService;
