import {
  AttackId,
  AttackParams,
  GameParams,
  InternalGameState,
  Player,
} from "./types";
import { makeEmptyGameState } from "./makers";
import {
  applyKnockoutsAndWinConditions,
  getOwnActivePokemon,
  hasMetEnergyRequirements,
} from "./utils";
import { AttackNotFoundError, EnergyRequirementNotMetError } from "./errors";
import { getEnergyRequirementsNotMetMessage } from "./stringify";
import { Registry } from "./registry";

export class GameEngine {
  private gameState: InternalGameState = makeEmptyGameState();
  private registry: Registry;

  constructor(params: GameParams) {
    this.registry = new Registry(params);
  }

  protected getGameState() {
    // TODO: Replace with a deep copy to avoid mutating nested fields.
    return { ...this.gameState };
  }

  protected getRegistry() {
    return this.registry;
  }

  protected setGameState(gameState: InternalGameState) {
    this.gameState = gameState;
  }

  public endTurn() {
    const game = this.getGameState();
    const newGame = {
      ...game,
      turnNumber: game.turnNumber + 1,
      activePlayer: game.activePlayer === Player.A ? Player.B : Player.A,
    };
    this.setGameState(newGame);
  }

  public useAttack(attackId: AttackId, params: AttackParams) {
    const game = this.getGameState();
    const ownActive = getOwnActivePokemon(game);
    const activeCardConfig = this.registry.getPokemonCardByStableId(
      ownActive.cardReference.cardStableId
    );
    if (!activeCardConfig.attacks.includes(attackId)) {
      throw new AttackNotFoundError(
        `Attack [${attackId}] not found on Pokemon card [${ownActive.cardReference.cardStableId}].`
      );
    }

    const attack = this.registry.getAttackById(attackId);
    if (
      !hasMetEnergyRequirements(
        attack.energyRequirements,
        ownActive.attachedEnergy
      )
    ) {
      throw new EnergyRequirementNotMetError(
        getEnergyRequirementsNotMetMessage(
          attackId,
          attack.energyRequirements,
          ownActive.attachedEnergy
        )
      );
    }

    const initialAttackGame = attack.onUse(game, params);
    // TODO: Apply weaknesses.
    // TODO: Apply abilities that affect attacks.
    // TODO: Apply effects that affect attacks.

    const nextGame = applyKnockoutsAndWinConditions(
      initialAttackGame,
      this.registry
    );
    this.setGameState(nextGame);
    this.endTurn();
  }
}
