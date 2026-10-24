import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Strip the "/api/v1" from your VITE_API_URL to get the root server URL for Socket.io
const SOCKET_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/api\/v1\/?$/, "");

export const useScoringSocket = (jobId) => {
    const [progress, setProgress] = useState({ processed: 0, total: 0, latestCandidate: "" });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
    if (!jobId) return;

    // Grab the token to pass backend authentication
    const token = localStorage.getItem("accessToken");

    const socket = io(SOCKET_URL, {
        withCredentials: true,
        auth: { token }
    });

    socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("join-job", jobId);
    });

    // Listen for the broadcast event we set up in the BullMQ worker
    socket.on("scoring-progress", (data) => {
        setProgress(data);
    });

    socket.on("disconnect", () => {
        setIsConnected(false);
    });

    // Cleanup: Leave room and disconnect when component unmounts or jobId changes
    return () => {
        socket.emit("leave-job", jobId);
        socket.disconnect();
    };
    }, [jobId]);

    return { progress, isConnected };
};