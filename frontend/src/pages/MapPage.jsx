import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Upload, 
  Navigation, 
  AlertTriangle, 
  Smartphone, 
  Clock, 
  Check, 
  Info,
  Calendar,
  X
} from 'lucide-react';
import MapView from '../components/MapView';
import { roadService, detectionService, complaintService } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';

export default function MapPage() {
  const [roads, setRoads] = useState([]);
  const [detections, setDetections] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual GPS Tag Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualLat, setManualLat] = useState('12.9716');
  const [manualLng, setManualLng] = useState('77.5946');
  const [manualRoad, setManualRoad] = useState('Outer Ring Road, Bengaluru');
  const [manualDesc, setManualDesc] = useState('Verified field coordinate marker');

  useEffect(() => {
    async function fetchMapData() {
      try {
        const [rd, det, cmp] = await Promise.all([
          roadService.listRoads(),
          detectionService.listDetections({ limit: 50 }),
          complaintService.listComplaints()
        ]);
        setRoads(rd);
        setDetections(det);
        setComplaints(cmp);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, []);

  const handleManualTagSubmit = (e) => {
    e.preventDefault();
    const newPoint = {
      id: `TAG-${Date.now().toString().slice(-4)}`,
      road_name: manualRoad,
      description: manualDesc,
      lat: parseFloat(manualLat),
      lng: parseFloat(manualLng),
      highest_severity: 'Medium',
      created_at: new Date().toISOString()
    };
    setDetections([newPoint, ...detections]);
    setManualModalOpen(false);
    setSelectedItem(newPoint);
  };

  const allMapItems = [...detections, ...complaints];

  return (
    <div className="space-y-6">
      {/* Top Banner & Hardware Synchronization Guide */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00d4ff]" />
            <span>Interactive GPS Hazard Telemetry Map (Leaflet & OSM)</span>
          </h2>
          <p className="text-xs text-slate-400">
            OpenStreetMap geospatial layers depicting detected potholes, structural cracks, and citizen alerts with micro-coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setManualModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0d1830] hover:bg-[#112247] border border-[#1d63ff]/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Add Manual Coordinate</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View Container (8 or 12 cols) */}
        <div className={selectedItem ? "lg:col-span-8" : "lg:col-span-12"}>
          <MapView
            items={allMapItems}
            roads={roads}
            height="560px"
            onMarkerSelect={(item) => setSelectedItem(item)}
          />
        </div>

        {/* Selected Marker Detail Card */}
        {selectedItem && (
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0a1226] border border-[#00d4ff]/40 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#17284b]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#00d4ff]">{selectedItem.id}</span>
                  <PriorityBadge tier={selectedItem.highest_severity || selectedItem.severity || 'Medium'} size="small" />
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo preview if present */}
              {(selectedItem.annotated_file_url || selectedItem.original_file_url || selectedItem.photo_url) && (
                <div className="my-3 rounded-xl overflow-hidden bg-black h-40 border border-[#17284b]">
                  <img
                    src={`http://localhost:8000${selectedItem.annotated_file_url || selectedItem.original_file_url || selectedItem.photo_url}`}
                    alt="Defect"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="space-y-2 mt-3">
                <h4 className="text-sm font-bold text-white">{selectedItem.road_name}</h4>
                <p className="text-xs text-slate-300">
                  {selectedItem.description || `Cataloged defect with ${selectedItem.potholes_count || 0} potholes and ${selectedItem.cracks_count || 0} cracks.`}
                </p>

                <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-1.5 font-mono text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="text-white font-bold">{parseFloat(selectedItem.lat).toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="text-white font-bold">{parseFloat(selectedItem.lng).toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logged At:</span>
                    <span className="text-slate-300">
                      {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#17284b] text-[11px] text-slate-400 italic">
              {selectedItem.is_demo_mode 
                ? "• Coordinated sample points registered for municipal hackathon demonstration."
                : "• Telemetry coordinates synchronized with Android phone GPS stream."}
            </div>
          </div>
        )}
      </div>

      {/* Hardware Video + GPS Synchronization Guide */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#00d4ff]" />
          <span>Vehicle Camera & Android GPS Synchronization Architecture</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Standard USB webcams do not contain onboard GPS chips. Under our budget ₹5,000 prototype:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
            <span className="font-bold text-[#00d4ff] block mb-1">1. Android GPS Logging</span>
            <p className="text-slate-400">Open free app 'GPS Logger' or 'OpenTracks' on an Android phone mounted on the car dashboard. Start logging a GPX/CSV track.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
            <span className="font-bold text-[#1d63ff] block mb-1">2. USB Webcam Recording</span>
            <p className="text-slate-400">A 1080p USB camera mounted on the vehicle hood records the road surface at 30 FPS into standard MP4 video.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080f1d] border border-[#17284b]">
            <span className="font-bold text-emerald-400 block mb-1">3. Automated Timestamp Matching</span>
            <p className="text-slate-400">Our OpenCV pipeline extracts keyframe timestamps and interpolates the nearest latitude & longitude from the phone CSV track.</p>
          </div>
        </div>
      </div>

      {/* Manual Tag Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1226] border border-[#17284b] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#17284b]">
              <h3 className="text-sm font-bold text-white">Add Field GPS Hazard</h3>
              <button onClick={() => setManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualTagSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Road Name</label>
                <input
                  type="text"
                  value={manualRoad}
                  onChange={(e) => setManualRoad(e.target.value)}
                  required
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    required
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    required
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1d63ff] hover:bg-[#1d63ff]/80 text-white font-bold"
                >
                  Place Marker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
