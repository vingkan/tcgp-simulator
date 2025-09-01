import { EnergyRequirementType, PokemonType } from "../../core/types";
import {
  makeBasicPokemonCard,
  makeSimpleDamagingMove,
} from "../../core/makers";

export const vineWhip = makeSimpleDamagingMove({
  id: "vine_whip",
  name: "Vine Whip",
  damage: 40,
  energyRequirements: {
    [EnergyRequirementType.GRASS]: 1,
    [EnergyRequirementType.ANY]: 1,
  },
});

export const bulbasaur = makeBasicPokemonCard({
  stableId: "a1-001",
  name: "Bulbasaur",
  speciesId: "bulbasaur",
  type: PokemonType.GRASS,
  baseHealthPoints: 70,
  attacks: [vineWhip.id],
  typeWeaknesses: [PokemonType.FIRE],
  retreatCost: 1,
});

export const bite = makeSimpleDamagingMove({
  id: "bite",
  name: "Bite",
  damage: 20,
  energyRequirements: {
    [EnergyRequirementType.ANY]: 2,
  },
});

export const growlithe = makeBasicPokemonCard({
  stableId: "a1-039",
  name: "Growlithe",
  speciesId: "growlithe",
  type: PokemonType.FIRE,
  baseHealthPoints: 70,
  attacks: [bite.id],
  typeWeaknesses: [PokemonType.WATER],
  retreatCost: 1,
});
