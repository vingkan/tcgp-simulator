import {
  AttackConfig,
  AttackEnergyRequirements,
  AttackId,
  CardClass,
  CardGameId,
  CardStableId,
  EnergyCount,
  HealthPoints,
  InternalGameState,
  Player,
  PokemonCardConfig,
  PokemonStage,
  PokemonState,
  PokemonType,
  SpeciesId,
} from "./types";
import { InvalidGameStateError } from "./errors";

export function makeSimpleDamagingMove(d: {
  id: string;
  name: string;
  description?: string;
  damage: number;
  energyRequirements: AttackEnergyRequirements;
}): AttackConfig {
  const { damage } = d;
  return {
    id: d.id as AttackId,
    name: d.name,
    description: d.description ?? null,
    energyRequirements: d.energyRequirements,
    damageDescriptor: damage.toString(),
    onUse: (game: InternalGameState) => {
      const opponent = game.activePlayer === Player.A ? Player.B : Player.A;
      const oppActivePokemonState = game.active[opponent];
      if (oppActivePokemonState == null) {
        throw new InvalidGameStateError("Opponent has no active Pokemon.");
      }

      return {
        ...game,
        active: {
          ...game.active,
          [opponent]: {
            ...oppActivePokemonState,
            currentHealthPoints:
              oppActivePokemonState.currentHealthPoints - damage,
          },
        },
      };
    },
    onPreview: () => {
      return {
        expectedDamageToOpponentActivePokemon: damage,
      };
    },
  };
}

export function makeBasicPokemonCard(p: {
  stableId: string;
  name: string;
  speciesId: string;
  type: PokemonType;
  baseHealthPoints: number;
  attacks: AttackId[];
  typeWeaknesses: PokemonType[];
  retreatCost: number;
}): PokemonCardConfig {
  return {
    stableId: p.stableId as CardStableId,
    cardClass: CardClass.POKEMON,
    name: p.name,
    speciesId: p.speciesId as SpeciesId,
    type: p.type as PokemonType,
    baseHealthPoints: p.baseHealthPoints as HealthPoints,
    evolvesFromSpeciesId: null,
    stage: PokemonStage.BASIC,
    isEx: false,
    isMegaEx: false,
    isFossil: false,
    attacks: p.attacks,
    typeWeaknesses: p.typeWeaknesses as PokemonType[],
    retreatCost: p.retreatCost as EnergyCount,
  };
}

export function makeEmptyGameState(): InternalGameState {
  return {
    turnNumber: 1,
    activePlayer: Player.A,
    currentTurnAllowances: {
      canAttachFreeEnergyFromZone: true,
      canUseSupporterCard: true,
      canRetreat: true,
    },
    prizePoints: {
      [Player.A]: 0,
      [Player.B]: 0,
    },
    active: {
      [Player.A]: null,
      [Player.B]: null,
    },
    bench: {
      [Player.A]: [null, null, null],
      [Player.B]: [null, null, null],
    },
    hand: {
      [Player.A]: [],
      [Player.B]: [],
    },
    discardPile: {
      [Player.A]: [],
      [Player.B]: [],
    },
    deck: {
      [Player.A]: [],
      [Player.B]: [],
    },
  };
}

export function makeInitialPokemonState(p: {
  pokemonCardConfig: PokemonCardConfig;
  cardId: string;
}): PokemonState {
  return {
    cardReference: {
      cardId: p.cardId as CardGameId,
      cardStableId: p.pokemonCardConfig.stableId,
      cardClass: CardClass.POKEMON,
    },
    currentHealthPoints: p.pokemonCardConfig.baseHealthPoints,
    attachedEnergy: [],
    attachedTool: null,
    evolvedFrom: [],
  };
}
