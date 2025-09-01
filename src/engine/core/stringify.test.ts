import { describe, expect, it } from "vitest";
import { getEnergyRequirementsNotMetMessage } from "./stringify";
import { AttackId, EnergyRequirementType, EnergyType } from "./types";

describe("getEnergyRequirementsNotMetMessage", () => {
  it("formats the energy requirements and the attached energy", () => {
    expect(
      getEnergyRequirementsNotMetMessage(
        "vine_whip" as AttackId,
        {
          [EnergyRequirementType.GRASS]: 1,
        },
        [EnergyType.FIRE]
      )
    ).toBe(
      "Energy requirements not met for attack [vine_whip]. Required: 🌱. Attached: 🔥."
    );
  });

  it("formats colorless energy requirements", () => {
    expect(
      getEnergyRequirementsNotMetMessage(
        "vine_whip" as AttackId,
        {
          [EnergyRequirementType.GRASS]: 1,
          [EnergyRequirementType.ANY]: 1,
        },
        [EnergyType.GRASS]
      )
    ).toBe(
      "Energy requirements not met for attack [vine_whip]. Required: 🌱⭐. Attached: 🌱."
    );
  });
});
