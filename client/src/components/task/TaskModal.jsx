import React, { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useBoard } from '../../context/BoardContext';

const PRIORITY_OPTIONS = ['low','medium','high'];
const PRIORITY_COLORS  = { low:'#3ecf8e', medium:'#f59e0b', high:'#f43f5e' };

const SUGGESTED_LABELS = ['Frontend','Backend','Bug','Feature','Design','Urgent','Testing','Docs'];

export default function TaskModal({ isOpen, onClose, task, listId, boardId }) {
  const { createTask, updateTask, activeBoard } = useBoard();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title:'', description:'', assignedTo:'', dueDate:'', priority:'medium', labels:[],
  });
  const [labelInput, setLabelInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || 'medium',
        labels: task.labels || [],
      });
    } else {
      setForm({ title:'', description:'', assignedTo:'', dueDate:'', priority:'medium', labels:[] });
    }
    setLabelInput('');
  }, [task, isOpen]);

  const addLabel = (label) => {
    const l = label.trim();
    if (l && !form.labels.includes(l) && form.labels.length < 5) {
      setForm({ ...form, labels: [...form.labels, l] });
    }
    setLabelInput('');
  };

  const removeLabel = (label) => setForm({ ...form, labels: form.labels.filter((l) => l !== label) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
        priority: form.priority,
        labels: form.labels,
      };
      if (isEdit) {
        await updateTask(task._id, payload);
        toast.success('Task updated');
      } else {
        await createTask({ ...payload, listId, boardId });
        toast.success('Task created!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const members = activeBoard?.members || [];

  const labelColors = ['#7c6af7','#3ecf8e','#f59e0b','#f43f5e','#06b6d4','#ec4899'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'} width={520}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
        <Input
          label="Task Title"
          placeholder="e.g. Design landing page"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />

        {/* Description */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
            Description
          </label>
          <textarea
            placeholder="Add details about this task…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{
              background:'var(--bg-elevated)', border:'1.5px solid var(--border)',
              borderRadius:'var(--radius-md)', color:'var(--text-primary)',
              padding:'0.65rem 0.9rem', fontSize:'0.9rem', resize:'vertical',
              outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)'; }}
            onBlur={(e)  => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; }}
          />
        </div>

        {/* Row: Priority + Due Date */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {/* Priority */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
              Priority
            </label>
            <div style={{ display:'flex', gap:'0.4rem' }}>
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  style={{
                    flex:1, padding:'0.4rem 0',
                    borderRadius:'var(--radius-sm)',
                    border: `1.5px solid ${form.priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`,
                    background: form.priority === p ? `${PRIORITY_COLORS[p]}18` : 'var(--bg-elevated)',
                    color: form.priority === p ? PRIORITY_COLORS[p] : 'var(--text-muted)',
                    fontSize:'0.72rem', fontWeight:700, textTransform:'capitalize',
                    transition:'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              style={{
                background:'var(--bg-elevated)', border:'1.5px solid var(--border)',
                borderRadius:'var(--radius-md)', color:'var(--text-primary)',
                padding:'0.5rem 0.7rem', fontSize:'0.875rem', outline:'none',
                colorScheme:'dark',
              }}
            />
          </div>
        </div>

        {/* Assign Member */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
            Assign To
          </label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
            <button
              type="button"
              onClick={() => setForm({ ...form, assignedTo: '' })}
              style={{
                padding:'0.3rem 0.7rem', borderRadius:999,
                border: `1.5px solid ${!form.assignedTo ? 'var(--accent)' : 'var(--border)'}`,
                background: !form.assignedTo ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: !form.assignedTo ? 'var(--accent-light)' : 'var(--text-muted)',
                fontSize:'0.75rem', fontWeight:600, transition:'all 0.15s',
              }}
            >
              Unassigned
            </button>
            {members.map((m) => {
              const member = m.user || m;
              const isSelected = form.assignedTo === member._id;
              return (
                <button
                  key={member._id} type="button"
                  onClick={() => setForm({ ...form, assignedTo: member._id })}
                  style={{
                    display:'flex', alignItems:'center', gap:'0.4rem',
                    padding:'0.3rem 0.7rem', borderRadius:999,
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: isSelected ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontSize:'0.75rem', fontWeight:600, transition:'all 0.15s',
                  }}
                >
                  <Avatar name={member.name} size={18} />
                  {member.name?.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Labels */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          <label style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
            Labels
          </label>
          {/* Applied labels */}
          {form.labels.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.3rem' }}>
              {form.labels.map((label, i) => (
                <span key={i} style={{
                  display:'flex', alignItems:'center', gap:'0.3rem',
                  background:`${labelColors[i % labelColors.length]}22`,
                  color: labelColors[i % labelColors.length],
                  border:`1px solid ${labelColors[i % labelColors.length]}44`,
                  borderRadius:999, padding:'2px 8px', fontSize:'0.72rem', fontWeight:600,
                }}>
                  {label}
                  <button type="button" onClick={() => removeLabel(label)}
                    style={{ background:'none', border:'none', color:'inherit', padding:0, display:'flex', lineHeight:1 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Suggested */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
            {SUGGESTED_LABELS.filter((s) => !form.labels.includes(s)).map((s) => (
              <button key={s} type="button" onClick={() => addLabel(s)} style={{
                background:'var(--bg-elevated)', border:'1px solid var(--border)',
                borderRadius:999, padding:'2px 8px', fontSize:'0.72rem', color:'var(--text-muted)',
                transition:'all 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}
              >
                + {s}
              </button>
            ))}
          </div>
          {/* Custom label input */}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.3rem' }}>
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(labelInput); } }}
              placeholder="Custom label…"
              style={{
                flex:1, background:'var(--bg-elevated)', border:'1.5px solid var(--border)',
                borderRadius:'var(--radius-sm)', color:'var(--text-primary)',
                padding:'0.4rem 0.7rem', fontSize:'0.8rem', outline:'none',
              }}
            />
            <button type="button" onClick={() => addLabel(labelInput)} style={{
              background:'var(--bg-elevated)', border:'1.5px solid var(--border)',
              borderRadius:'var(--radius-sm)', padding:'0.4rem 0.6rem',
              color:'var(--text-secondary)', display:'flex',
            }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', paddingTop:'0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}