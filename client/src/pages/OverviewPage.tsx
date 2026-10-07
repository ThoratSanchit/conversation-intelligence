import React, { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import apiService from '../services/api';
import type { Lead } from '../types';
import {
  AppShell,
  StatCard,
  SignalBadge,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../components';
import {
  Users,
  Radio,
  Flame,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getLeads({ limit: 100 });
      setLeads(res.leads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Compute live statistics from leads
  const totalLeads = leads.length;
  const leadsWithSignals = leads.filter(
    (l) => l.intelligence?.signals && l.intelligence.signals.length > 0
  ).length;

  const highPrioritySignalsCount = leads.reduce((acc, lead) => {
    const highSignals = (lead.intelligence?.signals || []).filter(
      (s) => s.severity === 'HIGH'
    ).length;
    return acc + highSignals;
  }, 0);

  const intelligenceGeneratedCount = leads.filter(
    (l) => l.intelligence?.status === 'COMPLETED'
  ).length;

  // Leads with priority signals (HIGH or MEDIUM)
  const priorityLeads = leads
    .filter((l) => (l.intelligence?.signals || []).some((s) => s.severity === 'HIGH'))
    .slice(0, 5);

  const recentLeads = leads.slice(0, 6);

  return (
    <AppShell
      title="Conversation Intelligence"
      subtitle="Turn lead data into timely, actionable conversations."
    >
      {loading ? (
        <LoadingState message="Loading intelligence workspace..." className="py-24" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOverviewData} />
      ) : totalLeads === 0 ? (
        <EmptyState
          icon={<UploadCloud className="w-6 h-6 text-indigo-600" />}
          title="No leads yet"
          description="Import a CSV containing SaaSquatch-enriched leads to detect factual triggers and generate conversation intelligence."
          action={
            <Link
              to="/import"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Your First CSV</span>
            </Link>
          }
          className="my-8"
        />
      ) : (
        <div className="space-y-8">
          {/* Summary metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Leads"
              value={totalLeads}
              subtitle="Enriched company records"
              icon={<Users className="w-4 h-4 text-slate-600" />}
            />
            <StatCard
              title="Leads With Signals"
              value={leadsWithSignals}
              subtitle={`${totalLeads > 0 ? Math.round((leadsWithSignals / totalLeads) * 100) : 0}% of workspace`}
              icon={<Radio className="w-4 h-4 text-blue-600" />}
              badge={leadsWithSignals > 0 ? { text: 'Active', variant: 'indigo' } : undefined}
            />
            <StatCard
              title="High Priority Signals"
              value={highPrioritySignalsCount}
              subtitle="Spikes & rapid growth triggers"
              icon={<Flame className="w-4 h-4 text-amber-600" />}
              badge={highPrioritySignalsCount > 0 ? { text: 'Actionable', variant: 'warning' } : undefined}
            />
            <StatCard
              title="Intelligence Generated"
              value={intelligenceGeneratedCount}
              subtitle="Ready for outbound sales"
              icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
              badge={intelligenceGeneratedCount > 0 ? { text: 'Ready', variant: 'success' } : undefined}
            />
          </div>

          {/* Priority Signals section */}
          {priorityLeads.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Priority Signals</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Companies exhibiting high-velocity hiring spikes or rapid expansion surges.
                  </p>
                </div>
                <Link
                  to="/leads"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
                >
                  <span>View all leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {priorityLeads.length === 1 ? (
                (() => {
                  const lead = priorityLeads[0];
                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{lead.company_name}</h3>
                            {lead.intelligence?.status === 'COMPLETED' ? (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Ready
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Unanalyzed
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                            {lead.industry && <span>{lead.industry}</span>}
                            {lead.industry && lead.location && <span>•</span>}
                            {lead.location && <span>{lead.location}</span>}
                            {lead.headcount_growth && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-700">{lead.headcount_growth} growth</span>
                              </>
                            )}
                            {lead.open_positions !== null && lead.open_positions !== undefined && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-700">{lead.open_positions} open roles</span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lead.intelligence?.signals?.map((sig, idx) => (
                              <SignalBadge key={idx} signal={sig} size="sm" />
                            ))}
                          </div>
                        </div>

                        <div className="lg:w-96 flex flex-col justify-between shrink-0 bg-white p-4 rounded-lg border border-slate-200/70">
                          {lead.intelligence?.why_contact_now ? (
                            <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3 mb-3">
                              "{lead.intelligence.why_contact_now}"
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic mb-3">
                              Pending intelligence generation.
                            </p>
                          )}
                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Link
                              to={`/leads/${lead.id}`}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                            >
                              <span>View Intelligence</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {priorityLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">{lead.company_name}</h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                              {lead.industry && <span>{lead.industry}</span>}
                              {lead.industry && lead.location && <span>•</span>}
                              {lead.location && <span>{lead.location}</span>}
                              {lead.open_positions !== null && lead.open_positions !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>{lead.open_positions} open roles</span>
                                </>
                              )}
                            </div>
                          </div>
                          {lead.intelligence?.status === 'COMPLETED' ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              Ready
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              Unanalyzed
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 my-3">
                          {lead.intelligence?.signals?.map((sig, idx) => (
                            <SignalBadge key={idx} signal={sig} size="sm" />
                          ))}
                        </div>

                        {lead.intelligence?.why_contact_now && (
                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-md border border-slate-200/70 line-clamp-2 italic mb-3">
                            "{lead.intelligence.why_contact_now}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          <span>View Intelligence</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Leads section */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Recent Leads</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest verified records enriched for conversation intelligence.
                </p>
              </div>
              <Link
                to="/leads"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
              >
                <span>Browse all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/75 border-b border-slate-200">
                  <tr>
                    {/* Primary columns */}
                    <th className="px-6 py-3 text-xs font-semibold text-slate-800 uppercase tracking-wider">Company</th>
                    {/* Secondary context */}
                    <th className="px-6 py-3 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-[11px] font-normal text-slate-400 uppercase tracking-wider">Employees</th>
                    {/* Primary columns */}
                    <th className="px-6 py-3 text-xs font-semibold text-slate-800 uppercase tracking-wider">Signals</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-800 uppercase tracking-wider">Intelligence</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-800 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLeads.map((lead) => {
                    const signals = lead.intelligence?.signals || [];
                    const status = lead.intelligence?.status;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Primary */}
                        <td className="px-6 py-3.5 font-semibold text-slate-900">
                          <Link to={`/leads/${lead.id}`} className="hover:text-indigo-600 transition-colors">
                            {lead.company_name}
                          </Link>
                        </td>
                        {/* Secondary */}
                        <td className="px-6 py-3.5 text-slate-500 text-xs font-normal">
                          {lead.industry || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs font-normal">
                          {lead.location || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs font-normal">
                          {lead.employees ? lead.employees.toLocaleString() : '—'}
                        </td>
                        {/* Primary */}
                        <td className="px-6 py-3.5">
                          {signals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {signals.slice(0, 2).map((s, idx) => (
                                <SignalBadge key={idx} signal={s} size="sm" />
                              ))}
                              {signals.length > 2 && (
                                <span className="text-[11px] text-slate-500 font-medium self-center">
                                  +{signals.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal">None detected</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
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
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default OverviewPage;
