import {
  AttackId,
  AttackParams,
  CardClass,
  CardGameId,
  GameParams,
  InternalGameState,
  Player,
} from "./types";
import { makeEmptyGameState } from "./makers";
import {
  applyAttackResult,
  applyEvolution,
  applyKnockoutsAndWinConditions,
  getHandCardConfigByCardId,
  getOwnActivePokemon,
  getPlayerPokemonStateByCardId,
  getPokemonStateByCardId,
  hasMetEnergyRequirements,
  transformAttackResult,
  updateEvolvedPokemonState,
} from "./utils";
import {
  AttackNotFoundError,
  DoesNotEvolveFromError,
  EnergyRequirementNotMetError,
  ImproperCardClassError,
  NonEvolutionCardError,
} from "./errors";
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
    // TODO: Apply abilities and effects that occur between turns.
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

  public evolveTo(targetCardId: CardGameId, evolvedCardId: CardGameId) {
    const game = this.getGameState();
    const preEvolvedPokemonState = getPlayerPokemonStateByCardId(
      game,
      game.activePlayer,
      targetCardId
    );
    const preEvolvedCardConfig = this.registry.getPokemonCardByStableId(
      preEvolvedPokemonState.cardReference.cardStableId
    );

    const evolvedCardConfig = getHandCardConfigByCardId(
      game,
      this.registry,
      game.activePlayer,
      evolvedCardId
    );
    if (evolvedCardConfig.cardClass !== CardClass.POKEMON) {
      throw new ImproperCardClassError(
        `Card [${evolvedCardId}] is not a Pokemon card.`
      );
    }

    const evolvesFromSpeciesId = evolvedCardConfig.evolvesFromSpeciesId;
    if (evolvesFromSpeciesId == null) {
      throw new NonEvolutionCardError(
        `Card [${evolvedCardId}] is not an evolution card.`
      );
    }

    const doesNotEvolveFromSpecies =
      evolvesFromSpeciesId !== preEvolvedCardConfig.speciesId;
    if (doesNotEvolveFromSpecies) {
      throw new DoesNotEvolveFromError(
        `Card [${evolvedCardId}] does not evolve from species [${preEvolvedCardConfig.speciesId}].`
      );
    }

    // TODO: Throw error if the Pokemon is not eligible to evolve this turn.

    const evolvedState = applyEvolution(
      preEvolvedPokemonState,
      preEvolvedCardConfig,
      evolvedCardConfig,
      evolvedCardId
    );

    const gameWithEvolvedPokemon = updateEvolvedPokemonState(
      game,
      targetCardId,
      evolvedState
    );

    // Remove evolved card from hand.
    const nextHand = {
      ...gameWithEvolvedPokemon.hand,
      [gameWithEvolvedPokemon.activePlayer]: gameWithEvolvedPokemon.hand[
        gameWithEvolvedPokemon.activePlayer
      ].filter((card) => card.cardId !== evolvedCardId),
    };

    const nextGame: InternalGameState = {
      ...gameWithEvolvedPokemon,
      hand: nextHand,
    };
    this.setGameState(nextGame);
  }
}
