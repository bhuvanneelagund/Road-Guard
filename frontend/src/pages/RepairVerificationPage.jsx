import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  UserCheck, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { repairService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RepairVerificationPage() {
  const { role } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [selectedRepairId, setSelectedRepairId] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [inspectorComments, setInspectorComments] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    repairService.listRepairs().then(data => {
      setRepairs(data);
      if (data.length > 0) setSelectedRepairId(data[0].id);
    }).catch(console.error);
  }, []);

  const handleBeforeChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setBeforeFile(f);
      setBeforePreview(URL.createObjectURL(f));
    }
  };

  const handleAfterChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setAfterFile(f);
      setAfterPreview(URL.createObjectURL(f));
    }
  };

  const handleRunComparison = async (e) => {
    e.preventDefault();
    if (!beforeFile || !afterFile) {
      setErrorMsg('Please upload both Before and After repair photos.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('repair_id', selectedRepairId);
      formData.append('before_image', beforeFile);
      formData.append('after_image', afterFile);
      formData.append('inspector_comments', inspectorComments || 'Field inspection submitted.');
      formData.append('human_approved', 'false');

      const res = await repairService.submitVerification(formData);
      setVerificationResult(res);
    } catch (err) {
      setErrorMsg('Verification failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleHumanSignoff = async (approved) => {
    if (!verificationResult) return;
    try {
      const res = await repairService.approveVerification(verificationResult.id, {
        approved,
        inspector_comments: inspectorComments || (approved ? 'Certified satisfactory repair pass.' : 'Remediation required.')
      });
      setVerificationResult(res);
      alert(approved ? 'Repair Certified and Verified by Human Inspector!' : 'Repair Marked for Contractor Remediation.');
    } catch (err) {
      alert('Error updating approval: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00d4ff]" />
            <span>Before & After Road Repair Verification Studio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Computer-vision assisted surface comparison with edge density analysis. Final approval requires certified human inspector sign-off.
          </p>
        </div>
      </div>

      {/* Main 2-Column: Upload Form & Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <h3 className="text-sm font-bold text-white">Upload Repair Evidence</h3>
          <p className="text-xs text-slate-400">Select road repair order and supply photographic evidence.</p>

          <form onSubmit={handleRunComparison} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Select Repair Work Order</label>
              <select
                value={selectedRepairId}
                onChange={(e) => setSelectedRepairId(e.target.value)}
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              >
                {repairs.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.road_name} ({r.severity})
                  </option>
                ))}
              </select>
            </div>

            {/* Before Photo */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">1. Before-Repair Photograph (Original Defect)</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleBeforeChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1d63ff]/20 file:text-[#00d4ff] cursor-pointer"
              />
              {beforePreview && (
                <img src={beforePreview} alt="Before" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            {/* After Photo */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">2. After-Repair Photograph (Completed Patch)</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleAfterChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1d63ff]/20 file:text-[#00d4ff] cursor-pointer"
              />
              {afterPreview && (
                <img src={afterPreview} alt="After" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Inspector Notes / Observations</label>
              <textarea
                rows={2}
                value={inspectorComments}
                onChange={(e) => setInspectorComments(e.target.value)}
                placeholder="Verify compaction roller passes, aggregate bonding, bitumen tacking..."
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Running CV Comparison...' : 'Execute Automated Comparison'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Comparison Canvas & Inspector Signoff (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {verificationResult ? (
            <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/40 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#17284b]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#00d4ff]">{verificationResult.id}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">Automated CV Comparison Analysis</h3>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  verificationResult.human_approved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {verificationResult.status}
                </span>
              </div>

              {/* Side by side image or composite */}
              <div className="rounded-xl overflow-hidden bg-black border border-[#17284b]">
                <img
                  src={`http://localhost:8000${verificationResult.comparison_image_url}`}
                  alt="Side-by-Side Verification"
                  className="w-full h-auto object-contain max-h-72"
                  onError={(e) => {
                    // Fallback to side-by-side div if server URL not reachable
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Computer Vision Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">ROUGHNESS REDUCTION</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    +{verificationResult.roughness_reduction_percent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Variance smoothing post-repair</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">RESIDUAL EDGE DENSITY</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {verificationResult.edge_density_percent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Remaining crack / fringe lines</span>
                </div>
              </div>

              {/* CV Candidate Suggestion */}
              <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Automated CV Diagnostic:</span>
                <p className="text-xs font-bold text-white">{verificationResult.cv_verdict_suggestion}</p>
                <p className="text-[10px] text-slate-400 italic">
                  Note: Automated CV similarity is heuristic assistance and does not replace certified structural engineering verification.
                </p>
              </div>

              {/* Human Inspector Approval Actions */}
              <div className="p-4 rounded-xl bg-[#0d1830] border border-[#1d63ff]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs font-bold text-white">Inspector Engineering Sign-Off</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleHumanSignoff(true)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Certify Repair</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHumanSignoff(false)}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Request Remediation</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0a1226] border border-[#17284b] text-center space-y-4 h-full flex flex-col items-center justify-center text-slate-400">
              <Sparkles className="w-10 h-10 text-slate-600" />
              <p className="text-xs max-w-sm">
                Upload Before and After repair images to run automated OpenCV feature difference alignment and generate a side-by-side inspection canvas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
