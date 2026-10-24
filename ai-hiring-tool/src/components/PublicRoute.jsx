import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const PublicRoute = () => {
    const { user, isRehydrating } = useAuth();

    // 1. Wait for the initial session check to finish
    if (isRehydrating) {
        return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
        );
    }

    // 2. If the user is logged in, send them to the dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Otherwise, let them see the public page (Landing, Login, Signup)
    return <Outlet />;
};

export default PublicRoute;