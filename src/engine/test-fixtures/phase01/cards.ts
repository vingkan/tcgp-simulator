import {
  AttackId,
  CardClass,
  CardStableId,
  EnergyCount,
  HealthPoints,
  PokemonCardConfig,
  PokemonStage,
  PokemonType,
  SpeciesId,
} from "../../client/types";
import { vineWhip } from "./attacks";

function makeBasicPokemonCard(p: {
  stableId: string;
  name: string;
  speciesId: string;
  type: PokemonType;
  baseHealthPoints: number;
  attacks: AttackId[];
  typeWeaknesses: PokemonType[];
  retreatCost: number;
}): PokemonCardConfig {
  return {
    stableId: p.stableId as CardStableId,
    cardClass: CardClass.POKEMON,
    name: p.name,
    speciesId: p.speciesId as SpeciesId,
    type: p.type as PokemonType,
    baseHealthPoints: p.baseHealthPoints as HealthPoints,
    evolvesFromSpeciesId: null,
    stage: PokemonStage.BASIC,
    isEx: false,
    isMegaEx: false,
    isFossil: false,
    attacks: p.attacks,
    typeWeaknesses: p.typeWeaknesses as PokemonType[],
    retreatCost: p.retreatCost as EnergyCount,
  };
}

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
