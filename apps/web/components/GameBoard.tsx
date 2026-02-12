import { useState } from "react";
import { GameState, ROLES } from "@operative/shared";
import GameCard from "./GameCard";
import { useSocket } from "../context/SocketContext";

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const { socket } = useSocket();
  const [clueWord, setClueWord] = useState("");
  const [clueNum, setClueNum] = useState("1");
  const [copied, setCopied] = useState(false);

  const myPlayer = gameState.players.find(p => p.id === socket?.id);
  const isMyTurn = gameState.turn === myPlayer?.team;
  const isSpymaster = myPlayer?.role === ROLES.SPYMASTER;
  const isHost = gameState.players[0]?.id === myPlayer?.id;
  const [viewAsSpymaster, setViewAsSpymaster] = useState(false);
  const showSpymasterView = isSpymaster || viewAsSpymaster;

  const handleCardClick = (cardId: string) => {
    if (!socket || isSpymaster || !isMyTurn || !gameState.currentClue) return;
    socket.emit("reveal_card", { roomCode: gameState.roomCode, cardId });
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

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
      
      {/* --- VICTORY OVERLAY --- */}
      {gameState.phase === "game_over" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-neutral-900 border border-neutral-700 p-8 rounded-2xl shadow-2xl text-center max-w-lg mx-4">
            <div className="text-6xl mb-4 animate-bounce">
              {gameState.winner === "red" ? "🔴" : "🔵"}
            </div>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tighter mb-2 ${gameState.winner === "red" ? "text-red-500" : "text-blue-500"}`}>
              {gameState.winner?.toUpperCase()} WINS!
            </h2>
            <p className="text-neutral-400 font-mono mb-8">MISSION ACCOMPLISHED</p>
            
            {isHost && (
              <button 
                onClick={handleRestart}
                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-neutral-200 transition-transform active:scale-95"
              >
                PLAY AGAIN
              </button>
            )}
            {!isHost && <p className="text-sm text-neutral-500 animate-pulse">Waiting for Host to restart...</p>}
          </div>
        </div>
      )}

      {/* --- ACTION BAR --- */}
      <div className="w-full max-w-3xl mb-6 min-h-[80px] flex items-center justify-center z-10">
        
        {/* SPYMASTER INPUT */}
        {gameState.phase === "playing" && isMyTurn && isSpymaster && !gameState.currentClue && (
          <form onSubmit={submitClue} className="flex gap-2 w-full bg-neutral-800 p-2 rounded-lg border border-neutral-600 shadow-xl">
            <input 
              type="text" 
              placeholder="CLUE WORD" 
              value={clueWord}
              onChange={e => setClueWord(e.target.value.toUpperCase().trim())}
              className="flex-1 bg-neutral-900 text-white px-4 py-2 rounded font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
            <select 
              value={clueNum}
              onChange={e => setClueNum(e.target.value)}
              className="bg-neutral-900 text-white px-4 py-2 rounded font-bold focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
              <option value="0">0</option>
              <option value="99">∞</option>
            </select>
            <button type="submit" className="bg-white text-black px-6 py-2 rounded font-black hover:bg-neutral-200">
              SEND
            </button>
          </form>
        )}

        {/* OPERATIVE GUESSING */}
        {gameState.phase === "playing" && isMyTurn && !isSpymaster && gameState.currentClue && (
          <div className="flex items-center gap-4 w-full justify-between bg-neutral-800/80 backdrop-blur p-4 rounded-lg border border-white/20 shadow-xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 tracking-widest">ACTIVE CLUE</span>
              <div className="text-3xl font-black text-white leading-none">
                {gameState.currentClue.word} <span className="text-neutral-500">/</span> {gameState.currentClue.number}
              </div>
            </div>
            <button onClick={endTurn} className="bg-neutral-700 hover:bg-red-600 text-white px-6 py-3 rounded font-bold transition-colors">
              END TURN
            </button>
          </div>
        )}

        {/* WAITING STATE */}
        {gameState.phase === "playing" && (!isMyTurn || (!gameState.currentClue && !isSpymaster)) && (
          <div className="flex items-center gap-3 animate-pulse bg-black/30 px-6 py-2 rounded-full border border-white/10">
            <div className={`w-3 h-3 rounded-full ${gameState.turn === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <span className="text-neutral-400 font-mono tracking-widest uppercase text-xs md:text-sm">
              WAITING FOR {gameState.turn} {(!gameState.currentClue ? "SPYMASTER" : "OPERATIVES")}...
            </span>
            {gameState.currentClue && (
               <span className="text-white font-bold ml-2">
                 CLUE: {gameState.currentClue.word} ({gameState.currentClue.number})
               </span>
            )}
          </div>
        )}
      </div>

      {/* --- SCOREBOARD --- */}
      <div className="w-full flex justify-between items-center mb-6 px-4 font-mono text-xl md:text-3xl relative z-0">
        <div className={`font-black transition-all duration-500 ${gameState.turn === 'red' ? 'text-red-500 scale-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]' : 'text-red-900/40'}`}>
          RED: {gameState.scores.red}
        </div>
        
        <button onClick={copyCode} className="flex flex-col items-center group active:scale-95 transition-transform">
          <div className="text-[10px] md:text-xs text-neutral-600 tracking-[0.2em] mb-1 group-hover:text-neutral-400">
            {copied ? "COPIED!" : "SECURE CHANNEL"}
          </div>
          <div className="bg-neutral-900 px-6 py-2 rounded border border-neutral-800 text-white font-mono font-bold tracking-widest text-lg transition-colors group-hover:border-neutral-600">
            {gameState.roomCode}
          </div>
        </button>
        
        <div className={`font-black transition-all duration-500 ${gameState.turn === 'blue' ? 'text-blue-500 scale-110 drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'text-blue-900/40'}`}>
          BLUE: {gameState.scores.blue}
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 w-full max-w-3xl perspective-1000">
        {gameState.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            disabled={gameState.phase === "game_over" || (isMyTurn && !isSpymaster && !gameState.currentClue)}
            isSpymaster={showSpymasterView}
          />
        ))}
      </div>

      {/* --- FOOTER --- */}
      <div className="w-full max-w-3xl mt-8 flex justify-between items-start gap-4">
        <div className="flex-1 bg-neutral-950/50 rounded-lg p-3 h-32 overflow-y-auto border border-neutral-800 font-mono text-xs text-neutral-400 shadow-inner">
          {gameState.logs.slice().reverse().map((log, i) => (
            <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{">"} {log}</div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
           {!isSpymaster && (
             <button 
               onClick={() => setViewAsSpymaster(!viewAsSpymaster)}
               className={`text-[10px] border px-3 py-2 rounded transition-colors ${viewAsSpymaster ? "bg-white text-black border-white" : "text-neutral-600 hover:text-white border-neutral-800"}`}
             >
               {viewAsSpymaster ? "HIDE CHEAT SHEET" : "VIEW CHEAT SHEET"}
             </button>
           )}
           {isHost && (
             <button 
               onClick={handleRestart}
               className="text-[10px] text-red-900 hover:text-red-500 border border-neutral-800 px-3 py-2 rounded transition-colors"
             >
               RESET MISSION
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
