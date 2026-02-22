// apps/web/app/components/GameCard.tsx
"use client";

import { useRef, useState } from "react"; 
import { Card, CARD_TYPES } from "@operative/shared";
import styles from "./GameCard.module.css";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  isSpymaster: boolean;
  isSelected?: boolean;
  targetingPlayers?: string[]; // NEW
}

export default function GameCard({ card, onClick, disabled, isSpymaster, isSelected, targetingPlayers = [] }: GameCardProps) {
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  const getAnimationClass = () => {
    if (!card.revealed) return "";
    if (card.type === CARD_TYPES.ASSASSIN) return styles.glitchAnim;
    if (card.type === CARD_TYPES.RED || card.type === CARD_TYPES.BLUE) return styles.flashAnim;
    return "";
  };

  const isInteractive = !card.revealed && !disabled && !isSpymaster;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setTilt({ x: 0, y: 0 }); 
  };

  return (
    <div className={styles.container}>
      <div 
        ref={cardRef}
        className={`${styles.cardInner} ${card.revealed ? styles.isRevealed : ""} ${isInteractive ? styles.isInteractive : ""} ${isSelected ? styles.isSelected : ""} ${getAnimationClass()}`}
        onClick={isInteractive ? onClick : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isInteractive ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : undefined}
      >
        {/* FRONT */}
        <div className={`${styles.face} ${styles.front} ${getHintClass()}`}>
          {card.word}
          {isSpymaster && card.type === CARD_TYPES.ASSASSIN && (
             <span style={{position:'absolute', top: 4, right: 4, fontSize: 10}}>☠</span>
          )}
          
          {/* NEW: Synchronized Teammate Targeting UI */}
          {!card.revealed && targetingPlayers.length > 0 && (
            <>
              <div className={styles.targetOverlay} />
              <div className={styles.targetNameBadge}>
                {targetingPlayers.length === 1 ? targetingPlayers[0] : `${targetingPlayers.length} AGENTS`}
              </div>
            </>
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
