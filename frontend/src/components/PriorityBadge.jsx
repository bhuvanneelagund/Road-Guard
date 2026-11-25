import React from 'react';

export default function PriorityBadge({ tier = "Low Priority", size = "normal" }) {
  const isHigh = tier.toLowerCase().includes("high") || tier.toLowerCase().includes("critical");
  const isMed = tier.toLowerCase().includes("medium") || tier.toLowerCase().includes("moderate");

  let colorClasses = "bg-cyan-500/10 text-[#00d4ff] border-cyan-500/30";
  let dotColor = "bg-[#00d4ff]";

  if (isHigh) {
    colorClasses = "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
    dotColor = "bg-rose-500 animate-pulse";
  } else if (isMed) {
    colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/40";
    dotColor = "bg-amber-400";
  }

  const padding = size === "small" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${padding} ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{tier}</span>
    </span>
  );
}
