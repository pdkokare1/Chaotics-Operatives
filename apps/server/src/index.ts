import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { generateGame } from "./gameLogic";

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS for Frontend access
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-Memory Storage for Games
// (Note: In a production app with multiple server instances, we would use Redis)
const games = new Map<string, any>();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- Event: Create Game ---
  socket.on("create_game", () => {
    // Generate a random 4-letter room code
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Create the game state using our logic
    const gameState = generateGame(roomCode);
    
    // Save to memory
    games.set(roomCode, gameState);

    // Join the socket to the room
    socket.join(roomCode);
    
    // Send the game state back to the user
    socket.emit("game_created", gameState);
    console.log(`Game Created: ${roomCode}`);
  });

  // --- Event: Join Game ---
  socket.on("join_game", (roomCode: string) => {
    // Clean up the code (remove spaces, uppercase)
    const code = roomCode.trim().toUpperCase();

    if (games.has(code)) {
      socket.join(code);
      const gameState = games.get(code);
      
      // Send the current game state to the new player
      socket.emit("game_joined", gameState);
      console.log(`User ${socket.id} joined room ${code}`);
    } else {
      socket.emit("error", "Room not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
