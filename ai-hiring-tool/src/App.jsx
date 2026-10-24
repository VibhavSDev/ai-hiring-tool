import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ─────────── Layout & Guards ─────────── */
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AuthSessionHandler from "./components/AuthSessionHandler";

/* ─────────── Public Pages ─────────── */
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ─────────── App Pages ─────────── */
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/jobs/JobsList";
import JobDetails from "./pages/jobs/JobDetails";
import CandidatesPage from "./pages/candidates/CandidatesPage";
import CandidateDetailPage from "./pages/candidates/CandidateDetailPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* Handles token refresh / logout globally via API interceptor events */}
      <AuthSessionHandler />

      <Routes>
        {/* ─────────── Public Routes ─────────── */}
        <Route element={<PublicRoute/>}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ─────────── Protected App Routes ─────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            
            {/* The conflicting index route was removed from here */}
            
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Core Pipeline Workflow */}
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
            
          </Route>
        </Route>
        
        {/* Fallback route to catch 404s and redirect to home or dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;