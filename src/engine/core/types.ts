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

export enum StatusCondition {
  BURN = "burn",
  CONFUSION = "confusion",
  PARALYSIS = "paralysis",
  POISON = "poison",
  SLEEP = "sleep",
}

export type PokemonState = {
  player: Player;
  cardReference: CardReference<CardClass.POKEMON>;
  currentHealthPoints: HealthPoints;
  currentStatusCondition: StatusCondition | null;
  // currentEffects
  attachedEnergy: EnergyType[];
  attachedTool: CardReference<CardClass.TOOL> | null;
  // allowedAttacks
  evolvedFrom: CardReference<CardClass.POKEMON>[];
  playedOnTurn: TurnNumber;
  wasSwitchedToActiveFromBenchThisTurn: boolean;
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
  revealedOpponentCards: {
    [Player.A]: CardGameId[];
    [Player.B]: CardGameId[];
  };
  sweetRelayStacks: {
    [Player.A]: number;
    [Player.B]: number;
  };
  moveUsedByCurrentActivePokemonOnPreviousTurn: {
    [Player.A]: AttackId | null;
    [Player.B]: AttackId | null;
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

export enum CoinFlipResult {
  HEADS = "heads",
  TAILS = "tails",
}

// Parameters for an attack controlled by the players.
export type AttackParams = {
  // Targets
  damageTargetCardIds?: CardGameId[];
  effectTargetCardIds?: CardGameId[];
  // Switching
  ownNextActivePokemon?: CardGameId;
  opponentNextActivePokemon?: CardGameId;
  // Effects
  statusConditionToInflict?: StatusCondition;
  // Discards
  ownBenchedPokemonToDiscard?: CardGameId[];
  // Copies
  opponentActivePokemonMoveToUse?: AttackId;
  // TODO: Why was energy to discard an attack param? Is it chance?
};

// Parameters for an attack controlled by random chance.
// Modeling this separately prevents players from altering them and
// enables simulation.
// Always generate these even if an attack does not use them.
export type ChanceParams = {
  singleCoinFlipResult?: CoinFlipResult;
  multipleCoinFlipResultHeadCount?: number;
  continuousCoinFlipResultHeadCount?: number;
  randomlyChosenDamageTargetCardIds?: CardGameId[];
};

export type AttackParamKey = keyof AttackParams;

// All damage done to Pokemon as a direct result of attacks,
// will be modeled as an AttackDamage. This includes recoil
// damage, which is modeled as damage with the attacker as the
// target. Damage from status conditions is handled separately.
export type AttackDamage = {
  targetCardId: CardGameId;
  damage: number;
};

export enum AttackEffectType {
  DISCARD_N_TYPED_ENERGY = "discard_n_typed_energy",
  // Discard N energy of X type from one target (can send multiple)
  // Discard all energy from self
  // Discard N random energy from one target
  // Attach N energy of X type to one own Pokemon (can send multiple)
  // Move all energy from self to own benched Pokemon
  // Change type of a random energy attached to opponent's defending Pokemon
  // Increased energy cost to attack on next turn (switching removes)
  // Heal damage from target
  // Draw next card from deck
  // Draw next card from deck until matches size of opponent's hand
  // Get random Pokemon from deck
  // Discard random card from opponent's hand
  // Opponent reveals random card from their hand and shuffles into deck
  // Inflict X status condition on target (could be self)
  // Switch own active Pokemon with own benched Pokemon
  // Switch opponent's active Pokemon (opponent chooses)
  // Opponent cannot use any supporter cards during next turn
  // Defending Pokemon cannot attack next turn (switching removes)
  // Defending Pokemon has to flip a coin to attack (switching removes)
  // This Pokemon cannot attack next turn (switching removes)
  // Defending Pokemon cannot retreat next turn
  // Prevent all damage and effects done to self on next turn
  // Reduce damage from defending Pokemon by X on next turn (switching removes)
  // Reduce damage to self by X on next turn
  // Heal self equivalent to damage done to opponent's active Pokemon
  // Shuffle opponent's active Pokemon and all cards attached into deck
  // Recoil damage to opponent if damaged on next turn
}

export type AttackEffect = {
  type: AttackEffectType.DISCARD_N_TYPED_ENERGY;
  targetCardId: CardGameId;
  energyType: EnergyType;
  discardCount: number;
};

export type EffectTransformer = (
  game: InternalGameState,
  effect: AttackEffect
) => InternalGameState;

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

type AttackParamsValidation =
  | { isValid: true }
  | { isValid: false; message: string };

export type AttackConfig = {
  id: AttackId;
  name: string;
  description: string | null;
  energyRequirements: AttackEnergyRequirements;
  damageDescriptor: string;
  validateParams: (
    game: InternalGameState,
    params: AttackParams
  ) => AttackParamsValidation;
  onUse: (game: InternalGameState, params: AttackParams) => AttackResult;
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
