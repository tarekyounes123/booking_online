import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffRoute = ({ children }) => {
  const { user, isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'staff') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default StaffRoute;