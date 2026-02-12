// apps/server/src/index.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { GameState } from "@operative/shared"; // Importing from shared!

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Basic Health Check
app.get("/", (req, res) => {
  res.send("Operative Game Server Running");
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Example of using shared type
  socket.on("join_room", (roomCode: string) => {
    socket.join(roomCode);
    console.log(`User joined room: ${roomCode}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
