import { Card, CARD_TYPES } from "@operative/shared";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

export default function GameCard({ card, onClick, disabled }: GameCardProps) {
  // Determine color based on state
  // If hidden: Grey. If revealed: Team Color.
  let bgColor = "bg-neutral-800 hover:bg-neutral-700";
  let textColor = "text-white";
  let borderColor = "border-neutral-700";

  if (card.revealed) {
    switch (card.type) {
      case CARD_TYPES.RED:
        bgColor = "bg-red-600";
        borderColor = "border-red-800";
        break;
      case CARD_TYPES.BLUE:
        bgColor = "bg-blue-600";
        borderColor = "border-blue-800";
        break;
      case CARD_TYPES.NEUTRAL:
        bgColor = "bg-amber-200";
        textColor = "text-neutral-900";
        borderColor = "border-amber-400";
        break;
      case CARD_TYPES.ASSASSIN:
        bgColor = "bg-neutral-950";
        borderColor = "border-neutral-900";
        break;
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || card.revealed}
      className={`
        relative w-full aspect-[4/3] flex items-center justify-center 
        text-sm md:text-lg font-bold uppercase tracking-widest
        transition-all duration-300 border-b-4 rounded-lg shadow-lg
        ${bgColor} ${textColor} ${borderColor}
        ${card.revealed ? "cursor-default transform-none" : "active:translate-y-1 active:border-b-0"}
      `}
    >
      {card.word}
      
      {/* Optional: Add a subtle pattern or icon for the Assassin later */}
      {card.revealed && card.type === CARD_TYPES.ASSASSIN && (
        <span className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl">
          ☠
        </span>
      )}
    </button>
  );
}
