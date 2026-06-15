import React from "react";
import { Navigate } from "react-router-dom";
import { type AppRole, APP_ROLES } from "@/config/constants";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("boss_user_role") as AppRole | null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    // If not authorized, redirect to their specific dashboard or main dashboard
    if (userRole === APP_ROLES.ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (userRole === APP_ROLES.USER) {
      return <Navigate to="/" replace />;
    }
    // Default fallback
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
