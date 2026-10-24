import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./src/config/db.js";
import { validateEnvironment } from "./src/config/validate-env.js";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/utils/socket.js";

// Validate environment early
try {
  validateEnvironment();
} catch (error) {
  console.error("[STARTUP ERROR]", error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

// ⬅️ NEW: Initialize the socket logic (Auth, join/leave rooms, etc.)
initSocket(io);

// Keep this in case you ever want to access 'io' from an Express req object
// (e.g., req.app.get("io").emit(...))
app.set("io", io);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
  process.exit(1);
});

connectDB()
.then(() => {
  server.listen(PORT, () => {
    console.log(`[STARTUP] Server running on port ${PORT}`);
    console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || "development"}`);
  });
})
.catch((error) => {
  console.error("[DB_CONNECTION_FAILED]", error.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[SHUTDOWN] SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("[SHUTDOWN] Server closed");
    process.exit(0);
  });
});