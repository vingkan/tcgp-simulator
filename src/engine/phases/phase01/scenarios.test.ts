import { describe, expect, it } from "vitest";
import { EnergyType, GameResult, Player } from "../../core/types";
import { bulbasaur, vineWhip } from "./cards";
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

    engine.updateGameState({
      active: {
        [Player.A]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "1",
          }),
          attachedEnergy: [EnergyType.GRASS, EnergyType.GRASS],
        },
        [Player.B]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "2",
          }),
        },
      },
    });

    const initial = engine.getGameState();
    engine.useAttack(vineWhip.id, {});

    const actual = engine.getGameState();
    const expected = {
      ...initial,
      turnNumber: 2,
      activePlayer: Player.B,
      active: {
        ...initial.active,
        [Player.B]: {
          ...initial.active[Player.B],
          currentHealthPoints: 30,
        },
      },
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

    engine.updateGameState({
      active: {
        [Player.A]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "1",
          }),
        },
        [Player.B]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "2",
          }),
        },
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

    engine.updateGameState({
      active: {
        [Player.A]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "1",
          }),
          attachedEnergy: [EnergyType.GRASS, EnergyType.GRASS],
        },
        [Player.B]: {
          ...makeInitialPokemonState({
            pokemonCardConfig: bulbasaur,
            cardId: "2",
          }),
          currentHealthPoints: 40,
        },
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
});
