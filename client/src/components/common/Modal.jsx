import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, width = 480 }) => {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    if (isOpen) { document.addEventListener('keydown', handler); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: width,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        animation: 'scaleIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-elevated)', border: 'none',
            borderRadius: 'var(--radius-sm)', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background='var(--rose-dim)'; e.currentTarget.style.color='var(--rose)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;