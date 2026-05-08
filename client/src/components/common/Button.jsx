import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    hoverBg: 'var(--accent-light)',
  },
  secondary: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1.5px solid var(--border-light)',
    hoverBg: 'var(--bg-hover)',
  },
  danger: {
    background: 'var(--rose-dim)',
    color: 'var(--rose)',
    border: '1.5px solid rgba(244,63,94,0.25)',
    hoverBg: 'rgba(244,63,94,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    hoverBg: 'var(--bg-elevated)',
  },
};

const Button = ({
  children, variant = 'primary', loading = false,
  icon: Icon, size = 'md', fullWidth = false, ...props
}) => {
  const v = variants[variant] || variants.primary;
  const pad = size === 'sm' ? '0.4rem 0.8rem' : size === 'lg' ? '0.85rem 1.6rem' : '0.6rem 1.2rem';
  const fs  = size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.875rem';

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.45rem',
        padding: pad,
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: fs,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        transition: 'all 0.15s',
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '0.01em',
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (!loading && !props.disabled) e.currentTarget.style.background = v.hoverBg;
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.background;
        props.onMouseLeave?.(e);
      }}
    >
      {loading ? <Spinner size={14} color={v.color} /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
};

export default Button;