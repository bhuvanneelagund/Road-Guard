import React from 'react';
import { ShieldCheck, AlertTriangle, Calendar, Navigation, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoadHealthCard({ road }) {
  if (!road) return null;

  const score = road.health_score || 0;
  
  let strokeColor = "#10b981"; // green
  let statusText = "Good Condition";
  let statusBg = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  if (score < 40) {
    strokeColor = "#f43f5e"; // rose
    statusText = "Critical Hazard";
    statusBg = "text-rose-400 bg-rose-500/10 border-rose-500/30";
  } else if (score < 60) {
    strokeColor = "#f59e0b"; // amber
    statusText = "Poor Condition";
    statusBg = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  } else if (score < 80) {
    strokeColor = "#00d4ff"; // cyan
    statusText = "Moderate Wear";
    statusBg = "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/30";
  }

  // Circular gauge parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] hover:border-[#1d63ff]/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider block">
              {road.id} • {road.road_category}
            </span>
            <h4 className="text-base font-bold text-white tracking-tight mt-0.5">{road.road_name}</h4>
            <p className="text-xs text-slate-400">{road.district}, {road.state} ({road.length_km} km)</p>
          </div>

          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBg}`}>
            {statusText}
          </span>
        </div>

        {/* Circular Gauge & Metrics */}
        <div className="flex items-center gap-6 my-4 p-3 rounded-xl bg-[#080f1d] border border-[#17284b]/60">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={strokeColor}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-white">{score}</span>
              <span className="text-[8px] font-mono text-slate-400 uppercase">SCORE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Potholes</span>
              <span className="font-bold text-white">{road.potholes_count ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Cracks</span>
              <span className="font-bold text-white">{road.cracks_count ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Traffic</span>
              <span className="font-bold text-slate-200">{road.traffic_density || 'Medium'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Recurrence</span>
              <span className={`font-bold ${road.repeat_damage ? 'text-rose-400' : 'text-slate-400'}`}>
                {road.repeat_damage ? 'Chronic' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#17284b] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Last Scan: {road.last_inspected || 'Recent'}</span>
        </div>

        <Link
          to={`/roads`}
          className="text-[#00d4ff] hover:underline font-semibold flex items-center gap-1"
        >
          <span>View Passport</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
