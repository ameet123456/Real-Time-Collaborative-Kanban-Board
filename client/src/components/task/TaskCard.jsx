import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User, Flag, Pencil, Trash2, Tag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../common/Avatar';

const PRIORITY_MAP = {
  high:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   label: 'High' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Medium' },
  low:    { color: '#3ecf8e', bg: 'rgba(62,207,142,0.12)',  label: 'Low' },
};

const LABEL_COLORS = ['#7c6af7','#3ecf8e','#f59e0b','#f43f5e','#06b6d4','#ec4899'];

export default function TaskCard({ task, index, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const duePast   = dueDate && isPast(dueDate) && !isToday(dueDate);
  const dueToday  = dueDate && isToday(dueDate);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: snapshot.isDragging ? 'var(--bg-hover)' : 'var(--bg-elevated)',
            border: `1.5px solid ${snapshot.isDragging ? 'var(--accent)' : hovered ? 'var(--border-light)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '0.5rem',
            cursor: 'grab',
            boxShadow: snapshot.isDragging ? 'var(--shadow-lg), var(--shadow-glow)' : hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            transform: snapshot.isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
            transition: snapshot.isDragging ? 'none' : 'all 0.15s ease',
            position: 'relative',
            ...provided.draggableProps.style,
          }}
        >
          {/* Priority bar */}
          <div style={{
            position:'absolute', left:0, top:8, bottom:8,
            width:3, borderRadius:'0 2px 2px 0',
            background: priority.color,
            opacity: 0.8,
          }} />

          {/* Labels */}
          {task.labels?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginBottom:'0.5rem' }}>
              {task.labels.map((label, i) => (
                <span key={i} style={{
                  background: `${LABEL_COLORS[i % LABEL_COLORS.length]}22`,
                  color: LABEL_COLORS[i % LABEL_COLORS.length],
                  border: `1px solid ${LABEL_COLORS[i % LABEL_COLORS.length]}44`,
                  borderRadius: 999, padding:'1px 8px', fontSize:'0.68rem', fontWeight:600,
                }}>
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <p style={{
            fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.45,
            color: 'var(--text-primary)', marginLeft: '0.5rem',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </p>

          {/* Description preview */}
          {task.description && (
            <p style={{
              fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.35rem',
              marginLeft:'0.5rem', lineHeight:1.4,
              display:'-webkit-box', WebkitLineClamp:2,
              WebkitBoxOrient:'vertical', overflow:'hidden',
            }}>
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginTop:'0.75rem', marginLeft:'0.5rem',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              {/* Due date */}
              {dueDate && (
                <div style={{
                  display:'flex', alignItems:'center', gap:'0.25rem',
                  fontSize:'0.72rem', fontWeight:500,
                  color: duePast ? 'var(--rose)' : dueToday ? 'var(--amber)' : 'var(--text-muted)',
                  background: duePast ? 'var(--rose-dim)' : dueToday ? 'var(--amber-dim)' : 'transparent',
                  borderRadius: 4, padding: duePast || dueToday ? '1px 5px' : 0,
                }}>
                  <Calendar size={11} />
                  {format(dueDate, 'dd MMM')}
                </div>
              )}

              {/* Priority badge */}
              <div style={{
                display:'flex', alignItems:'center', gap:'0.2rem',
                fontSize:'0.68rem', fontWeight:600,
                color: priority.color, background: priority.bg,
                borderRadius:4, padding:'1px 6px',
              }}>
                <Flag size={10} />
                {priority.label}
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              {/* Assigned avatar */}
              {task.assignedTo && (
                <Avatar name={task.assignedTo.name || '?'} size={22} />
              )}

              {/* Actions (show on hover) */}
              {hovered && (
                <div style={{ display:'flex', gap:'0.2rem', animation:'scaleIn 0.1s ease' }}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4,
                      padding:'3px 5px', color:'var(--text-secondary)', display:'flex', transition:'all 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
                  >
                    <Pencil size={11} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4,
                      padding:'3px 5px', color:'var(--text-secondary)', display:'flex', transition:'all 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.borderColor='var(--rose)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}