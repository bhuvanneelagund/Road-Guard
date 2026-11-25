import React, { useState, useEffect } from 'react';
import { Menu, Mic, Bell, PlusCircle, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemService } from '../services/api';
import VoiceReporterModal from './VoiceReporterModal';

export default function Header({ onMenuClick, title = "Platform Overview" }) {
  const { user, role } = useAuth();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [sysHealth, setSysHealth] = useState({ database_type: "Connecting...", ai_weights_available: false });

  useEffect(() => {
    systemService.getHealth()
      .then(res => setSysHealth(res))
      .catch(() => setSysHealth({ database_type: "SQLite Dev Mode", ai_weights_available: false }));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#080f1d]/90 backdrop-blur-md border-b border-[#17284b] px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-[#0d1830] border border-[#17284b] text-slate-300 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">{title}</h2>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>RoadGuard AI</span>
              <span>/</span>
              <span className="text-[#00d4ff]">{role} Workspace</span>
            </div>
          </div>
        </div>

        {/* Right: Actions and Live Diagnostics */}
        <div className="flex items-center gap-3">
          {/* Database indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1830] border border-[#17284b] text-xs">
            <Database className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span className="text-slate-300 font-medium">{sysHealth.database_type || "Dual Engine DB"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>

          {/* AI Model indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1830] border border-[#17284b] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1d63ff]" />
            <span className="text-slate-300">RDD2022 AI</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${sysHealth.ai_weights_available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
              {sysHealth.ai_weights_available ? 'YOLO Weights' : 'Active Demo Pipeline'}
            </span>
          </div>

          {/* Multilingual Voice Complaint Trigger */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-semibold shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Report (5 Languages)</span>
            <span className="sm:hidden">Voice</span>
          </button>

          {/* Quick scan CTA */}
          <Link
            to="/detections"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#112247] hover:bg-[#162c5c] border border-[#23427f] text-slate-200 text-xs font-medium transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#00d4ff]" />
            <span>Scan Road</span>
          </Link>
        </div>
      </div>

      {/* Voice Reporter Modal */}
      {voiceModalOpen && (
        <VoiceReporterModal onClose={() => setVoiceModalOpen(false)} />
      )}
    </header>
  );
}
