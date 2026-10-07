export interface DetectedSignal {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface LeadIntelligence {
  id: string;
  lead_id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  signals: DetectedSignal[];
  why_contact_now: string | null;
  why_it_matters: string | null;
  conversation_angle: string | null;
  suggested_opening: string | null;
  error_message: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  company_name: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  revenue?: string | null;
  employees?: number | null;
  year_founded?: number | null;
  owner_name?: string | null;
  owner_title?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  technology?: string | null;
  headcount_growth?: string | null;
  open_positions?: number | null;
  raw_data?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  intelligence?: LeadIntelligence | null;
}

export interface ImportStats {
  total_rows: number;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
    raw?: unknown;
  }>;
}

export interface LeadsResponse {
  success: boolean;
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadDetailResponse {
  success: boolean;
  lead: Lead;
}

export interface GenerateIntelligenceResponse {
  success: boolean;
  message?: string;
  data: LeadIntelligence;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  stats: ImportStats;
}
