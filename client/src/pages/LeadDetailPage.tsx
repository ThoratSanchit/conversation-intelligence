import React, { useEffect, useState } from 'react';
import { useRouter, Link } from '../lib/router';
import apiService from '../services/api';
import type { Lead, LeadIntelligence } from '../types';
import {
  AppShell,
  LoadingState,
  ErrorState,
} from '../components';
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Calendar,
  TrendingUp,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Compass,
  Radio,
  Flame,
} from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { params } = useRouter();
  const leadId = params.leadId;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intelligence generation state
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copiedOpening, setCopiedOpening] = useState(false);

  const fetchLead = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getLeadById(leadId);
      setLead(res.lead);
    } catch (err: any) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleGenerateIntelligence = async () => {
    if (!leadId) return;
    try {
      setGenerating(true);
      setGenerateError(null);
      const res = await apiService.generateIntelligence(leadId);
      // Update local intelligence
      if (res.data && lead) {
        setLead({
          ...lead,
          intelligence: res.data,
        });
      }
    } catch (err: any) {
      setGenerateError(err.message || 'Intelligence generation failed');
      // Refetch to reflect FAILED state persisted in DB
      fetchLead();
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyOpening = () => {
    const text = lead?.intelligence?.suggested_opening;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedOpening(true);
      setTimeout(() => setCopiedOpening(false), 2000);
    }
  };

  if (loading) {
    return (
      <AppShell title="Lead Workspace" subtitle="Loading intelligence profile...">
        <LoadingState message="Loading sales intelligence workspace..." className="py-24" />
      </AppShell>
    );
  }

  if (error || !lead) {
    return (
      <AppShell title="Lead Workspace" subtitle="Lead not found">
        <div className="space-y-4">
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leads</span>
          </Link>
          <ErrorState message={error || 'Lead could not be found'} onRetry={fetchLead} />
        </div>
      </AppShell>
    );
  }

  const intelligence: LeadIntelligence | null = lead.intelligence || null;
  const signals = intelligence?.signals || [];

  return (
    <AppShell
      title={lead.company_name}
      subtitle={`Sales Intelligence Workspace • ${lead.industry || 'B2B Lead'}`}
    >
      <div className="space-y-6">
        {/* Back navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads</span>
          </Link>

          {intelligence?.status === 'COMPLETED' && (
            <button
              onClick={handleGenerateIntelligence}
              disabled={generating}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Regenerating...' : 'Regenerate Intelligence'}</span>
            </button>
          )}
        </div>

        {/* Lead Header Overview Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {lead.company_name}
                </h1>
                {lead.website && (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <span>{lead.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                {lead.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.industry}</span>
                  </span>
                )}
                {lead.location && (
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <span>{lead.location}</span>
                  </span>
                )}
                {lead.year_founded && (
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Founded {lead.year_founded}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Status indicator */}
            <div className="shrink-0">
              {intelligence?.status === 'COMPLETED' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Intelligence Ready</span>
                </div>
              ) : intelligence?.status === 'FAILED' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Generation Failed</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Pending Intelligence</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick facts strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Estimated Revenue</span>
              <span className="font-semibold text-slate-800">{lead.revenue || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Employees</span>
              <span className="font-semibold text-slate-800">
                {lead.employees ? lead.employees.toLocaleString() : 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Headcount Growth</span>
              <span
                className={`font-semibold ${
                  lead.headcount_growth?.includes('-') ? 'text-slate-700' : 'text-emerald-700'
                }`}
              >
                {lead.headcount_growth || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Open Positions</span>
              <span className="font-semibold text-slate-800">
                {lead.open_positions !== null && lead.open_positions !== undefined
                  ? `${lead.open_positions} roles`
                  : 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column layout: Context + Signals (Left) & Sales Intelligence (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Contact & Verified Evidence */}
          <div className="space-y-6 lg:col-span-1">
            {/* Decision Maker Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Key Decision Maker
              </h3>
              {lead.owner_name ? (
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{lead.owner_name}</div>
                  <div className="text-xs text-indigo-700 font-medium mb-3">
                    {lead.owner_title || 'Executive'}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 truncate transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </a>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.linkedin && (
                      <a
                        href={lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>View LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No decision-maker contact identified.</p>
              )}
            </div>

            {/* Technology Context */}
            {lead.technology && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Technology Stack
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Context Only</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lead.technology.split(',').map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  Environment context. Do not presume tooling problems or defects.
                </p>
              </div>
            )}

            {/* Detected Deterministic Signals */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-slate-600" />
                  <span>Detected Signals</span>
                </h3>
                <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                  {signals.length} {signals.length === 1 ? 'Signal' : 'Signals'}
                </span>
              </div>

              {signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        sig.severity === 'HIGH'
                          ? 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                          : sig.severity === 'MEDIUM'
                          ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          {sig.severity === 'HIGH' ? (
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {sig.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-black/5">
                          {sig.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{sig.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No active hiring spikes or rapid expansion detected for this lead.
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Deterministic observations derived strictly from verified lead metrics. Zero arbitrary score.
              </p>
            </div>
          </div>

          {/* Right Column: AI Sales Intelligence */}
          <div className="lg:col-span-2 space-y-6">
            {generateError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Intelligence Generation Failed</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{generateError}</p>
                </div>
              </div>
            )}

            {intelligence?.status === 'COMPLETED' ? (
              <div className="space-y-6">
                {/* 1. WHY CONTACT NOW? (The Most Prominent Card) */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md border border-indigo-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Primary Trigger • Why Contact Now?</span>
                    </span>
                    <span className="text-[11px] font-medium text-indigo-200 bg-indigo-800/60 px-2 py-0.5 rounded-full border border-indigo-700">
                      Immediate Timing
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-indigo-50">
                    "{intelligence.why_contact_now}"
                  </p>
                  <p className="text-xs text-indigo-300/80 mt-3 pt-3 border-t border-indigo-800/60">
                    Timing is grounded directly in recent hiring spikes and expansion milestones.
                  </p>
                </div>

                {/* 2. WHY IT MATTERS (Decision-maker implication) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Why It Matters</span>
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Role &amp; Strategic Context
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {intelligence.why_it_matters}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                    Cautious operational perspective framed for{' '}
                    {lead.owner_title ? lead.owner_title : 'leadership'} without presuming existing tool failure.
                  </p>
                </div>

                {/* 3. CONVERSATION ANGLE (Consultative hypothesis) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Conversation Angle</span>
                    </h3>
                    <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Consultative Hypothesis
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                    "{intelligence.conversation_angle}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3">
                    Exploratory question for sales reps. Does NOT assume an unverified pain point.
                  </p>
                </div>

                {/* 4. SUGGESTED OPENING (Peer-to-peer human opener) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Suggested Opening</span>
                    </h3>
                    <button
                      onClick={handleCopyOpening}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedOpening ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Opener</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-slate-800 text-sm leading-relaxed font-normal">
                    {intelligence.suggested_opening}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2.5">
                    Human, peer-to-peer curiosity. No fake familiarity, no robotic sales pitching.
                  </p>
                </div>
              </div>
            ) : (
              /* Empty / Pending Intelligence State */
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  No Sales Intelligence Generated Yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Synthesize {lead.company_name}'s verified facts and {signals.length} detected signals
                  into a tailored "Why Contact Now?", strategic angle, and conversational opener.
                </p>

                <button
                  onClick={handleGenerateIntelligence}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  <span>{generating ? 'Analyzing Company Signals...' : 'Generate Intelligence'}</span>
                </button>

                {signals.length > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-4">
                    ✓ Ready: {signals.length} factual signal(s) ready for interpretation.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default LeadDetailPage;
