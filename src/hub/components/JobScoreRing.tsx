// @ts-nocheck
import React from 'react';
import { formatPercent } from '../utils/format';

interface JobScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

/**
 * Match-score ring.
 * Neutral track, single accent colour for the arc — no bands, no gradient.
 */
export const JobScoreRing: React.FC<JobScoreRingProps> = ({
  score,
  size = 46,
  strokeWidth = 4,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      title={`امتیاز تطابق: ${clampedScore}٪`}
      aria-label={`امتیاز تطابق ${clampedScore} درصد`}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--fill-tertiary)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        dir="rtl"
        className="absolute inset-0 flex select-none items-center justify-center font-bold tabular"
        style={{ fontSize: size * 0.26, color: 'var(--text-primary)' }}
      >
        <span>{showPercent ? formatPercent(clampedScore) : clampedScore}</span>
      </div>
    </div>
  );
};
