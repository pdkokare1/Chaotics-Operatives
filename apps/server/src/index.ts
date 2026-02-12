import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { generateGame, makeMove, addPlayer, removePlayer, updatePlayer, startGame, giveClue, endTurn } from "./gameLogic";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const games = new Map<string, any>();
const socketToRoom = new Map<string, string>(); 

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- Create Game ---
  socket.on("create_game", (hostName: string) => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    let gameState = generateGame(roomCode);
    const name = hostName || "Host";
    gameState = addPlayer(gameState, socket.id, name);
    games.set(roomCode, gameState);
    socketToRoom.set(socket.id, roomCode);
    socket.join(roomCode);
    io.to(roomCode).emit("game_updated", gameState);
  });

  // --- Join Game ---
  socket.on("join_game", ({ roomCode, playerName }) => {
    const code = roomCode.trim().toUpperCase();
    if (games.has(code)) {
      let gameState = games.get(code);
      const name = playerName || `Agent ${socket.id.substring(0, 3)}`;
      gameState = addPlayer(gameState, socket.id, name);
      games.set(code, gameState);
      socketToRoom.set(socket.id, code);
      socket.join(code);
      io.to(code).emit("game_updated", gameState);
    } else {
      socket.emit("error", "Room not found");
    }
  });

  // --- Lobby Actions ---
  socket.on("change_team", (team) => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = updatePlayer(gameState, socket.id, { team, role: "operative" });
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  socket.on("change_role", (role) => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = updatePlayer(gameState, socket.id, { role });
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  socket.on("start_game", () => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = startGame(gameState);
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  // --- Game Actions ---
  socket.on("reveal_card", ({ roomCode, cardId }) => {
    const code = roomCode.trim().toUpperCase();
    if (games.has(code)) {
      let gameState = games.get(code);
      gameState = makeMove(gameState, cardId);
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  socket.on("give_clue", ({ word, number }) => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = giveClue(gameState, word, number);
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  socket.on("end_turn", () => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = endTurn(gameState);
      games.set(code, gameState);
      io.to(code).emit("game_updated", gameState);
    }
  });

  socket.on("restart_game", (roomCode) => {
    const code = roomCode.trim().toUpperCase();
    if (games.has(code)) {
      let oldState = games.get(code);
      let newState = generateGame(code);
      newState.players = oldState.players;
      newState.phase = "lobby"; 
      newState.logs = ["Mission Reset. Prepare for deployment."];
      games.set(code, newState);
      io.to(code).emit("game_updated", newState);
    }
  });

  socket.on("disconnect", () => {
    const code = socketToRoom.get(socket.id);
    if (code && games.has(code)) {
      let gameState = games.get(code);
      gameState = removePlayer(gameState, socket.id);
      if (gameState.players.length === 0) games.delete(code);
      else {
        games.set(code, gameState);
        io.to(code).emit("game_updated", gameState);
      }
    }
    socketToRoom.delete(socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
