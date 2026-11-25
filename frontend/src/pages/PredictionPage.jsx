import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  CloudRain, 
  Activity, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { roadService, predictionService } from '../services/api';

export default function PredictionPage() {
  const [roads, setRoads] = useState([]);
  const [selectedRoadId, setSelectedRoadId] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadService.listRoads().then(data => {
      setRoads(data);
      if (data.length > 0) {
        setSelectedRoadId(data[0].id);
        fetchPrediction(data[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchPrediction = async (id) => {
    try {
      const res = await predictionService.getPrediction(id);
      setPrediction(res);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    }
  };

  const handleSelectRoad = (id) => {
    setSelectedRoadId(id);
    fetchPrediction(id);
  };

  // Prepare chart series from projections
  const chartData = prediction?.prediction_available ? [
    { name: 'Current', score: prediction.current_health_score },
    ...(prediction.projections || []).map(p => ({
      name: `+${p.months_ahead} Mo`,
      score: p.projected_score
    }))
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
            <span>Future Road Surface Deterioration Prediction</span>
          </h2>
          <p className="text-xs text-slate-400">
            Linear degradation velocity modeling calibrated against historical scans, monsoon precipitation, and traffic load acceleration.
          </p>
        </div>

        {/* Road selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Road Corridor:</span>
          <select
            value={selectedRoadId}
            onChange={(e) => handleSelectRoad(e.target.value)}
            className="bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
          >
            {roads.map(r => (
              <option key={r.id} value={r.id}>{r.road_name}</option>
            ))}
          </select>
        </div>
      </div>

      {prediction?.prediction_available ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Current Baseline Health</span>
              <p className="text-2xl font-black text-white">{prediction.current_health_score} / 100</p>
              <span className="text-[10px] text-slate-400">Latest inspection baseline</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Monthly Decay Rate</span>
              <p className="text-2xl font-black text-amber-400">-{prediction.monthly_decay_rate_points} pts/mo</p>
              <span className="text-[10px] text-slate-400">Observed degradation velocity</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Historical Scans Analyzed</span>
              <p className="text-2xl font-black text-[#00d4ff]">{prediction.sample_size} Scans</p>
              <span className="text-[10px] text-slate-400">Meets minimum threshold (3+)</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Critical Threshold Reach</span>
              <p className="text-2xl font-black text-rose-400">
                {prediction.critical_threshold_reach_months ? `In ~${prediction.critical_threshold_reach_months} Months` : 'Stable (>18 Mo)'}
              </p>
              <span className="text-[10px] text-slate-400">Predicted drop below 40.0 pts</span>
            </div>
          </div>

          {/* Projection Line Chart */}
          <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">12-Month Projected Health Decay Curve</h3>
                <p className="text-xs text-slate-400">Visualizing anticipated surface degradation without intervention</p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                MONSOON ADJUSTED
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#17284b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1830', borderColor: '#00d4ff', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#00d4ff" 
                    strokeWidth={3} 
                    dot={{ fill: '#1d63ff', r: 5 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projections Milestones Table */}
          <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
            <h3 className="text-sm font-bold text-white">Milestone Interventions & Preventative Maintenance</h3>
            
            <div className="rounded-xl overflow-hidden border border-[#17284b] bg-[#080f1d] text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#0d1830] text-slate-400 text-[11px] font-mono uppercase">
                  <tr>
                    <th className="p-3">Horizon</th>
                    <th className="p-3">Projected Score</th>
                    <th className="p-3">Condition Tier</th>
                    <th className="p-3">Recommended Preventative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17284b] text-slate-300">
                  {prediction.projections?.map((p, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-mono font-bold text-white">+{p.months_ahead} Months</td>
                      <td className="p-3 font-mono font-bold text-[#00d4ff]">{p.projected_score} / 100</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          p.projected_score < 40 ? 'bg-rose-500/20 text-rose-400' : (p.projected_score < 70 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400')
                        }`}>
                          {p.projected_tier}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{p.recommended_intervention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Insufficient Training Data Notice */
        <div className="p-10 rounded-2xl bg-[#0a1226] border border-amber-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Insufficient Historical Data for Predictive Regression</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            {prediction?.status_message || (
              "Predictive maintenance modeling is ethically gated until a minimum of 3 temporal scans are recorded to avoid fabricating inaccurate projections."
            )}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Recorded Scans: {prediction?.records_count || 0} / 3 Required • Select RD-DVG-001 or RD-DVG-004 to view active predictions.
          </p>
        </div>
      )}

      {/* Disclaimers */}
      <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
        <span>
          Linear degradation calculations assume historical traffic constants and normal monsoon patterns. Unscheduled heavy vehicle diversions or utility trench excavations can accelerate degradation.
        </span>
      </div>
    </div>
  );
}
