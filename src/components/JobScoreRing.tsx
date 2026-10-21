import React from 'react';

interface JobScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

export const JobScoreRing: React.FC<JobScoreRingProps> = ({
  score,
  size = 46,
  strokeWidth = 3.5,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color scheme depending on score
  let strokeColor = '#10B981'; // green for 85+
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10';

  if (clampedScore < 70) {
    strokeColor = '#F59E0B'; // amber
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
  } else if (clampedScore < 85) {
    strokeColor = '#818CF8'; // indigo
    textColor = 'text-indigo-400';
    bgColor = 'bg-indigo-500/10';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full ${bgColor}`}
      style={{ width: size, height: size }}
      title={`Match Score: ${clampedScore}%`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform-gpu overflow-visible"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        dir="ltr"
        className={`absolute inset-0 flex items-center justify-center ${textColor} font-bold select-none`}
        style={{ fontSize: size * 0.28 }}
      >
        <span>{clampedScore}</span>
        {showPercent && <span className="text-[9px] opacity-80 ms-0.5">%</span>}
      </div>
    </div>
  );
};
