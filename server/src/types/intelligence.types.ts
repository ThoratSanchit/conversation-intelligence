export interface DetectedSignal {
  type: string;
  name: string;
  description: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface LeadIntelligenceAttributes {
  id: string;
  lead_id: string;
  signals: DetectedSignal[];
  why_contact_now?: string | null;
  why_it_matters?: string | null;
  conversation_angle?: string | null;
  suggested_opening?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
