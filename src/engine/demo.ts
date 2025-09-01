import { GameState } from "./types";

export function doTurn(gameState: GameState): GameState {
  return {
    ...gameState,
    turnNumber: gameState.turnNumber + 1,
  };
}
