import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Camera, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  Mic, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { complaintService, contractorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoiceReporterModal from '../components/VoiceReporterModal';

const STATUS_STAGES = [
  "Submitted",
  "Under Review",
  "Assigned",
  "Repair in Progress",
  "Completed"
];

export default function CitizenReportPage() {
  const { user, role } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [trackingId, setTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Form State
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.phone || '');
  const [roadName, setRoadName] = useState('PB Road (Near Bapuji College)');
  const [damageType, setDamageType] = useState('Deep Pothole with Sharp Edges');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('14.4644');
  const [lng, setLng] = useState('75.9218');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
    contractorService.list().then(setContractors).catch(console.error);
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await complaintService.listComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error loading complaints:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittedId(null);
    try {
      const formData = new FormData();
      formData.append('citizen_name', citizenName);
      formData.append('contact_details', contact);
      formData.append('road_name', roadName);
      formData.append('damage_type', damageType);
      formData.append('description', description);
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('language_used', 'Web Portal Form');
      if (photoFile) formData.append('photo', photoFile);

      const res = await complaintService.submitComplaint(formData);
      setSubmittedId(res.id);
      setTrackedComplaint(res);
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview(null);
      loadComplaints();
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackingError('');
    setTrackedComplaint(null);
    if (!trackingId.trim()) return;

    try {
      const res = await complaintService.getComplaint(trackingId.trim());
      setTrackedComplaint(res);
    } catch (err) {
      setTrackingError('No complaint found with ID ' + trackingId);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await complaintService.updateStatus(id, { status: newStatus });
      loadComplaints();
      if (trackedComplaint?.id === id) {
        setTrackedComplaint({ ...trackedComplaint, status: newStatus });
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#00d4ff]" />
            <span>Citizen Complaint Registration & Real-Time Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">
            Report road hazards with geo-tagging, track repair progress with unique Complaint IDs, or speak in your regional language.
          </p>
        </div>

        <button
          onClick={() => setVoiceModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90"
        >
          <Mic className="w-4 h-4" />
          <span>Launch Voice Reporting (5 Languages)</span>
        </button>
      </div>

      {/* Track Complaint Bar */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-[#00d4ff]" />
          <span>Track Complaint Status with Reference ID</span>
        </h3>

        <form onSubmit={handleTrack} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="e.g. CMP-2026-001"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-1 min-w-[200px] bg-[#0d1830] border border-[#17284b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff] font-mono"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#1d63ff] hover:bg-[#1d63ff]/80 text-white text-xs font-bold transition-all"
          >
            Track Status
          </button>
        </form>

        {trackingError && (
          <p className="text-xs text-rose-400">{trackingError}</p>
        )}

        {/* Tracking Timeline Card */}
        {trackedComplaint && (
          <div className="p-4 rounded-xl bg-[#080f1d] border border-[#00d4ff]/30 space-y-4 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#17284b]">
              <div>
                <span className="font-mono text-xs font-bold text-[#00d4ff]">{trackedComplaint.id}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{trackedComplaint.road_name}</h4>
                <p className="text-xs text-slate-400">{trackedComplaint.damage_type}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-[#00d4ff] border border-[#00d4ff]/40">
                {trackedComplaint.status}
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#17284b] z-0"></div>
                {STATUS_STAGES.map((stg, i) => {
                  const currentIdx = STATUS_STAGES.indexOf(trackedComplaint.status);
                  const isDone = i <= currentIdx;
                  const isCurrent = i === currentIdx;

                  return (
                    <div key={stg} className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone 
                          ? 'bg-[#00d4ff] text-black shadow-glow-cyan' 
                          : 'bg-[#0d1830] text-slate-500 border border-[#17284b]'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : (i + 1)}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium text-center hidden sm:block ${
                        isCurrent ? 'text-[#00d4ff] font-bold' : (isDone ? 'text-slate-300' : 'text-slate-500')
                      }`}>
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-[#17284b] flex flex-wrap justify-between gap-2">
              <span>Admin Note: {trackedComplaint.admin_notes || 'Triage in queue.'}</span>
              {trackedComplaint.assigned_contractor_name && (
                <span>Assigned Contractor: <strong className="text-white">{trackedComplaint.assigned_contractor_name}</strong></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column: Complaint Submission Form (Left) & All Complaints Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <h3 className="text-sm font-bold text-white">Report Road Damage</h3>
          <p className="text-xs text-slate-400">Fill in location details and upload photographic evidence.</p>

          {submittedId && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Registered! Save reference ID: <strong>{submittedId}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Citizen / Reporter Name</label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Contact Details (Optional)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 Phone or Email"
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Road Name & Landmark</label>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder="e.g. PB Road opposite College Gate"
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Damage Classification</label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              >
                <option value="Deep Pothole with Sharp Edges">Deep Pothole with Sharp Edges</option>
                <option value="Alligator Fatigue Cracks">Alligator Fatigue Cracks</option>
                <option value="Longitudinal Rutting">Longitudinal Rutting</option>
                <option value="Waterlogged Depression">Waterlogged Depression</option>
                <option value="Edge Ravelling & Broken Shoulder">Edge Ravelling & Broken Shoulder</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe hazard depth, risk to two-wheelers, traffic conditions..."
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Defect Photograph (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1d63ff]/20 file:text-[#00d4ff] cursor-pointer"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Submit Citizen Complaint'}</span>
            </button>
          </form>
        </div>

        {/* Right Table: Authority Complaint Management (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Municipal Complaint Queue</h3>
              <p className="text-xs text-slate-400">Authority review and contractor assignment panel</p>
            </div>
            <span className="text-xs font-mono text-[#00d4ff]">{complaints.length} Total Reports</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {complaints.map((c) => (
              <div 
                key={c.id} 
                className="p-4 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-xs font-bold text-white">{c.citizen_name}</span>
                  </div>

                  {/* Status Dropdown (Accessible to Government Authorities / Admins) */}
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className="bg-[#0d1830] border border-[#17284b] text-[11px] font-semibold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Repair in Progress">Repair in Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200">{c.damage_type}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{c.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#17284b]/60 text-[10px] text-slate-400 font-mono">
                  <span>Location: {c.road_name} ({parseFloat(c.lat).toFixed(4)}, {parseFloat(c.lng).toFixed(4)})</span>
                  <span>Channel: {c.language_used || 'Web Portal'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Modal */}
      {voiceModalOpen && (
        <VoiceReporterModal
          onClose={() => setVoiceModalOpen(false)}
          onSuccess={(res) => {
            loadComplaints();
            setTrackedComplaint(res);
          }}
        />
      )}
    </div>
  );
}
