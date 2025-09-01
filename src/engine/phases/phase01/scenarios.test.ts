import { describe, expect, it } from "vitest";
import { EnergyType, GameResult, Player } from "../../core/types";
import {
  bite,
  bulbasaur,
  charmander,
  ember,
  growlithe,
  vineWhip,
} from "./cards";
import { makeInitialPokemonState } from "../../core/makers";
import { AdminGameEngine } from "../../admin/main";
import { EnergyRequirementNotMetError } from "../../core/errors";

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
