import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, error, type = 'text', icon: Icon, ...props }, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none', display:'flex' }}>
            <Icon size={15} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          {...props}
          style={{
            width: '100%',
            padding: `0.65rem ${isPassword ? '2.5rem' : '0.9rem'} 0.65rem ${Icon ? '2.4rem' : '0.9rem'}`,
            background: 'var(--bg-elevated)',
            border: `1.5px solid ${error ? 'var(--rose)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            outline: 'none',
            ...props.style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--rose)' : 'var(--accent)';
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(244,63,94,0.15)' : 'var(--accent-dim)'}`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--rose)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} style={{
            position: 'absolute', right: 10,
            background: 'none', border: 'none',
            color: 'var(--text-muted)', display: 'flex', padding: 4,
          }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--rose)' }}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;