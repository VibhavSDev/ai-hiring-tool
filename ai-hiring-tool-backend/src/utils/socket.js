import jwt from "jsonwebtoken";

let ioInstance; // We create a variable to hold the instance

export const initSocket = (io) => {
  ioInstance = io; // Save the instance when the server starts

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication error: Token missing"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?._id || socket.user?.id;

    socket.on("join-job", (jobId) => {
      if (!jobId) return;
      socket.join(`job:${jobId}`);
    });

    socket.on("leave-job", (jobId) => {
      if (!jobId) return;
      socket.leave(`job:${jobId}`);
    });
  });
};

// Export this getter so ANY file in your backend can broadcast events!
export const getIO = () => {
  if (!ioInstance) {
    console.warn("Socket.io has not been initialized yet!");
  }
  return ioInstance;
};