import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Renders child routes only when the user is authenticated.
 * Waits for session rehydration before redirecting to /login.
 * This prevents premature redirects when checking server-side auth via /auth/me.
 */
export default function ProtectedRoute() {
  const { user, isRehydrating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if rehydration is complete and user is not authenticated
    if (!isRehydrating && !user) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, isRehydrating, navigate, location]);

  // Show loading/blank while rehydrating to avoid flashing login page
  if (isRehydrating) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}

