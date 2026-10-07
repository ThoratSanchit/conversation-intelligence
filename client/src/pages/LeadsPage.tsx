import React, { useEffect, useState, useMemo } from 'react';
import { Link } from '../lib/router';
import apiService from '../services/api';
import type { Lead } from '../types';
import {
  AppShell,
  SignalBadge,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../components';
import {
  Search,
  Filter,
  UploadCloud,
  ChevronRight,
  Building,
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'HAS_SIGNALS' | 'HIGH_PRIORITY' | 'NO_SIGNALS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getLeads({ limit: 100 });
      setLeads(res.leads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Compute unique industries & locations for dropdowns
  const industries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry) set.add(l.industry);
    });
    return Array.from(set).sort();
  }, [leads]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.location) set.add(l.location);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.company_name.toLowerCase().includes(q);
        const matchesOwner = (lead.owner_name || '').toLowerCase().includes(q);
        const matchesIndustry = (lead.industry || '').toLowerCase().includes(q);
        const matchesTech = (lead.technology || '').toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesIndustry && !matchesTech) {
          return false;
        }
      }

      // 2. Industry filter
      if (selectedIndustry && lead.industry !== selectedIndustry) {
        return false;
      }

      // 3. Location filter
      if (selectedLocation && lead.location !== selectedLocation) {
        return false;
      }

      // 4. Signal filter
      const signals = lead.intelligence?.signals || [];
      if (signalFilter === 'HAS_SIGNALS' && signals.length === 0) {
        return false;
      }
      if (signalFilter === 'HIGH_PRIORITY' && !signals.some((s) => s.severity === 'HIGH')) {
        return false;
      }
      if (signalFilter === 'NO_SIGNALS' && signals.length > 0) {
        return false;
      }

      // 5. Intelligence Status filter
      const status = lead.intelligence?.status || 'PENDING';
      if (statusFilter !== 'ALL' && status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, selectedIndustry, selectedLocation, signalFilter, statusFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedLocation('');
    setSignalFilter('ALL');
    setStatusFilter('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedIndustry !== '' ||
    selectedLocation !== '' ||
    signalFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  return (
    <AppShell
      title="Leads"
      subtitle="Explore enriched leads and identify the strongest conversation opportunities."
    >
      <div className="space-y-6">
        {/* Top actions bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, founder, industry, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>

          <Link
            to="/import"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Leads</span>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-xs font-semibold text-slate-500 gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Signal Filter */}
            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <option value="ALL">All Signals</option>
              <option value="HAS_SIGNALS">With Signals</option>
              <option value="HIGH_PRIORITY">High Priority (Spikes)</option>
              <option value="NO_SIGNALS">Without Signals</option>
            </select>

            {/* Intelligence Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Intelligence Ready</option>
              <option value="PENDING">Pending Analysis</option>
              <option value="FAILED">Failed</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-auto cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Lead Table Container */}
        {loading ? (
          <LoadingState message="Loading enriched leads..." className="py-24" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeads} />
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={<Building className="w-6 h-6 text-slate-400" />}
            title="No leads match your criteria"
            description={
              hasActiveFilters
                ? 'Try adjusting or clearing your filters to see more leads.'
                : 'Import a CSV to begin analyzing company signals.'
            }
            action={
              hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  to="/import"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Import Leads</span>
                </Link>
              )
            }
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    {/* Primary column */}
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">Company</th>
                    {/* Secondary context */}
                    <th className="px-5 py-3.5 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Industry</th>
                    <th className="px-5 py-3.5 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-5 py-3.5 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Employees</th>
                    <th className="px-5 py-3.5 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Headcount Growth</th>
                    <th className="px-5 py-3.5 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Open Roles</th>
                    {/* Primary columns */}
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-800 uppercase tracking-wider min-w-[200px]">Detected Signals</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">Intelligence</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-800 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const signals = lead.intelligence?.signals || [];
                    const status = lead.intelligence?.status;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Primary: Company */}
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="group-hover:text-indigo-600 transition-colors"
                          >
                            {lead.company_name}
                          </Link>
                          {lead.owner_name && (
                            <span className="block text-xs font-normal text-slate-500 mt-0.5">
                              {lead.owner_name} {lead.owner_title ? `• ${lead.owner_title}` : ''}
                            </span>
                          )}
                        </td>

                        {/* Secondary context columns: subtly muted */}
                        <td className="px-5 py-4 text-xs text-slate-500 font-normal">
                          {lead.industry || '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-normal">
                          {lead.location || '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-normal tabular-nums">
                          {lead.employees ? lead.employees.toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-normal tabular-nums">
                          {lead.headcount_growth || '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-normal tabular-nums">
                          {lead.open_positions !== null && lead.open_positions !== undefined ? (
                            <span>{lead.open_positions} open roles</span>
                          ) : (
                            <span>—</span>
                          )}
                        </td>

                        {/* Primary: Detected Signals */}
                        <td className="px-5 py-4">
                          {signals.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {signals.map((sig, idx) => (
                                <SignalBadge key={idx} signal={sig} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal italic">None detected</span>
                          )}
                        </td>

                        {/* Primary: Intelligence */}
                        <td className="px-5 py-4">
                          {status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Ready
                            </span>
                          ) : status === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Primary: Action */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200/60 transition-colors shadow-2xs"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredLeads.length} of {leads.length} leads</span>
              <span className="text-slate-400">Signals prioritized • Zero arbitrary scoring</span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default LeadsPage;
