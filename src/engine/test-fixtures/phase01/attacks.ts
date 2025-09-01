import {
  AttackConfig,
  AttackEnergyCost,
  AttackId,
  EnergyCount,
  EnergyType,
  InternalGameState,
  InvalidGameStateError,
  Player,
} from "../../client/types";

function makeEnergyCost(
  cost: Partial<Record<EnergyType, number>> & { colorless: number }
): AttackEnergyCost {
  return {
    typedEnergy: {
      ...cost,
      colorless: undefined,
    } as unknown as Record<EnergyType, EnergyCount>,
    colorlessEnergy: cost.colorless as EnergyCount,
  };
}

export const vineWhip: AttackConfig = {
  id: "vine_whip" as AttackId,
  description: null,
  name: "Vine Whip",
  damageDescriptor: "40",
  energyCost: makeEnergyCost({
    [EnergyType.GRASS]: 1,
    colorless: 0,
  }),
  onUse: (game: InternalGameState) => {
    const opponent = game.activePlayer === Player.A ? Player.B : Player.A;
    const oppActivePokemonState = game.active[opponent];
    if (oppActivePokemonState == null) {
      throw new InvalidGameStateError("Opponent has no active Pokemon.");
    }

    return {
      ...game,
      active: {
        ...game.active,
        [opponent]: {
          ...oppActivePokemonState,
          currentHealthPoints: oppActivePokemonState.currentHealthPoints - 40,
        },
      },
    };
  },
  onPreview: () => {
    return {
      expectedDamageToOpponentActivePokemon: 40,
    };
  },
};
