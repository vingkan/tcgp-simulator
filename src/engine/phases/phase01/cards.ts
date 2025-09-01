import {
  AttackEffectType,
  EnergyRequirementType,
  EnergyType,
  InternalGameState,
  PokemonType,
} from "../../core/types";
import { makeBasicPokemonCard, makeDamagingMove } from "../../core/makers";
import { stringifyEnergyType } from "../../core/stringify";
import { getOwnActivePokemon } from "../../core/utils";

export const vineWhip = makeDamagingMove({
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

const fire = stringifyEnergyType(EnergyType.FIRE);

export const ember = makeDamagingMove({
  id: "ember",
  name: "Ember",
  description: `Discard a ${fire} energy from this Pokemon.`,
  damage: 30,
  energyRequirements: {
    [EnergyRequirementType.FIRE]: 1,
  },
  withEffect: (game: InternalGameState) => {
    const ownActivePokemon = getOwnActivePokemon(game);
    return {
      type: AttackEffectType.DISCARD_SINGLE_ENERGY,
      targetCardId: ownActivePokemon.cardId,
      energyType: EnergyType.FIRE,
    };
  },
});

export const charmander = makeBasicPokemonCard({
  stableId: "a1-033",
  name: "Charmander",
  speciesId: "charmander",
  type: PokemonType.FIRE,
  baseHealthPoints: 60,
  attacks: [ember.id],
  typeWeaknesses: [PokemonType.WATER],
  retreatCost: 1,
});

export const bite = makeDamagingMove({
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
