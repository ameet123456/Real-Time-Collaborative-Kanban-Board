import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, ArrowLeft, Users, Layers, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import ListColumn from '../components/board/ListColumn';
import TaskModal from '../components/task/TaskModal';
import InviteModal from '../components/board/InviteModal';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchBoard, leaveBoard, activeBoard, lists, tasks, loadingBoard, createList, moveTask, moveTaskLocal, deleteTask } = useBoard();

  const [taskModal, setTaskModal]     = useState({ open: false, listId: null, task: null });
  const [inviteModal, setInviteModal] = useState(false);
  const [addListModal, setAddListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList]   = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected]     = useState(true);

  useEffect(() => {
    fetchBoard(id).catch(() => { toast.error('Board not found or access denied'); navigate('/dashboard'); });
    return () => leaveBoard(id);
  }, [id]);

  // Track who's online via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onJoin = (u) => setOnlineUsers((p) => [...p.filter((x) => x.userId !== u.userId), u]);
    const onLeave = ({ userId }) => setOnlineUsers((p) => p.filter((x) => x.userId !== userId));
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('user:joined', onJoin);
    socket.on('user:left', onLeave);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => { socket.off('user:joined', onJoin); socket.off('user:left', onLeave); socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, []);

  const handleDragEnd = useCallback(async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    // Optimistic update
    moveTaskLocal(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
    } catch {
      toast.error('Failed to move task');
      fetchBoard(id); // revert
    }
  }, [moveTask, moveTaskLocal, id, fetchBoard]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return toast.error('List title is required');
    setAddingList(true);
    try {
      await createList(newListTitle.trim(), id);
      toast.success('List added!');
      setNewListTitle('');
      setAddListModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add list');
    } finally { setAddingList(false); }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    try {
      await deleteTask(deleteTaskTarget._id);
      toast.success('Task deleted');
      setDeleteTaskTarget(null);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const getTasksForList = (listId) =>
    tasks.filter((t) => (t.list?._id || t.list) === listId).sort((a, b) => a.position - b.position);

  if (loadingBoard) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', background:'var(--bg-base)' }}>
        <Spinner size={40} />
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Loading board…</p>
      </div>
    );
  }

  if (!activeBoard) return null;
  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', flexDirection:'column' }}>
      {/* Board Navbar */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(10,10,15,0.9)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 1.25rem', height:56,
        display:'flex', alignItems:'center', gap:'1rem',
      }}>
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background:'var(--bg-elevated)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)', padding:'0.35rem 0.7rem',
            color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'0.4rem',
            fontSize:'0.8rem', transition:'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
        >
          <ArrowLeft size={14} />
          <span style={{ display:'none', ['@media (min-width: 640px)']: { display:'inline' } }}>Boards</span>
        </button>

        {/* Board icon + name */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flex:1, minWidth:0 }}>
          <div style={{
            width:28, height:28, borderRadius:'var(--radius-sm)',
            background:'var(--accent-dim)', border:'1px solid var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <Layers size={14} color="var(--accent)" />
          </div>
          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1rem',
            letterSpacing:'-0.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>
            {activeBoard.name}
          </h1>
        </div>

        {/* Online users */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.72rem', color: connected ? 'var(--jade)' : 'var(--rose)' }}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live' : 'Offline'}
          </div>

          {onlineUsers.length > 0 && (
            <div style={{ display:'flex', alignItems:'center' }}>
              {onlineUsers.slice(0,4).map((u, i) => (
                <div key={u.userId} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 4 - i }}>
                  <Avatar name={u.name} size={26} style={{ border:'2px solid var(--jade)', boxShadow:'0 0 8px rgba(62,207,142,0.4)' }} />
                </div>
              ))}
              {onlineUsers.length > 4 && (
                <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginLeft:4 }}>+{onlineUsers.length - 4}</span>
              )}
            </div>
          )}

          {/* My avatar */}
          <Avatar name={user?.name} size={30} style={{ border:'2px solid var(--accent)' }} />

          {/* Members button */}
          <Button variant="secondary" size="sm" icon={Users} onClick={() => setInviteModal(true)}>
            Members
          </Button>

          {/* Add list */}
          <Button size="sm" icon={Plus} onClick={() => setAddListModal(true)}>
            Add List
          </Button>
        </div>
      </div>

      {/* Board Canvas */}
      <div style={{
        flex:1,
        overflowX:'auto',
        overflowY:'hidden',
        padding:'1.25rem',
      }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{
            display:'flex',
            alignItems:'flex-start',
            gap:'1rem',
            minHeight:'calc(100vh - 120px)',
            width:'max-content',
          }}>
            {sortedLists.map((list, index) => (
              <ListColumn
                key={list._id}
                list={list}
                index={index}
                tasks={getTasksForList(list._id)}
                onAddTask={(listId) => setTaskModal({ open: true, listId, task: null })}
                onEditTask={(task) => setTaskModal({ open: true, listId: task.list?._id || task.list, task })}
                onDeleteTask={(task) => setDeleteTaskTarget(task)}
              />
            ))}

            {/* Add List inline button */}
            <div
              onClick={() => setAddListModal(true)}
              style={{
                width: 260, flexShrink:0,
                border:'2px dashed var(--border)',
                borderRadius:'var(--radius-lg)',
                padding:'1.5rem 1rem',
                display:'flex', alignItems:'center', justifyContent:'center',
                gap:'0.5rem', minHeight:100,
                color:'var(--text-muted)', cursor:'pointer',
                transition:'all 0.2s',
                alignSelf:'flex-start',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
            >
              <Plus size={18} />
              <span style={{ fontSize:'0.875rem', fontWeight:600 }}>Add another list</span>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open:false, listId:null, task:null })}
        task={taskModal.task}
        listId={taskModal.listId}
        boardId={id}
      />

      {/* Invite Modal */}
      <InviteModal isOpen={inviteModal} onClose={() => setInviteModal(false)} />

      {/* Add List Modal */}
      <Modal isOpen={addListModal} onClose={() => setAddListModal(false)} title="Add New List" width={400}>
        <form onSubmit={handleAddList} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
          <Input
            label="List Title"
            placeholder="e.g. In Review"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            autoFocus
          />
          <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setAddListModal(false)}>Cancel</Button>
            <Button type="submit" loading={addingList} icon={Plus}>Add List</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirm */}
      <Modal isOpen={!!deleteTaskTarget} onClose={() => setDeleteTaskTarget(null)} title="Delete Task" width={400}>
        <p style={{ color:'var(--text-secondary)', marginBottom:'1.5rem', lineHeight:1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color:'var(--text-primary)' }}>{deleteTaskTarget?.title}</strong>?
          This cannot be undone.
        </p>
        <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTaskTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteTask}>Delete Task</Button>
        </div>
      </Modal>
    </div>
  );
}
