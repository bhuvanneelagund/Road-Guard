import React, { useState } from 'react';
import { ScanSearch, MapPin, ShieldAlert, Activity, Cpu } from 'lucide-react';

export default function HeroScene3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative w-full h-[420px] sm:h-[470px] perspective-1200 flex items-center justify-center select-none"
    >
      {/* Ambient 3D Glows */}
      <div className="absolute w-72 h-72 rounded-full bg-[#1d63ff]/25 blur-[110px] -top-4 right-8 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-[#00d4ff]/20 blur-[95px] bottom-0 left-6 pointer-events-none" />
      <div className="absolute w-44 h-44 rounded-full bg-violet-600/20 blur-[90px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* 3D Interactive Stage */}
      <div
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 250ms ease-out',
        }}
        className="relative w-full max-w-[460px] h-[360px] preserve-3d flex items-center justify-center"
      >
        {/* Miniature 3D Indian Road Segment */}
        <div
          style={{
            transform: 'rotateX(56deg) rotateZ(-18deg) translateY(38px)',
            boxShadow: '0 35px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 212, 255, 0.15)',
          }}
          className="relative w-[330px] sm:w-[370px] h-[220px] rounded-2xl bg-gradient-to-br from-[#1b2232] via-[#121824] to-[#090d16] border border-[#00d4ff]/35 overflow-hidden"
        >
          {/* Road Shoulder & Lane Markings */}
          <div className="absolute inset-x-0 top-3 h-1 bg-amber-400/60" />
          <div className="absolute inset-x-0 bottom-3 h-1 bg-amber-400/60" />
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-1.5 bg-slate-200/70 rounded-full" />
            ))}
          </div>

          {/* Realistic 3D Pothole & Damage Zone */}
          <div className="absolute left-[46%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-24 h-16 rounded-[45%] bg-[#04060a] border-2 border-rose-500/80 shadow-[inset_0_8px_16px_rgba(0,0,0,0.95),0_0_20px_rgba(244,63,94,0.45)]">
            <div className="absolute inset-2 rounded-[45%] border border-rose-400/40 bg-gradient-to-b from-slate-900/40 to-black" />
          </div>

          {/* AI Bounding Box Overlay on Road */}
          <div className="absolute left-[46%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-28 h-20 border-2 border-[#00d4ff] rounded-lg shadow-[0_0_18px_rgba(0,212,255,0.65)]" />

          {/* Sweeping Blue AI Scan Beam */}
          <div className="animate-scan-sweep absolute inset-x-0 top-1/2 h-10 bg-gradient-to-b from-transparent via-[#00d4ff]/35 to-transparent border-y border-[#00d4ff]/60 pointer-events-none" />
        </div>

        {/* Floating 3D AI Scanner Drone / Camera Unit */}
        <div className="animate-float-slow absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="px-4 py-2.5 rounded-2xl glass-3d border border-[#00d4ff]/50 shadow-glow-cyan flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00d4ff] font-bold tracking-wider">AI VISION SCANNER</div>
              <div className="text-[11px] text-white font-semibold">YOLOv8 + OpenCV Active</div>
            </div>
          </div>
          {/* Vertical Laser Cone */}
          <div className="w-32 h-24 bg-gradient-to-b from-[#00d4ff]/30 via-[#1d63ff]/10 to-transparent clip-path-cone pointer-events-none" style={{ clipPath: 'polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)' }} />
        </div>

        {/* Floating Glass Card: GPS Coordinates */}
        <div className="animate-float-slow absolute top-20 -left-2 sm:left-0 px-3.5 py-2.5 rounded-xl glass-3d border border-[#00d4ff]/35 shadow-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00d4ff] font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>LIVE GPS TELEMETRY</span>
          </div>
          <div className="text-xs font-mono text-white font-bold mt-0.5">12.9716° N, 77.5946° E</div>
          <div className="text-[10px] text-slate-400">Bengaluru Arterial Corridor</div>
        </div>

        {/* Floating Glass Card: Detection & Severity */}
        <div className="animate-float-slow absolute bottom-6 -right-1 sm:right-0 px-3.5 py-2.5 rounded-xl glass-3d border border-rose-500/40 shadow-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>POTHOLE D40 DETECTED</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div>
              <div className="text-[10px] text-slate-400">Severity</div>
              <div className="text-xs font-bold text-rose-400">HIGH PRIORITY</div>
            </div>
            <div className="h-6 w-px bg-[#17284b]" />
            <div>
              <div className="text-[10px] text-slate-400">Road Health</div>
              <div className="text-xs font-bold text-[#00d4ff] flex items-center gap-1">
                <Activity className="w-3 h-3" /> 42/100
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
