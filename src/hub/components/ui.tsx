// @ts-nocheck
import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { hapticTap } from '../utils/haptics';
import { toPersianDigits } from '../utils/format';

/* ------------------------------------------------------------------ */
/* Motion presets                                                       */
/* ------------------------------------------------------------------ */
export const SPRING = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.7,
} as const;

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.6,
} as const;

export const TWEEN_FAST = { duration: 0.18, ease: [0.32, 0.72, 0, 1] as const };
export const TWEEN_PAGE = { duration: 0.24, ease: [0.32, 0.72, 0, 1] as const };

/* ------------------------------------------------------------------ */
/* Pressable                                                            */
/* ------------------------------------------------------------------ */
interface PressableProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  scale?: number;
  withHaptic?: boolean;
}

export const Pressable: React.FC<PressableProps> = ({
  scale = 0.97,
  withHaptic = true,
  onClick,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileTap={reduce ? undefined : { scale }}
      transition={SPRING}
      onClick={(event) => {
        if (withHaptic) hapticTap();
        onClick?.(event);
      }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
};

/* ------------------------------------------------------------------ */
/* Segmented control — mirrors UISegmentedControl                       */
/* ------------------------------------------------------------------ */
export type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export interface SegmentedItem<T extends string> {
  id: T;
  label: string;
  icon?: IconComponent;
}

interface SegmentedProps<T extends string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedProps<T>) {
  const groupId = useId();

  return (
    <div
      className={`ios-seg ${className}`}
      role="tablist"
      aria-label={ariaLabel}
      dir="rtl"
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${groupId}-${item.id}`}
            aria-selected={active}
            data-active={active}
            onClick={() => {
              if (!active) {
                hapticTap();
                onChange(item.id);
              }
            }}
            className="ios-seg-item"
          >
            {active && (
              <motion.span
                layoutId={`seg-thumb-${groupId}`}
                className="ios-seg-thumb"
                transition={SPRING_SNAPPY}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5 truncate">
              {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
              <span className="truncate">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip                                                                 */
/* ------------------------------------------------------------------ */
interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  tone = 'neutral',
  onClick,
  children,
  className = '',
  ...rest
}) => (
  <button
    type="button"
    data-active={active}
    data-tone={tone}
    onClick={(event) => {
      hapticTap();
      onClick?.(event);
    }}
    className={`ios-chip ios-press-sm ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Switch — iOS UISwitch look                                           */
/* ------------------------------------------------------------------ */
interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled }) => {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-on={checked}
      onClick={() => {
        hapticTap();
        onChange(!checked);
      }}
      className="ios-switch"
    >
      {/* RTL layout: the knob starts on the right and travels left when on */}
      <motion.span
        className="ios-switch-knob"
        animate={{ x: checked ? -20 : 0 }}
        transition={reduce ? { duration: 0 } : SPRING}
      />
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Section header                                                       */
/* ------------------------------------------------------------------ */
export const SectionHeader: React.FC<{
  title: string;
  caption?: string;
  action?: React.ReactNode;
}> = ({ title, caption, action }) => (
  <div className="mb-2 flex items-end justify-between gap-3 px-1">
    <div className="min-w-0">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {title}
      </h2>
      {caption && <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">{caption}</p>}
    </div>
    {action}
  </div>
);

/* ------------------------------------------------------------------ */
/* Empty state                                                          */
/* ------------------------------------------------------------------ */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--fill-quaternary)] text-[var(--text-tertiary)]">
      {icon}
    </div>
    <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-[280px] text-[13px] leading-[1.7] text-[var(--text-secondary)]">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Progress ring (used by the daily digest card)                        */
/* ------------------------------------------------------------------ */
interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: 'accent' | 'success' | 'warning';
  label?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 56,
  strokeWidth = 5,
  tone = 'accent',
  label,
}) => {
  const rawId = useId();
  const gradientId = `ring-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const colors = {
    accent: ['#0a84ff', '#0060df'],
    success: ['#30d158', '#248a3d'],
    warning: ['#ff9f0a', '#c93400'],
  }[tone];

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--fill-tertiary)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={SPRING}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[var(--text-primary)] tabular">
        {label ?? `${toPersianDigits(Math.round(clamped))}٪`}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Icon badge                                                           */
/* ------------------------------------------------------------------ */
export const IconBadge: React.FC<{
  children: React.ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: number;
}> = ({ children, tone = 'neutral', size = 34 }) => {
  const tones: Record<string, string> = {
    accent: 'background:var(--accent-soft);color:var(--accent)',
    success: 'background:var(--success-soft);color:var(--success)',
    warning: 'background:var(--warning-soft);color:var(--warning)',
    danger: 'background:var(--danger-soft);color:var(--danger)',
    neutral: 'background:var(--fill-quaternary);color:var(--text-secondary)',
  };

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[10px]"
      style={{ width: size, height: size, ...parseTone(tones[tone]) }}
    >
      {children}
    </span>
  );
};

const parseTone = (style: string) => {
  const out: Record<string, string> = {};
  style.split(';').forEach((chunk) => {
    const [key, value] = chunk.split(':');
    if (key && value) out[key.trim()] = value.trim();
  });
  return out;
};

/* ------------------------------------------------------------------ */
/* Action sheet (UIAlertController style)                              */
/* ------------------------------------------------------------------ */
export interface ActionSheetOption {
  id: string;
  label: string;
  destructive?: boolean;
  selected?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  onSelect: (id: string) => void;
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  open,
  onClose,
  title,
  message,
  options,
  onSelect,
  cancelLabel = 'انصراف',
}) => {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end px-3 pb-3" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={reduce ? { duration: 0.01 } : SPRING}
            role="menu"
            aria-label={title}
            className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[14px] ios-sheet"
          >
            {(title || message) && (
              <div className="px-4 pb-3 pt-4 text-center">
                {title && (
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</p>
                )}
                {message && (
                  <p className="mt-1 text-[11px] leading-[1.6] text-[var(--text-secondary)]">
                    {message}
                  </p>
                )}
              </div>
            )}

            <div className="border-t-0.5px border-[var(--separator)]">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    hapticTap();
                    onSelect(option.id);
                  }}
                  className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-2 text-center text-[15px] transition-colors active:bg-[var(--grouped-card-pressed)]"
                  style={{
                    color: option.destructive ? 'var(--danger)' : 'var(--accent)',
                    fontWeight: option.selected ? 600 : 400,
                  }}
                >
                  <span className="mx-auto truncate">{option.label}</span>
                  {option.selected && (
                    <span className="absolute end-4 text-[var(--accent)]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={reduce ? { duration: 0.01 } : SPRING}
            onClick={onClose}
            className="relative mx-auto mt-2 min-h-[44px] w-full max-w-[400px] rounded-[14px] ios-sheet text-[15px] font-semibold text-[var(--accent)]"
          >
            {cancelLabel}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ */
/* Generic bottom sheet                                                 */
/* ------------------------------------------------------------------ */
export interface SheetDetent {
  id: string;
  ratio: number;
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  detents?: SheetDetent[];
  initialDetent?: string;
  onDetentChange?: (id: string) => void;
  ariaLabel?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  children,
  header,
  footer,
  detents,
  initialDetent,
  onDetentChange,
  ariaLabel,
}) => {
  const reduce = useReducedMotion();
  const dragState = useRef<{ startY: number; offset: number } | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [activeDetent, setActiveDetent] = React.useState(initialDetent ?? detents?.[0]?.id);

  useEffect(() => {
    if (open) {
      setDragOffset(0);
      setActiveDetent(initialDetent ?? detents?.[0]?.id);
    }
  }, [open, initialDetent, detents]);

  const currentRatio =
    detents?.find((d) => d.id === activeDetent)?.ratio ?? detents?.[0]?.ratio ?? 0.6;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 380, damping: 34 }}
            className="relative flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[24px] ios-sheet"
            style={{ height: `${currentRatio * 100}dvh` }}
          >
            <div
              className="shrink-0 touch-none"
              onPointerDown={(e) => {
                dragState.current = { startY: e.clientY, offset: 0 };
              }}
              onPointerMove={(e) => {
                if (!dragState.current) return;
                const delta = Math.max(0, e.clientY - dragState.current.startY);
                dragState.current.offset = delta;
                setDragOffset(delta);
              }}
              onPointerUp={() => {
                const delta = dragState.current?.offset ?? 0;
                dragState.current = null;
                setDragOffset(0);
                if (delta > 110) onClose();
              }}
            >
              <div className="ios-sheet-handle" />
              {header}
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</div>

            {footer && (
              <div className="shrink-0 border-t-0.5px border-[var(--glass-border)] px-4 pb-safe pt-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
