import {
  AttackId,
  AttackParams,
  GameParams,
  InternalGameState,
  Player,
} from "./types";
import { makeEmptyGameState } from "./makers";
import {
  applyAttackResult,
  applyKnockoutsAndWinConditions,
  getOwnActivePokemon,
  getPokemonStateByCardId,
  hasMetEnergyRequirements,
  transformAttackResult,
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
      ownActive.cardStableId
    );
    if (!activeCardConfig.attacks.includes(attackId)) {
      throw new AttackNotFoundError(
        `Attack [${attackId}] not found on Pokemon card [${ownActive.cardStableId}].`
      );
    }

    const attack = this.registry.getAttackById(attackId);
    const ownState = getPokemonStateByCardId(game, ownActive.cardId);
    if (
      !hasMetEnergyRequirements(
        attack.energyRequirements,
        ownState.attachedEnergy
      )
    ) {
      throw new EnergyRequirementNotMetError(
        getEnergyRequirementsNotMetMessage(
          attackId,
          attack.energyRequirements,
          ownState.attachedEnergy
        )
      );
    }

    const result = attack.onUse(game, params);
    const engineResult = transformAttackResult(game, this.registry, {
      ...result,
      attackingType: activeCardConfig.type,
    });
    const afterAttackGame = applyAttackResult(game, engineResult);
    const nextGame = applyKnockoutsAndWinConditions(
      afterAttackGame,
      this.registry
    );
    this.setGameState(nextGame);
    this.endTurn();
  }
}
