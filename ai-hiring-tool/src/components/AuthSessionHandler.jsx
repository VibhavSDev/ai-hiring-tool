import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Listens for 401-triggered session expiry from the API layer.
 * Clears auth state and redirects to login without a full page reload.
 */
export default function AuthSessionHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpired = () => {
      logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:sessionExpired", handleExpired);
    return () => window.removeEventListener("auth:sessionExpired", handleExpired);
  }, [logout, navigate]);

  return null;
}
