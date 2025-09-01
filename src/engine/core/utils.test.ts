import { describe, expect, it } from "vitest";
import { hasMetEnergyRequirements } from "./utils";
import { EnergyRequirementType, EnergyType } from "./types";

describe("utils", () => {
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
