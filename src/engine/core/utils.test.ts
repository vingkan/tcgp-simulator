import { describe, expect, it } from "vitest";
import { getGameResult, hasMetEnergyRequirements } from "./utils";
import {
  EnergyRequirementType,
  EnergyType,
  GameResult,
  Player,
  PokemonType,
} from "./types";
import {
  makeBasicPokemonCard,
  makeEmptyGameState,
  makeInitialPokemonState,
} from "./makers";

describe("hasMetEnergyRequirements", () => {
  it("satisfies single type, single energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.GRASS]: 1,
        },
        [EnergyType.GRASS]
      )
    ).toBe(true);
  });

  it("satisfies single type, multiple energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.GRASS]: 2,
        },
        [EnergyType.GRASS, EnergyType.GRASS]
      )
    ).toBe(true);
  });

  it("satisfies multiple type, multiple energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.WATER]: 2,
          [EnergyRequirementType.LIGHTNING]: 1,
        },
        [EnergyType.WATER, EnergyType.WATER, EnergyType.LIGHTNING]
      )
    ).toBe(true);
  });

  it("satisfies colorless, single energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.ANY]: 1,
        },
        [EnergyType.FIRE]
      )
    ).toBe(true);
  });

  it("satisfies colorless, multiple energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.ANY]: 2,
        },
        [EnergyType.WATER, EnergyType.FIRE]
      )
    ).toBe(true);
  });

  it("satisfies mixed type, multiple energy requirements", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.PSYCHIC]: 1,
          [EnergyRequirementType.ANY]: 1,
        },
        [EnergyType.PSYCHIC, EnergyType.DARK]
      )
    ).toBe(true);
  });

  it("satisfies mixed type, multiple energy requirements, even when the colorless energy was attached first", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.PSYCHIC]: 1,
          [EnergyRequirementType.ANY]: 1,
        },
        [EnergyType.DARK, EnergyType.PSYCHIC]
      )
    ).toBe(true);
  });

  it("rejects mixed type, multiple energy requirements when the typed energy is not satisfied", () => {
    expect(
      hasMetEnergyRequirements(
        {
          [EnergyRequirementType.PSYCHIC]: 1,
          [EnergyRequirementType.ANY]: 1,
        },
        [EnergyType.WATER, EnergyType.FIRE]
      )
    ).toBe(false);
  });
});

describe("getGameResult", () => {
  const basicPokemonCard = makeBasicPokemonCard({
    stableId: "1",
    name: "Testmon",
    speciesId: "1",
    type: PokemonType.METAL,
    baseHealthPoints: 50,
    attacks: [],
    typeWeaknesses: [],
    retreatCost: 0,
  });

  it("awards victory to player A if B whited out, even if B had more prize points", () => {
    expect(
      getGameResult({
        ...makeEmptyGameState(),
        prizePoints: {
          [Player.A]: 1,
          [Player.B]: 2,
        },
        active: {
          [Player.A]: {
            ...makeInitialPokemonState({
              pokemonCardConfig: basicPokemonCard,
              cardId: "1",
            }),
          },
          [Player.B]: null,
        },
      })
    ).toBe(GameResult.PLAYER_A_WON);
  });
});
