import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendUp, 
  accentColor = "cyan",
  badge
}) {
  const colorMap = {
    cyan: {
      border: 'hover:border-[#00d4ff]/50',
      iconBg: 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20',
      badge: 'bg-[#00d4ff]/10 text-[#00d4ff]'
    },
    electric: {
      border: 'hover:border-[#1d63ff]/50',
      iconBg: 'bg-[#1d63ff]/15 text-[#1d63ff] border-[#1d63ff]/30',
      badge: 'bg-[#1d63ff]/10 text-[#1d63ff]'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-400'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-400'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-400'
    }
  };

  const scheme = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className={`
      relative p-5 rounded-2xl bg-[#0a1226]/80 backdrop-blur-md border border-[#17284b] 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${scheme.border}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#17284b]/60">
        <span className="text-slate-400 truncate">{subtitle}</span>
        
        {badge ? (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${scheme.badge}`}>
            {badge}
          </span>
        ) : trend ? (
          <div className={`flex items-center gap-1 font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
