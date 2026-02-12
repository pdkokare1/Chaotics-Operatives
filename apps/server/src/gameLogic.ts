import { GameState, Card, TEAMS, CARD_TYPES } from "@operative/shared";
import { WORD_LIST } from "./words"; // Import the massive list

export function generateGame(roomCode: string): GameState {
  // 1. Shuffle Words (Pick 25 random words from the massive list)
  const shuffledWords = [...WORD_LIST]
    .sort(() => 0.5 - Math.random())
    .slice(0, 25);

  // 2. Assign Colors (9 Red, 8 Blue, 7 Neutral, 1 Assassin)
  const types = [
    ...Array(9).fill(CARD_TYPES.RED),
    ...Array(8).fill(CARD_TYPES.BLUE),
    ...Array(7).fill(CARD_TYPES.NEUTRAL),
    CARD_TYPES.ASSASSIN
  ].sort(() => 0.5 - Math.random());

  // 3. Build Board
  const board: Card[] = shuffledWords.map((word, index) => ({
    id: `card-${index}`,
    word,
    type: types[index],
    revealed: false 
  }));
  
  return {
    roomCode,
    phase: "playing",
    turn: TEAMS.RED,
    board,
    scores: { red: 9, blue: 8 },
    winner: null,
    logs: ["Mission Started. Red Team's Turn."]
  };
}

export function makeMove(gameState: GameState, cardId: string): GameState {
  // 1. Validation
  if (gameState.phase !== "playing") return gameState;
  
  const cardIndex = gameState.board.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return gameState;
  
  const card = gameState.board[cardIndex];
  if (card.revealed) return gameState; 

  // 2. Reveal Card
  const newBoard = [...gameState.board];
  newBoard[cardIndex] = { ...card, revealed: true };
  
  const newState = { ...gameState, board: newBoard, logs: [...gameState.logs] };
  const currentTeam = newState.turn;
  const opponentTeam = currentTeam === TEAMS.RED ? TEAMS.BLUE : TEAMS.RED;

  // 3. Apply Rules
  if (card.type === CARD_TYPES.ASSASSIN) {
    newState.phase = "game_over";
    newState.winner = opponentTeam;
    newState.logs.push(`FATAL ERROR: ${currentTeam.toUpperCase()} Hit the Assassin! ${opponentTeam.toUpperCase()} Wins.`);
  } 
  else if (card.type === CARD_TYPES.NEUTRAL) {
    newState.turn = opponentTeam;
    newState.logs.push(`${currentTeam.toUpperCase()} hit a civilian. Turn over.`);
  } 
  else if (card.type === currentTeam) {
    newState.scores[currentTeam] -= 1;
    newState.logs.push(`${currentTeam.toUpperCase()} found an Agent!`);

    if (newState.scores[currentTeam] === 0) {
      newState.phase = "game_over";
      newState.winner = currentTeam;
      newState.logs.push(`MISSION ACCOMPLISHED: ${currentTeam.toUpperCase()} Wins!`);
    }
  } 
  else {
    newState.scores[opponentTeam] -= 1;
    newState.turn = opponentTeam;
    newState.logs.push(`${currentTeam.toUpperCase()} found an Enemy Spy! Turn over.`);

    if (newState.scores[opponentTeam] === 0) {
      newState.phase = "game_over";
      newState.winner = opponentTeam;
      newState.logs.push(`MISSION FAILED: ${opponentTeam.toUpperCase()} Wins!`);
    }
  }

  return newState;
}
