import {
  AttackConfig,
  AttackId,
  AttackParams,
  CardStableId,
  GameParams,
  InternalGameState,
  Player,
  PokemonCardConfig,
} from "./types";
import { makeEmptyGameState } from "./makers";
import {
  getAttacksById,
  getPokemonCardsByStableId,
  getOwnActivePokemon,
} from "./utils";
import { CardNotFoundError, AttackNotFoundError } from "./errors";

export class GameEngine {
  private gameState: InternalGameState = makeEmptyGameState();
  private pokemonByStableId: Record<CardStableId, PokemonCardConfig> = {};
  private attacksById: Record<AttackId, AttackConfig> = {};

  constructor(params: GameParams) {
    this.pokemonByStableId = getPokemonCardsByStableId(params.allCards);
    this.attacksById = getAttacksById(params.allAttacks);
  }

  protected getGameState() {
    return this.gameState;
  }

  protected setGameState(gameState: InternalGameState) {
    this.gameState = gameState;
  }

  protected getPokemonCardByStableId(
    stableId: CardStableId
  ): PokemonCardConfig {
    const card = this.pokemonByStableId[stableId];
    if (card == null) {
      throw new CardNotFoundError(
        `Pokemon card not found for stable ID [${stableId}].`
      );
    }
    return card;
  }

  protected getAttackById(attackId: AttackId): AttackConfig {
    const attack = this.attacksById[attackId];
    if (attack == null) {
      throw new AttackNotFoundError(`Attack not found for ID [${attackId}].`);
    }
    return attack;
  }

  public endTurn() {
    const game = this.gameState;
    const newGame = {
      ...game,
      turnNumber: game.turnNumber + 1,
      activePlayer: game.activePlayer === Player.A ? Player.B : Player.A,
    };
    this.setGameState(newGame);
  }

  public useAttack(attackId: AttackId, params: AttackParams) {
    const game = this.gameState;
    const ownActive = getOwnActivePokemon(game);
    const activeCardConfig = this.getPokemonCardByStableId(
      ownActive.cardReference.cardStableId
    );
    if (!activeCardConfig.attacks.includes(attackId)) {
      throw new AttackNotFoundError(
        `Attack [${attackId}] not found on Pokemon card [${ownActive.cardReference.cardStableId}].`
      );
    }

    const attack = this.getAttackById(attackId);
    const nextGame = attack.onUse(game, params);
    this.setGameState(nextGame);
    this.endTurn();
  }
}
