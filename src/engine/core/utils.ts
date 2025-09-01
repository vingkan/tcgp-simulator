import {
  AttackEnergyRequirements,
  EnergyRequirementType,
  GameResult,
  InternalGameState,
  Player,
  PokemonCardConfig,
  PokemonState,
  PrizePoints,
} from "./types";
import { InvalidGameStateError } from "./errors";
import { Registry } from "./registry";

export function getOwnActivePokemon(game: InternalGameState): PokemonState {
  const own = game.activePlayer === Player.A ? Player.A : Player.B;
  const ownActivePokemonState = game.active[own];
  if (ownActivePokemonState == null) {
    throw new InvalidGameStateError("Player has no active Pokemon.");
  }
  return ownActivePokemonState;
}

export function getOpponentActivePokemon(
  game: InternalGameState
): PokemonState {
  const opponent = game.activePlayer === Player.A ? Player.B : Player.A;
  const oppActivePokemonState = game.active[opponent];
  if (oppActivePokemonState == null) {
    throw new InvalidGameStateError("Opponent has no active Pokemon.");
  }
  return oppActivePokemonState;
}

export function hasMetEnergyRequirements(
  energyRequirements: AttackEnergyRequirements,
  attachedEnergy: PokemonState["attachedEnergy"]
): boolean {
  const requirementsCopy = { ...energyRequirements };
  for (const energyType of attachedEnergy) {
    const typedRemainingCost = requirementsCopy[energyType] ?? 0;
    if (typedRemainingCost > 0) {
      requirementsCopy[energyType] = typedRemainingCost - 1;
      if (requirementsCopy[energyType] === 0) {
        delete requirementsCopy[energyType];
      }
      continue;
    }

    const colorlessRemainingCost =
      requirementsCopy[EnergyRequirementType.ANY] ?? 0;
    if (colorlessRemainingCost > 0) {
      requirementsCopy[EnergyRequirementType.ANY] = colorlessRemainingCost - 1;
      if (requirementsCopy[EnergyRequirementType.ANY] === 0) {
        delete requirementsCopy[EnergyRequirementType.ANY];
      }
      continue;
    }
  }
  return Object.keys(requirementsCopy).length === 0;
}

export function getGameResult(game: InternalGameState): GameResult {
  const aPoints = game.prizePoints[Player.A];
  const bPoints = game.prizePoints[Player.B];
  const aWonOnPoints = aPoints >= 3;
  const bWonOnPoints = bPoints >= 3;
  const aWhitedOut =
    game.active[Player.A] === null &&
    game.bench[Player.A].every((slot) => slot === null);
  const bWhitedOut =
    game.active[Player.B] === null &&
    game.bench[Player.B].every((slot) => slot === null);
  const aWon = aWonOnPoints || bWhitedOut;
  const bWon = bWonOnPoints || aWhitedOut;
  if (aWon && bWon) {
    if (aPoints > bPoints || (bWhitedOut && !aWhitedOut)) {
      return GameResult.PLAYER_A_WON;
    }
    if (bPoints > aPoints || (aWhitedOut && !bWhitedOut)) {
      return GameResult.PLAYER_B_WON;
    }
    return GameResult.DRAW;
  }
  if (aWon) {
    return GameResult.PLAYER_A_WON;
  }
  if (bWon) {
    return GameResult.PLAYER_B_WON;
  }
  return GameResult.IN_PROGRESS;
}

function isKnockedOut(pokemon: PokemonState): boolean {
  return pokemon.currentHealthPoints <= 0;
}

function getPrizePointsForPokemon(config: PokemonCardConfig): PrizePoints {
  if (config.isMegaEx) {
    return 3;
  }
  if (config.isEx) {
    return 2;
  }
  return 1;
}

export function applyKnockoutsAndWinConditions(
  game: InternalGameState,
  registry: Registry
): InternalGameState {
  const nextGame = { ...game };
  // Check for knockouts to active Pokemon.
  const activeA = game.active[Player.A];
  if (activeA && isKnockedOut(activeA)) {
    nextGame.active[Player.A] = null;
    const config = registry.getPokemonCardByStableId(
      activeA.cardReference.cardStableId
    );
    const points = getPrizePointsForPokemon(config);
    nextGame.prizePoints[Player.B] = game.prizePoints[Player.B] + points;
  }

  const activeB = game.active[Player.B];
  if (activeB && isKnockedOut(activeB)) {
    nextGame.active[Player.B] = null;
    const config = registry.getPokemonCardByStableId(
      activeB.cardReference.cardStableId
    );
    const points = getPrizePointsForPokemon(config);
    nextGame.prizePoints[Player.A] = game.prizePoints[Player.A] + points;
  }

  // TODO: Check for knockouts to benched Pokemon.

  const withWinConditions = {
    ...nextGame,
    gameResult: getGameResult(nextGame),
  };
  return withWinConditions;
}
