import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { waterloggingService } from '../services/api';

export default function WaterloggingPage() {
  const [events, setEvents] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [roadName, setRoadName] = useState('PB Road Underpass Drainage Point');
  const [lat, setLat] = useState('14.4644');
  const [lng, setLng] = useState('75.9218');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await waterloggingService.list();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load waterlogging events:', err);
    }
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMsg('Please select a road surface image first.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('road_name', roadName);
      formData.append('lat', lat);
      formData.append('lng', lng);

      const res = await waterloggingService.detect(formData);
      setLatestAnalysis(res);
      loadEvents();
    } catch (err) {
      setErrorMsg('Detection failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-[#00d4ff]" />
            <span>Optical Waterlogging & Flood Hazard Detection Module</span>
          </h2>
          <p className="text-xs text-slate-400">
            HSV surface reflection segmentation detects water accumulation, hydroplaning hazards, and submerged pavement.
          </p>
        </div>
      </div>

      {/* 2-Column: Upload Form (Left) & Detection Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <h3 className="text-sm font-bold text-white">Scan Road Inundation</h3>
          <p className="text-xs text-slate-400">Upload road surface image during or following precipitation.</p>

          <form onSubmit={handleRunAnalysis} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Road Location Name</label>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
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
              <label className="text-slate-300 font-semibold block mb-1">Surface Image</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1d63ff]/20 file:text-[#00d4ff] cursor-pointer"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-28 rounded-lg object-cover w-full" />
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <CloudRain className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing Surface Reflection...' : 'Detect Waterlogging Mask'}</span>
            </button>
          </form>
        </div>

        {/* Right Output: Analyzed Water Mask & Risk Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {latestAnalysis ? (
            <div className="p-6 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/40 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#17284b]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#00d4ff]">{latestAnalysis.id}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{latestAnalysis.road_name}</h3>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  latestAnalysis.alert_status === 'CRITICAL_HAZARD' 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                    : (latestAnalysis.alert_status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                }`}>
                  {latestAnalysis.alert_status}
                </span>
              </div>

              {/* Annotated Mask Image */}
              <div className="rounded-xl overflow-hidden bg-black border border-[#17284b] max-h-72 flex items-center justify-center">
                <img
                  src={`http://localhost:8000${latestAnalysis.annotated_image_url}`}
                  alt="Waterlogging Mask"
                  className="w-full h-auto object-contain max-h-72"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">WATER COVERAGE RATIO</span>
                  <span className="text-2xl font-black text-[#00d4ff] font-mono">
                    {latestAnalysis.water_surface_ratio_percent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Submerged road ROI percentage</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-[10px] text-slate-400 block font-mono">CLASSIFIED RISK</span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {latestAnalysis.risk_level}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Hydroplaning & sub-base softening</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                <span>
                  Notice: Optical waterlogging detection is based on surface reflection and contrast thresholds. It does not represent an IoT ultrasonic flood sensor depth gauge.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0a1226] border border-[#17284b] text-center space-y-3 h-full flex flex-col items-center justify-center text-slate-400">
              <CloudRain className="w-10 h-10 text-slate-600" />
              <p className="text-xs max-w-sm">
                Upload a road scene image to generate an HSV reflective puddle segmentation mask and compute submerged surface ratio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
