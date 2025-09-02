import {
  AttackEnergyRequirements,
  CardGameId,
  EnergyRequirementType,
  GameResult,
  InternalGameState,
  Player,
  PokemonCardConfig,
  PokemonState,
  PrizePoints,
  PokemonSlot,
  EngineAttackResult,
  PokemonType,
  AttackEffectType,
  CardConfig,
  CardClass,
  Bench,
} from "./types";
import {
  CardInstanceNotFoundError,
  InvalidAttackResultError,
  InvalidGameStateError,
} from "./errors";
import { Registry } from "./registry";

export function getOwnActivePokemon(game: InternalGameState): PokemonSlot {
  const own = game.activePlayer === Player.A ? Player.A : Player.B;
  const ownActivePokemon = game.active[own];
  if (ownActivePokemon == null) {
    throw new InvalidGameStateError("Player has no active Pokemon.");
  }
  return ownActivePokemon;
}

export function getOpponentActivePokemon(game: InternalGameState): PokemonSlot {
  const opponent = game.activePlayer === Player.A ? Player.B : Player.A;
  const oppActivePokemon = game.active[opponent];
  if (oppActivePokemon == null) {
    throw new InvalidGameStateError("Opponent has no active Pokemon.");
  }
  return oppActivePokemon;
}

export function getPokemonStateByCardId(
  game: InternalGameState,
  cardId: CardGameId
): PokemonState {
  const pokemonState = game.pokemonStates.find(
    (p) => p.cardReference.cardId === cardId
  );
  if (pokemonState == null) {
    throw new CardInstanceNotFoundError(
      `Pokemon state not found for card ID [${cardId}].`
    );
  }
  return pokemonState;
}

export function getPlayerPokemonStateByCardId(
  game: InternalGameState,
  player: Player,
  cardId: CardGameId
): PokemonState {
  const pokemonState = game.pokemonStates.find(
    (p) => p.cardReference.cardId === cardId && p.player === player
  );
  if (pokemonState == null) {
    throw new CardInstanceNotFoundError(
      `Pokemon state not found for card ID [${cardId}] and player [${player}].`
    );
  }
  return pokemonState;
}

export function getHandCardConfigByCardId(
  game: InternalGameState,
  registry: Registry,
  player: Player,
  cardId: CardGameId
): CardConfig {
  const handCard = game.hand[player].find((c) => c.cardId === cardId);
  if (handCard == null) {
    throw new CardInstanceNotFoundError(
      `Could not find card in hand for player [${player}] with ID [${cardId}].`
    );
  }
  const handCardConfig = registry.getCardByStableId(handCard.cardStableId);
  return handCardConfig;
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

export function updatePokemonStates(
  game: InternalGameState,
  nextPokemonStates: PokemonState[]
): InternalGameState {
  const nextStatesByCardId = new Map(
    nextPokemonStates.map((p) => [p.cardReference.cardId, p])
  );
  const withNewState = game.pokemonStates.map((currentState) => {
    const nextState = nextStatesByCardId.get(currentState.cardReference.cardId);
    if (nextState) {
      return nextState;
    }
    return currentState;
  });
  const nextGame = {
    ...game,
    pokemonStates: withNewState,
  };
  return nextGame;
}

export function updateEvolvedPokemonState(
  game: InternalGameState,
  preEvolvedCardId: CardGameId,
  evolvedPokemonState: PokemonState
): InternalGameState {
  if (evolvedPokemonState.evolvedFrom.length === 0) {
    throw new InvalidGameStateError(
      `Evolved Pokemon state does not have any pre-evolved Pokemon.`
    );
  }

  const latestPreEvolutionCardId =
    evolvedPokemonState.evolvedFrom[evolvedPokemonState.evolvedFrom.length - 1]
      .cardId;
  const withNewState = game.pokemonStates.map((currentState) => {
    if (currentState.cardReference.cardId === latestPreEvolutionCardId) {
      return evolvedPokemonState;
    }
    return currentState;
  });

  const nextGame = {
    ...game,
    pokemonStates: withNewState,
  };

  // Update active Pokemon.
  if (nextGame.active[Player.A]?.cardId === preEvolvedCardId) {
    nextGame.active[Player.A] = evolvedPokemonState.cardReference;
  }
  if (nextGame.active[Player.B]?.cardId === preEvolvedCardId) {
    nextGame.active[Player.B] = evolvedPokemonState.cardReference;
  }

  // Update bench Pokemon.
  const nextBenchA = nextGame.bench[Player.A].map((slot) => {
    if (slot?.cardId === preEvolvedCardId) {
      return evolvedPokemonState.cardReference;
    }
    return slot;
  }) as Bench;
  nextGame.bench[Player.A] = nextBenchA;
  const nextBenchB = nextGame.bench[Player.B].map((slot) => {
    if (slot?.cardId === preEvolvedCardId) {
      return evolvedPokemonState.cardReference;
    }
    return slot;
  }) as Bench;
  nextGame.bench[Player.B] = nextBenchB;

  return nextGame;
}

function removePokemonStateByCardId(
  pokemonStates: PokemonState[],
  cardId: CardGameId
): PokemonState[] {
  return pokemonStates.filter((p) => p.cardReference.cardId !== cardId);
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
  if (activeA && isKnockedOut(getPokemonStateByCardId(game, activeA.cardId))) {
    // Remove knocked out Pokemon.
    nextGame.active[Player.A] = null;
    nextGame.pokemonStates = removePokemonStateByCardId(
      nextGame.pokemonStates,
      activeA.cardId
    );

    // Award prize points to opponent.
    const config = registry.getPokemonCardByStableId(activeA.cardStableId);
    const points = getPrizePointsForPokemon(config);
    nextGame.prizePoints[Player.B] = game.prizePoints[Player.B] + points;
  }

  const activeB = game.active[Player.B];
  if (activeB && isKnockedOut(getPokemonStateByCardId(game, activeB.cardId))) {
    // Remove knocked out Pokemon.
    nextGame.active[Player.B] = null;
    nextGame.pokemonStates = removePokemonStateByCardId(
      nextGame.pokemonStates,
      activeB.cardId
    );

    // Award prize points to opponent.
    const config = registry.getPokemonCardByStableId(activeB.cardStableId);
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

function getTargetPokemonStateByCardId(
  game: InternalGameState,
  cardId: CardGameId
): PokemonState {
  const targetState = getPokemonStateByCardId(game, cardId);
  if (targetState == null) {
    throw new CardInstanceNotFoundError(
      `Pokemon instance not found for card ID [${cardId}].`
    );
  }
  return targetState;
}

function applyWeakness(
  attackingType: PokemonType,
  defendingCard: PokemonCardConfig,
  baseDamage: number
): number {
  const weakness = defendingCard.typeWeaknesses.find(
    (w) => w === attackingType
  );
  if (weakness) {
    return baseDamage * 2;
  }
  return baseDamage;
}

export function transformAttackResult(
  game: InternalGameState,
  registry: Registry,
  result: EngineAttackResult
): EngineAttackResult {
  const damages = result.damages.map((d) => {
    const targetCard = getTargetPokemonStateByCardId(game, d.targetCardId);
    const targetPokemonCard = registry.getPokemonCardByStableId(
      targetCard.cardReference.cardStableId
    );
    const damageAfterWeakness = applyWeakness(
      result.attackingType,
      targetPokemonCard,
      d.damage
    );
    return {
      ...d,
      damage: damageAfterWeakness,
    };
  });

  // TODO: Apply abilities that affect attacks.
  // TODO: Apply effects that affect attacks

  return {
    ...result,
    damages,
  };
}

export function applyAttackResult(
  game: InternalGameState,
  result: EngineAttackResult
): InternalGameState {
  const currentGame = { ...game };
  const uniqueTargets = new Set(result.damages.map((d) => d.targetCardId));
  if (uniqueTargets.size !== result.damages.length) {
    throw new InvalidAttackResultError(
      "Found multiple damages with the same target card ID."
    );
  }

  const damagedStates = result.damages.map((d) => {
    const targetState = getTargetPokemonStateByCardId(game, d.targetCardId);
    const nextState = { ...targetState };
    nextState.currentHealthPoints = nextState.currentHealthPoints - d.damage;
    return nextState;
  });

  const damagesApplied = updatePokemonStates(currentGame, damagedStates);

  const affectedStates = result.effects
    .map((e) => {
      if (e.type === AttackEffectType.DISCARD_SINGLE_ENERGY) {
        const targetState = getTargetPokemonStateByCardId(game, e.targetCardId);
        const nextState = { ...targetState };
        const affectedEnergy = nextState.attachedEnergy.filter(
          (t) => t !== e.energyType
        );
        const safeEnergy = nextState.attachedEnergy.filter(
          (t) => t !== e.energyType
        );
        affectedEnergy.pop();
        const nextEnergy = [...affectedEnergy, ...safeEnergy];
        nextState.attachedEnergy = nextEnergy;
        return nextState;
      }
      return null;
    })
    .filter((s) => s !== null);

  const nextGame = updatePokemonStates(damagesApplied, affectedStates);
  return nextGame;
}

export function applyEvolution(
  preEvolvedState: PokemonState,
  preEvolvedCardConfig: PokemonCardConfig,
  evolvedCardConfig: PokemonCardConfig,
  evolvedCardId: CardGameId
): PokemonState {
  const currentState = { ...preEvolvedState };
  const healthPointsGain =
    evolvedCardConfig.baseHealthPoints - preEvolvedCardConfig.baseHealthPoints;
  const nextHealthPoints = currentState.currentHealthPoints + healthPointsGain;
  const nextState: PokemonState = {
    ...currentState,
    currentHealthPoints: nextHealthPoints,
    cardReference: {
      cardId: evolvedCardId,
      cardStableId: evolvedCardConfig.stableId,
      cardClass: CardClass.POKEMON,
    },
    evolvedFrom: [
      ...preEvolvedState.evolvedFrom,
      preEvolvedState.cardReference,
    ],
  };
  return nextState;
}
