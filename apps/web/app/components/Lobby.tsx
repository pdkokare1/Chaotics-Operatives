// apps/web/app/components/Lobby.tsx
"use client";

import { useState } from "react";
import { GameState, Player, TEAMS, ROLES } from "@operative/shared";
import { useSocket } from "../../context/SocketContext";
import styles from "./Lobby.module.css";

interface LobbyProps {
  gameState: GameState;
  currentPlayerId?: string;
}

export default function Lobby({ gameState, currentPlayerId }: LobbyProps) {
  const { socket } = useSocket();

  // NEW: State for Host options
  const [selectedCategory, setSelectedCategory] = useState("Standard Mix");
  const [selectedTimer, setSelectedTimer] = useState(0);

  const redTeam = gameState.players.filter(p => p.team === TEAMS.RED);
  const blueTeam = gameState.players.filter(p => p.team === TEAMS.BLUE);
  const isHost = gameState.players[0]?.id === currentPlayerId;

  const switchTeam = (team: string) => { socket?.emit("change_team", team); };
  const switchRole = (role: string) => { socket?.emit("change_role", role); };
  
  // NEW: Send options when starting
  const startGame = () => { socket?.emit("start_game", { category: selectedCategory, timer: selectedTimer }); };

  const leaveMission = () => {
    if (confirm("Are you sure you want to leave this mission?")) {
      socket?.emit("leave_game");
      window.location.reload(); 
    }
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h2 className={styles.title}>MISSION LOBBY</h2>
        <div className={styles.codeBadge}>
          <span className={styles.codeLabel}>ROOM CODE:</span>
          <span className={styles.codeValue}>{gameState.roomCode}</span>
        </div>
      </div>

      <div className={styles.teamsGrid}>
        {/* --- RED TEAM --- */}
        <div className={`${styles.teamPanel} ${styles.redPanel}`}>
          <button onClick={() => switchTeam(TEAMS.RED)} className={`${styles.joinButton} ${styles.joinRed}`}>
            JOIN RED TEAM
          </button>
          <div className={styles.playerList}>
            {redTeam.map(player => (
              <PlayerCard key={player.id} player={player} isMe={player.id === currentPlayerId} onRoleSwitch={switchRole} />
            ))}
            {redTeam.length === 0 && <div className={styles.emptyState}>No Agents</div>}
          </div>
        </div>

        {/* --- BLUE TEAM --- */}
        <div className={`${styles.teamPanel} ${styles.bluePanel}`}>
          <button onClick={() => switchTeam(TEAMS.BLUE)} className={`${styles.joinButton} ${styles.joinBlue}`}>
            JOIN BLUE TEAM
          </button>
          <div className={styles.playerList}>
            {blueTeam.map(player => (
              <PlayerCard key={player.id} player={player} isMe={player.id === currentPlayerId} onRoleSwitch={switchRole} />
            ))}
            {blueTeam.length === 0 && <div className={styles.emptyState}>No Agents</div>}
          </div>
        </div>
      </div>

      {isHost ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          {/* NEW: Host Settings */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
          >
            <option value="Standard Mix">Standard Mix</option>
            <option value="Spy & Action">Spy & Action</option>
            <option value="Places & Nature">Places & Nature</option>
            <option value="Objects & Food">Objects & Food</option>
            <option value="Characters & Myths">Characters & Myths</option>
          </select>

          <select 
            value={selectedTimer} 
            onChange={(e) => setSelectedTimer(Number(e.target.value))}
            style={{ padding: '0.75rem', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
          >
            <option value={0}>Timer: Off</option>
            <option value={60}>Timer: 60 Seconds</option>
            <option value={90}>Timer: 90 Seconds</option>
            <option value={120}>Timer: 120 Seconds</option>
          </select>

          <button onClick={startGame} className={styles.startButton}>START MISSION</button>
        </div>
      ) : (
        <div className="animate-pulse" style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>
          WAITING FOR HOST TO START...
        </div>
      )}

      <button 
        onClick={leaveMission} 
        style={{marginTop: '2rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', borderRadius: '4px', fontSize: '0.8rem', letterSpacing: '0.1em'}}
      >
        LEAVE MISSION
      </button>
    </div>
  );
}

function PlayerCard({ player, isMe, onRoleSwitch }: { player: Player, isMe: boolean, onRoleSwitch: (r: string) => void }) {
  const isSpy = player.role === ROLES.SPYMASTER;
  return (
    <div className={`${styles.playerCard} ${isMe ? styles.isMe : ""}`}>
      <div className={styles.playerInfo}>
        <div className={`${styles.roleDot} ${isSpy ? styles.isSpymaster : ""} ${isSpy ? "animate-pulse" : ""}`} />
        <span className={`${styles.playerName} ${isMe ? styles.nameActive : ""}`}>
          {player.name} {isMe && "(YOU)"}
        </span>
      </div>

      {isMe ? (
        // NEW: Changed Toggle to Dropdown as requested
        // Original Code Commented Out:
        // <div className={styles.roleToggle}>
        //   <button 
        //     onClick={() => onRoleSwitch(ROLES.OPERATIVE)}
        //     className={`${styles.roleBtn} ${!isSpy ? styles.roleBtnActive : ""}`}
        //   >OP</button>
        //   <button 
        //     onClick={() => onRoleSwitch(ROLES.SPYMASTER)}
        //     className={`${styles.roleBtn} ${isSpy ? styles.spyActive : ""}`}
        //   >SPY</button>
        // </div>
        <select 
          value={player.role}
          onChange={(e) => onRoleSwitch(e.target.value)}
          style={{ background: '#000', color: 'var(--text-muted)', border: '1px solid #404040', borderRadius: '4px', fontSize: '10px', padding: '4px 6px', fontWeight: 'bold' }}
        >
          <option value={ROLES.OPERATIVE}>OPERATIVE</option>
          <option value={ROLES.SPYMASTER}>SPYMASTER</option>
        </select>
      ) : (
        <span style={{fontSize: '10px', fontFamily: 'monospace', color: '#525252'}}>
          {isSpy ? "SPYMASTER" : "OPERATIVE"}
        </span>
      )}
    </div>
  );
}
