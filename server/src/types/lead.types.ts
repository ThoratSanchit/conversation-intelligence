export interface LeadAttributes {
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
  created_at?: Date;
  updated_at?: Date;
}

export interface LeadFilterParams {
  search?: string;
  industry?: string;
  minEmployees?: number;
  maxEmployees?: number;
  page?: number;
  limit?: number;
}

export interface CsvImportError {
  row: number;
  company_name?: string;
  error: string;
}

export interface CsvImportStats {
  total_rows: number;
  imported: number;
  skipped: number;
  errors: CsvImportError[];
}
