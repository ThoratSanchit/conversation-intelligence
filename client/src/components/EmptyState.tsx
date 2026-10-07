import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-xl ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
