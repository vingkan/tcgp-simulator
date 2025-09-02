import {
  AttackEnergyRequirements,
  AttackId,
  EnergyRequirementType,
  EnergyType,
  PokemonState,
} from "./types";

// Currently unused, but it's for fun.
export const ENERGY_TYPE_TO_ICON: Record<EnergyRequirementType, string> = {
  [EnergyRequirementType.GRASS]: "🌱",
  [EnergyRequirementType.FIRE]: "🔥",
  [EnergyRequirementType.WATER]: "💧",
  [EnergyRequirementType.LIGHTNING]: "⚡",
  [EnergyRequirementType.FIGHTING]: "✊🏾",
  [EnergyRequirementType.PSYCHIC]: "👁",
  [EnergyRequirementType.DARK]: "🌙",
  [EnergyRequirementType.METAL]: "🥈",
  [EnergyRequirementType.ANY]: "⭐",
};

// Use energy letters to match online formats.
// Note that fire is R (red) and fighting is F.
export const ENERGY_TYPE_TO_LETTER: Record<EnergyRequirementType, string> = {
  [EnergyRequirementType.GRASS]: "G",
  [EnergyRequirementType.FIRE]: "R",
  [EnergyRequirementType.WATER]: "W",
  [EnergyRequirementType.LIGHTNING]: "L",
  [EnergyRequirementType.FIGHTING]: "F",
  [EnergyRequirementType.PSYCHIC]: "P",
  [EnergyRequirementType.DARK]: "D",
  [EnergyRequirementType.METAL]: "M",
  [EnergyRequirementType.ANY]: "C",
};

export function stringifyEnergyType(
  type: EnergyRequirementType | EnergyType
): string {
  // EnergyType is a subset of EnergyRequirementType, so it will always be found.
  return ENERGY_TYPE_TO_LETTER[type];
}

function stringifyEnergyRequirements(
  requirements: AttackEnergyRequirements
): string {
  return Object.entries(requirements)
    .flatMap(([type, count]) =>
      Array(count).fill(stringifyEnergyType(type as EnergyRequirementType))
    )
    .join("");
}

export function stringifyAttachedEnergy(
  attached: PokemonState["attachedEnergy"]
): string {
  return attached.map((type) => stringifyEnergyType(type)).join("");
}

export function getEnergyRequirementsNotMetMessage(
  attackId: AttackId,
  requirements: AttackEnergyRequirements,
  attached: PokemonState["attachedEnergy"]
): string {
  return [
    `Energy requirements not met for attack [${attackId}].`,
    `Required: ${stringifyEnergyRequirements(requirements)}.`,
    `Attached: ${stringifyAttachedEnergy(attached)}.`,
  ].join(" ");
}
