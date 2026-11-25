import React from 'react';
import { MapPin, Calendar, AlertOctagon, Eye } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function DamageCard({ detection, onViewDetails }) {
  if (!detection) return null;

  const defects = detection.detected_objects || [];
  const sev = detection.highest_severity || 'Medium';

  return (
    <div className="rounded-2xl bg-[#0a1226] border border-[#17284b] overflow-hidden hover:border-[#00d4ff]/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail Preview */}
        <div className="relative h-44 bg-[#080f1d] overflow-hidden">
          {detection.annotated_file_url || detection.original_file_url ? (
            <img 
              src={`http://localhost:8000${detection.annotated_file_url || detection.original_file_url}`} 
              alt="Road Damage" 
              onError={(e) => {
                // If local upload image not found, show stylish SVG canvas representation
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <AlertOctagon className="w-8 h-8 text-[#00d4ff]/60 mb-1" />
              <span className="text-xs font-mono">Telemetry Image</span>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <PriorityBadge tier={`${sev} Severity`} size="small" />
            {detection.is_demo_mode && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/80 text-[#00d4ff] border border-[#00d4ff]/40">
                DEMO
              </span>
            )}
          </div>

          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300">
            {detection.total_defects || defects.length} Defect(s)
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <h4 className="text-sm font-bold text-white tracking-tight truncate">
            {detection.road_name || 'Unassigned Section'}
          </h4>

          {/* Detected tags */}
          <div className="flex flex-wrap gap-1">
            {defects.slice(0, 3).map((d, i) => (
              <span 
                key={i} 
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1830] text-slate-300 border border-[#17284b]"
              >
                {d.class_name} ({Math.round((d.confidence || 0.8) * 100)}%)
              </span>
            ))}
            {defects.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1830] text-slate-400">
                +{defects.length - 3} more
              </span>
            )}
          </div>

          {/* Location & Time */}
          <div className="space-y-1 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />
              <span className="font-mono text-[11px] truncate">
                {detection.lat ? `${detection.lat.toFixed(4)}, ${detection.lng.toFixed(4)}` : 'Manual GPS Pending'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px]">
                {detection.created_at ? new Date(detection.created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#17284b] bg-[#080f1d]/60 flex justify-end">
        <button
          onClick={() => onViewDetails && onViewDetails(detection)}
          className="text-xs text-[#00d4ff] hover:text-white font-semibold flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Scan</span>
        </button>
      </div>
    </div>
  );
}
