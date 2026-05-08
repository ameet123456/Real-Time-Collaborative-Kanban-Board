import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, Trash2, Users, LogOut, Layers, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';

const BG_COLORS = [
  '#0f172a','#0d1117','#0a0f1e','#0f0a1e','#0a1f0f',
  '#1a0a0a','#0a1a1a','#12100a',
];
const ACCENT_COLORS = [
  '#7c6af7','#3ecf8e','#f59e0b','#f43f5e','#06b6d4','#8b5cf6','#ec4899','#10b981',
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { boards, loadingBoards, fetchBoards, createBoard, deleteBoard } = useBoard();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', background: BG_COLORS[0] });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Board name is required');
    setCreating(true);
    try {
      const board = await createBoard(form);
      toast.success('Board created!');
      setShowCreate(false);
      setForm({ name: '', description: '', background: BG_COLORS[0] });
      navigate(`/board/${board._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create board');
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBoard(deleteTarget._id);
      toast.success('Board deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const isOwner = (board) => board.owner?._id === user?._id || board.owner === user?._id;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Navbar */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(10,10,15,0.85)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 1.5rem', height:60,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{
            width:32, height:32, borderRadius:'var(--radius-sm)',
            background:'var(--accent-dim)', border:'1px solid var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Layers size={16} color="var(--accent)" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>
            KanbanFlow
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Avatar name={user?.name} size={34} />
          <div style={{ lineHeight:1.3 }}>
            <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{user?.name}</div>
            <div style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background:'var(--bg-elevated)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)', padding:'0.4rem 0.7rem',
            color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'0.4rem',
            fontSize:'0.8rem', transition:'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background='var(--rose-dim)'; e.currentTarget.style.color='var(--rose)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.8rem', letterSpacing:'-0.03em' }}>
              My Workspaces
            </h2>
            <p style={{ color:'var(--text-secondary)', marginTop:'0.3rem', fontSize:'0.9rem' }}>
              {boards.length} board{boards.length !== 1 ? 's' : ''} — pick one to dive in
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreate(true)}>New Board</Button>
        </div>

        {/* Search */}
        <div style={{ position:'relative', maxWidth:320, marginBottom:'2rem' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards…"
            style={{
              width:'100%', padding:'0.6rem 0.9rem 0.6rem 2.3rem',
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'var(--radius-md)', color:'var(--text-primary)',
              fontSize:'0.875rem', outline:'none',
            }}
          />
        </div>

        {/* Loading */}
        {loadingBoards && (
          <div style={{ display:'flex', justifyContent:'center', marginTop:'4rem' }}>
            <Spinner size={36} />
          </div>
        )}

        {/* Empty */}
        {!loadingBoards && filtered.length === 0 && (
          <div style={{
            textAlign:'center', marginTop:'5rem',
            color:'var(--text-muted)',
          }}>
            <Layout size={48} style={{ margin:'0 auto 1rem', opacity:0.3 }} />
            <p style={{ fontSize:'1.1rem', marginBottom:'0.5rem' }}>
              {search ? 'No boards match your search' : 'No boards yet'}
            </p>
            {!search && (
              <p style={{ fontSize:'0.875rem', marginBottom:'1.5rem' }}>
                Create your first board to get started
              </p>
            )}
            {!search && <Button icon={Plus} onClick={() => setShowCreate(true)}>Create Board</Button>}
          </div>
        )}

        {/* Grid */}
        {!loadingBoards && filtered.length > 0 && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
            gap:'1.2rem',
          }}>
            {filtered.map((board, i) => {
              const accentColor = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <div
                  key={board._id}
                  onClick={() => navigate(`/board/${board._id}`)}
                  style={{
                    background:'var(--bg-card)',
                    border:'1px solid var(--border)',
                    borderRadius:'var(--radius-xl)',
                    padding:'1.5rem',
                    cursor:'pointer',
                    transition:'all 0.2s',
                    position:'relative',
                    overflow:'hidden',
                    animation:`fadeIn 0.3s ease ${i * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${accentColor}55`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Accent strip */}
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, height:3,
                    background:`linear-gradient(90deg, ${accentColor}, ${accentColor}55)`,
                    borderRadius:'var(--radius-xl) var(--radius-xl) 0 0',
                  }} />

                  {/* Board icon */}
                  <div style={{
                    width:40, height:40, borderRadius:'var(--radius-md)',
                    background:`${accentColor}18`,
                    border:`1px solid ${accentColor}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:'1rem',
                  }}>
                    <Layout size={18} color={accentColor} />
                  </div>

                  <h3 style={{
                    fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem',
                    marginBottom:'0.4rem', letterSpacing:'-0.01em',
                  }}>
                    {board.name}
                  </h3>
                  {board.description && (
                    <p style={{
                      color:'var(--text-secondary)', fontSize:'0.82rem',
                      marginBottom:'1rem', lineHeight:1.5,
                      display:'-webkit-box', WebkitLineClamp:2,
                      WebkitBoxOrient:'vertical', overflow:'hidden',
                    }}>
                      {board.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem' }}>
                    {/* Members */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <div style={{ display:'flex' }}>
                        {board.members?.slice(0,3).map((m, mi) => (
                          <div key={m._id || mi} style={{ marginLeft: mi > 0 ? -8 : 0, zIndex: 3 - mi }}>
                            <Avatar name={m.user?.name || '?'} size={24} />
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                        {board.members?.length} member{board.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Delete */}
                    {isOwner(board) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(board); }}
                        style={{
                          background:'none', border:'none',
                          color:'var(--text-muted)', padding:'4px',
                          borderRadius:'var(--radius-sm)', display:'flex', transition:'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.background='var(--rose-dim)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='none'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Role badge */}
                  <div style={{
                    position:'absolute', top:'1rem', right:'1rem',
                    background: isOwner(board) ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: isOwner(board) ? 'var(--accent-light)' : 'var(--text-muted)',
                    border: `1px solid ${isOwner(board) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:999, padding:'2px 8px', fontSize:'0.68rem', fontWeight:600,
                    textTransform:'uppercase', letterSpacing:'0.05em',
                  }}>
                    {isOwner(board) ? 'Owner' : 'Member'}
                  </div>
                </div>
              );
            })}

            {/* + New Board card */}
            <div
              onClick={() => setShowCreate(true)}
              style={{
                border:'2px dashed var(--border)',
                borderRadius:'var(--radius-xl)',
                padding:'1.5rem',
                cursor:'pointer',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:'0.5rem', minHeight:160,
                color:'var(--text-muted)',
                transition:'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
            >
              <Plus size={28} />
              <span style={{ fontSize:'0.875rem', fontWeight:600 }}>New Board</span>
            </div>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Board">
        <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
          <Input
            label="Board Name"
            placeholder="e.g. Product Roadmap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
              Description (optional)
            </label>
            <textarea
              placeholder="What is this board for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{
                background:'var(--bg-elevated)', border:'1.5px solid var(--border)',
                borderRadius:'var(--radius-md)', color:'var(--text-primary)',
                padding:'0.65rem 0.9rem', fontSize:'0.9rem', resize:'vertical',
                outline:'none', fontFamily:'var(--font-body)',
              }}
            />
          </div>
          <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating} icon={Plus}>Create Board</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Board" width={400}>
        <p style={{ color:'var(--text-secondary)', marginBottom:'1.5rem', lineHeight:1.6 }}>
          Are you sure you want to delete <strong style={{ color:'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
          This will permanently delete all lists and tasks inside it.
        </p>
        <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete Board</Button>
        </div>
      </Modal>
    </div>
  );
}
