// https://egghead.io/blog/using-branded-types-in-typescript
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;

export enum Player {
  A = "A",
  B = "B",
}

export enum CardClass {
  POKEMON = "pokemon",
  ITEM = "item",
  SUPPORTER = "supporter",
  TOOL = "tool",
}

export enum EnergyRequirementType {
  GRASS = "grass",
  FIRE = "fire",
  WATER = "water",
  LIGHTNING = "lightning",
  FIGHTING = "fighting",
  PSYCHIC = "psychic",
  DARK = "dark",
  METAL = "metal",
  ANY = "any",
}

export enum EnergyType {
  GRASS = EnergyRequirementType.GRASS,
  FIRE = EnergyRequirementType.FIRE,
  WATER = EnergyRequirementType.WATER,
  LIGHTNING = EnergyRequirementType.LIGHTNING,
  FIGHTING = EnergyRequirementType.FIGHTING,
  PSYCHIC = EnergyRequirementType.PSYCHIC,
  DARK = EnergyRequirementType.DARK,
  METAL = EnergyRequirementType.METAL,
}

export enum PokemonType {
  GRASS = "grass",
  FIRE = "fire",
  WATER = "water",
  LIGHTNING = "lightning",
  FIGHTING = "fighting",
  PSYCHIC = "psychic",
  DARK = "dark",
  METAL = "metal",
  COLORLESS = "colorless",
  DRAGON = "dragon",
}

export type CardGameId = Branded<string, "CardGameId">;
export type CardStableId = Branded<string, "CardStableId">;

export type CardReference<T extends CardClass> = {
  cardId: CardGameId;
  cardStableId: CardStableId;
  cardClass: T;
};

export type EnergyCount = number;
export type HealthPoints = number;

export type PokemonState = {
  player: Player;
  cardReference: CardReference<CardClass.POKEMON>;
  currentHealthPoints: HealthPoints;
  // currentStatusCondition
  // currentEffects
  attachedEnergy: EnergyType[];
  attachedTool: CardReference<CardClass.TOOL> | null;
  // allowedAttacks
  evolvedFrom: CardReference<CardClass.POKEMON>[];
  playedOnTurn: TurnNumber;
};

export type TurnAllowances = {
  canAttachFreeEnergyFromZone: boolean;
  canUseSupporterCard: boolean;
  canRetreat: boolean;
};

export type PrizePoints = number;

export enum GameResult {
  IN_PROGRESS = "in_progress",
  PLAYER_A_WON = "player_a_won",
  PLAYER_B_WON = "player_b_won",
  DRAW = "draw",
}

export type PokemonSlot = CardReference<CardClass.POKEMON>;

export type BenchSlot = PokemonSlot | null;

export type Bench = [BenchSlot, BenchSlot, BenchSlot];

export type InternalGameState = {
  gameResult: GameResult;
  turnNumber: TurnNumber;
  activePlayer: Player;
  currentTurnAllowances: TurnAllowances;
  pokemonStates: PokemonState[];
  prizePoints: {
    [Player.A]: PrizePoints;
    [Player.B]: PrizePoints;
  };
  active: {
    [Player.A]: PokemonSlot | null;
    [Player.B]: PokemonSlot | null;
  };
  bench: {
    [Player.A]: Bench;
    [Player.B]: Bench;
  };
  hand: {
    [Player.A]: CardReference<CardClass>[];
    [Player.B]: CardReference<CardClass>[];
  };
  discardPile: {
    [Player.A]: CardReference<CardClass>[];
    [Player.B]: CardReference<CardClass>[];
  };
  deck: {
    [Player.A]: CardReference<CardClass>[];
    [Player.B]: CardReference<CardClass>[];
  };
};

// One-indexed: The first turn of the game is turn 1.
export type TurnNumber = number;

export type CardCount = number;

enum PlayerGameResult {
  IN_PROGRESS = "in_progress",
  WON = "won",
  LOST = "lost",
  DRAW = "draw",
}

export type PlayerGameState = {
  gameResult: PlayerGameResult;
  turnNumber: TurnNumber;
  isOwnTurn: boolean;
  ownPrizePoints: PrizePoints;
  opponentPrizePoints: PrizePoints;
  allowances: TurnAllowances;
  ownActivePokemon: PokemonState | null;
  opponentActivePokemon: PokemonState | null;
  ownBench: Bench;
  opponentBench: Bench;
  ownHand: CardReference<CardClass>[];
  opponentHandCardCount: CardCount;
  ownDeckCardCountRemaining: CardCount;
  opponentDeckCardCountRemaining: CardCount;
  ownDiscardPile: CardReference<CardClass>[];
  opponentDiscardPile: CardReference<CardClass>[];
};

export type AttackParams = {
  targetCardId?: CardGameId;
};

export type AttackDamage = {
  targetCardId: CardGameId;
  damage: number;
};

export enum AttackEffectType {
  DISCARD_SINGLE_ENERGY = "discard_single_energy",
}

export type AttackEffect = {
  type: AttackEffectType.DISCARD_SINGLE_ENERGY;
  targetCardId: CardGameId;
  energyType: EnergyType;
};

export type AttackResult = {
  damages: AttackDamage[];
  effects: AttackEffect[];
  // TODO: Model status conditions.
  // TODO: Model side effects.
};

export type EngineAttackResult = AttackResult & {
  attackingType: PokemonType;
};

export type AttackPreview = {
  expectedDamageToOpponentActivePokemon: number;
};

export type AttackId = Branded<string, "AttackId">;

export type AttackEnergyRequirements = Partial<
  Record<EnergyRequirementType, EnergyCount>
>;

export type AttackConfig = {
  id: AttackId;
  name: string;
  description: string | null;
  energyRequirements: AttackEnergyRequirements;
  damageDescriptor: string;
  onUse: (game: InternalGameState, params: AttackParams) => AttackResult;
  onPreview: (game: InternalGameState) => AttackPreview;
};

export type BaseCardConfig = {
  stableId: CardStableId;
  cardClass: CardClass;
  name: string;
};

export type SpeciesId = Branded<string, "SpeciesId">;

export enum PokemonStage {
  BASIC = "basic",
  STAGE_1 = "stage_1",
  STAGE_2 = "stage_2",
}

export type PokemonCardConfig = BaseCardConfig & {
  cardClass: CardClass.POKEMON;
  speciesId: SpeciesId;
  type: PokemonType;
  baseHealthPoints: HealthPoints;
  evolvesFromSpeciesId: SpeciesId | null;
  stage: PokemonStage;
  isEx: boolean;
  isMegaEx: boolean;
  isFossil: boolean;
  attacks: AttackId[];
  typeWeaknesses: PokemonType[];
  retreatCost: EnergyCount;
};

export type ItemCardConfig = BaseCardConfig & {
  cardClass: CardClass.ITEM;
  description: string;
};

export type SupporterCardConfig = BaseCardConfig & {
  cardClass: CardClass.SUPPORTER;
  description: string;
};

export type ToolCardConfig = BaseCardConfig & {
  cardClass: CardClass.TOOL;
  description: string;
};

export type CardConfig =
  | PokemonCardConfig
  | ItemCardConfig
  | SupporterCardConfig
  | ToolCardConfig;

export type DeckConfig = {
  name: string;
  energyZoneTypes: EnergyType[];
  cards: Record<CardStableId, CardCount>;
};

export type GameParams = {
  allCards: CardConfig[];
  allAttacks: AttackConfig[];
  deckA: DeckConfig;
  deckB: DeckConfig;
};
