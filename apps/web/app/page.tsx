"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { GameState } from "@operative/shared";
import GameBoard from "../components/GameBoard";
import Lobby from "../components/Lobby";

export default function Home() {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Inputs
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [view, setView] = useState<"welcome" | "game">("welcome");

  useEffect(() => {
    if (!socket) return;

    socket.on("game_updated", (newGame: GameState) => {
      setGameState(newGame);
      setLoading(false);
      setView("game");
    });

    socket.on("error", (msg: string) => {
      alert(msg);
      setLoading(false);
    });

    return () => {
      socket.off("game_updated");
      socket.off("error");
    };
  }, [socket]);

  const handleCreateGame = () => {
    if (!socket || !playerName) return alert("Please enter your name");
    setLoading(true);
    socket.emit("create_game", playerName);
  };

  const handleJoinGame = () => {
    if (!socket || !joinCode || !playerName) return alert("Please enter name and code");
    setLoading(true);
    socket.emit("join_game", { roomCode: joinCode, playerName });
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-red-500 font-mono animate-pulse">
        CONNECTING TO SECURE SERVER...
      </div>
    );
  }

  // --- 1. WELCOME SCREEN (Enter Name) ---
  if (view === "welcome") {
    return (
      <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
          OPERATIVE
        </h1>
        
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <label className="block text-neutral-500 font-mono text-xs mb-2">IDENTIFICATION</label>
          <input 
            type="text" 
            placeholder="CODENAME" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded mb-8 text-lg font-bold text-white focus:outline-none focus:border-white transition-colors"
          />

          <div className="space-y-4">
            <button
              onClick={handleCreateGame}
              disabled={loading || !playerName}
              className="w-full py-4 bg-white text-black font-black text-xl tracking-widest rounded hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              {loading ? "INITIALIZING..." : "CREATE MISSION"}
            </button>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="CODE" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-1/3 bg-neutral-900 border border-neutral-700 p-3 rounded text-center font-mono uppercase font-bold focus:outline-none focus:border-white"
                maxLength={4}
              />
              <button 
                onClick={handleJoinGame}
                disabled={loading || !playerName || joinCode.length !== 4}
                className="flex-1 bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold rounded hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-50"
              >
                JOIN SQUAD
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- 2. LOBBY or GAME BOARD ---
  if (gameState?.phase === "lobby") {
    return (
      <main className="min-h-screen bg-neutral-900 text-white">
        <Lobby gameState={gameState} currentPlayerId={socket.id} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-white py-8">
      {gameState && <GameBoard gameState={gameState} />}
    </main>
  );
}
