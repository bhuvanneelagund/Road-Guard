import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  Wrench, 
  IndianRupee, 
  Info, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { costService } from '../services/api';

export default function CostEstimatorPage() {
  const [lengthM, setLengthM] = useState('2.5');
  const [widthM, setWidthM] = useState('1.2');
  const [depthCm, setDepthCm] = useState('7.5');
  const [materialType, setMaterialType] = useState('Bituminous Asphalt');
  const [laborDays, setLaborDays] = useState('1.5');
  const [laborRate, setLaborRate] = useState('1200');
  const [machineryCost, setMachineryCost] = useState('3500');
  const [contingency, setContingency] = useState('15');

  const [calculating, setCalculating] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await costService.estimateCost({
        damage_length_m: parseFloat(lengthM) || 1.0,
        damage_width_m: parseFloat(widthM) || 1.0,
        estimated_depth_cm: parseFloat(depthCm) || 5.0,
        material_type: materialType,
        labour_cost_per_day: parseFloat(laborRate) || 1200,
        number_of_labour_days: parseFloat(laborDays) || 1.0,
        machinery_rental_cost: parseFloat(machineryCost) || 3000,
        overhead_and_contingency_percent: parseFloat(contingency) || 15
      });
      setEstimateResult(res);
    } catch (err) {
      alert('Cost calculation error: ' + err.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#00d4ff]" />
            <span>AI Civil Repair Cost Estimator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Rapid volumetric estimation based on Indian municipal Schedule of Rates (SoR), material densities, and crew-day productivity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <h3 className="text-sm font-bold text-white">Repair Geometry & Material Inputs</h3>
          <p className="text-xs text-slate-400">Enter measured dimensions and prevailing municipal material standards.</p>

          <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Length (m)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={lengthM}
                  onChange={(e) => setLengthM(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={widthM}
                  onChange={(e) => setWidthM(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Depth (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={depthCm}
                  onChange={(e) => setDepthCm(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Repair Material Specification</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              >
                <option value="Bituminous Asphalt">Bituminous Asphalt (Hot Mix VG-30) - ₹6,500/m³</option>
                <option value="Cold Mix">Ready Cold Patch Mix - ₹7,200/m³</option>
                <option value="Reinforced Concrete">M25 High Strength Concrete - ₹8,500/m³</option>
                <option value="Paver Blocks">Heavy Duty Interlocking Pavers - ₹4,800/m³</option>
                <option value="Gravel/WBM">Wet Mix Macadam (WBM Sub-base) - ₹2,200/m³</option>
              </select>
            </div>

            {/* Labor & Machinery */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Daily Labor Wage (₹)</label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(e) => setLaborRate(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Estimated Days</label>
                <input
                  type="number"
                  step="0.5"
                  value={laborDays}
                  onChange={(e) => setLaborDays(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Equipment / Roller (₹)</label>
                <input
                  type="number"
                  value={machineryCost}
                  onChange={(e) => setMachineryCost(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Contingency (%)</label>
                <input
                  type="number"
                  value={contingency}
                  onChange={(e) => setContingency(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{calculating ? 'Computing Volumetrics...' : 'Compute Bill of Quantities (BoQ)'}</span>
            </button>
          </form>
        </div>

        {/* Breakdown Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {estimateResult ? (
            <div className="p-6 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/40 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#17284b]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider block">
                    CIVIL ESTIMATE SUMMARY
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">Indicative Repair Expenditure</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">ESTIMATED TOTAL</span>
                  <span className="text-2xl font-black text-[#00d4ff] font-mono">
                    ₹{estimateResult.estimated_grand_total_inr?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Volumetric Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">SURFACE AREA</span>
                  <span className="text-lg font-black text-white font-mono">
                    {estimateResult.dimensions?.effective_surface_area_m2} m²
                  </span>
                  <span className="text-[10px] text-slate-400 block">+15% edge dressing</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">FILL VOLUME</span>
                  <span className="text-lg font-black text-white font-mono">
                    {estimateResult.dimensions?.fill_volume_m3} m³
                  </span>
                  <span className="text-[10px] text-slate-400 block">Compacted volume</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">MATERIAL WEIGHT</span>
                  <span className="text-lg font-black text-[#00d4ff] font-mono">
                    {estimateResult.material?.estimated_weight_tonnes} tonnes
                  </span>
                  <span className="text-[10px] text-slate-400 block">{estimateResult.material?.type}</span>
                </div>
              </div>

              {/* Itemized Cost Table */}
              <div className="rounded-xl overflow-hidden border border-[#17284b] bg-[#080f1d] text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0d1830] text-slate-400 text-[11px] font-mono uppercase">
                    <tr>
                      <th className="p-3">Cost Component</th>
                      <th className="p-3">Basis / Rate</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17284b] text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-white">Aggregates & Asphalt Material</td>
                      <td className="p-3 font-mono">{estimateResult.dimensions?.fill_volume_m3} m³ @ ₹{estimateResult.material?.unit_rate_per_m3_inr}/m³</td>
                      <td className="p-3 font-mono text-right text-white">₹{estimateResult.material?.total_material_cost_inr?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Masonry & Labor Crew</td>
                      <td className="p-3 font-mono">2 workers for {estimateResult.labor?.estimated_crew_days} days @ ₹{estimateResult.labor?.daily_rate_inr}/day</td>
                      <td className="p-3 font-mono text-right text-white">₹{estimateResult.labor?.total_labor_cost_inr?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Machinery Rental (Compactor)</td>
                      <td className="p-3 font-mono">Plate compactor & sprayer</td>
                      <td className="p-3 font-mono text-right text-white">₹{estimateResult.machinery_and_tools_inr?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Overhead & Contingencies</td>
                      <td className="p-3 font-mono">{estimateResult.contingency_percent}% margin</td>
                      <td className="p-3 font-mono text-right text-amber-400">₹{estimateResult.contingency_amount_inr?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-[#0d1830]/90 font-bold text-white text-sm">
                      <td className="p-3">Total Estimated Expenditure</td>
                      <td className="p-3 font-mono text-xs text-slate-400">Inclusive of Taxes</td>
                      <td className="p-3 font-mono text-right text-[#00d4ff]">₹{estimateResult.estimated_grand_total_inr?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {estimateResult.disclaimer || "INDICATIVE ESTIMATE ONLY. Actual expenditure requires formal site inspection and PWD validation."}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0a1226] border border-[#17284b] text-center space-y-3 h-full flex flex-col items-center justify-center text-slate-400">
              <Calculator className="w-10 h-10 text-slate-600" />
              <p className="text-xs max-w-sm">
                Enter defect dimensions on the left to compute volumetric asphalt requirements and itemized labor costs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
