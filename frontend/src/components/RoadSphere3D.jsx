import React from 'react';

export default function RoadSphere3D() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Ambient Orange Sphere Aura */}
      <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#FF572E]/25 blur-[95px] pointer-events-none" />

      {/* Central 3D Glass Sphere */}
      <div
        className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border border-[#FF713D]/60 shadow-[0_0_55px_rgba(255,87,46,0.38),inset_0_0_45px_rgba(255,113,61,0.28)]"
        style={{
          background:
            'radial-gradient(circle at 30% 25%, rgba(255, 170, 85, 0.22), rgba(21, 19, 26, 0.88) 58%, rgba(8, 9, 13, 0.96) 100%)',
        }}
      >
        {/* Inner Rotating Miniature Indian Road Network */}
        <div
          className="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center"
          style={{ transform: 'rotateX(52deg) rotateZ(-18deg)' }}
        >
          <div className="relative w-60 h-60 rounded-full bg-[#15131A] border border-[#FF713D]/30 shadow-inner flex items-center justify-center">
            {/* Horizontal & Vertical Asphalt Roads */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-[#231B20] border-y border-[#FFAA55]/40" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 bg-[#231B20] border-x border-[#FFAA55]/40" />

            {/* Dashed Lane Markings */}
            <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="w-5 h-0.5 bg-[#F5F2EF]/60 rounded-full" />
              ))}
            </div>

            {/* Miniature Vehicles */}
            <div className="absolute left-8 top-[46%] w-4 h-2.5 rounded-sm bg-[#FFAA55] shadow-[0_0_8px_#FFAA55]" />
            <div className="absolute right-10 top-[52%] w-4 h-2.5 rounded-sm bg-[#F5F2EF] shadow-[0_0_8px_#F5F2EF]" />

            {/* Trees / Infrastructure */}
            <div className="absolute top-6 left-8 w-4 h-4 rounded-full bg-emerald-700/70 border border-emerald-400/40" />
            <div className="absolute bottom-7 right-8 w-5 h-5 rounded-full bg-emerald-700/70 border border-emerald-400/40" />

            {/* Pothole & Glowing Orange Damage Marker */}
            <div className="absolute left-[48%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-9 h-7 rounded-full bg-[#08090D] border-2 border-[#FF572E] shadow-[0_0_16px_#FF572E]">
              <span className="absolute inset-0 rounded-full bg-[#FF572E]/40 animate-ping" />
            </div>
          </div>
        </div>

        {/* Animated Orange Scanning Beam */}
        <div className="animate-scan-sweep absolute inset-x-0 top-1/2 h-10 bg-gradient-to-b from-transparent via-[#FF713D]/35 to-transparent border-y border-[#FFAA55]/60 pointer-events-none" />

        {/* Glass Specular Reflection */}
        <div
          className="absolute top-4 left-7 w-24 h-12 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.28), transparent)',
            transform: 'rotate(-24deg)',
          }}
        />
      </div>

      {/* Circular Futuristic 3D Platform with Glowing Orange Rings */}
      <div className="relative -mt-5 flex items-center justify-center">
        <div
          className="w-60 h-14 rounded-[100%] border-2 border-[#FF713D]/70 bg-gradient-to-b from-[#231B20]/90 to-[#08090D] shadow-[0_12px_35px_rgba(255,87,46,0.45)]"
          style={{ transform: 'rotateX(65deg)' }}
        />
        <div
          className="absolute w-72 h-16 rounded-[100%] border border-[#FFAA55]/40 pointer-events-none"
          style={{ transform: 'rotateX(65deg)' }}
        />
      </div>
    </div>
  );
}
