import { GameState, Card } from "@operative/shared";
import GameCard from "./GameCard";
import { useSocket } from "../context/SocketContext"; // Import socket

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const { socket } = useSocket();

  const handleCardClick = (cardId: string) => {
    if (!socket) return;
    
    // Send the move to the server
    socket.emit("reveal_card", { 
      roomCode: gameState.roomCode, 
      cardId 
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
      
      {/* Game Status / Winner Banner */}
      {gameState.phase === "game_over" && (
        <div className={`
          mb-8 px-8 py-4 rounded-xl text-2xl font-black tracking-widest animate-bounce
          ${gameState.winner === "red" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}
        `}>
          MISSION COMPLETE: {gameState.winner?.toUpperCase()} WINS!
        </div>
      )}

      {/* Scoreboard */}
      <div className="w-full flex justify-between items-center mb-6 px-4 font-mono text-xl md:text-2xl">
        <div className={`font-bold transition-all ${gameState.turn === 'red' ? 'text-red-500 scale-110' : 'text-red-900'}`}>
          RED: {gameState.scores.red}
        </div>
        
        <div className="bg-neutral-800 px-6 py-2 rounded-full text-neutral-400 text-sm md:text-base border border-neutral-700">
          CODE: <span className="text-white font-bold tracking-widest">{gameState.roomCode}</span>
        </div>
        
        <div className={`font-bold transition-all ${gameState.turn === 'blue' ? 'text-blue-500 scale-110' : 'text-blue-900'}`}>
          BLUE: {gameState.scores.blue}
        </div>
      </div>

      {/* The 5x5 Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 w-full aspect-[5/4] md:aspect-auto">
        {gameState.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={gameState.phase === "game_over"}
          />
        ))}
      </div>

      {/* Game Logs (What just happened?) */}
      <div className="mt-8 w-full max-w-2xl bg-neutral-950 rounded-lg p-4 h-32 overflow-y-auto border border-neutral-800 font-mono text-xs md:text-sm text-neutral-400">
        {gameState.logs.slice().reverse().map((log, i) => (
          <div key={i} className="mb-1 border-b border-neutral-900 pb-1 last:border-0">
            {">"} {log}
          </div>
        ))}
      </div>
    </div>
  );
}
