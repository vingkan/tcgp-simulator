import {
  AttackConfig,
  AttackEffect,
  AttackEnergyRequirements,
  AttackId,
  AttackResult,
  CardClass,
  CardConfig,
  CardGameId,
  CardReference,
  CardStableId,
  EnergyCount,
  GameResult,
  HealthPoints,
  InternalGameState,
  Player,
  PokemonCardConfig,
  PokemonStage,
  PokemonState,
  PokemonType,
  SpeciesId,
} from "./types";
import { getOpponentActivePokemon } from "./utils";

export function makeDamagingMove(d: {
  id: string;
  name: string;
  description?: string;
  damage: number;
  energyRequirements: AttackEnergyRequirements;
  withEffect?: (game: InternalGameState) => AttackEffect;
}): AttackConfig {
  const { damage } = d;
  return {
    id: d.id as AttackId,
    name: d.name,
    description: d.description ?? null,
    energyRequirements: d.energyRequirements,
    damageDescriptor: damage.toString(),
    onUse: (game: InternalGameState): AttackResult => {
      const opponentActivePokemon = getOpponentActivePokemon(game);
      const effects = d.withEffect ? [d.withEffect(game)] : [];

      return {
        damages: [
          {
            targetCardId: opponentActivePokemon.cardId,
            damage,
          },
        ],
        effects,
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

export function makeEvolvedPokemonCard(p: {
  stableId: string;
  name: string;
  speciesId: string;
  type: PokemonType;
  baseHealthPoints: number;
  attacks: AttackId[];
  typeWeaknesses: PokemonType[];
  retreatCost: number;
  stage: PokemonStage.STAGE_1 | PokemonStage.STAGE_2;
  evolvesFromSpeciesId: string;
}): PokemonCardConfig {
  return {
    stableId: p.stableId as CardStableId,
    cardClass: CardClass.POKEMON,
    name: p.name,
    speciesId: p.speciesId as SpeciesId,
    type: p.type as PokemonType,
    baseHealthPoints: p.baseHealthPoints as HealthPoints,
    evolvesFromSpeciesId: p.evolvesFromSpeciesId as SpeciesId,
    stage: p.stage as PokemonStage,
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
    gameResult: GameResult.IN_PROGRESS,
    turnNumber: 1,
    activePlayer: Player.A,
    currentTurnAllowances: {
      canAttachFreeEnergyFromZone: true,
      canUseSupporterCard: true,
      canRetreat: true,
    },
    pokemonStates: [],
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
  player: Player;
  pokemonCardConfig: PokemonCardConfig;
  cardId: string;
}): PokemonState {
  return {
    player: p.player,
    cardReference: {
      cardId: p.cardId as CardGameId,
      cardStableId: p.pokemonCardConfig.stableId,
      cardClass: CardClass.POKEMON,
    },
    currentHealthPoints: p.pokemonCardConfig.baseHealthPoints,
    attachedEnergy: [],
    attachedTool: null,
    evolvedFrom: [],
    playedOnTurn: 1,
  };
}

export function makeCardReferenceFromCard(
  cardConfig: CardConfig,
  cardId: string
): CardReference<CardClass> {
  return {
    cardId: cardId as CardGameId,
    cardStableId: cardConfig.stableId,
    cardClass: cardConfig.cardClass,
  };
}
