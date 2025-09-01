import {
  AttackConfig,
  AttackId,
  CardClass,
  CardConfig,
  CardStableId,
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
