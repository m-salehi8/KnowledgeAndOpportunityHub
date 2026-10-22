import React, { useId } from 'react';
import { formatPercent } from '../utils/format';

interface JobScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

/**
 * Match-score ring.
 * Bands: ≥ 80 green · ≥ 50 amber · below that neutral grey.
 */
export const JobScoreRing: React.FC<JobScoreRingProps> = ({
  score,
  size = 46,
  strokeWidth = 4,
  showPercent = true,
}) => {
  const rawId = useId();
  const gradientId = `score-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let from = '#8e8e93';
  let to = '#636366';
  let textColor = 'var(--text-secondary)';

  if (clampedScore >= 80) {
    from = '#30d158';
    to = '#248a3d';
    textColor = 'var(--success)';
  } else if (clampedScore >= 50) {
    from = '#ff9f0a';
    to = '#c93400';
    textColor = 'var(--warning)';
  }

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      title={`امتیاز تطابق: ${clampedScore}٪`}
      aria-label={`امتیاز تطابق ${clampedScore} درصد`}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
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
          stroke="var(--fill-tertiary)"
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
        />
      </svg>
      <div
        dir="rtl"
        className="absolute inset-0 flex select-none items-center justify-center font-bold tabular"
        style={{ fontSize: size * 0.26, color: textColor }}
      >
        <span>{showPercent ? formatPercent(clampedScore) : clampedScore}</span>
      </div>
    </div>
  );
};
