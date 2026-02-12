import { GameState, Card } from "@operative/shared";
import GameCard from "./GameCard";

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const handleCardClick = (cardId: string) => {
    // We will add the "Server Reveal" logic in the next step.
    // For now, this is just visual.
    console.log("Clicked card:", cardId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Scoreboard */}
      <div className="flex justify-between items-center mb-8 px-4 font-mono text-xl">
        <div className="text-red-500 font-bold">
          RED AGENTS: {gameState.scores.red}
        </div>
        <div className="bg-neutral-800 px-4 py-1 rounded text-neutral-400 text-sm">
          ROOM: {gameState.roomCode}
        </div>
        <div className="text-blue-500 font-bold">
          BLUE AGENTS: {gameState.scores.blue}
        </div>
      </div>

      {/* The 5x5 Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {gameState.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={gameState.phase === "game_over"}
          />
        ))}
      </div>

      {/* Turn Indicator */}
      <div className="mt-8 text-center">
        <span className={`
          inline-block px-6 py-2 rounded-full text-white font-bold tracking-widest animate-pulse
          ${gameState.turn === "red" ? "bg-red-600" : "bg-blue-600"}
        `}>
          {gameState.turn.toUpperCase()}'S TURN
        </span>
      </div>
    </div>
  );
}
