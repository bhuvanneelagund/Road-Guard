import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Hospital, 
  GraduationCap, 
  CloudRain, 
  RefreshCw, 
  Info,
  Check,
  ChevronDown
} from 'lucide-react';
import { priorityService } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';

export default function PriorityEnginePage() {
  const [priorityData, setPriorityData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Weight Sliders
  const [weights, setWeights] = useState({
    damage_severity: 0.35,
    traffic_importance: 0.20,
    sensitive_zones: 0.20,
    repeat_damage: 0.15,
    waterlogging: 0.10
  });

  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    try {
      const data = await priorityService.getPriorities();
      setPriorityData(data);
    } catch (err) {
      console.error('Failed to load priority ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightRecalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      await priorityService.calculatePriority({
        damage_severity_weight: weights.damage_severity,
        traffic_importance_weight: weights.traffic_importance,
        schools_hospitals_weight: weights.sensitive_zones,
        repeat_damage_weight: weights.repeat_damage,
        waterlogging_weight: weights.waterlogging
      });
      await loadPriorities();
    } catch (err) {
      console.error('Recalculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  const prioritizedRoads = priorityData?.prioritized_roads || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00d4ff]" />
            <span>Smart Repair Priority & Accident Risk Assessment Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-factor civil engineering prioritization algorithm weighing defect gravity, ambulance routes, school zones, and flood recurrence.
          </p>
        </div>

        <button
          onClick={loadPriorities}
          className="p-2 rounded-xl bg-[#0d1830] text-slate-400 hover:text-white border border-[#17284b]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Weight Configuration Bar (Admin Configurable) */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Tunable Priority Weight Matrix (Administrator Controls)</h3>
            <p className="text-xs text-slate-400">Adjust municipal resource prioritization weights and re-rank live corridors.</p>
          </div>
          <button
            onClick={handleWeightRecalculate}
            disabled={calculating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{calculating ? 'Recomputing...' : 'Apply Weights & Recalculate'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Weight 1 */}
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Damage Severity</span>
              <span className="font-mono text-[#00d4ff] font-bold">{Math.round(weights.damage_severity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.60"
              step="0.05"
              value={weights.damage_severity}
              onChange={(e) => setWeights({ ...weights, damage_severity: parseFloat(e.target.value) })}
              className="w-full accent-[#00d4ff] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Pothole depth & crack area</span>
          </div>

          {/* Weight 2 */}
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Traffic Density</span>
              <span className="font-mono text-[#00d4ff] font-bold">{Math.round(weights.traffic_importance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.traffic_importance}
              onChange={(e) => setWeights({ ...weights, traffic_importance: parseFloat(e.target.value) })}
              className="w-full accent-[#00d4ff] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Peak hourly PCU volume</span>
          </div>

          {/* Weight 3 */}
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Sensitive Zones</span>
              <span className="font-mono text-[#00d4ff] font-bold">{Math.round(weights.sensitive_zones * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.sensitive_zones}
              onChange={(e) => setWeights({ ...weights, sensitive_zones: parseFloat(e.target.value) })}
              className="w-full accent-[#00d4ff] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Hospitals & school perimeters</span>
          </div>

          {/* Weight 4 */}
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Chronic Recurrence</span>
              <span className="font-mono text-[#00d4ff] font-bold">{Math.round(weights.repeat_damage * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.05"
              value={weights.repeat_damage}
              onChange={(e) => setWeights({ ...weights, repeat_damage: parseFloat(e.target.value) })}
              className="w-full accent-[#00d4ff] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Repeated failure within 1 yr</span>
          </div>

          {/* Weight 5 */}
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Waterlogging</span>
              <span className="font-mono text-[#00d4ff] font-bold">{Math.round(weights.waterlogging * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.05"
              value={weights.waterlogging}
              onChange={(e) => setWeights({ ...weights, waterlogging: parseFloat(e.target.value) })}
              className="w-full accent-[#00d4ff] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Drainage failure risk</span>
          </div>
        </div>
      </div>

      {/* Prioritized Roads Ranked Table */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Prioritized Repair Queue</h3>
            <p className="text-xs text-slate-400">Road segments sorted by descending Composite Priority Index</p>
          </div>
          <span className="text-xs font-mono text-[#00d4ff]">
            {prioritizedRoads.length} Ranked Sections
          </span>
        </div>

        <div className="space-y-3">
          {prioritizedRoads.map((item, index) => {
            const p = item.priority;
            const risk = item.accident_risk;

            return (
              <div 
                key={item.road_id}
                className="p-4 rounded-xl bg-[#080f1d] border border-[#17284b] hover:border-[#1d63ff]/50 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#0d1830] border border-[#17284b] text-white font-mono font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{item.road_name}</h4>
                      <p className="text-xs text-slate-400">
                        {item.road_category} • {item.district} (Health: {item.health_score}/100)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">PRIORITY INDEX</span>
                      <span className="text-lg font-black text-[#00d4ff] font-mono">
                        {p.priority_index} / 100
                      </span>
                    </div>
                    <PriorityBadge tier={p.priority_tier} />
                  </div>
                </div>

                {/* Reasons Breakdown List */}
                <div className="p-3 rounded-lg bg-[#0d1830]/80 border border-[#17284b]/60 space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Algorithmic Score Reasoning:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {p.reasons?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-1 shrink-0"></span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#17284b]/60 text-[10px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-semibold">{p.urgency_window}</span>
                    <span>Accident Risk Level: <strong className="text-white">{risk?.risk_level}</strong> ({risk?.accident_risk_score} pts)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accident Risk Analysis & Missing Data Disclosure */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Accident Risk Assessment Transparency & Disclaimers</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Accident risk evaluations synthesize visual defect dimensions with traffic density and proximity to emergency corridors.
        </p>

        <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-2 text-xs">
          <span className="font-bold text-white block">Identified Gaps & Non-Integrated Telemetry:</span>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>State Traffic Police accident incident database integration is pending formal API access.</li>
            <li>Real-time vehicle speed telemetry and live speed radar feeds are currently unavailable.</li>
            <li>Monsoon precipitation projections are based on IMD seasonal normals rather than hyper-local rain gauge probes.</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Disclaimer: Priority rankings and risk scores are heuristics for municipal workflow triage and do not claim guaranteed accident prediction or establish legal liability.
        </p>
      </div>
    </div>
  );
}
