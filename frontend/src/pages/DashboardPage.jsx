import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  Layers, 
  ShieldAlert, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  ChevronRight,
  TrendingUp,
  ScanSearch,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import MapView from '../components/MapView';
import { dashboardService, roadService, detectionService } from '../services/api';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [roads, setRoads] = useState([]);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [stats, act, rdList, detList] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(),
          roadService.listRoads(),
          detectionService.listDetections({ limit: 20 })
        ]);
        setStatsData(stats);
        setActivityData(act);
        setRoads(rdList);
        setDetections(detList);
      } catch (err) {
        console.error('Error fetching dashboard records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const stats = statsData?.stats || {
    total_detected_defects: 0,
    total_potholes: 0,
    total_cracks: 0,
    high_priority_locations: 0,
    pending_complaints: 0,
    repaired_road_sections: 0,
    total_inspected_roads: 0
  };

  const charts = statsData?.charts || {
    road_condition: [],
    damage_categories: [],
    repair_status: []
  };

  const highRiskRoads = activityData?.high_risk_roads || [];
  const recentDetections = activityData?.recent_detections || [];
  const latestComplaints = activityData?.latest_complaints || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1830] via-[#0f2144] to-[#0d1830] border border-[#1d63ff]/40 flex flex-wrap items-center justify-between gap-4 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d63ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>National Road Health Telemetry Feed Active</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LIVE DB SYNC
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Monitoring 5 major district corridors in Davanagere urban network. Priority triage refreshed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/detections"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>Launch YOLO Detection</span>
          </Link>
        </div>
      </div>

      {/* Primary 7 Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Road Defects"
          value={loading ? "..." : stats.total_detected_defects}
          subtitle="Identified across road scans"
          icon={AlertTriangle}
          accentColor="rose"
          badge="SURVEYED"
        />

        <StatCard
          title="Potholes (D40)"
          value={loading ? "..." : stats.total_potholes}
          subtitle="Wheel rim & skidding risk"
          icon={AlertTriangle}
          accentColor="rose"
          trend="+12% this month"
          trendUp={false}
        />

        <StatCard
          title="Structural Cracks"
          value={loading ? "..." : stats.total_cracks}
          subtitle="Alligator, linear, transverse"
          icon={Layers}
          accentColor="amber"
          badge="D00-D20"
        />

        <StatCard
          title="High Priority Sites"
          value={loading ? "..." : stats.high_priority_locations}
          subtitle="Immediate 48h repair window"
          icon={ShieldAlert}
          accentColor="rose"
          badge="ACTION REQUIRED"
        />

        <StatCard
          title="Pending Complaints"
          value={loading ? "..." : stats.pending_complaints}
          subtitle="Citizen reports under review"
          icon={Clock}
          accentColor="cyan"
          trend="3 assigned"
          trendUp={true}
        />

        <StatCard
          title="Repaired Sections"
          value={loading ? "..." : stats.repaired_road_sections}
          subtitle="Human & CV verified"
          icon={CheckCircle2}
          accentColor="emerald"
          badge="VERIFIED"
        />

        <StatCard
          title="Inspected Roads"
          value={loading ? "..." : stats.total_inspected_roads}
          subtitle="With digital Health Passport"
          icon={FileText}
          accentColor="electric"
          badge="ACTIVE"
        />

        <StatCard
          title="Contractor Rating"
          value="4.5 / 5.0"
          subtitle="3 licensed engineering firms"
          icon={TrendingUp}
          accentColor="cyan"
          badge="PWD GRADE"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Condition Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Road Condition Index</h4>
              <p className="text-[11px] text-slate-400">Health score distribution (0-100 scale)</p>
            </div>
            <span className="text-[10px] font-mono text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded">
              PASSPORTS
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.road_condition}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.road_condition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1830', borderColor: '#1d63ff', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(val) => <span className="text-[11px] text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Damage Category Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Road Damage Classification</h4>
              <p className="text-[11px] text-slate-400">Count of defects cataloged by RDD2022 AI taxonomy</p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              YOLOv8 DETECTIONS
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.damage_categories} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#17284b" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1830', borderColor: '#00d4ff', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {charts.damage_categories.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={entry.fill || '#00d4ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Map Preview with Real GPS Telemetry */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00d4ff]" />
              <span>Interactive GPS Hazard Map Preview</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Live coordinates mapped across Davanagere corridors with OpenStreetMap layer
            </p>
          </div>

          <Link
            to="/map"
            className="text-xs text-[#00d4ff] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Fullscreen Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <MapView 
          items={[...detections, ...latestComplaints]} 
          roads={roads}
          height="380px"
        />
      </div>

      {/* Two Column Section: High-Risk Roads & Latest Citizen Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Road List */}
        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Urgent Repair Priority Roads</span>
              </h4>
              <p className="text-[11px] text-slate-400">Ranked by damage severity, schools, hospitals, and waterlogging</p>
            </div>

            <Link to="/priority" className="text-xs text-[#00d4ff] hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {highRiskRoads.map((road) => (
              <div 
                key={road.id} 
                className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] hover:border-[#1d63ff]/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{road.name}</span>
                    <PriorityBadge tier={road.priority} size="small" />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Health: <span className="font-bold text-white">{road.health_score}/100</span> • Potholes: <span className="text-rose-400 font-bold">{road.potholes}</span> • Cracks: {road.cracks}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono italic truncate">
                    {road.reasons?.[0] || 'Standard monitoring'}
                  </p>
                </div>

                <Link
                  to="/roads"
                  className="px-3 py-1.5 rounded-lg bg-[#0d1830] hover:bg-[#112247] border border-[#17284b] text-[11px] text-[#00d4ff] font-semibold shrink-0"
                >
                  Passport
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Complaints Feed */}
        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00d4ff]" />
                <span>Recent Citizen Complaints</span>
              </h4>
              <p className="text-[11px] text-slate-400">Multi-channel submissions with voice transcripts</p>
            </div>

            <Link to="/citizen-report" className="text-xs text-[#00d4ff] hover:underline font-semibold">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {latestComplaints.map((c) => (
              <div 
                key={c.id} 
                className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {c.status}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-white">{c.damage_type}</h5>
                  <p className="text-[11px] text-slate-300 line-clamp-1">{c.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#17284b]/60">
                  <span>{c.road_name}</span>
                  <span className="font-mono">{c.language_used || 'Voice'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
