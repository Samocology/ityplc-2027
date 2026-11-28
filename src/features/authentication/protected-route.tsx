"use client";

import { Navigate } from "react-router";
import { useAuth } from "@/features/authentication/use-auth";

type Role = "hq_admin" | "zone_admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, isAuthenticated, isHqAdmin, isZoneAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => {
      if (role === "hq_admin") return isHqAdmin;
      if (role === "zone_admin") return isZoneAdmin;
      return false;
    });
    if (!hasRole) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
