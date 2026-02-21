// apps/web/app/components/GameCard.tsx
"use client";

import { Card, CARD_TYPES } from "@operative/shared";
import styles from "./GameCard.module.css";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  isSpymaster: boolean;
  isSelected?: boolean; // NEW: Prop to track mobile safe taps
}

export default function GameCard({ card, onClick, disabled, isSpymaster, isSelected }: GameCardProps) {
  
  const getBackClass = () => {
    switch (card.type) {
      case CARD_TYPES.RED: return styles.backRed;
      case CARD_TYPES.BLUE: return styles.backBlue;
      case CARD_TYPES.NEUTRAL: return styles.backNeutral;
      case CARD_TYPES.ASSASSIN: return styles.backAssassin;
      default: return "";
    }
  };

  const getHintClass = () => {
    if (!isSpymaster || card.revealed) return "";
    switch (card.type) {
      case CARD_TYPES.RED: return styles.hintRed;
      case CARD_TYPES.BLUE: return styles.hintBlue;
      case CARD_TYPES.NEUTRAL: return styles.hintNeutral;
      case CARD_TYPES.ASSASSIN: return styles.hintAssassin;
      default: return "";
    }
  };

  const isInteractive = !card.revealed && !disabled && !isSpymaster;

  return (
    <div className={styles.container}>
      <div 
        // Embedded the new isSelected class dynamically here
        className={`${styles.cardInner} ${card.revealed ? styles.isRevealed : ""} ${isInteractive ? styles.isInteractive : ""} ${isSelected ? styles.isSelected : ""}`}
        onClick={isInteractive ? onClick : undefined}
      >
        {/* FRONT */}
        <div className={`${styles.face} ${styles.front} ${getHintClass()}`}>
          {card.word}
          {isSpymaster && card.type === CARD_TYPES.ASSASSIN && (
             <span style={{position:'absolute', top: 4, right: 4, fontSize: 10}}>☠</span>
          )}
        </div>

        {/* BACK */}
        <div className={`${styles.face} ${styles.back} ${getBackClass()}`}>
          {card.type === CARD_TYPES.ASSASSIN ? <span className={styles.assassinIcon}>☠</span> : card.word}
        </div>
      </div>
    </div>
  );
}
