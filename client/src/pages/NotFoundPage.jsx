import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-base)', flexDirection:'column', gap:'1rem', textAlign:'center', padding:'2rem',
    }}>
      <div style={{ fontSize:'5rem', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--text-muted)', letterSpacing:'-0.05em' }}>
        404
      </div>
      <AlertCircle size={40} color="var(--text-muted)" />
      <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.4rem' }}>Page Not Found</h2>
      <p style={{ color:'var(--text-secondary)', maxWidth:360 }}>
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <Link to="/dashboard" style={{
        display:'inline-flex', alignItems:'center', gap:'0.5rem',
        background:'var(--accent)', color:'#fff',
        padding:'0.65rem 1.4rem', borderRadius:'var(--radius-md)',
        fontWeight:600, fontSize:'0.9rem', marginTop:'0.5rem',
        transition:'background 0.15s',
      }}>
        <Home size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}
