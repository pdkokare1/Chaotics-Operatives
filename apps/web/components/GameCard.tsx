import { Card, CARD_TYPES } from "@operative/shared";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  isSpymaster: boolean;
}

export default function GameCard({ card, onClick, disabled, isSpymaster }: GameCardProps) {
  // Determine the styling for the BACK of the card (Revealed State)
  let backBg = "bg-neutral-800";
  let backBorder = "border-neutral-700";
  let backText = "text-white";
  let Icon = null;

  switch (card.type) {
    case CARD_TYPES.RED:
      backBg = "bg-red-600";
      backBorder = "border-red-800";
      break;
    case CARD_TYPES.BLUE:
      backBg = "bg-blue-600";
      backBorder = "border-blue-800";
      break;
    case CARD_TYPES.NEUTRAL:
      backBg = "bg-amber-100";
      backText = "text-neutral-900";
      backBorder = "border-amber-300";
      break;
    case CARD_TYPES.ASSASSIN:
      backBg = "bg-neutral-950";
      backBorder = "border-neutral-800";
      backText = "text-red-500";
      Icon = <span className="text-4xl opacity-50">☠</span>;
      break;
  }

  // Determine Spymaster Hint (Border Only)
  let spymasterBorder = "";
  if (isSpymaster && !card.revealed) {
    switch (card.type) {
      case CARD_TYPES.RED: spymasterBorder = "border-red-500/50 bg-red-900/10"; break;
      case CARD_TYPES.BLUE: spymasterBorder = "border-blue-500/50 bg-blue-900/10"; break;
      case CARD_TYPES.NEUTRAL: spymasterBorder = "border-amber-500/30"; break;
      case CARD_TYPES.ASSASSIN: spymasterBorder = "border-neutral-500/50 bg-black"; break;
    }
  }

  return (
    <div className="relative w-full aspect-[4/3] perspective-1000">
      <div
        className={`
          w-full h-full relative transition-all duration-500 transform-style-3d cursor-pointer
          ${card.revealed ? "rotate-y-180" : ""}
          ${!card.revealed && !disabled && !isSpymaster ? "hover:-translate-y-1" : ""}
        `}
        onClick={(!card.revealed && !disabled && !isSpymaster) ? onClick : undefined}
      >
        {/* --- FRONT FACE (Hidden) --- */}
        <div className={`
          absolute inset-0 w-full h-full backface-hidden
          flex items-center justify-center rounded-lg shadow-lg border-b-4
          bg-neutral-800 text-white font-bold uppercase tracking-widest text-xs md:text-sm lg:text-base
          transition-colors border-neutral-700
          ${spymasterBorder}
          ${isSpymaster && card.type === CARD_TYPES.ASSASSIN ? "text-red-500" : ""}
        `}>
          {card.word}
          {/* Spymaster Icon Hint */}
          {isSpymaster && card.type === CARD_TYPES.ASSASSIN && <span className="absolute top-1 right-1 text-[10px]">☠</span>}
        </div>

        {/* --- BACK FACE (Revealed) --- */}
        <div className={`
          absolute inset-0 w-full h-full backface-hidden rotate-y-180
          flex items-center justify-center rounded-lg shadow-inner
          ${backBg} ${backText} ${backBorder} border-4
          font-bold uppercase tracking-widest text-xs md:text-sm lg:text-base
        `}>
          {Icon ? Icon : card.word}
        </div>
      </div>
    </div>
  );
}
