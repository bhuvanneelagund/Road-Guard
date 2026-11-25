import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Plus, 
  Activity, 
  CheckCircle, 
  Info,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { roadService } from '../services/api';
import RoadHealthCard from '../components/RoadHealthCard';
import PriorityBadge from '../components/PriorityBadge';

export default function RoadPassportPage() {
  const [roads, setRoads] = useState([]);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [roadHealthData, setRoadHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal to add new road
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoadName, setNewRoadName] = useState('');
  const [newCategory, setNewCategory] = useState('Major District Road');
  const [newTraffic, setNewTraffic] = useState('Medium');
  const [newSchools, setNewSchools] = useState(false);
  const [newHospitals, setNewHospitals] = useState(false);
  const [newFlood, setNewFlood] = useState(false);
  const [newLength, setNewLength] = useState('2.5');

  useEffect(() => {
    loadRoads();
  }, []);

  const loadRoads = async () => {
    try {
      const data = await roadService.listRoads();
      setRoads(data);
      if (data.length > 0 && !selectedRoad) {
        handleSelectRoad(data[0]);
      }
    } catch (err) {
      console.error('Failed to load roads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoad = async (road) => {
    setSelectedRoad(road);
    try {
      const health = await roadService.getHealthPassport(road.id);
      setRoadHealthData(health);
    } catch (err) {
      console.error('Failed to load road health:', err);
    }
  };

  const handleCreateRoad = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        road_name: newRoadName,
        road_category: newCategory,
        traffic_density: newTraffic,
        has_schools_nearby: newSchools,
        has_hospitals_nearby: newHospitals,
        flood_prone: newFlood,
        length_km: parseFloat(newLength) || 1.0,
        start_lat: 14.4644,
        start_lng: 75.9218,
        end_lat: 14.4710,
        end_lng: 75.9290
      };
      await roadService.createRoad(payload);
      setCreateModalOpen(false);
      setNewRoadName('');
      loadRoads();
    } catch (err) {
      alert('Failed to register road: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00d4ff]" />
            <span>Digital Road Health Passport System</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable asset ledger logging surface condition scores, distress indices, historical scans, and scheduled maintenance.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Road Asset</span>
        </button>
      </div>

      {/* Main 2-Column Passport Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Road Directory List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">
              Monitored Corridors ({roads.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {roads.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelectRoad(r)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedRoad?.id === r.id
                    ? 'bg-[#112040] border-[#00d4ff] shadow-glow-cyan'
                    : 'bg-[#0a1226] border-[#17284b] hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#00d4ff]">
                    {r.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.health_score < 40 ? 'bg-rose-500/20 text-rose-400' : (r.health_score < 70 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400')
                  }`}>
                    {r.health_score}/100
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">{r.road_name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {r.road_category} • {r.length_km} km
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-[#17284b]/60">
                  <span>Potholes: <strong className="text-white">{r.potholes_count || 0}</strong></span>
                  <span>Cracks: <strong className="text-white">{r.cracks_count || 0}</strong></span>
                  <span>{r.traffic_density} Traffic</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Health Passport View (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {roadHealthData ? (
            <div className="p-6 rounded-2xl bg-[#0a1226] border border-[#17284b] shadow-2xl space-y-6">
              {/* Header Title & Status */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#17284b]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2.5 py-0.5 rounded border border-[#00d4ff]/30">
                      PASSPORT #{roadHealthData.road_id}
                    </span>
                    <PriorityBadge tier={roadHealthData.status} />
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">{roadHealthData.road_name}</h3>
                  <p className="text-xs text-slate-400">
                    {roadHealthData.location?.city}, {roadHealthData.location?.district}, {roadHealthData.location?.state} • {roadHealthData.category}
                  </p>
                </div>

                {/* Big Health Score Badge */}
                <div className="p-4 rounded-xl bg-[#080f1d] border border-[#17284b] text-center min-w-[120px]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">HEALTH SCORE</span>
                  <span className={`text-3xl font-black tracking-tight ${
                    roadHealthData.health_score < 40 ? 'text-rose-400' : (roadHealthData.health_score < 70 ? 'text-amber-400' : 'text-emerald-400')
                  }`}>
                    {roadHealthData.health_score}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">OUT OF 100</span>
                </div>
              </div>

              {/* Inspection Timeline Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#00d4ff]" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">LAST RECORDED SCAN</span>
                    <span className="text-xs font-bold text-white">{roadHealthData.last_inspection || 'Recent'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">RECOMMENDED NEXT INSPECTION</span>
                    <span className="text-xs font-bold text-white">{roadHealthData.next_recommended_inspection || 'In 30 days'}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Transparent Condition Scoring Formula Deductions
                </h4>
                
                <div className="rounded-xl overflow-hidden border border-[#17284b] bg-[#080f1d] text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#0d1830] text-slate-400 text-[11px] font-mono uppercase">
                      <tr>
                        <th className="p-3">Defect / Factor Parameter</th>
                        <th className="p-3">Observed Quantity</th>
                        <th className="p-3">Points Deducted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#17284b] text-slate-300">
                      <tr>
                        <td className="p-3">Potholes (Critical Impact)</td>
                        <td className="p-3 font-mono">{roadHealthData.defect_summary?.potholes} units</td>
                        <td className="p-3 font-mono text-rose-400 font-bold">-{roadHealthData.scoring_breakdown?.potholes_deduction} pts</td>
                      </tr>
                      <tr>
                        <td className="p-3">Alligator Fatigue Cracks</td>
                        <td className="p-3 font-mono">Present</td>
                        <td className="p-3 font-mono text-amber-400">-{roadHealthData.scoring_breakdown?.alligator_cracks_deduction} pts</td>
                      </tr>
                      <tr>
                        <td className="p-3">Linear Cracks (Transverse/Longitudinal)</td>
                        <td className="p-3 font-mono">Present</td>
                        <td className="p-3 font-mono text-amber-400">-{roadHealthData.scoring_breakdown?.linear_cracks_deduction} pts</td>
                      </tr>
                      <tr>
                        <td className="p-3">Citizen Unresolved Complaints</td>
                        <td className="p-3 font-mono">{roadHealthData.defect_summary?.pending_citizen_complaints} pending</td>
                        <td className="p-3 font-mono text-cyan-400">-{roadHealthData.scoring_breakdown?.complaints_deduction} pts</td>
                      </tr>
                      <tr>
                        <td className="p-3">Traffic Stress Multiplier</td>
                        <td className="p-3 font-mono">Multiplier Factor</td>
                        <td className="p-3 font-mono text-slate-300">{roadHealthData.scoring_breakdown?.traffic_multiplier}x</td>
                      </tr>
                      <tr className="bg-[#0d1830]/80 font-bold text-white">
                        <td className="p-3">Net Score Deduction</td>
                        <td className="p-3 font-mono">Sub-Total</td>
                        <td className="p-3 font-mono text-rose-400">-{roadHealthData.scoring_breakdown?.total_penalty} pts</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-[#080f1d] border border-[#17284b] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">Recommended Engineering Intervention</h5>
                  <p className="text-xs text-slate-300 mt-0.5">{roadHealthData.recommended_action}</p>
                </div>
              </div>

              {/* Official Engineering Disclaimer Notice */}
              <div className="p-3.5 rounded-xl bg-[#080f1d]/50 border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {roadHealthData.official_disclaimer || "The Road Health Score is an indicative heuristic calculation designed for municipal prioritization. It does not represent a certified engineering structural audit."}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0a1226] border border-[#17284b] text-center text-slate-400">
              Select a road asset on the left to view its digital health passport.
            </div>
          )}
        </div>
      </div>

      {/* Register Road Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1226] border border-[#17284b] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#17284b]">
              <h3 className="text-base font-bold text-white">Register Road Asset</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoad} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Road Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road Phase 2, Davanagere"
                  value={newRoadName}
                  onChange={(e) => setNewRoadName(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Road Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                  >
                    <option value="National Highway">National Highway</option>
                    <option value="State Highway">State Highway</option>
                    <option value="Major District Road">Major District Road</option>
                    <option value="City Arterial">City Arterial</option>
                    <option value="Residential Street">Residential Street</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Traffic Density</label>
                  <select
                    value={newTraffic}
                    onChange={(e) => setNewTraffic(e.target.value)}
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Length (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLength}
                    onChange={(e) => setNewLength(e.target.value)}
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1.5 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSchools}
                      onChange={(e) => setNewSchools(e.target.checked)}
                      className="accent-[#00d4ff]"
                    />
                    <span className="text-slate-300">Nearby Schools</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHospitals}
                      onChange={(e) => setNewHospitals(e.target.checked)}
                      className="accent-[#00d4ff]"
                    />
                    <span className="text-slate-300">Nearby Hospitals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFlood}
                      onChange={(e) => setNewFlood(e.target.checked)}
                      className="accent-[#00d4ff]"
                    />
                    <span className="text-slate-300">Known Flood Zone</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#17284b]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white font-bold shadow-glow-cyan"
                >
                  Generate Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
