import { GameState, Player, TEAMS, ROLES } from "@operative/shared";
import { useSocket } from "../context/SocketContext";

interface LobbyProps {
  gameState: GameState;
  currentPlayerId?: string;
}

export default function Lobby({ gameState, currentPlayerId }: LobbyProps) {
  const { socket } = useSocket();

  const redTeam = gameState.players.filter(p => p.team === TEAMS.RED);
  const blueTeam = gameState.players.filter(p => p.team === TEAMS.BLUE);

  // Helper to check if I am the Host (first player usually)
  const isHost = gameState.players[0]?.id === currentPlayerId;

  const switchTeam = (team: string) => {
    socket?.emit("change_team", team);
  };

  const switchRole = (role: string) => {
    socket?.emit("change_role", role);
  };

  const startGame = () => {
    socket?.emit("start_game");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center animate-in fade-in duration-500">
      
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2">MISSION LOBBY</h2>
        <div className="inline-block bg-neutral-800 px-6 py-2 rounded-full border border-neutral-700">
          <span className="text-neutral-500 font-mono mr-3">ROOM CODE:</span>
          <span className="text-white font-mono font-bold text-xl tracking-widest">{gameState.roomCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
        {/* --- RED TEAM --- */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 flex flex-col">
          <button 
            onClick={() => switchTeam(TEAMS.RED)}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest rounded mb-6 transition-all"
          >
            JOIN RED TEAM
          </button>

          <div className="space-y-3">
            {redTeam.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isMe={player.id === currentPlayerId}
                onRoleSwitch={switchRole}
              />
            ))}
            {redTeam.length === 0 && <div className="text-red-800/50 text-center italic">No Agents</div>}
          </div>
        </div>

        {/* --- BLUE TEAM --- */}
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-6 flex flex-col">
          <button 
             onClick={() => switchTeam(TEAMS.BLUE)}
             className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest rounded mb-6 transition-all"
          >
            JOIN BLUE TEAM
          </button>

          <div className="space-y-3">
            {blueTeam.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isMe={player.id === currentPlayerId}
                onRoleSwitch={switchRole}
              />
            ))}
            {blueTeam.length === 0 && <div className="text-blue-800/50 text-center italic">No Agents</div>}
          </div>
        </div>
      </div>

      {isHost ? (
        <button 
          onClick={startGame}
          className="px-12 py-5 bg-white text-black font-black text-2xl tracking-widest rounded hover:bg-neutral-200 transition-transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          START MISSION
        </button>
      ) : (
        <div className="text-neutral-500 font-mono animate-pulse">
          WAITING FOR HOST TO START...
        </div>
      )}
    </div>
  );
}

// Sub-component for individual player row
function PlayerCard({ player, isMe, onRoleSwitch }: { player: Player, isMe: boolean, onRoleSwitch: (r: string) => void }) {
  return (
    <div className={`
      flex items-center justify-between p-3 rounded bg-neutral-900/50 border border-neutral-800
      ${isMe ? "ring-1 ring-white/50" : ""}
    `}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${player.role === ROLES.SPYMASTER ? "bg-yellow-400 animate-pulse" : "bg-neutral-600"}`} />
        <span className={`font-bold ${isMe ? "text-white" : "text-neutral-400"}`}>
          {player.name} {isMe && "(YOU)"}
        </span>
      </div>

      {isMe && (
        <div className="flex bg-neutral-950 rounded p-1">
          <button 
            onClick={() => onRoleSwitch(ROLES.OPERATIVE)}
            className={`px-2 py-1 text-[10px] font-bold rounded ${player.role === ROLES.OPERATIVE ? "bg-neutral-700 text-white" : "text-neutral-600 hover:text-white"}`}
          >
            OP
          </button>
          <button 
            onClick={() => onRoleSwitch(ROLES.SPYMASTER)}
            className={`px-2 py-1 text-[10px] font-bold rounded ${player.role === ROLES.SPYMASTER ? "bg-neutral-700 text-yellow-400" : "text-neutral-600 hover:text-white"}`}
          >
            SPY
          </button>
        </div>
      )}
      {!isMe && (
        <span className="text-[10px] font-mono text-neutral-600 uppercase">
          {player.role === ROLES.SPYMASTER ? "SPYMASTER" : "OPERATIVE"}
        </span>
      )}
    </div>
  );
}
