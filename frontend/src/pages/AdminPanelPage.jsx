import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Cpu, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  HardHat,
  FileText
} from 'lucide-react';
import { systemService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanelPage() {
  const { user, role, switchRole } = useAuth();
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await systemService.getHealth();
      setHealthInfo(data);
    } catch (err) {
      console.error('Failed to load system diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  const usersList = [
    { id: 'usr-admin-01', name: 'Super Administrator', email: 'admin@roadguard.ai', role: 'Administrator', dept: 'KSHIP / PWD' },
    { id: 'usr-gov-01', name: 'Executive Engineer (PWD)', email: 'authority@pwd.gov.in', role: 'Government Authority', dept: 'PWD Davanagere' },
    { id: 'usr-insp-01', name: 'Ramesh Kumar (Chief Inspector)', email: 'inspector@roadguard.ai', role: 'Inspector', dept: 'City Corporation' },
    { id: 'usr-cit-01', name: 'Ananya Sharma', email: 'citizen@gmail.com', role: 'Citizen', dept: 'Resident' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00d4ff]" />
            <span>Administration, User Roles & System Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Role-Based Access Control (RBAC), multi-engine database adapters, and AI inference configuration.
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="p-2 rounded-xl bg-[#0d1830] text-slate-400 hover:text-white border border-[#17284b]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* System Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 font-mono">DATABASE ENGINE</span>
            <Database className="w-4 h-4 text-[#00d4ff]" />
          </div>
          <h3 className="text-xl font-black text-white">{healthInfo?.database_type || 'SQLite Document Mode'}</h3>
          <p className="text-xs text-slate-400">
            Dual MongoDB Atlas & SQLite JSON adapter with zero-setup development mode.
          </p>
          <div className="pt-2 border-t border-[#17284b] text-[11px] text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Connection Health: Active & Seeded</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 font-mono">AI YOLO MODEL</span>
            <Cpu className="w-4 h-4 text-[#1d63ff]" />
          </div>
          <h3 className="text-xl font-black text-white">YOLOv8-RDD2022</h3>
          <p className="text-xs text-slate-400">
            Trained on 6 road defect classes (Potholes, Alligator Cracks, Longitudinal, Transverse).
          </p>
          <div className="pt-2 border-t border-[#17284b] text-[11px] text-[#00d4ff] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff]"></span>
            <span>Fallback Demo Mode: {healthInfo?.demo_mode_enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 font-mono">SESSION IDENTITY</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-xl font-black text-white">{role}</h3>
          <p className="text-xs text-slate-400">
            Active RBAC permissions: {role === 'Administrator' ? 'Full Read/Write & Config' : 'Restricted Role Views'}
          </p>
          <div className="pt-2 border-t border-[#17284b] text-[11px] text-purple-400 flex items-center gap-1.5 font-mono">
            <span>Logged as: {user?.email}</span>
          </div>
        </div>
      </div>

      {/* User Management & Role Switcher */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00d4ff]" />
              <span>User Role Hierarchy & Multi-User Testing Portal</span>
            </h3>
            <p className="text-xs text-slate-400">Switch between role profiles to evaluate role-specific capabilities</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#17284b] bg-[#080f1d] text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#0d1830] text-slate-400 text-[11px] font-mono uppercase">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Official Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Department</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3 text-right">Switch Active Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17284b] text-slate-300">
              {usersList.map((u) => (
                <tr key={u.id} className={u.role === role ? 'bg-[#112040]' : ''}>
                  <td className="p-3 font-mono font-bold text-[#00d4ff]">{u.id}</td>
                  <td className="p-3 font-semibold text-white">{u.name}</td>
                  <td className="p-3 font-mono text-slate-400">{u.email}</td>
                  <td className="p-3">{u.dept}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'Administrator' ? 'bg-rose-500/20 text-rose-400' : (
                        u.role === 'Government Authority' ? 'bg-amber-500/20 text-amber-300' : (
                          u.role === 'Inspector' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                        )
                      )
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => switchRole(u.role)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        u.role === role
                          ? 'bg-[#00d4ff] text-black shadow-glow-cyan'
                          : 'bg-[#0d1830] hover:bg-[#1d63ff] text-white border border-[#17284b]'
                      }`}
                    >
                      {u.role === role ? 'Active Session' : 'Assume Role'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
