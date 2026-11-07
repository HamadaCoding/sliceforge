import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute Component
 * 
 * Route guard that restricts unauthenticated visitor pages (Login, Register).
 * If the user is already authenticated, they are automatically redirected to the Engine workspace.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const currentUser = useAuthStore((state) => state.user);
  const isAuthHydrated = useAuthStore((state) => state.isReady);

  if (!isAuthHydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/engine" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
