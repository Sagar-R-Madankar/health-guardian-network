
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const RequireAuth = ({ children, requireAdmin = false }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, you might want to show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin is required but user is not admin
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
