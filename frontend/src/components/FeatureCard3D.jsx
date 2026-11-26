import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function FeatureCard3D({ title, description, icon: Icon, to }) {
  return (
    <Link to={to} className="block group">
      <TiltCard3D className="p-6 h-full flex flex-col justify-between transition-all">
        <div>
          <div className="w-12 h-12 rounded-xl bg-[#15131A] border border-[#FF713D]/50 flex items-center justify-center mb-4 shadow-glow-orange group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6 text-[#FF713D]" />
          </div>
          <h3 className="text-base font-bold text-[#F5F2EF] mb-2 group-hover:text-[#FFAA55] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[#B8B2B0] leading-relaxed">{description}</p>
        </div>
        <div className="mt-5 pt-3 border-t border-[#FF713D]/25 flex items-center justify-between text-xs font-semibold text-[#FF713D]">
          <span>Open Module</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </TiltCard3D>
    </Link>
  );
}
