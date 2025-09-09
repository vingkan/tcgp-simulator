import { AttackEffect, AttackEffectType, EffectTransformer } from "./types";
import { InvalidEffectCallError } from "./errors";
import { getTargetPokemonStateByCardId, updatePokemonStates } from "./utils";

function validateEffectType<T extends AttackEffectType>(
  effect: AttackEffect,
  type: T
) {
  if (effect.type !== type) {
    throw new InvalidEffectCallError(
      `Effect transformer for [${type}] called on effect [${effect.type}].`
    );
  }
}

export const EFFECT_TRANSFORMERS_BY_TYPE: Record<
  AttackEffectType,
  EffectTransformer
> = {
  [AttackEffectType.DISCARD_N_TYPED_ENERGY]: (game, e) => {
    validateEffectType(e, AttackEffectType.DISCARD_N_TYPED_ENERGY);

    const targetState = getTargetPokemonStateByCardId(game, e.targetCardId);
    const nextState = { ...targetState };
    const affectedEnergy = nextState.attachedEnergy.filter(
      (t) => t !== e.energyType
    );
    const safeEnergy = nextState.attachedEnergy.filter(
      (t) => t !== e.energyType
    );
    for (let i = 0; i < e.discardCount; i++) {
      affectedEnergy.pop();
    }

    const nextEnergy = [...affectedEnergy, ...safeEnergy];
    nextState.attachedEnergy = nextEnergy;
    updatePokemonStates(game, [nextState]);
    return game;
  },
};
