import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-lg)',
              },
              success: { iconTheme: { primary: '#3ecf8e', secondary: 'var(--bg-elevated)' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: 'var(--bg-elevated)' } },
              duration: 3000,
            }}
          />
          <Routes>
            <Route path="/"           element={<Navigate to="/dashboard" replace />} />
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/register"   element={<RegisterPage />} />
            <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/board/:id"  element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
            <Route path="*"           element={<NotFoundPage />} />
          </Routes>
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
