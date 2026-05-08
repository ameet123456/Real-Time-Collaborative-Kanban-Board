import React, { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskCard from '../task/TaskCard';
import { useBoard } from '../../context/BoardContext';

const COLUMN_ACCENTS = ['#7c6af7','#3ecf8e','#f59e0b','#f43f5e','#06b6d4','#8b5cf6','#ec4899','#10b981'];

export default function ListColumn({ list, tasks, index, onAddTask, onEditTask, onDeleteTask }) {
  const { updateList, deleteList } = useBoard();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const accent = COLUMN_ACCENTS[index % COLUMN_ACCENTS.length];

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRename = async () => {
    if (!title.trim()) { setTitle(list.title); setEditing(false); return; }
    if (title.trim() === list.title) { setEditing(false); return; }
    try {
      await updateList(list._id, { title: title.trim() });
      toast.success('List renamed');
    } catch {
      toast.error('Failed to rename list');
      setTitle(list.title);
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Delete "${list.title}" and all its tasks?`)) return;
    try {
      await deleteList(list._id);
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div style={{
      width: 288,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
      animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
    }}>
      {/* Column Header */}
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border)`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        padding: '0.85rem 0.9rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        {/* Task count badge */}
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: `${accent}22`, border: `1px solid ${accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 800, color: accent, flexShrink: 0,
        }}>
          {tasks.length}
        </div>

        {/* Title / Edit */}
        {editing ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') { setTitle(list.title); setEditing(false); }
              }}
              style={{
                flex: 1, background: 'var(--bg-elevated)',
                border: '1.5px solid var(--accent)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', padding: '0.2rem 0.5rem',
                fontSize: '0.875rem', fontWeight: 700, outline: 'none',
              }}
            />
            <button onClick={handleRename} style={{ background: 'var(--jade-dim)', border: 'none', borderRadius: 4, padding: '3px', color: 'var(--jade)', display: 'flex' }}>
              <Check size={13} />
            </button>
            <button onClick={() => { setTitle(list.title); setEditing(false); }} style={{ background: 'var(--rose-dim)', border: 'none', borderRadius: 4, padding: '3px', color: 'var(--rose)', display: 'flex' }}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            style={{
              flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.9rem', letterSpacing: '-0.01em', cursor: 'default',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {list.title}
          </span>
        )}

        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '3px', color: 'var(--text-muted)', display: 'flex',
              transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 50,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', minWidth: 160,
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              animation: 'scaleIn 0.15s ease',
            }}>
              {[
                { icon: Pencil, label: 'Rename List', action: () => { setEditing(true); setMenuOpen(false); }, color: 'var(--text-primary)' },
                { icon: Trash2, label: 'Delete List', action: handleDelete, color: 'var(--rose)' },
              ].map(({ icon: Icon, label, action, color }) => (
                <button key={label} onClick={action} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                  padding: '0.6rem 0.9rem', background: 'none', border: 'none',
                  color, fontSize: '0.82rem', fontWeight: 500, textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              overflowY: 'auto',
              background: snapshot.isDraggingOver ? `${accent}0a` : 'var(--bg-surface)',
              border: `1px solid ${snapshot.isDraggingOver ? `${accent}44` : 'var(--border)'}`,
              borderTop: 'none',
              padding: '0.6rem',
              minHeight: 60,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {tasks.map((task, i) => (
              <TaskCard
                key={task._id}
                task={task}
                index={i}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task Button */}
      <button
        onClick={() => onAddTask(list._id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-surface)',
          border: `1px solid var(--border)`,
          borderTop: 'none',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          padding: '0.65rem 0.9rem',
          color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600,
          width: '100%', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.background = `${accent}0a`; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
      >
        <Plus size={14} /> Add a task
      </button>
    </div>
  );
}
