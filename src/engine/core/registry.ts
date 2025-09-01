import {
  AttackConfig,
  AttackId,
  CardClass,
  CardConfig,
  CardStableId,
  PokemonCardConfig,
  SpeciesId,
} from "./types";
import {
  AttackNotFoundError,
  CardNotFoundError,
  ImproperCardClassError,
} from "./errors";

type RegistryParams = {
  allCards: CardConfig[];
  allAttacks: AttackConfig[];
};

function getCardsByStableId(
  cards: CardConfig[]
): Record<CardStableId, CardConfig> {
  return cards.reduce((acc, card) => {
    acc[card.stableId] = card;
    return acc;
  }, {} as Record<CardStableId, CardConfig>);
}

function getAttacksById(
  attacks: AttackConfig[]
): Record<AttackId, AttackConfig> {
  return attacks.reduce((acc, attack) => {
    acc[attack.id] = attack;
    return acc;
  }, {} as Record<AttackId, AttackConfig>);
}

export class Registry {
  private cardsByStableId: Record<CardStableId, CardConfig> = {};
  private attacksById: Record<AttackId, AttackConfig> = {};

  constructor(params: RegistryParams) {
    this.cardsByStableId = getCardsByStableId(params.allCards);
    this.attacksById = getAttacksById(params.allAttacks);
  }

  public getCardByStableId(stableId: CardStableId): CardConfig {
    const card = this.cardsByStableId[stableId];
    if (card == null) {
      throw new CardNotFoundError(
        `Card not found for stable ID [${stableId}].`
      );
    }
    return this.cardsByStableId[stableId];
  }

  public getPokemonCardByStableId(stableId: CardStableId): PokemonCardConfig {
    const card = this.cardsByStableId[stableId];
    if (card == null) {
      throw new CardNotFoundError(
        `Card not found for stable ID [${stableId}].`
      );
    }
    if (card.cardClass !== CardClass.POKEMON) {
      throw new ImproperCardClassError(
        `Card [${stableId}] is not a Pokemon card.`
      );
    }
    return card as PokemonCardConfig;
  }

  public getPokemonCardsForSpeciesId(
    speciesId: SpeciesId
  ): PokemonCardConfig[] {
    const pokemonCards = Object.values(this.cardsByStableId).filter(
      (card) => card.cardClass === CardClass.POKEMON
    );
    return pokemonCards.filter((card) => card.speciesId === speciesId);
  }

  public getAttackById(id: AttackId): AttackConfig {
    const attack = this.attacksById[id];
    if (attack == null) {
      throw new AttackNotFoundError(`Attack not found for ID [${id}].`);
    }
    return attack;
  }
}
