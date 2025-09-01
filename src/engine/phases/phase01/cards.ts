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
    [EnergyRequirementType.ANY]: 0,
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
