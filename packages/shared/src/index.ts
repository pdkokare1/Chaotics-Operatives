// packages/shared/src/index.ts
import { z } from "zod";

// --- Zod Schemas (Runtime Validation) ---

export const GameStateSchema = z.object({
  roomCode: z.string(),
  status: z.enum(["lobby", "playing", "finished"]),
  turn: z.enum(["red", "blue"]),
  scores: z.object({
    red: z.number(),
    blue: z.number(),
  }),
});

// --- TypeScript Types (Compile-time Safety) ---

export type GameState = z.infer<typeof GameStateSchema>;

export interface Card {
  id: string;
  word: string;
  type: "red" | "blue" | "civilian" | "assassin";
  revealed: boolean;
}
