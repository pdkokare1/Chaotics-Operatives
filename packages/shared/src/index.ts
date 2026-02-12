import { z } from "zod";

// --- Game Constants ---
export const TEAMS = {
  RED: "red",
  BLUE: "blue",
} as const;

export const CARD_TYPES = {
  RED: "red",
  BLUE: "blue",
  NEUTRAL: "neutral",
  ASSASSIN: "assassin",
} as const;

// --- Types ---
export type Team = (typeof TEAMS)[keyof typeof TEAMS];
export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];

export interface Card {
  id: string;
  word: string;
  type: CardType;
  revealed: boolean;
}

export interface GameState {
  roomCode: string;
  phase: "lobby" | "playing" | "game_over";
  turn: Team;
  board: Card[];
  scores: { red: number; blue: number };
  winner: Team | null;
  logs: string[]; // To show "Red Team guessed APPLE"
}

// --- Validation Schemas ---
export const CreateGameSchema = z.object({
  hostName: z.string().min(1),
});

export const JoinGameSchema = z.object({
  roomCode: z.string().length(4),
  playerName: z.string().min(1),
});
