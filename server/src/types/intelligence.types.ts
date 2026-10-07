export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DetectedSignal {
  type: string;
  severity: SignalSeverity;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export type IntelligenceStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface LeadIntelligenceAttributes {
  id: string;
  lead_id: string;
  status: IntelligenceStatus;
  signals: DetectedSignal[];
  why_contact_now?: string | null;
  why_it_matters?: string | null;
  conversation_angle?: string | null;
  suggested_opening?: string | null;
  error_message?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
