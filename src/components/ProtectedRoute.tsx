import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  currentRole: UserRole | null;
}

const ProtectedRoute = ({ allowedRoles, currentRole }: ProtectedRouteProps) => {
  if (!currentRole) {
    return <Navigate to="/" replace />;
  }
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;