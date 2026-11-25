import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanSearch, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Sliders, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  CloudRain, 
  HardHat, 
  Settings, 
  LogOut,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigationItems = [
  { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Damage Detection', path: '/detections', icon: ScanSearch, badge: 'YOLOv8' },
  { name: 'GPS Damage Map', path: '/map', icon: MapPin },
  { name: 'Road Health Passport', path: '/roads', icon: FileText },
  { name: 'Priority & Risk Engine', path: '/priority', icon: Sliders },
  { name: 'Citizen Complaints', path: '/citizen-report', icon: ShieldAlert },
  { name: 'Repair Verification', path: '/verification', icon: Sparkles },
  { name: 'AI Cost Estimator', path: '/cost-estimator', icon: Calculator },
  { name: 'Degradation Prediction', path: '/prediction', icon: TrendingUp },
  { name: 'Waterlogging & Flood', path: '/waterlogging', icon: CloudRain },
  { name: 'Contractor Management', path: '/contractors', icon: HardHat },
  { name: 'Administration Panel', path: '/admin', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, switchRole, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-[#080f1d] border-r border-[#17284b] 
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#17284b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center shadow-glow-cyan">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-1.5">
                ROADGUARD <span className="text-[#00d4ff]">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">INDIA INFRASTRUCTURE</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Indicator */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg bg-[#0d1830] border border-[#1d3557] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00d4ff]"></span>
            </span>
            <span className="text-xs text-slate-300 font-medium">Inference Engine</span>
          </div>
          <span className="text-[11px] font-mono text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/30">
            RDD2022
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#1d63ff]/20 to-[#00d4ff]/10 text-white border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-[#0e1b38] border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#00d4ff] transition-colors" />
                  <span>{item.name}</span>
                </div>
                
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1d63ff]/20 text-[#00d4ff] border border-[#1d63ff]/40">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User & Role Switcher Footer */}
        <div className="p-4 border-t border-[#17284b] bg-[#060b13]">
          <div className="mb-3">
            <label className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
              Active Access Role (Demo)
            </label>
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full bg-[#0d1830] border border-[#17284b] text-xs text-[#00d4ff] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="Administrator">Administrator (Super User)</option>
              <option value="Government Authority">Government Authority (PWD)</option>
              <option value="Inspector">Inspector (Field Chief)</option>
              <option value="Citizen">Citizen (Public Reporter)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#17284b]/60">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-[#1d63ff]/30 border border-[#00d4ff]/40 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
