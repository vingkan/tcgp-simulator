import { describe, expect, it } from "vitest";
import { EnergyType, GameResult, Player } from "../core/types";
import {
  bite,
  bulbasaur,
  charmander,
  ember,
  growlithe,
  ivysaur,
  razorLeaf,
  vineWhip,
} from "../../cards/a1-genetic-apex/index";
import {
  makeCardReferenceFromCard,
  makeInitialPokemonState,
} from "../core/makers";
import { AdminGameEngine } from "../admin/main";
import {
  AttackNotFoundError,
  EnergyRequirementNotMetError,
} from "../core/errors";

describe("one vs one", () => {
  it("damages the opponent's active Pokemon", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur],
      allAttacks: [vineWhip],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = {
      ...makeInitialPokemonState({
        player: Player.A,
        pokemonCardConfig: bulbasaur,
        cardId: "1",
      }),
      attachedEnergy: [EnergyType.GRASS, EnergyType.GRASS],
    };
    const pokemonB = makeInitialPokemonState({
      player: Player.B,
      pokemonCardConfig: bulbasaur,
      cardId: "2",
    });

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
    });

    const initial = engine.getGameState();
    engine.useAttack(vineWhip.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      turnNumber: 2,
      activePlayer: Player.B,
      pokemonStates: [pokemonA, { ...pokemonB, currentHealthPoints: 30 }],
    };
    expect(actual).toStrictEqual(expected);
  });

  it("rejects using an attack whose energy requirements are not met", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur],
      allAttacks: [vineWhip],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = makeInitialPokemonState({
      player: Player.A,
      pokemonCardConfig: bulbasaur,
      cardId: "1",
    });
    const pokemonB = makeInitialPokemonState({
      player: Player.B,
      pokemonCardConfig: bulbasaur,
      cardId: "2",
    });

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
    });

    expect(() => {
      engine.useAttack(vineWhip.id, {});
    }).toThrow(EnergyRequirementNotMetError);
  });

  it("knocks out the opponent's active Pokemon", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur],
      allAttacks: [vineWhip],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = {
      ...makeInitialPokemonState({
        player: Player.A,
        pokemonCardConfig: bulbasaur,
        cardId: "1",
      }),
      attachedEnergy: [EnergyType.GRASS, EnergyType.GRASS],
    };
    const pokemonB = {
      ...makeInitialPokemonState({
        player: Player.B,
        pokemonCardConfig: bulbasaur,
        cardId: "2",
      }),
      currentHealthPoints: 40,
    };

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
    });

    const initial = engine.getGameState();
    engine.useAttack(vineWhip.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      gameResult: GameResult.PLAYER_A_WON,
      turnNumber: 2,
      activePlayer: Player.B,
      pokemonStates: [pokemonA],
      active: {
        ...initial.active,
        [Player.B]: null,
      },
      prizePoints: {
        [Player.A]: 1,
        [Player.B]: 0,
      },
    };
    expect(actual).toStrictEqual(expected);
  });

  it("damages the opponent's active Pokemon with weaknesses", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur, growlithe],
      allAttacks: [vineWhip, bite],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.FIRE],
        cards: {
          [growlithe.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = {
      ...makeInitialPokemonState({
        player: Player.A,
        pokemonCardConfig: growlithe,
        cardId: "1",
      }),
      attachedEnergy: [EnergyType.FIRE, EnergyType.FIRE],
    };
    const pokemonB = makeInitialPokemonState({
      player: Player.B,
      pokemonCardConfig: bulbasaur,
      cardId: "2",
    });

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
    });

    const initial = engine.getGameState();
    engine.useAttack(bite.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      turnNumber: 2,
      activePlayer: Player.B,
      pokemonStates: [pokemonA, { ...pokemonB, currentHealthPoints: 30 }],
    };
    expect(actual).toStrictEqual(expected);
  });

  it("damages the opponent's active Pokemon with weakness and applies a discard single energy effect", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur, charmander],
      allAttacks: [vineWhip, ember],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.FIRE],
        cards: {
          [charmander.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = {
      ...makeInitialPokemonState({
        player: Player.A,
        pokemonCardConfig: charmander,
        cardId: "1",
      }),
      attachedEnergy: [EnergyType.FIRE],
    };
    const pokemonB = makeInitialPokemonState({
      player: Player.B,
      pokemonCardConfig: bulbasaur,
      cardId: "2",
    });

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
    });

    const initial = engine.getGameState();
    engine.useAttack(ember.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      turnNumber: 2,
      activePlayer: Player.B,
      pokemonStates: [
        { ...pokemonA, attachedEnergy: [] },
        { ...pokemonB, currentHealthPoints: 10 },
      ],
    };
    expect(actual).toStrictEqual(expected);
  });
});

describe("evolution", () => {
  it("evolves a basic Pokemon to stage 1, gains health points, and uses a new attack", () => {
    const engine = new AdminGameEngine({
      allCards: [bulbasaur, ivysaur],
      allAttacks: [vineWhip, razorLeaf],
      deckA: {
        name: "deckA",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
      deckB: {
        name: "deckB",
        energyZoneTypes: [EnergyType.GRASS],
        cards: {
          [bulbasaur.stableId]: 1,
        },
      },
    });

    const pokemonA = {
      ...makeInitialPokemonState({
        player: Player.A,
        pokemonCardConfig: bulbasaur,
        cardId: "1",
      }),
      currentHealthPoints: 10,
      attachedEnergy: [EnergyType.GRASS, EnergyType.GRASS, EnergyType.GRASS],
    };
    const pokemonB = makeInitialPokemonState({
      player: Player.B,
      pokemonCardConfig: bulbasaur,
      cardId: "2",
    });

    const evolutionCardReference = makeCardReferenceFromCard(ivysaur, "3");

    engine.updateGameState({
      pokemonStates: [pokemonA, pokemonB],
      active: {
        [Player.A]: pokemonA.cardReference,
        [Player.B]: pokemonB.cardReference,
      },
      hand: {
        [Player.A]: [evolutionCardReference],
        [Player.B]: [],
      },
    });

    const initial = engine.getGameState();
    engine.evolveTo(
      pokemonA.cardReference.cardId,
      evolutionCardReference.cardId
    );

    // Can no longer use attacks from the pre-evolved Pokemon.
    expect(() => {
      engine.useAttack(vineWhip.id, {});
    }).toThrow(AttackNotFoundError);

    // Can now use attacks from the evolved Pokemon.
    engine.useAttack(razorLeaf.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      turnNumber: 2,
      activePlayer: Player.B,
      pokemonStates: [
        {
          ...pokemonA,
          cardReference: evolutionCardReference,
          // Gain 20 health points by evolving.
          currentHealthPoints: 30,
          evolvedFrom: [pokemonA.cardReference],
        },
        { ...pokemonB, currentHealthPoints: 10 },
      ],
      hand: {
        [Player.A]: [],
        [Player.B]: [],
      },
    };
    expect(actual).toStrictEqual(expected);
  });
});
