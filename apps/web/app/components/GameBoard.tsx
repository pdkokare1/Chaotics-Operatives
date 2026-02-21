// apps/web/app/components/GameBoard.tsx
"use client";

import { useState, useEffect } from "react";
import { GameState, ROLES } from "@operative/shared";
import GameCard from "./GameCard";
import { useSocket } from "../../context/SocketContext";
import styles from "./GameBoard.module.css";

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const { socket } = useSocket();
  const [clueWord, setClueWord] = useState("");
  const [clueNum, setClueNum] = useState("1");
  const [copied, setCopied] = useState(false);

  const [timeLeft, setTimeLeft] = useState(gameState.timerDuration);
  
  // NEW: State to track "Mobile Safe Taps" (require double-click to reveal)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const myPlayer = gameState.players.find(p => p.id === socket?.id);
  const isMyTurn = gameState.turn === myPlayer?.team;
  const isSpymaster = myPlayer?.role === ROLES.SPYMASTER;
  const isHost = gameState.players[0]?.id === myPlayer?.id;
  const [viewAsSpymaster, setViewAsSpymaster] = useState(false);
  const showSpymasterView = isSpymaster || viewAsSpymaster;

  useEffect(() => {
    setTimeLeft(gameState.timerDuration);
    setSelectedCardId(null); // Clear active selections if the turn changes
  }, [gameState.turn, gameState.currentClue, gameState.timerDuration]);

  useEffect(() => {
    if (gameState.timerDuration === 0 || gameState.phase !== "playing") return;
    
    if (timeLeft <= 0) {
      if (isMyTurn) socket?.emit("end_turn");
      return;
    }

    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState.timerDuration, gameState.phase, isMyTurn, socket]);

  const handleCardClick = (cardId: string) => {
    if (!socket || isSpymaster || !isMyTurn || !gameState.currentClue) return;
    
    // NEW: Safe Tap Logic - First tap selects, second tap confirms and fires to server
    if (selectedCardId === cardId) {
      socket.emit("reveal_card", { roomCode: gameState.roomCode, cardId });
      setSelectedCardId(null); 
    } else {
      setSelectedCardId(cardId); 
    }
  };

  const submitClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !clueWord) return;
    socket.emit("give_clue", { word: clueWord, number: parseInt(clueNum) });
    setClueWord("");
  };

  const endTurn = () => { if (socket) socket.emit("end_turn"); };
  const handleRestart = () => { if (socket && confirm("Reset mission?")) socket.emit("restart_game", gameState.roomCode); };

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMission = () => {
    if (confirm("Are you sure you want to abort the mission?")) {
      if (socket) socket.emit("leave_game");
      window.location.reload();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // NEW: Mission Intel Feed Parser (Turns raw server text into styled badges)
  const renderLogEntry = (log: string) => {
    if (log.includes("FATAL ERROR")) {
      return <><span className={styles.tagFatal}>FATAL</span> <span style={{color: 'var(--red-primary)'}}>{log.replace("FATAL ERROR: ", "")}</span></>;
    }
    if (log.includes("civilian")) {
      return <><span className={styles.tagWarn}>INTEL</span> <span style={{color: 'var(--yellow-accent)'}}>{log}</span></>;
    }
    if (log.startsWith("RED") || log.includes("Red Team")) {
      return <><span className={styles.tagRed}>RED</span> {log.replace(/^RED\s/, "")}</>;
    }
    if (log.startsWith("BLUE") || log.includes("Blue Team")) {
      return <><span className={styles.tagBlue}>BLUE</span> {log.replace(/^BLUE\s/, "")}</>;
    }
    if (log.includes("MISSION")) {
      return <><span className={styles.tagSystem}>SYSTEM</span> {log}</>;
    }
    return <><span className={styles.tagSystem}>INFO</span> {log}</>;
  };

  // Dynamically apply background glow classes based on current turn
  const containerClass = `${styles.container} ${gameState.phase === 'playing' ? (gameState.turn === 'red' ? styles.glowRed : styles.glowBlue) : ''}`;

  return (
    <div className={containerClass}>
      
      {/* --- VICTORY OVERLAY --- */}
      {gameState.phase === "game_over" && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <div style={{fontSize: '4rem', marginBottom: '1rem'}} className="animate-pulse">
              {gameState.winner === "red" ? "🔴" : "🔵"}
            </div>
            <h2 className={`${styles.winnerTitle} ${gameState.winner === "red" ? styles.redWin : styles.blueWin}`}>
              {gameState.winner?.toUpperCase()} WINS!
            </h2>
            <p style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>MISSION ACCOMPLISHED</p>
            
            {isHost ? (
              <button onClick={handleRestart} className={styles.restartBtn}>PLAY AGAIN</button>
            ) : <p className="animate-pulse" style={{marginTop: '1rem', fontSize: '0.8rem'}}>Waiting for Host...</p>}
          </div>
        </div>
      )}

      {/* --- ACTION BAR --- */}
      <div className={styles.actionBar}>
        
        {/* SPYMASTER INPUT */}
        {gameState.phase === "playing" && isMyTurn && isSpymaster && !gameState.currentClue && (
          <form onSubmit={submitClue} className={styles.clueForm}>
            <input 
              type="text" 
              placeholder="CLUE WORD" 
              value={clueWord}
              onChange={e => setClueWord(e.target.value.toUpperCase().trim())}
              className={styles.clueInput}
              autoFocus
            />
            <select 
              value={clueNum}
              onChange={e => setClueNum(e.target.value)}
              className={styles.clueSelect}
            >
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
              <option value="0">0</option>
              <option value="99">∞</option>
            </select>
            <button type="submit" className={styles.sendBtn}>SEND</button>
          </form>
        )}

        {/* OPERATIVE GUESSING */}
        {gameState.phase === "playing" && isMyTurn && !isSpymaster && gameState.currentClue && (
          <div className={styles.activeCluePanel}>
            <div className={styles.clueDisplay}>
              {gameState.currentClue.word} <span style={{color: 'var(--text-muted)'}}>/</span> {gameState.currentClue.number}
            </div>
            <button onClick={endTurn} className={styles.endTurnBtn}>END TURN</button>
          </div>
        )}

        {/* WAITING STATE */}
        {gameState.phase === "playing" && (!isMyTurn || (!gameState.currentClue && !isSpymaster)) && (
          <div className={`${styles.waitingPanel} animate-pulse`}>
            <div style={{width: 10, height: 10, borderRadius: '50%', background: gameState.turn === 'red' ? 'var(--red-primary)' : 'var(--blue-primary)'}} />
            <span style={{fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.1em'}}>
              WAITING FOR {gameState.turn.toUpperCase()}...
            </span>
          </div>
        )}
      </div>

      {/* --- SCOREBOARD --- */}
      <div className={styles.scoreboard}>
        <div className={`${styles.scoreRed} ${gameState.turn === 'red' ? styles.scoreActive : styles.scoreInactive}`}>
          RED: {gameState.scores.red}
        </div>
        
        <button onClick={copyCode} className={styles.roomCodeDisplay}>
          <div style={{fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4}}>{copied ? "COPIED!" : "SECURE CHANNEL"}</div>
          <div className={styles.roomCodeBox}>{gameState.roomCode}</div>
          
          {gameState.timerDuration > 0 && gameState.phase === "playing" && (
            <div style={{ fontSize: '0.8rem', marginTop: 4, color: timeLeft <= 10 ? 'var(--red-primary)' : 'var(--text-muted)', fontWeight: timeLeft <= 10 ? 'bold' : 'normal' }}>
              TIME: {formatTime(timeLeft)}
            </div>
          )}
        </button>
        
        <div className={`${styles.scoreBlue} ${gameState.turn === 'blue' ? styles.scoreActive : styles.scoreInactive}`}>
          BLUE: {gameState.scores.blue}
        </div>
      </div>

      {/* --- GRID --- */}
      <div className={styles.grid}>
        {gameState.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={gameState.phase === "game_over" || (isMyTurn && !isSpymaster && !gameState.currentClue)}
            isSpymaster={showSpymasterView}
            isSelected={selectedCardId === card.id} 
          />
        ))}
      </div>

      {/* --- FOOTER --- */}
      <div className={styles.footer}>
        <div className={styles.logs}>
          {gameState.logs.slice().reverse().map((log, i) => (
            <div key={i} className={styles.logEntry}>
               {renderLogEntry(log)}
            </div>
          ))}
        </div>

        <div className={styles.controls}>
           {!isSpymaster && (
             <button onClick={() => setViewAsSpymaster(!viewAsSpymaster)} className={styles.controlBtn}>
               {viewAsSpymaster ? "HIDE CHEAT" : "VIEW CHEAT"}
             </button>
           )}
           {isHost && (
             <button onClick={handleRestart} className={styles.controlBtn} style={{borderColor: 'var(--red-dark)', color: 'var(--red-primary)'}}>
               RESET
             </button>
           )}
           <button onClick={leaveMission} className={styles.controlBtn}>
             ABORT
           </button>
        </div>
      </div>
    </div>
  );
}
