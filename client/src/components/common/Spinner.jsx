import React from 'react';

const Spinner = ({ size = 24, color = 'var(--accent)' }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid rgba(255,255,255,0.08)`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  }} />
);

export default Spinner;