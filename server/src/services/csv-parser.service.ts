import Papa from 'papaparse';
import { LeadCreationAttributes } from '../models/lead.model';
import { CsvImportError, CsvImportStats } from '../types/lead.types';

export { CsvImportError, CsvImportStats };

export interface CsvParseResult {
  validLeads: LeadCreationAttributes[];
  stats: CsvImportStats;
}

/**
 * Canonical alias map for approved SaaSquatch lead fields
 */
const FIELD_ALIASES: Record<string, string[]> = {
  company_name: [
    'company_name',
    'company name',
    'company',
    'organization',
    'account name',
    'business name',
  ],
  website: [
    'website',
    'domain',
    'url',
    'company website',
    'web address',
  ],
  industry: [
    'industry',
    'vertical',
    'sector',
    'category',
    'business sector',
  ],
  location: [
    'location',
    'headquarters',
    'hq',
    'city, state',
    'city',
    'address',
    'office location',
  ],
  revenue: [
    'revenue',
    'estimated revenue',
    'annual revenue',
    'arr',
    'est revenue',
    'estimated_revenue',
  ],
  employees: [
    'employees',
    'employee count',
    'headcount',
    'size',
    'staff',
    'number of employees',
    'employee_count',
  ],
  year_founded: [
    'year_founded',
    'year founded',
    'founded year',
    'founded',
    'established',
    'year established',
  ],
  owner_name: [
    'owner_name',
    'owner name',
    'ceo name',
    'decision maker',
    'contact name',
    'full name',
    'founder',
    'ceo',
    'contact',
  ],
  owner_title: [
    'owner_title',
    'owner title',
    'title',
    'job title',
    'position',
    'role',
    'contact title',
  ],
  email: [
    'email',
    'work email',
    'contact email',
    'verified email',
    'email address',
  ],
  phone: [
    'phone',
    'phone number',
    'direct phone',
    'telephone',
    'mobile',
    'direct dial',
  ],
  linkedin: [
    'linkedin',
    'linkedin url',
    'person linkedin',
    'company linkedin',
    'linkedin profile',
    'linkedin_url',
  ],
  technology: [
    'technology',
    'tech stack',
    'technologies',
    'tools used',
    'tech',
    'software used',
  ],
  headcount_growth: [
    'headcount_growth',
    'headcount growth',
    'growth rate',
    'employee growth',
    'growth %',
    'growth',
    'headcount_growth_%',
  ],
  open_positions: [
    'open_positions',
    'open positions',
    'job openings',
    'hiring count',
    'active jobs',
    'job openings count',
  ],
};

export class CsvParserService {
  /**
   * Normalizes header key to clean lookup string
   */
  private cleanHeader(header: string): string {
    return header.trim().toLowerCase().replace(/[\-_]+/g, ' ').replace(/\s+/g, ' ');
  }

  /**
   * Identifies canonical field name from header alias
   */
  private matchCanonicalField(cleanedHeader: string): string | null {
    for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
      if (canonical === cleanedHeader || aliases.includes(cleanedHeader)) {
        return canonical;
      }
    }
    return null;
  }

  /**
   * Parses integer safely handling strings with commas or ranges
   */
  private parseInteger(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return isNaN(value) ? null : Math.floor(value);

    const str = String(value).trim().replace(/,/g, '');
    const match = str.match(/(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  /**
   * Normalizes string values, returning null if empty
   */
  private parseString(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    return str.length > 0 ? str : null;
  }

  /**
   * Normalizes email addresses
   */
  private parseEmail(value: unknown): string | null {
    const str = this.parseString(value);
    return str ? str.toLowerCase() : null;
  }

  /**
   * Parse CSV content and normalize lead rows according to the approved contract
   */
  async parseAndNormalize(csvContent: string | Buffer): Promise<CsvParseResult> {
    const rawString = typeof csvContent === 'string' ? csvContent : csvContent.toString('utf-8');
    // Strip BOM if present
    const cleanCsv = rawString.replace(/^\uFEFF/, '');

    const parsed = Papa.parse<Record<string, unknown>>(cleanCsv, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim(),
    });

    const stats: CsvImportStats = {
      total_rows: parsed.data.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const validLeads: LeadCreationAttributes[] = [];

    // Map headers to canonical names
    const headerMapping = new Map<string, string>(); // rawHeader -> canonicalField
    if (parsed.meta.fields) {
      for (const field of parsed.meta.fields) {
        const cleaned = this.cleanHeader(field);
        const canonical = this.matchCanonicalField(cleaned);
        if (canonical) {
          headerMapping.set(field, canonical);
        }
      }
    }

    parsed.data.forEach((row, index) => {
      const rowNumber = index + 1;
      const canonicalValues: Record<string, unknown> = {};
      const rawData: Record<string, unknown> = {};

      // Map row values into canonical fields or raw_data
      for (const [key, value] of Object.entries(row)) {
        const canonicalKey = headerMapping.get(key);
        if (canonicalKey) {
          canonicalValues[canonicalKey] = value;
        } else {
          // Unmapped columns preserved in raw_data
          rawData[key] = value;
        }
      }

      // 6. Validate company_name as the only required field
      const companyName = this.parseString(canonicalValues.company_name);
      if (!companyName) {
        stats.skipped++;
        stats.errors.push({
          row: rowNumber,
          error: 'Missing required field: company_name',
        });
        return;
      }

      // Normalize all values
      const lead: LeadCreationAttributes = {
        company_name: companyName,
        website: this.parseString(canonicalValues.website),
        industry: this.parseString(canonicalValues.industry),
        location: this.parseString(canonicalValues.location),
        revenue: this.parseString(canonicalValues.revenue),
        employees: this.parseInteger(canonicalValues.employees),
        year_founded: this.parseInteger(canonicalValues.year_founded),
        owner_name: this.parseString(canonicalValues.owner_name),
        owner_title: this.parseString(canonicalValues.owner_title),
        email: this.parseEmail(canonicalValues.email),
        phone: this.parseString(canonicalValues.phone),
        linkedin: this.parseString(canonicalValues.linkedin),
        technology: this.parseString(canonicalValues.technology),
        headcount_growth: this.parseString(canonicalValues.headcount_growth),
        open_positions: this.parseInteger(canonicalValues.open_positions),
        raw_data: Object.keys(rawData).length > 0 ? rawData : {},
      };

      validLeads.push(lead);
      stats.imported++;
    });

    return {
      validLeads,
      stats,
    };
  }
}

export const csvParserService = new CsvParserService();
export default csvParserService;
