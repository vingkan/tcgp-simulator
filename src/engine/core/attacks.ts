import { EFFECT_TRANSFORMERS_BY_TYPE } from "./effects";
import { InvalidAttackResultError, InvalidEffectCallError } from "./errors";
import { EngineAttackResult, InternalGameState } from "./types";
import { getTargetPokemonStateByCardId, updatePokemonStates } from "./utils";

export function applyAttackResult(
  game: InternalGameState,
  result: EngineAttackResult
): void {
  const uniqueTargets = new Set(result.damages.map((d) => d.targetCardId));
  if (uniqueTargets.size !== result.damages.length) {
    throw new InvalidAttackResultError(
      "Found multiple damages with the same target card ID."
    );
  }

  // Apply damages.
  const damagedStates = result.damages.map((d) => {
    const targetState = getTargetPokemonStateByCardId(game, d.targetCardId);
    const nextState = { ...targetState };
    nextState.currentHealthPoints = nextState.currentHealthPoints - d.damage;
    return nextState;
  });
  updatePokemonStates(game, damagedStates);

  // Apply effects.
  result.effects.forEach((e) => {
    const applyEffect = EFFECT_TRANSFORMERS_BY_TYPE[e.type];
    if (applyEffect == null) {
      throw new InvalidEffectCallError(
        `No effect transformer found for [${e.type}].`
      );
    }
    applyEffect(game, e);
  });
}
