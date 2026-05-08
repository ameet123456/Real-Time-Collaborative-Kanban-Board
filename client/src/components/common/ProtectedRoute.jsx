import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({
  children
}) {

  const {
    user,
    loading
  } = useAuth();

  

  if (loading) {

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#111',
          color: 'white'
        }}
      >
        Loading...
      </div>
    );

  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  return children;

}