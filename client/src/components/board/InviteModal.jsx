import React, { useState } from 'react';
import { Mail, UserMinus, Crown, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';

export default function InviteModal({ isOpen, onClose }) {
  const { activeBoard, inviteMember, removeMember } = useBoard();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const isOwner = activeBoard?.owner?._id === user?._id || activeBoard?.owner === user?._id;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Email is required');
    setLoading(true);
    try {
      await inviteMember(activeBoard._id, email.trim(), role);
      toast.success(`Invite sent to ${email}`);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite');
    } finally { setLoading(false); }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the board?')) return;
    setRemovingId(memberId);
    try {
      await removeMember(activeBoard._id, memberId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally { setRemovingId(null); }
  };

  const members = activeBoard?.members || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members" width={500}>
      {/* Invite form */}
      {isOwner && (
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:'0.8rem' }}>
            Invite by email address. They must have a KanbanFlow account.
          </p>
          <form onSubmit={handleInvite} style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="priya@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <div style={{ display:'flex', gap:'0.4rem', flex:1 }}>
                {['member','admin'].map((r) => (
                  <button
                    key={r} type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex:1, padding:'0.45rem', borderRadius:'var(--radius-sm)',
                      border: `1.5px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`,
                      background: role === r ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      color: role === r ? 'var(--accent-light)' : 'var(--text-muted)',
                      fontSize:'0.8rem', fontWeight:600, textTransform:'capitalize', transition:'all 0.15s',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Button type="submit" loading={loading}>Invite</Button>
            </div>
          </form>
          <div style={{ margin:'1.5rem 0', borderTop:'1px solid var(--border)' }} />
        </div>
      )}

      {/* Members list */}
      <div>
        <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'0.8rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {members.length} Member{members.length !== 1 ? 's' : ''}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {members.map((m) => {
            const member = m.user || m;
            const isThisOwner = activeBoard?.owner?._id === member._id || activeBoard?.owner === member._id;
            const isSelf = member._id === user?._id;

            return (
              <div key={member._id} style={{
                display:'flex', alignItems:'center', gap:'0.8rem',
                padding:'0.7rem 0.9rem',
                background:'var(--bg-elevated)',
                border:'1px solid var(--border)',
                borderRadius:'var(--radius-md)',
              }}>
                <Avatar name={member.name} size={36} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    {member.name}
                    {isSelf && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:400 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {member.email}
                  </div>
                </div>

                {/* Role badge */}
                <div style={{
                  display:'flex', alignItems:'center', gap:'0.25rem',
                  padding:'2px 8px', borderRadius:999, fontSize:'0.7rem', fontWeight:700,
                  background: isThisOwner ? 'var(--amber-dim)' : 'var(--bg-card)',
                  color: isThisOwner ? 'var(--amber)' : 'var(--text-muted)',
                  border: `1px solid ${isThisOwner ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                  textTransform:'capitalize',
                }}>
                  {isThisOwner ? <Crown size={10} /> : <User size={10} />}
                  {isThisOwner ? 'Owner' : m.role}
                </div>

                {/* Remove button */}
                {isOwner && !isThisOwner && (
                  <button
                    onClick={() => handleRemove(member._id)}
                    disabled={removingId === member._id}
                    style={{
                      background:'none', border:'1px solid var(--border)',
                      borderRadius:'var(--radius-sm)', padding:'4px 6px',
                      color:'var(--text-muted)', display:'flex', transition:'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background='var(--rose-dim)'; e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.borderColor='rgba(244,63,94,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
                  >
                    <UserMinus size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.5rem' }}>
        <Button variant="secondary" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
