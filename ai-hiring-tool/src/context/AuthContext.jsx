import { createContext, useContext, useState, useEffect } from "react";
import { logoutAPI } from "../services/api";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isRehydrating, setIsRehydrating] = useState(true);
  const [rehydrationError, setRehydrationError] = useState(null);

  // On mount, try to rehydrate session from /auth/me
  useEffect(() => {
    const rehydrateSession = async () => {
      try {
        const data = await API.get("/auth/me"); // api.js already unwrapped this!
        
        // Handle variations (data.user or just data depending on backend controller)
        const userData = data?.user || data; 
        
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        setRehydrationError(error.message);
      } finally {
        setIsRehydrating(false);
      }
    };

    rehydrateSession();
  }, []);

  function login(data) {
    const userData = data?.user ?? data?.recruiter ?? data;
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    
    // CRITICAL: Save the access token so your useScoringSocket hook can authenticate!
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
  }

  function logout() {
    try {
      logoutAPI();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken"); // Clean up token for sockets
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isRehydrating, rehydrationError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);