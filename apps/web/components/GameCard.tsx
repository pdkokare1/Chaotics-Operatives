import { Card, CARD_TYPES } from "@operative/shared";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  isSpymaster: boolean; // New Prop
}

export default function GameCard({ card, onClick, disabled, isSpymaster }: GameCardProps) {
  // Base State (Hidden / Unknown)
  let bgColor = "bg-neutral-800";
  let textColor = "text-white";
  let borderColor = "border-neutral-700";
  let opacity = "opacity-100";

  // LOGIC: Determine how to display the card
  if (card.revealed) {
    // REVEALED: Show full bright colors
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
        textColor = "text-red-500";
        break;
    }
  } else if (isSpymaster) {
    // SPYMASTER VIEW: Show dimmed hints
    opacity = "opacity-90"; // Slightly see-through
    switch (card.type) {
      case CARD_TYPES.RED:
        bgColor = "bg-red-900/40 text-red-200 border-red-900"; 
        break;
      case CARD_TYPES.BLUE:
        bgColor = "bg-blue-900/40 text-blue-200 border-blue-900";
        break;
      case CARD_TYPES.NEUTRAL:
        bgColor = "bg-neutral-800 text-neutral-400 border-neutral-700"; // Keep neutral vague but darker
        break;
      case CARD_TYPES.ASSASSIN:
        bgColor = "bg-neutral-950 border-red-900/50 text-neutral-500";
        break;
    }
  } else {
    // OPERATIVE VIEW: Standard hidden card
    bgColor = "bg-neutral-800 hover:bg-neutral-700";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || card.revealed || isSpymaster} // Spymasters can't click cards!
      className={`
        relative w-full aspect-[4/3] flex items-center justify-center 
        text-sm md:text-lg font-bold uppercase tracking-widest
        transition-all duration-300 border-b-4 rounded-lg shadow-lg
        ${bgColor} ${textColor} ${borderColor} ${opacity}
        ${(card.revealed || isSpymaster) ? "cursor-default transform-none border-b-0" : "active:translate-y-1 active:border-b-0"}
      `}
    >
      {card.word}
      
      {/* Icon for Assassin (Visible to Spymaster or when Revealed) */}
      {(card.revealed || isSpymaster) && card.type === CARD_TYPES.ASSASSIN && (
        <span className="absolute top-1 right-2 text-xs md:text-sm opacity-50">☠</span>
      )}
    </button>
  );
}
