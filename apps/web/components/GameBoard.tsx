import { useState } from "react";
import { GameState } from "@operative/shared";
import GameCard from "./GameCard";
import { useSocket } from "../context/SocketContext";

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const { socket } = useSocket();
  const [isSpymaster, setIsSpymaster] = useState(false);

  const handleCardClick = (cardId: string) => {
    if (!socket || isSpymaster) return;
    
    socket.emit("reveal_card", { 
      roomCode: gameState.roomCode, 
      cardId 
    });
  };

  const handleRestart = () => {
    if (!socket) return;
    if (confirm("Are you sure you want to reset the mission?")) {
      socket.emit("restart_game", gameState.roomCode);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
      
      {/* --- Control Bar (Spymaster Toggle & Restart) --- */}
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <button 
          onClick={() => setIsSpymaster(!isSpymaster)}
          className={`
            px-4 py-2 rounded text-xs md:text-sm font-bold tracking-wider border transition-all
            ${isSpymaster 
              ? "bg-neutral-100 text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
              : "bg-transparent text-neutral-500 border-neutral-700 hover:text-white"}
          `}
        >
          {isSpymaster ? "👁 SPYMASTER ACTIVE" : "👁 VIEW AS SPYMASTER"}
        </button>

        <button 
          onClick={handleRestart}
          className="px-4 py-2 rounded text-xs md:text-sm font-bold tracking-wider text-neutral-500 hover:text-red-500 transition-colors"
        >
          ↻ RESTART MISSION
        </button>
      </div>

      {/* --- Winner Banner --- */}
      {gameState.phase === "game_over" && (
        <div className={`
          w-full mb-8 px-8 py-6 rounded-xl text-2xl md:text-4xl font-black tracking-widest text-center animate-bounce shadow-2xl
          ${gameState.winner === "red" ? "bg-red-600 text-white shadow-red-900/50" : "bg-blue-600 text-white shadow-blue-900/50"}
        `}>
          MISSION COMPLETE: {gameState.winner?.toUpperCase()} WINS!
        </div>
      )}

      {/* --- Scoreboard --- */}
      <div className="w-full flex justify-between items-center mb-6 px-4 font-mono text-xl md:text-3xl">
        <div className={`font-black transition-all duration-500 ${gameState.turn === 'red' ? 'text-red-500 scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-red-900/50'}`}>
          RED: {gameState.scores.red}
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-[10px] md:text-xs text-neutral-600 tracking-[0.2em] mb-1">SECURE CHANNEL</div>
          <div className="bg-neutral-900 px-6 py-2 rounded border border-neutral-800 text-white font-mono font-bold tracking-widest text-lg md:text-xl">
            {gameState.roomCode}
          </div>
        </div>
        
        <div className={`font-black transition-all duration-500 ${gameState.turn === 'blue' ? 'text-blue-500 scale-110 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-blue-900/50'}`}>
          BLUE: {gameState.scores.blue}
        </div>
      </div>

      {/* --- The Grid --- */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-3xl">
        {gameState.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={gameState.phase === "game_over"}
            isSpymaster={isSpymaster}
          />
        ))}
      </div>

      {/* --- Game Logs --- */}
      <div className="mt-8 w-full max-w-3xl bg-neutral-950/50 rounded-lg p-4 h-32 overflow-y-auto border border-neutral-800 font-mono text-xs md:text-sm text-neutral-400 shadow-inner">
        {gameState.logs.slice().reverse().map((log, i) => (
          <div key={i} className="mb-2 border-b border-neutral-900/50 pb-1 last:border-0 last:pb-0">
            <span className="text-neutral-600 mr-2">{">"}</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
