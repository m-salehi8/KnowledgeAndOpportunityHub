import React, { useId } from 'react';
import { formatPercent, toPersianDigits } from '../utils/format';

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
  const rawId = useId();
  const gradientId = `score-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let from = '#34D399';
  let to = '#10B981';
  let textClass = 'text-emerald-300';
  let glow = 'rgba(16,185,129,0.55)';

  if (clampedScore < 70) {
    from = '#FBBF24';
    to = '#F59E0B';
    textClass = 'text-amber-300';
    glow = 'rgba(245,158,11,0.5)';
  } else if (clampedScore < 85) {
    from = '#A5B4FC';
    to = '#818CF8';
    textClass = 'text-indigo-300';
    glow = 'rgba(129,140,248,0.5)';
  }

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.14), rgba(2,6,23,0.42) 70%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 16px -4px ${glow}`,
      }}
      title={`Match Score: ${clampedScore}%`}
    >
      <svg width={size} height={size} className="-rotate-90 transform-gpu overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${glow})` }}
        />
      </svg>
      <div
        dir="rtl"
        className={`absolute inset-0 flex select-none items-center justify-center font-bold ${textClass}`}
        style={{ fontSize: size * 0.28 }}
      >
        <span>{showPercent ? formatPercent(clampedScore) : toPersianDigits(clampedScore)}</span>
      </div>
    </div>
  );
};
