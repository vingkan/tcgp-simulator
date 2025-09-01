import { GameEngine } from "../core/main";
import { GameParams, InternalGameState } from "../core/types";

/**
 * Provides more control over game state for administrative purposes,
 * such as testing under controlled conditions.
 */
export class AdminGameEngine extends GameEngine {
  constructor(params: GameParams) {
    super(params);
  }

  public getGameState() {
    return super.getGameState();
  }

  public updateGameState(nextState: Partial<InternalGameState>) {
    const currentGameState = super.getGameState();
    super.setGameState({
      ...currentGameState,
      ...nextState,
    });
  }
}
