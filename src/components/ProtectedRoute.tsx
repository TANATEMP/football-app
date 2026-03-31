// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  currentRole: UserRole | null;
}

const ProtectedRoute = ({ allowedRoles, currentRole }: ProtectedRouteProps) => {
  // 1. ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login ทันที
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. ถ้าล็อกอินแล้ว แต่ Role ไม่ตรงกับหน้าที่อนุญาต (เช่น Player แอบเข้าหน้า Admin) ให้เด้งไปหน้าแรก
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. ถ้าสิทธิ์ถูกต้อง ก็ให้แสดงเนื้อหาของหน้านั้นๆ ได้เลย
  return <Outlet />;
};

export default ProtectedRoute;