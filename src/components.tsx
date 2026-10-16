import React, { useState, useEffect, useRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type CSSProperties, type HTMLAttributes } from 'react';

/* ==========================================================================
   M3 Primitive Components — Material Design 3 (Expressive)
   Only official M3 components. No invented patterns.
   ========================================================================== */

/* ---------- State Layer Utility ---------- */
function stateLayer(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
}

/* ==========================================================================
   Top App Bar (M3 — Center-aligned, Expressive)
   ========================================================================== */
interface TopAppBarProps {
  headline: string;
  supportingText?: string;
  navigationIcon?: ReactNode;
  actions?: ReactNode;
}
export function TopAppBar({ headline, supportingText, navigationIcon, actions }: TopAppBarProps) {
  return (
    <header
      className="m3-top-app-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'transparent',
      }}
    >
      {navigationIcon && <div style={{ display: 'flex', alignItems: 'center' }}>{navigationIcon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="type-title-large" style={{ color: 'var(--md-sys-color-on-surface)', lineHeight: '28px' }}>
          {headline}
        </div>
        {supportingText && (
          <div className="type-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {supportingText}
          </div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>{actions}</div>}
    </header>
  );
}

/* ==========================================================================
   Buttons (M3) — Filled, Tonal, Outlined, Text
   ========================================================================== */
type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
}
function M3ButtonBase({ variant = 'filled', icon, children, style, ...rest }: M3ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const configs: Record<ButtonVariant, CSSProperties> = {
    filled: {
      background: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)',
      border: 'none',
    },
    tonal: {
      background: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      color: 'var(--md-sys-color-primary)',
      border: '1px solid var(--md-sys-color-outline)',
    },
    text: {
      background: 'transparent',
      color: 'var(--md-sys-color-primary)',
      border: 'none',
    },
  };

  const stateColor = variant === 'filled'
    ? 'var(--md-sys-color-on-primary)'
    : variant === 'tonal'
    ? 'var(--md-sys-color-on-secondary-container)'
    : 'var(--md-sys-color-primary)';

  const overlayOpacity = pressed ? 0.10 : hovered ? 0.08 : 0;

  return (
    <button
      {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="m3-focus-ring"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 40,
        padding: icon ? '0 16px 0 12px' : variant === 'text' ? '0 12px' : '0 24px',
        borderRadius: 'var(--md-sys-shape-full)',
        ...configs[variant],
        transition: `background var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized), box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
        boxShadow: variant === 'filled' && hovered ? 'var(--md-sys-elevation-1)' : 'none',
        ...style,
      }}
    >
      {/* State layer */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: stateColor,
          opacity: overlayOpacity,
          transition: `opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
          pointerEvents: 'none',
        }}
      />
      {icon && <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{icon}</span>}
      <span className="type-label-large" style={{ position: 'relative' }}>{children}</span>
    </button>
  );
}

export const FilledButton: React.FC<M3ButtonProps> = (p) => <M3ButtonBase variant="filled" {...p} />;
export const TonalButton: React.FC<M3ButtonProps> = (p) => <M3ButtonBase variant="tonal" {...p} />;
export const OutlinedButton: React.FC<M3ButtonProps> = (p) => <M3ButtonBase variant="outlined" {...p} />;
export const TextButton: React.FC<M3ButtonProps> = (p) => <M3ButtonBase variant="text" {...p} />;

/* ==========================================================================
   Icon Button (M3) — standard, filled, tonal
   ========================================================================== */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'standard' | 'filled' | 'tonal';
  selected?: boolean;
  children: ReactNode;
}
export function IconButton({ variant = 'standard', selected, children, style, ...rest }: IconButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isTonalOrFilled = variant !== 'standard';
  const bg = isTonalOrFilled
    ? selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)'
    : 'transparent';
  const color = isTonalOrFilled
    ? selected ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)'
    : selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)';

  return (
    <button
      {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="m3-focus-ring"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: 40,
        height: 40,
        borderRadius: 'var(--md-sys-shape-full)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color,
        transition: `background var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: color,
          opacity: hovered ? 0.08 : 0,
          transition: `opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', display: 'inline-flex' }}>{children}</span>
    </button>
  );
}

/* ==========================================================================
   FAB / Extended FAB (M3)
   ========================================================================== */
interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'regular' | 'large';
}
export function FAB({ icon, label, variant = 'primary', size = 'regular', style, ...rest }: FABProps) {
  const [hovered, setHovered] = useState(false);
  const isExtended = !!label;
  const sizeMap = { small: 40, regular: 56, large: 96 };
  const iconSize = size === 'large' ? 36 : 24;
  const height = isExtended ? 56 : sizeMap[size];
  const borderRadius = isExtended ? 'var(--md-sys-shape-large)' : 'var(--md-sys-shape-extra-large)';

  const colors: Record<string, { bg: string; fg: string }> = {
    surface: { bg: 'var(--md-sys-color-surface-container-high)', fg: 'var(--md-sys-color-primary)' },
    primary: { bg: 'var(--md-sys-color-primary-container)', fg: 'var(--md-sys-color-on-primary-container)' },
    secondary: { bg: 'var(--md-sys-color-secondary-container)', fg: 'var(--md-sys-color-on-secondary-container)' },
    tertiary: { bg: 'var(--md-sys-color-tertiary-container)', fg: 'var(--md-sys-color-on-tertiary-container)' },
  };
  const { bg, fg } = colors[variant];

  return (
    <button
      {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="m3-focus-ring"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height,
        padding: isExtended ? '0 20px 0 16px' : 0,
        width: isExtended ? 'auto' : height,
        borderRadius,
        background: bg,
        color: fg,
        boxShadow: hovered ? 'var(--md-sys-elevation-2)' : 'var(--md-sys-elevation-1)',
        transition: `box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized), transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)`,
        transform: hovered ? 'translateY(-1px)' : 'none',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', width: iconSize, height: iconSize }}>{icon}</span>
      {isExtended && <span className="type-label-large">{label}</span>}
    </button>
  );
}

/* ==========================================================================
   Cards (M3) — Elevated, Filled, Outlined
   ========================================================================== */
type CardVariant = 'elevated' | 'filled' | 'outlined';
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}
export function Card({ variant = 'elevated', children, style, ...rest }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const base: CSSProperties = {
    borderRadius: 'var(--md-sys-shape-medium)',
    padding: 16,
    transition: `box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized), transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)`,
  };
  const variants: Record<CardVariant, CSSProperties> = {
    elevated: {
      background: 'var(--md-sys-color-surface-container-low)',
      color: 'var(--md-sys-color-on-surface)',
      boxShadow: hovered ? 'var(--md-sys-elevation-2)' : 'var(--md-sys-elevation-1)',
    },
    filled: {
      background: 'var(--md-sys-color-surface-container-highest)',
      color: 'var(--md-sys-color-on-surface)',
      boxShadow: 'none',
    },
    outlined: {
      background: 'var(--md-sys-color-surface)',
      color: 'var(--md-sys-color-on-surface)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      boxShadow: 'none',
    },
  };
  return (
    <div
      {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   Chips (M3) — Filter, Assist, Suggestion, Input
   ========================================================================== */
type ChipVariant = 'filter' | 'assist' | 'suggestion' | 'input';
interface ChipProps {
  variant?: ChipVariant;
  selected?: boolean;
  onClick?: () => void;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  label: ReactNode;
}
export function Chip({ variant = 'filter', selected, onClick, leadingIcon, trailingIcon, label }: ChipProps) {
  const [hovered, setHovered] = useState(false);
  const isFilter = variant === 'filter';
  const bg = isFilter && selected
    ? 'var(--md-sys-color-secondary-container)'
    : 'transparent';
  const border = isFilter
    ? selected ? 'none' : '1px solid var(--md-sys-color-outline)'
    : '1px solid var(--md-sys-color-outline-variant)';
  const color = isFilter && selected
    ? 'var(--md-sys-color-on-secondary-container)'
    : 'var(--md-sys-color-on-surface-variant)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="m3-focus-ring"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 32,
        padding: leadingIcon ? '0 16px 0 8px' : '0 16px',
        borderRadius: 'var(--md-sys-shape-small)',
        background: bg,
        border,
        color,
        transition: `background var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: color, opacity: hovered ? 0.08 : 0, pointerEvents: 'none',
          transition: `opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
        }}
      />
      {leadingIcon && <span style={{ display: 'inline-flex', width: 18, height: 18, position: 'relative' }}>{leadingIcon}</span>}
      <span className="type-label-large" style={{ position: 'relative' }}>{label}</span>
      {trailingIcon && <span style={{ display: 'inline-flex', width: 18, height: 18, position: 'relative' }}>{trailingIcon}</span>}
    </button>
  );
}

/* ==========================================================================
   Text Field (M3) — Outlined / Filled
   ========================================================================== */
interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  supportingText?: string;
  variant?: 'outlined' | 'filled';
  error?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
export function TextField({ label, supportingText, variant = 'outlined', error, leadingIcon, trailingIcon, style, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const activeColor = error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)';

  if (variant === 'filled') {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, ...style }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--md-sys-color-surface-container-highest)',
            borderTopLeftRadius: 'var(--md-sys-shape-extra-small)',
            borderTopRightRadius: 'var(--md-sys-shape-extra-small)',
            minHeight: 56,
            padding: '0 16px',
            borderBottom: `2px solid ${focused ? activeColor : error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'}`,
            transition: `border-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
          }}
        >
          {leadingIcon && <span style={{ marginRight: 12, color: 'var(--md-sys-color-on-surface-variant)', display: 'inline-flex' }}>{leadingIcon}</span>}
          <div style={{ position: 'relative', flex: 1, paddingTop: label ? 12 : 0 }}>
            {label && (
              <label
                className="type-body-small"
                style={{
                  position: 'absolute',
                  top: focused || rest.value ? 4 : '50%',
                  transform: focused || rest.value ? 'translateY(0)' : 'translateY(-50%)',
                  color: focused ? activeColor : 'var(--md-sys-color-on-surface-variant)',
                  transition: `all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
                  pointerEvents: 'none',
                }}
              >
                {label}
              </label>
            )}
            <input
              {...rest}
              onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
              onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--md-sys-color-on-surface)',
                padding: label ? '16px 0 8px' : '16px 0',
                fontSize: 16,
              }}
            />
          </div>
          {trailingIcon && <span style={{ marginLeft: 12, color: 'var(--md-sys-color-on-surface-variant)', display: 'inline-flex' }}>{trailingIcon}</span>}
        </div>
        {supportingText && (
          <span className="type-body-small" style={{ color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)', padding: '0 16px' }}>
            {supportingText}
          </span>
        )}
      </div>
    );
  }

  // Outlined
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, ...style }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minHeight: 56,
          padding: '0 16px',
          borderRadius: 'var(--md-sys-shape-extra-small)',
          border: `${focused ? '2px' : '1px'} solid ${focused ? activeColor : error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-outline)'}`,
          transition: `border-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized), border-width var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
        }}
      >
        {leadingIcon && <span style={{ marginRight: 12, color: 'var(--md-sys-color-on-surface-variant)', display: 'inline-flex' }}>{leadingIcon}</span>}
        <div style={{ position: 'relative', flex: 1, paddingTop: label ? 8 : 0 }}>
          {label && (
            <label
              className="type-body-small"
              style={{
                position: 'absolute',
                top: focused || rest.value ? 4 : '50%',
                transform: focused || rest.value ? 'translateY(-50%)' : 'translateY(-50%)',
                left: 0,
                color: focused ? activeColor : 'var(--md-sys-color-on-surface-variant)',
                background: 'var(--md-sys-color-surface)',
                padding: '0 4px',
                transition: `all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized)`,
                pointerEvents: 'none',
                fontSize: focused || rest.value ? 12 : 16,
              }}
            >
              {label}
            </label>
          )}
          <input
            {...rest}
            onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--md-sys-color-on-surface)',
              padding: label ? '16px 0 8px' : '16px 0',
              fontSize: 16,
            }}
          />
        </div>
        {trailingIcon && <span style={{ marginLeft: 12, color: 'var(--md-sys-color-on-surface-variant)', display: 'inline-flex' }}>{trailingIcon}</span>}
      </div>
      {supportingText && (
        <span className="type-body-small" style={{ color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)', padding: '0 16px' }}>
          {supportingText}
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   Slider (M3)
   ========================================================================== */
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  valueFormatter?: (v: number) => string;
}
export function Slider({ value, min, max, step = 1, onChange, label, valueFormatter }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>{label}</span>
          <span className="type-title-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
            {valueFormatter ? valueFormatter(value) : value}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            cursor: 'pointer',
            height: 20,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-runnable-track {
            height: 4px;
            border-radius: var(--md-sys-shape-full);
            background: linear-gradient(to right, var(--md-sys-color-primary) 0%, var(--md-sys-color-primary) ${pct}%, var(--md-sys-color-surface-variant) ${pct}%, var(--md-sys-color-surface-variant) 100%);
          }
          input[type="range"]::-moz-range-track {
            height: 4px;
            border-radius: var(--md-sys-shape-full);
            background: var(--md-sys-color-surface-variant);
          }
          input[type="range"]::-moz-range-progress {
            height: 4px;
            border-radius: var(--md-sys-shape-full);
            background: var(--md-sys-color-primary);
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: var(--md-sys-shape-full);
            background: var(--md-sys-color-primary);
            margin-top: -8px;
            box-shadow: var(--md-sys-elevation-1);
            transition: transform var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized);
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: var(--md-sys-shape-full);
            background: var(--md-sys-color-primary);
            border: none;
            box-shadow: var(--md-sys-elevation-1);
          }
        `}</style>
      </div>
    </div>
  );
}

/* ==========================================================================
   Linear Progress Indicator (M3)
   ========================================================================== */
interface LinearProgressProps {
  value: number; // 0..1
  variant?: 'determinate' | 'indeterminate';
}
export function LinearProgress({ value, variant = 'determinate' }: LinearProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      style={{
        height: 4,
        borderRadius: 'var(--md-sys-shape-full)',
        background: 'var(--md-sys-color-surface-variant)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: variant === 'determinate' ? `${Math.min(100, Math.max(0, value * 100))}%` : '40%',
          background: 'var(--md-sys-color-primary)',
          borderRadius: 'inherit',
          transition: variant === 'determinate' ? `width var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-emphasized)` : 'none',
          animation: variant === 'indeterminate' ? 'm3-indeterminate 1.5s var(--md-sys-motion-easing-emphasized) infinite' : 'none',
        }}
      />
      <style>{`
        @keyframes m3-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

/* ==========================================================================
   Snackbar (M3) — single action, auto-dismiss
   ========================================================================== */
interface SnackbarProps {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}
export function Snackbar({ open, message, actionLabel, onAction, onDismiss, duration = 4000 }: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [open, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translate(-50%, ${open ? 0 : 24}px)`,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: `transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized), opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderRadius: 'var(--md-sys-shape-extra-small)',
          background: 'var(--md-sys-color-inverse-surface)',
          color: 'var(--md-sys-color-inverse-on-surface)',
          boxShadow: 'var(--md-sys-elevation-3)',
          minWidth: 280,
          maxWidth: 560,
        }}
      >
        <span className="type-body-medium" style={{ flex: 1 }}>{message}</span>
        {actionLabel && (
          <button
            onClick={onAction}
            className="type-label-large m3-focus-ring"
            style={{
              color: 'var(--md-sys-color-inverse-primary)',
              padding: '4px 8px',
              borderRadius: 'var(--md-sys-shape-extra-small)',
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Dialog (M3) — Full-screen on mobile, centered on desktop
   ========================================================================== */
interface DialogProps {
  open: boolean;
  onDismiss: () => void;
  icon?: ReactNode;
  headline: string;
  supportingText?: ReactNode;
  actions?: ReactNode;
}
export function Dialog({ open, onDismiss, icon, headline, supportingText, actions }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onDismiss]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 24,
        animation: 'm3-dialog-in var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--md-sys-color-surface-container-high)',
          color: 'var(--md-sys-color-on-surface)',
          borderRadius: 'var(--md-sys-shape-extra-large)',
          padding: 24,
          minWidth: 280,
          maxWidth: 560,
          width: '100%',
          boxShadow: 'var(--md-sys-elevation-3)',
          animation: 'm3-dialog-scale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)',
        }}
      >
        {icon && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--md-sys-color-primary)' }}>{icon}</div>}
        <h2 className="type-headline-small" style={{ margin: '0 0 16px', textAlign: icon ? 'center' : 'left' }}>{headline}</h2>
        {supportingText && (
          <div className="type-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 24 }}>
            {supportingText}
          </div>
        )}
        {actions && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
      <style>{`
        @keyframes m3-dialog-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes m3-dialog-scale { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
}

/* ==========================================================================
   Bottom Sheet (M3) — modal
   ========================================================================== */
interface BottomSheetProps {
  open: boolean;
  onDismiss: () => void;
  title?: string;
  children: ReactNode;
}
export function BottomSheet({ open, onDismiss, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'm3-dialog-in var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--md-sys-color-surface-container-low)',
          color: 'var(--md-sys-color-on-surface)',
          borderTopLeftRadius: 'var(--md-sys-shape-extra-large)',
          borderTopRightRadius: 'var(--md-sys-shape-extra-large)',
          padding: '12px 24px 24px',
          width: '100%',
          maxWidth: 640,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: 'var(--md-sys-elevation-4)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-emphasized)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 32, height: 4, borderRadius: 'var(--md-sys-shape-full)', background: 'var(--md-sys-color-outline-variant)' }} />
        </div>
        {title && <h2 className="type-title-large" style={{ margin: '0 0 16px' }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

/* ==========================================================================
   Navigation Bar (M3) — bottom, 3-5 destinations
   ========================================================================== */
interface NavigationBarProps {
  destinations: { label: string; icon: ReactNode; activeIcon?: ReactNode }[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}
export function NavigationBar({ destinations, selectedIndex, onSelect }: NavigationBarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        background: 'var(--md-sys-color-surface-container)',
        borderTop: '1px solid var(--md-sys-color-surface-variant)',
        height: 80,
        padding: '0 8px',
      }}
    >
      {destinations.map((d, i) => {
        const selected = i === selectedIndex;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="m3-focus-ring"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '12px 0',
              borderRadius: 'var(--md-sys-shape-extra-small)',
              color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
              transition: `color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 32,
                borderRadius: 'var(--md-sys-shape-full)',
                background: selected ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `background var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized), width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)`,
              }}
            >
              {selected && d.activeIcon ? d.activeIcon : d.icon}
            </div>
            <span className={selected ? 'type-label-medium' : 'type-label-small'}>{d.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ==========================================================================
   Segmented Button (M3) — for tab-like selection
   ========================================================================== */
interface SegmentedButtonProps {
  segments: { label: string; icon?: ReactNode }[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}
export function SegmentedButton({ segments, selectedIndex, onSelect }: SegmentedButtonProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        borderRadius: 'var(--md-sys-shape-full)',
        border: '1px solid var(--md-sys-color-outline)',
        overflow: 'hidden',
      }}
    >
      {segments.map((s, i) => {
        const selected = i === selectedIndex;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(i)}
            className="m3-focus-ring"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              padding: '0 16px',
              background: selected ? 'var(--md-sys-color-secondary-container)' : 'transparent',
              color: selected ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)',
              borderRight: i < segments.length - 1 ? '1px solid var(--md-sys-color-outline)' : 'none',
              transition: `background var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized)`,
            }}
          >
            {selected && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
            )}
            {s.icon && <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{s.icon}</span>}
            <span className="type-label-large">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   Divider (M3)
   ========================================================================== */
export function Divider({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 1,
        background: 'var(--md-sys-color-outline-variant)',
        margin: '8px 0',
        ...style,
      }}
    />
  );
}

/* ==========================================================================
   Surface Container (utility for layout sections)
   ========================================================================== */
export function SurfaceContainer({
  level = 'default',
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { level?: 'lowest' | 'low' | 'default' | 'high' | 'highest' }) {
  const map = {
    lowest: 'var(--md-sys-color-surface-container-lowest)',
    low: 'var(--md-sys-color-surface-container-low)',
    default: 'var(--md-sys-color-surface-container)',
    high: 'var(--md-sys-color-surface-container-high)',
    highest: 'var(--md-sys-color-surface-container-highest)',
  };
  return (
    <div
      {...rest}
      style={{
        background: map[level],
        color: 'var(--md-sys-color-on-surface)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
