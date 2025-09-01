import {
  AttackConfig,
  AttackEnergyRequirements,
  AttackId,
  CardClass,
  CardConfig,
  CardStableId,
  EnergyRequirementType,
  InternalGameState,
  Player,
  PokemonCardConfig,
  PokemonState,
} from "./types";
import { InvalidGameStateError } from "./errors";

export function getPokemonCardsByStableId(
  cards: CardConfig[]
): Record<CardStableId, PokemonCardConfig> {
  const pokemonCards = cards.filter(
    (card) => card.cardClass === CardClass.POKEMON
  );
  return pokemonCards.reduce((acc, card) => {
    acc[card.stableId] = card;
    return acc;
  }, {} as Record<CardStableId, PokemonCardConfig>);
}

export function getAttacksById(
  attacks: AttackConfig[]
): Record<AttackId, AttackConfig> {
  return attacks.reduce((acc, attack) => {
    acc[attack.id] = attack;
    return acc;
  }, {} as Record<AttackId, AttackConfig>);
}

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
