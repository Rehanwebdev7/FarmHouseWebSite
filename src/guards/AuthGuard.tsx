import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = localStorage.getItem("boss_auth_token");
  const location = useLocation();

  if (!token) {
    // Redirect to login page, preserving path in query parameters
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
