import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const BoardContext = createContext(null);

export const BoardProvider = ({ children }) => {
  const { user } = useAuth();
  const [boards, setBoards]           = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [lists, setLists]             = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingBoard,  setLoadingBoard]  = useState(false);
  const listenersAttached = useRef(false); // ← prevents duplicate listeners

  // ── Boards ──────────────────────────────────────────────
  const fetchBoards = useCallback(async () => {
    setLoadingBoards(true);
    try {
      const { data } = await api.get('/boards');
      setBoards(data.boards);
    } finally { setLoadingBoards(false); }
  }, []);

  const createBoard = useCallback(async (payload) => {
    const { data } = await api.post('/boards', payload);
    setBoards((prev) => [data.board, ...prev]);
    return data.board;
  }, []);

  const deleteBoard = useCallback(async (id) => {
    await api.delete(`/boards/${id}`);
    setBoards((prev) => prev.filter((b) => b._id !== id));
    if (activeBoard?._id === id) { setActiveBoard(null); setLists([]); setTasks([]); }
  }, [activeBoard]);

  // ── Single Board ─────────────────────────────────────────
  const fetchBoard = useCallback(async (id) => {
    setLoadingBoard(true);
    try {
      const { data } = await api.get(`/boards/${id}`);
      setActiveBoard(data.board);
      setLists(data.lists);
      setTasks(data.tasks);

      const tryJoin = (attempts = 0) => {
        const socket = getSocket();
        if (!socket) {
          if (attempts < 10) setTimeout(() => tryJoin(attempts + 1), 500);
          return;
        }
        if (socket.connected) {
          socket.emit('board:join', id);
          console.log('✅ Emitted board:join for', id);
        } else {
          socket.once('connect', () => {
            socket.emit('board:join', id);
            console.log('✅ Emitted board:join after connect for', id);
          });
        }
      };
      tryJoin();

      return data;
    } finally { setLoadingBoard(false); }
  }, []);

  const leaveBoard = useCallback((id) => {
    const socket = getSocket();
    if (socket && id) socket.emit('board:leave', id);
    setActiveBoard(null); setLists([]); setTasks([]);
  }, []);

  // ── Lists ────────────────────────────────────────────────
  const createList = useCallback(async (title, boardId) => {
    const { data } = await api.post('/lists', { title, boardId });
    return data.list;
  }, []);

  const updateList = useCallback(async (id, payload) => {
    const { data } = await api.patch(`/lists/${id}`, payload);
    setLists((prev) => prev.map((l) => (l._id === id ? data.list : l)));
    return data.list;
  }, []);

  const deleteList = useCallback(async (id) => {
    await api.delete(`/lists/${id}`);
    setLists((prev) => prev.filter((l) => l._id !== id));
    setTasks((prev) => prev.filter((t) => t.list !== id));
  }, []);

  // ── Tasks ────────────────────────────────────────────────
  const createTask = useCallback(async (payload) => {
    const { data } = await api.post('/tasks', payload);
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const moveTask = useCallback(async (taskId, listId, position) => {
    const { data } = await api.patch(`/tasks/${taskId}/move`, { listId, position });
    setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    return data.task;
  }, []);

  const moveTaskLocal = useCallback((taskId, sourceListId, destListId, sourceIdx, destIdx) => {
    setTasks((prev) => {
      const updated = [...prev];
      const taskIdx = updated.findIndex((t) => t._id === taskId);
      if (taskIdx === -1) return prev;
      const task = { ...updated[taskIdx], list: destListId, position: destIdx };
      updated.splice(taskIdx, 1);
      updated.push(task);
      return updated;
    });
  }, []);

  // ── Members ──────────────────────────────────────────────
  const inviteMember = useCallback(async (boardId, email, role = 'member') => {
    const { data } = await api.post(`/boards/${boardId}/invite`, { email, role });
    setActiveBoard(data.board);
    return data.board;
  }, []);

  const removeMember = useCallback(async (boardId, userId) => {
    const { data } = await api.delete(`/boards/${boardId}/members/${userId}`);
    setActiveBoard(data.board);
    return data.board;
  }, []);

  // ── Socket real-time listeners ───────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || listenersAttached.current) return; // ← skip if already attached

    listenersAttached.current = true; // ← mark as attached

    const onConnect = () => {
      if (activeBoard?._id) {
        socket.emit('board:join', activeBoard._id);
      }
    };
    socket.on('connect', onConnect);

    socket.on('list:created',        (l)        => setLists((p) => p.some((x) => x._id === l._id) ? p : [...p, l]));
    socket.on('list:updated',        (l)        => setLists((p) => p.map((x) => x._id === l._id ? l : x)));
    socket.on('list:deleted',        ({listId}) => { setLists((p) => p.filter((x) => x._id !== listId)); setTasks((p) => p.filter((t) => t.list !== listId)); });
    socket.on('task:created',        (t)        => setTasks((p) => p.some((x) => x._id === t._id) ? p : [...p, t]));
    socket.on('task:updated',        (t)        => setTasks((p) => p.map((x) => x._id === t._id ? t : x)));
    socket.on('task:moved',          (t)        => setTasks((p) => p.map((x) => x._id === t._id ? t : x)));
    socket.on('task:deleted',        ({taskId}) => setTasks((p) => p.filter((x) => x._id !== taskId)));
    socket.on('board:updated',       (b)        => setActiveBoard(b));
    socket.on('board:memberAdded',   ({board})  => setActiveBoard(board));
    socket.on('board:memberRemoved', ({board})  => setActiveBoard(board));

    return () => {
      listenersAttached.current = false; // ← reset on unmount
      socket.off('connect', onConnect);
      socket.off('list:created');
      socket.off('list:updated');
      socket.off('list:deleted');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:moved');
      socket.off('task:deleted');
      socket.off('board:updated');
      socket.off('board:memberAdded');
      socket.off('board:memberRemoved');
    };
  }, [user]); // ← only [user], not activeBoard._id

  return (
    <BoardContext.Provider value={{
      boards, activeBoard, lists, tasks,
      loadingBoards, loadingBoard,
      fetchBoards, createBoard, deleteBoard,
      fetchBoard, leaveBoard,
      createList, updateList, deleteList,
      createTask, updateTask, deleteTask, moveTask, moveTaskLocal,
      inviteMember, removeMember,
      setActiveBoard,
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
};
