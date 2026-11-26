import React, { useRef, useState } from 'react';

export default function FloatingAnalyticsPanel({ title, badge, children, className = '' }) {
  const panelRef = useRef(null);
  const [transform, setTransform] = useState('perspective(900px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 10;
    const rx = (0.5 - y) * 10;
    setTransform(`perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`);
  };

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransform('perspective(900px) rotateX(0deg) rotateY(0deg)')}
      style={{ transform, transition: 'transform 200ms ease-out' }}
      className={`glass-orange rounded-2xl p-3.5 shadow-2xl ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFAA55]">
          {title}
        </span>
        {badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FF572E]/20 text-[#FF713D] border border-[#FF713D]/40">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
