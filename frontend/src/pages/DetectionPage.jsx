import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanSearch, 
  Upload, 
  Video, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  MapPin, 
  Info, 
  Sparkles,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { detectionService, roadService } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';

export default function DetectionPage() {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video', 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [roadName, setRoadName] = useState('Bengaluru Road Survey');
  const [roadId, setRoadId] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [locatingGps, setLocatingGps] = useState(false);
  const [roads, setRoads] = useState([]);
  const [forceDemo, setForceDemo] = useState(false);
  const [gpsCsv, setGpsCsv] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  // Camera capture state
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    roadService.listRoads().then(setRoads).catch(console.error);
    loadHistory();
  }, []);

  const loadHistory = () => {
    detectionService.listDetections({ limit: 12 }).then(setHistory).catch(console.error);
  };

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setErrorMsg('');
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'environment' } 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Could not access camera: ' + err.message);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  // Capture Frame from Camera
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `cam_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera();
      setActiveTab('image');
    }, 'image/jpeg', 0.92);
  };

  // Run AI Detection
  const handleRunDetection = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or capture a road image/video first.');
      return;
    }

    setProcessing(true);
    setUploadProgress(10);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('road_name', roadName);
      if (roadId) formData.append('road_id', roadId);
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);
      formData.append('force_demo', forceDemo ? 'true' : 'false');

      if (activeTab === 'image') {
        formData.append('file', selectedFile);
        const res = await detectionService.uploadImage(formData);
        setDetectionResult(res);
        setUploadProgress(100);
      } else {
        formData.append('file', selectedFile);
        if (gpsCsv) formData.append('gps_csv', gpsCsv);
        const res = await detectionService.uploadVideo(formData, (p) => setUploadProgress(p));
        setDetectionResult(res);
      }
      loadHistory();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || err.message || 'AI detection failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (confirm('Delete this detection record?')) {
      await detectionService.deleteDetection(id);
      loadHistory();
      if (detectionResult?.id === id) setDetectionResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ScanSearch className="w-5 h-5 text-[#00d4ff]" />
            <span>AI Road Defect Detection Studio (YOLOv8 & OpenCV)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated visual scanning for Indian road conditions: Potholes, Alligator Cracks, Longitudinal Cracks, and Surface Ravelling.
          </p>
        </div>

        {/* Demo Mode Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-[#0d1830] px-3 py-1.5 rounded-xl border border-[#17284b]">
          <input
            type="checkbox"
            checked={forceDemo}
            onChange={(e) => setForceDemo(e.target.checked)}
            className="w-4 h-4 accent-[#00d4ff] rounded cursor-pointer"
          />
          <div className="text-left">
            <span className="text-xs font-semibold text-slate-200 block">Demo Simulation Mode</span>
            <span className="text-[10px] text-slate-400">Clearly labeled test data without GPU</span>
          </div>
        </label>
      </div>

      {/* Main Upload / Camera Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#080f1d] rounded-xl border border-[#17284b]">
              <button
                type="button"
                onClick={() => { setActiveTab('image'); stopCamera(); }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'image'
                    ? 'bg-[#1d63ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Road Image</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('video'); stopCamera(); }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'video'
                    ? 'bg-[#1d63ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Survey</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('camera'); startCamera(); }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'camera'
                    ? 'bg-[#1d63ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Camera</span>
              </button>
            </div>

            {/* Road Selection Metadata */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Road Asset</label>
                <select
                  value={roadId}
                  onChange={(e) => {
                    setRoadId(e.target.value);
                    const selected = roads.find(r => r.id === e.target.value);
                    if (selected) setRoadName(selected.road_name);
                  }}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.road_name} ({r.road_category})
                    </option>
                  ))}
                  <option value="">Custom Unregistered Corridor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Road Location Name</label>
                <input
                  type="text"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              {/* GPS Coordinates for Map Pinning */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">GPS Coordinates (Mapped on Live Map)</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      setLocatingGps(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLat(pos.coords.latitude.toFixed(6));
                          setLng(pos.coords.longitude.toFixed(6));
                          setLocatingGps(false);
                        },
                        () => setLocatingGps(false),
                        { enableHighAccuracy: true, timeout: 10000 }
                      );
                    }}
                    className="text-[11px] text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{locatingGps ? 'Locating...' : 'Use Live GPS'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {activeTab === 'video' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Optional GPS Track Log (.csv from Android Phone)
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setGpsCsv(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1d63ff]/20 file:text-[#00d4ff] hover:file:bg-[#1d63ff]/30 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Matches video frames with recorded Android phone GPS timestamps.
                  </p>
                </div>
              )}
            </div>

            {/* Upload Area / Camera View */}
            {activeTab === 'camera' ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#17284b]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      Camera inactive. Click Start Camera.
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureFrame}
                    disabled={!cameraActive}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot & Analyze</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Stop
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block p-6 rounded-xl border-2 border-dashed border-[#17284b] hover:border-[#00d4ff]/40 bg-[#080f1d] text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept={activeTab === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#1d63ff]/15 text-[#00d4ff] flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white block">
                      {selectedFile ? selectedFile.name : `Click to Upload Road ${activeTab === 'image' ? 'Image' : 'Video'}`}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {activeTab === 'image' ? 'JPEG, PNG up to 25MB' : 'MP4, MOV from Vehicle Webcam'}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Execution CTA Button */}
            {selectedFile && activeTab !== 'camera' && (
              <button
                type="button"
                onClick={handleRunDetection}
                disabled={processing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <ScanSearch className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                <span>{processing ? 'Processing AI Inference...' : 'Execute YOLO Damage Detection'}</span>
              </button>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Output & Bounding Boxes (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {detectionResult ? (
            <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/30 shadow-glass space-y-5">
              {/* Header result badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#17284b]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00d4ff]">{detectionResult.id}</span>
                    <PriorityBadge tier={`${detectionResult.highest_severity || 'Medium'} Severity`} size="small" />
                    {detectionResult.is_demo_mode && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-[#00d4ff] border border-[#00d4ff]/40">
                        DEMO SIMULATION
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{detectionResult.road_name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Defects</span>
                  <span className="text-xl font-extrabold text-white">
                    {detectionResult.total_defects || detectionResult.detected_objects?.length || 0}
                  </span>
                </div>
              </div>

              {/* Visual Display */}
              <div className="relative rounded-xl overflow-hidden bg-black border border-[#17284b] max-h-96 flex items-center justify-center">
                {detectionResult.media_type === 'video' ? (
                  <div className="p-6 text-center space-y-3 w-full">
                    <Video className="w-12 h-12 text-[#00d4ff] mx-auto" />
                    <h4 className="text-sm font-bold text-white">Video Inspection Summary</h4>
                    <p className="text-xs text-slate-400">
                      Processed {detectionResult.inspected_frames_count} keyframes across {detectionResult.video_duration_seconds}s video duration.
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-xs">
                      <div className="p-2 rounded bg-[#0d1830] border border-[#17284b]">
                        <span className="text-slate-400 block text-[10px]">Potholes</span>
                        <span className="font-bold text-rose-400">{detectionResult.potholes_count}</span>
                      </div>
                      <div className="p-2 rounded bg-[#0d1830] border border-[#17284b]">
                        <span className="text-slate-400 block text-[10px]">Cracks</span>
                        <span className="font-bold text-amber-400">{detectionResult.cracks_count}</span>
                      </div>
                      <div className="p-2 rounded bg-[#0d1830] border border-[#17284b]">
                        <span className="text-slate-400 block text-[10px]">GPS Matches</span>
                        <span className="font-bold text-[#00d4ff]">{detectionResult.gps_matched_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={`http://localhost:8000${detectionResult.annotated_file_url || detectionResult.original_file_url}`}
                    alt="AI Annotated Road Defect"
                    className="w-full h-auto object-contain max-h-96"
                  />
                )}
              </div>

              {/* Detected Objects Table */}
              {detectionResult.detected_objects && detectionResult.detected_objects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Classified Defect Bounding Boxes ({detectionResult.detected_objects.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {detectionResult.detected_objects.map((obj, i) => (
                      <div 
                        key={i}
                        className="p-2.5 rounded-xl bg-[#080f1d] border border-[#17284b] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00d4ff]"></span>
                          <span className="font-bold text-white">{obj.class_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Confidence: {Math.round((obj.confidence || 0.85) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Area: {obj.area_ratio || '1.8'}%
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            obj.estimated_severity === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {obj.estimated_severity || 'Medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informative notice */}
              <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                <span>
                  {detectionResult.demo_disclosure || (
                    "Defect bounding boxes computed using YOLOv8 Indian Road Damage Model. Coordinates mapped into Road Health Passport."
                  )}
                </span>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="p-12 rounded-2xl bg-[#0a1226] border border-[#17284b] text-center space-y-4 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#080f1d] border border-[#17284b] text-[#00d4ff] flex items-center justify-center">
                <ScanSearch className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Detection Active</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Upload a road image or vehicle survey video on the left, or use Live Camera capture to run real-time inference.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detection History Grid */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Detection History Archive</h3>
            <p className="text-xs text-slate-400">Past road scans cataloged with telemetry</p>
          </div>
          <button 
            onClick={loadHistory}
            className="p-1.5 rounded-lg bg-[#0d1830] text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {history.map((det) => (
            <div 
              key={det.id}
              className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] hover:border-[#00d4ff]/40 transition-all space-y-2 relative group"
            >
              <div className="h-28 rounded-lg bg-black overflow-hidden relative">
                {det.annotated_file_url || det.original_file_url ? (
                  <img
                    src={`http://localhost:8000${det.annotated_file_url || det.original_file_url}`}
                    alt="Scan"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                    Video Record
                  </div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-[#00d4ff]">
                    {det.id}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white truncate">{det.road_name}</h5>
                <p className="text-[10px] text-slate-400">
                  {det.total_defects || 0} defects • {det.highest_severity || 'Low'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#17284b]/60 text-xs">
                <button
                  type="button"
                  onClick={() => setDetectionResult(det)}
                  className="text-[#00d4ff] hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteHistory(det.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
