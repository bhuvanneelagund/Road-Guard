import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Filter, Compass, AlertCircle, Eye, Navigation, CheckCircle2, MapPin, Globe } from 'lucide-react';

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY || '';

// Tile layer presets — Geoapify primary when VITE_MAP_API_KEY is configured, CARTO/Esri fallback
const TILE_LAYERS = {
  'Dark Matter': {
    url: MAP_API_KEY
      ? `https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}.png?apiKey=${MAP_API_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: MAP_API_KEY
      ? 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; OpenStreetMap contributors'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  'Dark Blue': {
    url: MAP_API_KEY
      ? `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${MAP_API_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution: MAP_API_KEY
      ? 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; OpenStreetMap contributors'
      : '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20,
  },
  'Street Map': {
    url: MAP_API_KEY
      ? `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${MAP_API_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: MAP_API_KEY
      ? 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; OpenStreetMap contributors'
      : '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20,
  },
  'Satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
};

const CITY_PRESETS = {
  Bengaluru: { center: [12.9716, 77.5946], zoom: 12 },
  Davanagere: { center: [14.4644, 75.9218], zoom: 13 },
};

// Reverse geocoding using Geoapify (with Nominatim fallback)
async function reverseGeocode(lat, lng) {
  if (MAP_API_KEY) {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${MAP_API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          return data.features[0].properties;
        }
      }
    } catch (err) {
      console.warn('Geoapify reverse geocode failed, falling back:', err);
    }
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.address) {
      return {
        street: data.address.road || data.address.neighbourhood || '',
        suburb: data.address.suburb || data.address.town || '',
        city: data.address.city || data.address.county || '',
        district: data.address.state_district || '',
        state: data.address.state || '',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }
  return null;
}

export default function MapView({ 
  items = [], 
  roads = [], 
  center = [12.9716, 77.5946], 
  zoom = 12,
  height = "520px",
  onMarkerSelect,
  onGpsLocated,
  autoLocate = true,
  showExtraMarkers = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('Dark Matter');
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  // Initialize Map safely (handling React 19 / StrictMode mounting)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if the DOM element already has an internal leaflet id
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    // Apply primary tile layer
    const layerConfig = TILE_LAYERS[activeLayer];
    const tileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      ...(layerConfig.url.includes('cartocdn') ? { subdomains: 'abcd' } : {})
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Invalidate size to ensure crisp tile rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    if (autoLocate) {
      handleLocateMe();
    }

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  const switchTileLayer = (layerName) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConfig = TILE_LAYERS[layerName];
    const newTile = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      ...(layerConfig.url.includes('cartocdn') ? { subdomains: 'abcd' } : {})
    }).addTo(map);

    tileLayerRef.current = newTile;
    setActiveLayer(layerName);
    setLayerMenuOpen(false);
  };

  const flyToCity = (cityName) => {
    const map = mapInstanceRef.current;
    const preset = CITY_PRESETS[cityName];
    if (map && preset) {
      map.flyTo(preset.center, preset.zoom, { duration: 1.0 });
    }
  };

  // Update Markers based on filtered items
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Re-attach the single live user location marker if it exists
    if (userMarkerRef.current) {
      markersLayer.addLayer(userMarkerRef.current);
    }
    if (userCircleRef.current) {
      markersLayer.addLayer(userCircleRef.current);
    }

    if (!showExtraMarkers) return;

    // Expand video detections with per-frame GPS if present, plus image/complaint items
    const expandedItems = [];
    items.forEach(item => {
      if (item.media_type === 'video' && Array.isArray(item.detections_timeline) && item.detections_timeline.length > 0 && item.gps_matched_count > 0) {
        item.detections_timeline.forEach((frame, idx) => {
          if (frame.gps && frame.gps.lat != null && frame.gps.lng != null) {
            expandedItems.push({
              ...item,
              id: `${item.id}-F${idx + 1}`,
              lat: frame.gps.lat,
              lng: frame.gps.lng,
              potholes_count: frame.summary?.potholes || 0,
              cracks_count: frame.summary?.cracks || 0,
              highest_severity: frame.summary?.highest_severity || item.highest_severity,
              annotated_file_url: frame.keyframe_image_url || item.annotated_file_url,
              description: `Video Frame @ ${frame.timestamp_seconds}s: ${frame.summary?.potholes || 0} Potholes, ${frame.summary?.cracks || 0} Cracks`
            });
          }
        });
      } else {
        expandedItems.push(item);
      }
    });

    // Combine detections and complaints with GPS coordinates
    const filtered = expandedItems.filter(item => {
      const cat = (item.damage_type || (item.potholes_count > 0 ? 'Pothole' : 'Crack') || 'General').toUpperCase();
      const sev = (item.highest_severity || item.severity || 'MEDIUM').toUpperCase();

      if (categoryFilter !== 'ALL') {
        if (categoryFilter === 'POTHOLE' && !cat.includes('POTHOLE')) return false;
        if (categoryFilter === 'CRACK' && !cat.includes('CRACK')) return false;
        if (categoryFilter === 'WATER' && !cat.includes('WATER')) return false;
      }

      if (severityFilter !== 'ALL' && sev !== severityFilter) return false;

      return (item.lat != null && item.lng != null && item.lat !== 0);
    });

    filtered.forEach(item => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const isPothole = (item.potholes_count > 0) || (item.damage_type && item.damage_type.toLowerCase().includes('pothole'));
      const isWater = (item.damage_type && item.damage_type.toLowerCase().includes('water')) || item.waterlogging_detected;
      const isHighSev = (item.highest_severity === 'High') || (item.severity === 'High');

      // Custom HTML Marker Icon
      let markerColor = '#00d4ff'; // cyan
      let pulseAnim = '';
      if (isHighSev || isPothole) {
        markerColor = '#ef4444'; // red
        pulseAnim = 'animate-ping';
      } else if (isWater) {
        markerColor = '#3b82f6'; // blue
      }

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${markerColor}; opacity: 0.4;" class="${pulseAnim}"></span>
            <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background-color: ${markerColor}; border: 2px solid white; box-shadow: 0 0 10px ${markerColor};"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; color: #00d4ff; text-transform: uppercase;">
              ${item.id || 'GPS HAZARD'}
            </span>
            <span style="font-size: 10px; font-weight: bold; background: ${markerColor}22; color: ${markerColor}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${markerColor}55;">
              ${item.highest_severity || item.severity || 'Medium'}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #f1f5f9; margin: 0 0 4px 0;">
            ${item.road_name || 'Road Corridor'}
          </h4>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">
            ${item.description || (item.potholes_count ? `${item.potholes_count} Potholes, ${item.cracks_count || 0} Cracks` : 'Road defect logged')}
          </p>
          <div style="font-size: 10px; font-family: monospace; color: #64748b; margin-bottom: 6px;">
            GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
          ${(item.annotated_file_url || item.photo_url || (item.original_file_url && !/\.(mp4|avi|mov|webm)$/i.test(item.original_file_url))) ? `
            <img src="http://localhost:8000${item.annotated_file_url || item.original_file_url || item.photo_url}" 
                 style="width: 100%; height: 95px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" 
                 onerror="this.style.display='none'" />
          ` : ''}
          <div style="font-size: 9px; color: #cbd5e1; font-style: italic;">
            ${item.is_demo_mode ? '• Sample coordinate telemetry' : '• Field Telemetry Recorded'}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onMarkerSelect) onMarkerSelect(item);
      });

      markersLayer.addLayer(marker);
    });

    // Draw road corridor lines if roads supplied
    roads.forEach(r => {
      if (r.start_lat && r.start_lng && r.end_lat && r.end_lng) {
        const polylineColor = r.health_score < 50 ? '#ef4444' : (r.health_score < 75 ? '#f59e0b' : '#10b981');
        const roadLine = L.polyline([
          [r.start_lat, r.start_lng],
          [r.end_lat, r.end_lng]
        ], {
          color: polylineColor,
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 6'
        });
        roadLine.bindPopup(`<b>${r.road_name}</b><br/>Category: ${r.road_category}<br/>Health Score: <b>${r.health_score}/100</b>`);
        markersLayer.addLayer(roadLine);
      }
    });

  }, [items, roads, categoryFilter, severityFilter]);

  // Browser Geolocation Function
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);
    setGpsError(null);
    setUserAddress(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setUserLocation({ lat: userLat, lng: userLng });
        setGpsAccuracy(accuracy);
        setLocatingUser(false);

        // Reverse geocode using Geoapify
        const geo = await reverseGeocode(userLat, userLng);
        const addressLine = geo
          ? [geo.street, geo.suburb, geo.city, geo.district, geo.state].filter(Boolean).join(', ')
          : null;
        setUserAddress(addressLine);

        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        if (!map || !markersLayer) return;

        // Remove previous user markers
        if (userMarkerRef.current) markersLayer.removeLayer(userMarkerRef.current);
        if (userCircleRef.current) markersLayer.removeLayer(userCircleRef.current);

        // Zoom map to user location
        map.setView([userLat, userLng], 15);
        map.invalidateSize();

        // Pulsing Neon User Icon
        const userIcon = L.divIcon({
          className: 'user-live-pin',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #00d4ff; opacity: 0.5;" class="animate-ping"></span>
              <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: #00d4ff; border: 3px solid white; box-shadow: 0 0 15px #00d4ff;"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18]
        });

        const userMarker = L.marker([userLat, userLng], { icon: userIcon });
        userMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #00d4ff; display: inline-block;"></span>
              <strong style="font-size: 12px; color: #00d4ff;">Your Live GPS Location</strong>
            </div>
            ${addressLine ? `<p style="font-size: 11px; color: #e2e8f0; margin: 0 0 4px 0; font-weight: 600;">📍 ${addressLine}</p>` : ''}
            <p style="font-size: 11px; color: #94a3b8; margin: 0 0 4px 0;">
              GPS Coordinates: <b>${userLat.toFixed(5)}, ${userLng.toFixed(5)}</b>
            </p>
            <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
              Estimated Accuracy: ±${accuracy} meters
            </p>
          </div>
        `).openPopup();

        // Accuracy Circle
        const userCircle = L.circle([userLat, userLng], {
          radius: Math.max(accuracy, 25),
          color: '#00d4ff',
          weight: 1,
          fillColor: '#00d4ff',
          fillOpacity: 0.12
        });

        markersLayer.addLayer(userMarker);
        markersLayer.addLayer(userCircle);
        userMarkerRef.current = userMarker;
        userCircleRef.current = userCircle;

        if (onGpsLocated) {
          onGpsLocated({ lat: userLat, lng: userLng, accuracy, address: addressLine });
        }
      },
      (err) => {
        setLocatingUser(false);
        setGpsError(`GPS permission required or timed out (${err.message}). Using Davanagere reference.`);
        console.warn("GPS error:", err);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#17284b] shadow-2xl">
      {/* Top Filter & GPS Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#080f1d]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#17284b]">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#00d4ff]" />
            Type:
          </span>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0d1830] border border-[#17284b] text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#00d4ff]"
          >
            <option value="ALL">All Categories</option>
            <option value="POTHOLE">Potholes Only (D40)</option>
            <option value="CRACK">Cracks Only (D00-D20)</option>
            <option value="WATER">Waterlogging Pockets</option>
          </select>

          <span className="text-[11px] font-semibold text-slate-400 px-1 border-l border-[#17284b] ml-1">
            Severity:
          </span>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0d1830] border border-[#17284b] text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#00d4ff]"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Right toolbar: City jump + Layer switcher + GPS */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* City Quick-Jump */}
          <div className="hidden md:flex items-center bg-[#080f1d]/90 backdrop-blur-md p-1 rounded-xl border border-[#17284b] text-[11px] font-semibold">
            {Object.keys(CITY_PRESETS).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => flyToCity(city)}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-[#00d4ff] hover:bg-[#0d1830] transition-colors"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Tile Layer Switcher */}
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080f1d]/90 backdrop-blur-md border border-[#17284b] hover:border-[#00d4ff]/50 text-xs text-slate-300 font-semibold transition-all"
              title="Switch Map Style"
            >
              <Layers className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span className="hidden sm:inline">{activeLayer}</span>
            </button>
            {layerMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#0a1226] border border-[#17284b] rounded-xl shadow-2xl overflow-hidden z-[1001]">
                {Object.keys(TILE_LAYERS).map(name => (
                  <button
                    key={name}
                    onClick={() => switchTileLayer(name)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                      activeLayer === name 
                        ? 'bg-[#1d63ff]/20 text-[#00d4ff] font-bold' 
                        : 'text-slate-300 hover:bg-[#0d1830]'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>{name}</span>
                    {activeLayer === name && <CheckCircle2 className="w-3 h-3 ml-auto text-[#00d4ff]" />}
                  </button>
                ))}
                <div className="px-3 py-1.5 text-[9px] text-emerald-400 border-t border-[#17284b] font-mono">
                  {MAP_API_KEY ? '✓ Geoapify API Connected' : '✓ Live Map Tiles Active'}
                </div>
              </div>
            )}
          </div>

          {/* User GPS status badge */}
          {userLocation && (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#080f1d]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} (±{gpsAccuracy}m)</span>
            </div>
          )}

          {/* Enable Live GPS Location Button */}
          <button
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <Compass className={`w-4 h-4 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Acquiring Satellites...' : (userLocation ? 'Update My GPS' : 'Enable Live GPS')}</span>
          </button>
        </div>
      </div>

      {/* GPS Notice / Error Banner if denied */}
      {gpsError && (
        <div className="absolute top-16 left-3 right-3 z-[1000] p-2 rounded-xl bg-amber-500/15 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
          <span>{gpsError}</span>
          <button onClick={() => setGpsError(null)} className="underline ml-2">Dismiss</button>
        </div>
      )}

      {/* Reverse Geocode Address Bar */}
      {userAddress && (
        <div className="absolute top-16 left-3 right-3 z-[999] p-2 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">📍 {userAddress}</span>
          <button onClick={() => setUserAddress(null)} className="ml-auto text-emerald-400 underline">Hide</button>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }}
        className="z-0"
      />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#080f1d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#17284b] text-[11px] flex flex-wrap items-center gap-4 text-slate-300">
        {showExtraMarkers ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Pothole (D40)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff]"></span>
              <span>Structural Crack (D00-D20)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Waterlogging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Repaired Section</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
            <span>Live GPS Location</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono border-l border-[#17284b] pl-3 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Live Map + GPS</span>
        </div>
      </div>
    </div>
  );
}
