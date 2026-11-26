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
  RefreshCw,
  Play,
  Pause,
  Square,
  Radio,
  Download,
  Activity,
  Gauge,
  Navigation,
  Save,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { detectionService, roadService } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function DetectionPage() {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video', 'live'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [roadName, setRoadName] = useState('Bengaluru Road Survey');
  const [roadId, setRoadId] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Standby');
  const [roads, setRoads] = useState([]);
  const [forceDemo, setForceDemo] = useState(false);
  const [gpsCsv, setGpsCsv] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  // ==========================================
  // LIVE CAMERA & REAL-TIME VIDEO DETECTION
  // ==========================================
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  // Real-time Detection Loop State
  const [isLiveDetecting, setIsLiveDetecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [livePotholes, setLivePotholes] = useState(0);
  const [liveCracks, setLiveCracks] = useState(0);
  const [liveSevere, setLiveSevere] = useState(0);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [modelStatus, setModelStatus] = useState('Ready (OpenCV/YOLO)');
  const [autoSaveDetections, setAutoSaveDetections] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

  // Video Recording State
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  const isDetectingRef = useRef(false);
  const isPausedRef = useRef(false);
  const frameRequestRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);

  useEffect(() => {
    roadService.listRoads().then(setRoads).catch(console.error);
    loadHistory();
    listCameraDevices();

    return () => {
      stopCamera();
    };
  }, []);

  const loadHistory = () => {
    detectionService.listDetections({ limit: 12 }).then(setHistory).catch(console.error);
  };

  const listCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Device enumeration error:', err);
    }
  };

  // Browser Geolocation API
  const handleGetLiveGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setGpsStatus('Not Supported');
      return;
    }
    setLocatingGps(true);
    setGpsStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocatingGps(false);
        setGpsStatus(`Locked (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setLocatingGps(false);
        setGpsStatus('Denied / Unavailable');
        setErrorMsg(`GPS Error: ${err.message}. Using default Bengaluru coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ==========================================
  // CAMERA START / STOP
  // ==========================================
  const startCamera = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          adjustOverlayCanvas();
        };
      }
      setCameraActive(true);
      setErrorMsg('');
      handleGetLiveGps();
      listCameraDevices();
    } catch (err) {
      setErrorMsg('Camera access denied or device unavailable: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    stopLiveDetection();
    stopRecording();
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    clearOverlay();
  };

  const adjustOverlayCanvas = () => {
    if (videoRef.current && overlayCanvasRef.current) {
      const v = videoRef.current;
      overlayCanvasRef.current.width = v.videoWidth || 640;
      overlayCanvasRef.current.height = v.videoHeight || 480;
    }
  };

  const clearOverlay = () => {
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  };

  // ==========================================
  // REAL-TIME FRAME PROCESSING LOOP
  // ==========================================
  const startLiveDetection = () => {
    if (!cameraActive) {
      setErrorMsg('Please start the camera before running live detection.');
      return;
    }
    setIsLiveDetecting(true);
    setIsPaused(false);
    isDetectingRef.current = true;
    isPausedRef.current = false;
    lastInferenceTimeRef.current = 0;
    runInferenceLoop();
  };

  const pauseLiveDetection = () => {
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const resumeLiveDetection = () => {
    setIsPaused(false);
    isPausedRef.current = false;
  };

  const stopLiveDetection = () => {
    setIsLiveDetecting(false);
    setIsPaused(false);
    isDetectingRef.current = false;
    isPausedRef.current = false;
    if (frameRequestRef.current) {
      cancelAnimationFrame(frameRequestRef.current);
    }
    clearOverlay();
    setCurrentDetections([]);
  };

  const runInferenceLoop = async () => {
    if (!isDetectingRef.current) return;

    const now = Date.now();
    // Process at 3 frames per second (330ms interval) to avoid CPU bottleneck
    if (!isPausedRef.current && now - lastInferenceTimeRef.current > 330) {
      await processCurrentFrame();
      lastInferenceTimeRef.current = Date.now();
    }

    frameRequestRef.current = requestAnimationFrame(runInferenceLoop);
  };

  const processCurrentFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Off-screen canvas to grab and compress frame
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = hiddenCanvasRef.current;
    canvas.width = Math.min(width, 640);
    canvas.height = Math.round((canvas.width / width) * height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const startTime = performance.now();

    // Convert frame to Blob
    canvas.toBlob(async (blob) => {
      if (!blob || !isDetectingRef.current) return;

      const formData = new FormData();
      formData.append('file', blob, 'live_frame.jpg');
      formData.append('force_demo', forceDemo ? 'true' : 'false');
      formData.append('road_name', roadName);
      if (roadId) formData.append('road_id', roadId);
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);

      // Auto-save rate limiter: at most 1 saved record every 4 seconds when defects are confirmed
      const shouldSaveNow = autoSaveDetections && (Date.now() - lastSavedTime > 4000);
      if (shouldSaveNow) {
        formData.append('save_detection', 'true');
      }

      try {
        const res = await detectionService.detectLiveFrame(formData);
        const elapsed = Math.round(performance.now() - startTime);
        setLatencyMs(elapsed);
        setFps(Math.round(1000 / Math.max(elapsed, 330)));
        setProcessedFrames(prev => prev + 1);

        if (res.model_source) setModelStatus(res.model_source);

        const dets = res.detections || [];
        setCurrentDetections(dets);

        // Update counts
        const pCount = dets.filter(d => d.class_name.toLowerCase().includes('pothole')).length;
        const cCount = dets.filter(d => d.class_name.toLowerCase().includes('crack')).length;
        const sCount = dets.filter(d => d.estimated_severity === 'High').length;
        setLivePotholes(prev => prev + pCount);
        setLiveCracks(prev => prev + cCount);
        setLiveSevere(prev => prev + sCount);

        // Render bounding boxes over video canvas
        drawBoundingBoxes(dets, width, height, canvas.width, canvas.height);

        if (shouldSaveNow && res.saved_record) {
          setLastSavedTime(Date.now());
          setSaveSuccessNotice(`Saved ${res.saved_record.id} (${pCount} Potholes, ${cCount} Cracks)`);
          setTimeout(() => setSaveSuccessNotice(''), 3000);
          loadHistory();
        }
      } catch (err) {
        // Soft error handling in real-time loop
        console.warn('Live frame inference error:', err.message);
      }
    }, 'image/jpeg', 0.75);
  };

  // Draw overlay bounding boxes
  const drawBoundingBoxes = (detections, videoW, videoH, frameW, frameH) => {
    if (!overlayCanvasRef.current) return;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / frameW;
    const scaleY = canvas.height / frameH;

    detections.forEach((d) => {
      const x1 = d.x1 * scaleX;
      const y1 = d.y1 * scaleY;
      const x2 = d.x2 * scaleX;
      const y2 = d.y2 * scaleY;
      const bw = x2 - x1;
      const bh = y2 - y1;

      // Color coding based on defect class
      let strokeColor = '#00d4ff'; // default cyan
      let labelBg = 'rgba(0, 212, 255, 0.85)';
      if (d.class_name.toLowerCase().includes('pothole')) {
        strokeColor = '#ff3366'; // Red for potholes
        labelBg = 'rgba(255, 51, 102, 0.85)';
      } else if (d.class_name.toLowerCase().includes('alligator')) {
        strokeColor = '#ffaa00'; // Amber
        labelBg = 'rgba(255, 170, 0, 0.85)';
      } else if (d.class_name.toLowerCase().includes('transverse') || d.class_name.toLowerCase().includes('longitudinal')) {
        strokeColor = '#33ccff';
        labelBg = 'rgba(51, 204, 255, 0.85)';
      }

      // Box outline
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x1, y1, bw, bh);

      // Semi-transparent fill
      ctx.fillStyle = strokeColor + '22';
      ctx.fillRect(x1, y1, bw, bh);

      // Label banner
      const labelText = `${d.class_name.toUpperCase()} ${Math.round((d.confidence || 0.85) * 100)}%`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = labelBg;
      ctx.fillRect(x1, Math.max(0, y1 - 22), textWidth + 14, 22);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x1 + 6, Math.max(16, y1 - 6));
    });
  };

  // Manually Save Current Live Frame Detection
  const handleSaveCurrentLiveDetection = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'manual_live_save.jpg');
      formData.append('save_detection', 'true');
      formData.append('force_demo', forceDemo ? 'true' : 'false');
      formData.append('road_name', roadName);
      if (roadId) formData.append('road_id', roadId);
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);

      try {
        const res = await detectionService.detectLiveFrame(formData);
        if (res.saved_record) {
          setSaveSuccessNotice(`Successfully saved ${res.saved_record.id} to Road Health Map!`);
          setTimeout(() => setSaveSuccessNotice(''), 4000);
          loadHistory();
        }
      } catch (err) {
        setErrorMsg('Failed to save live detection: ' + err.message);
      }
    }, 'image/jpeg', 0.90);
  };

  // ==========================================
  // VIDEO RECORDING (MediaRecorder)
  // ==========================================
  const startRecording = () => {
    if (!mediaStream) return;
    try {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const recorder = new MediaRecorder(mediaStream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setErrorMsg('Recording not supported or failed to start: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // ==========================================
  // SINGLE IMAGE / UPLOAD DETECTION
  // ==========================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setErrorMsg('');
    }
  };

  const captureFrameToImage = () => {
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
            Real-time visual scanning & damage classification for Indian roads: Potholes, Alligator Cracks, Transverse/Longitudinal Cracks, and Surface Wear.
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
            <span className="text-[10px] text-slate-400">Force labeled test boxes without GPU</span>
          </div>
        </label>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00d4ff]" />
              <span>Inspection Input Mode</span>
            </h3>

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
                onClick={() => { setActiveTab('live'); }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'live'
                    ? 'bg-[#1d63ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Live Camera</span>
              </button>
            </div>

            {/* Road Selection & Telemetry */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Road Asset</label>
                <select
                  value={roadId}
                  onChange={(e) => {
                    setRoadId(e.target.value);
                    const selected = roads.find(r => r.id === e.target.value);
                    if (selected) {
                      setRoadName(selected.name);
                      if (selected.start_lat) setLat(selected.start_lat.toString());
                      if (selected.start_lng) setLng(selected.start_lng.toString());
                    }
                  }}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="">Custom Unregistered Corridor</option>
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Road Location Name</label>
                <input
                  type="text"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Bengaluru"
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              {/* GPS Coordinates with Live Browser GPS */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    GPS Coordinates (Mapped on Live Map)
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLiveGps}
                    disabled={locatingGps}
                    className="text-[10px] text-[#00d4ff] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Compass className={`w-3 h-3 ${locatingGps ? 'animate-spin' : ''}`} />
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
                <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>GPS Status: <strong className="text-slate-300">{gpsStatus}</strong></span>
                  <span>Default: Bengaluru, KA</span>
                </p>
              </div>

              {/* Video Track CSV */}
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

            {/* Input Selection: Live Camera or Upload */}
            {activeTab === 'live' ? (
              <div className="space-y-3 pt-2 border-t border-[#17284b]">
                {/* Camera Hardware Selector */}
                {availableDevices.length > 1 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Select Camera Sensor</label>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        if (cameraActive) startCamera();
                      }}
                      className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl px-3 py-1.5 text-xs text-[#00d4ff] focus:outline-none"
                    >
                      {availableDevices.map((d, idx) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera Device ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Camera Controls */}
                <div className="grid grid-cols-2 gap-2">
                  {!cameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 flex items-center justify-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={captureFrameToImage}
                        className="py-2.5 rounded-xl bg-[#0d1830] border border-[#17284b] text-slate-300 text-xs font-semibold hover:text-white flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#00d4ff]" />
                        <span>Freeze Snapshot</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Real-time Detection Controls */}
                {cameraActive && (
                  <div className="space-y-2 pt-2 border-t border-[#17284b]">
                    <div className="flex gap-2">
                      {!isLiveDetecting ? (
                        <button
                          type="button"
                          onClick={startLiveDetection}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start AI Detection</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={isPaused ? resumeLiveDetection : pauseLiveDetection}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center justify-center gap-1.5"
                          >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            <span>{isPaused ? 'Resume Detection' : 'Pause'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopLiveDetection}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
                          >
                            Stop
                          </button>
                        </>
                      )}
                    </div>

                    {/* Manual Save & Recording Controls */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveCurrentLiveDetection}
                        className="py-2 rounded-xl bg-[#0d1830] border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-semibold hover:bg-[#00d4ff]/10 flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Detection</span>
                      </button>

                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="py-2 rounded-xl bg-[#0d1830] border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 flex items-center justify-center gap-1.5"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Record Feed</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="py-2 rounded-xl bg-rose-500 text-white text-xs font-bold animate-pulse flex items-center justify-center gap-1.5"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>

                    {/* Auto-Save Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={autoSaveDetections}
                        onChange={(e) => setAutoSaveDetections(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#00d4ff] rounded cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400">
                        Auto-save detected defects to GPS Map & Health Passport
                      </span>
                    </label>

                    {saveSuccessNotice && (
                      <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{saveSuccessNotice}</span>
                      </div>
                    )}
                  </div>
                )}
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

            {/* Static Image/Video CTA Button */}
            {selectedFile && activeTab !== 'live' && (
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

        {/* Right Column: Video Preview / AI Output Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Mode: Live Video Stream & Overlays */}
          {activeTab === 'live' ? (
            <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/30 shadow-glass space-y-4">
              
              {/* Header Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#17284b]">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {cameraActive ? (isLiveDetecting ? 'AI REAL-TIME INFERENCE ACTIVE' : 'CAMERA STANDBY') : 'NO CAMERA FEED'}
                  </span>
                  {forceDemo && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DEMO MODE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">FPS: <strong className="text-[#00d4ff]">{fps}</strong></span>
                  <span className="text-slate-400">Latency: <strong className="text-emerald-400">{latencyMs}ms</strong></span>
                </div>
              </div>

              {/* Main Viewport with Canvas Bounding Box Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#17284b] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Canvas for Real-time Bounding Boxes */}
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-400 space-y-2 bg-[#060b13]/80">
                    <Camera className="w-10 h-10 text-slate-600" />
                    <span>Click "Start Camera" on the left panel to begin live road inspection.</span>
                  </div>
                )}

                {/* HUD Scanner Grid Overlay */}
                {isLiveDetecting && (
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#00d4ff]/30 text-[11px] font-mono text-[#00d4ff]">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>YOLO ROAD SCANNER ACTIVE</span>
                  </div>
                )}

                {isRecording && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-rose-600/90 text-white px-2 py-0.5 rounded font-mono text-[10px] animate-pulse">
                    <Radio className="w-3 h-3" />
                    <span>REC</span>
                  </div>
                )}
              </div>

              {/* Live Analytics Dashboard Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-slate-400 text-[10px] block">Processed Frames</span>
                  <span className="text-base font-bold text-white font-mono">{processedFrames}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-slate-400 text-[10px] block">Potholes Detected</span>
                  <span className="text-base font-bold text-rose-400 font-mono">{livePotholes}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-slate-400 text-[10px] block">Cracks Detected</span>
                  <span className="text-base font-bold text-amber-400 font-mono">{liveCracks}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
                  <span className="text-slate-400 text-[10px] block">High Severity</span>
                  <span className="text-base font-bold text-rose-500 font-mono">{liveSevere}</span>
                </div>
              </div>

              {/* Live Detected Defect Stream List */}
              {currentDetections.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#17284b]">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Current Frame Identified Objects ({currentDetections.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentDetections.map((d, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#080f1d] border border-[#17284b] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${d.class_name.includes('Pothole') ? 'bg-rose-500' : 'bg-[#00d4ff]'}`}></span>
                          <span className="font-bold text-white">{d.class_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{Math.round(d.confidence * 100)}%</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          d.estimated_severity === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {d.estimated_severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recorded Video Playback & Download */}
              {recordedVideoUrl && (
                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#00d4ff]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#00d4ff]" />
                      <span>Recorded Camera Clip</span>
                    </span>
                    <a
                      href={recordedVideoUrl}
                      download={`roadguard_survey_${Date.now()}.webm`}
                      className="text-[11px] text-[#00d4ff] hover:underline flex items-center gap-1 font-mono"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Video</span>
                    </a>
                  </div>
                  <video src={recordedVideoUrl} controls className="w-full rounded-lg max-h-48 bg-black" />
                </div>
              )}

              {/* Inference Engine Status */}
              <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                <span>Engine: <strong>{modelStatus}</strong>. Connected to Bengaluru Indian Road Damage Detection standard.</span>
              </div>
            </div>
          ) : (
            /* Mode: Image / Uploaded Video Output */
            detectionResult ? (
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
                      src={getMediaUrl(detectionResult.annotated_file_url || detectionResult.original_file_url)}
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
                  <h3 className="text-base font-bold text-white">No Detection Active</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Upload a road image or vehicle survey video on the left, or use Live Camera capture to run real-time inference.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Detection History Archive */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Detection History Archive</h3>
            <p className="text-xs text-slate-400">Past road scans cataloged with telemetry</p>
          </div>
          <button
            onClick={loadHistory}
            className="p-2 rounded-xl bg-[#080f1d] text-slate-400 hover:text-white border border-[#17284b]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.map((det) => (
              <div key={det.id} className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-2">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                  {det.media_type === 'video' ? (
                    <div className="flex flex-col items-center text-slate-500">
                      <Video className="w-8 h-8 text-[#00d4ff]" />
                      <span className="text-[10px] mt-1">Video Log</span>
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(det.annotated_file_url || det.original_file_url)}
                      alt="Detection thumb"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-[#00d4ff]">
                    {det.media_type === 'live_video' ? 'LIVE' : (det.media_type || 'image').toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate">{det.road_name}</span>
                    <PriorityBadge tier={`${det.highest_severity || 'Low'} Severity`} size="small" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>{det.total_defects || 0} Defects</span>
                    <span>{new Date(det.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#17284b]/60">
                  <button
                    onClick={() => setDetectionResult(det)}
                    className="text-[11px] text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Result</span>
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(det.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No past detection records found.</p>
        )}
      </div>
    </div>
  );
}
