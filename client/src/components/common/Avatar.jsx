import React from 'react';

const COLORS = [
  '#7c6af7','#3ecf8e','#f59e0b','#f43f5e',
  '#06b6d4','#8b5cf6','#ec4899','#10b981',
];

const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const Avatar = ({ name = '', size = 32, style = {} }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = getColor(name);

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `${bg}22`,
      border: `1.5px solid ${bg}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.38,
      color: bg,
      flexShrink: 0,
      userSelect: 'none',
      ...style,
    }}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;