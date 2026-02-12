import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  roomCode: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  // We store the entire GameState object here
  state: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // Auto-delete games after 24 hours to save space
  }
});

export const GameModel = mongoose.model("Game", GameSchema);
