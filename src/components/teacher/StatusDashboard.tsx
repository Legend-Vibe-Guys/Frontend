import { CheckCircle2 } from 'lucide-react';

interface StatusDashboardProps {
  label: string;
  completedCount: number;
  totalCount: number;
}

export function StatusDashboard({ label, completedCount, totalCount }: StatusDashboardProps) {
  return (
    <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <CheckCircle2 size={80} className="text-emerald-500" />
      </div>
      <span className="text-sm font-bold text-emerald-800 mb-1 z-10">{label}</span>
      <div className="flex items-baseline gap-2 z-10 mt-1">
        <span className="text-4xl font-black text-emerald-600 tracking-tight">{completedCount}</span>
        <span className="text-2xl font-bold text-slate-300">/</span>
        <span className="text-2xl font-bold text-slate-400">{totalCount}</span>
      </div>
    </div>
  );
}
