import React from 'react';
import { Flame, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { DetectedSignal } from '../types';

interface SignalBadgeProps {
  signal: DetectedSignal;
  size?: 'sm' | 'md';
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ signal, size = 'sm' }) => {
  const getIcon = () => {
    switch (signal.type) {
      case 'HIRING_SPIKE':
        return <Flame className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />;
      case 'ACTIVE_HIRING':
        return <Activity className={size === 'sm' ? 'w-3.5 h-3.5 text-blue-600' : 'w-4 h-4 text-blue-600'} />;
      case 'RAPID_HEADCOUNT_SURGE':
        return <TrendingUp className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />;
      case 'STEADY_EXPANSION':
        return <TrendingUp className={size === 'sm' ? 'w-3.5 h-3.5 text-blue-600' : 'w-4 h-4 text-blue-600'} />;
      case 'HEADCOUNT_CONTRACTION':
        return <TrendingDown className={size === 'sm' ? 'w-3.5 h-3.5 text-slate-500' : 'w-4 h-4 text-slate-500'} />;
      default:
        return <Activity className={size === 'sm' ? 'w-3.5 h-3.5 text-slate-500' : 'w-4 h-4 text-slate-500'} />;
    }
  };

  const getColors = () => {
    switch (signal.severity) {
      case 'HIGH':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'LOW':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md transition-colors ${getColors()} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      title={signal.description}
    >
      {getIcon()}
      <span>{signal.name}</span>
      {size === 'md' && (
        <span className="text-[10px] uppercase font-semibold px-1 py-0.2 rounded bg-white/60 border border-black/5 ml-1">
          {signal.severity}
        </span>
      )}
    </span>
  );
};

export default SignalBadge;
