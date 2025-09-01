import { describe, expect, it } from "vitest";
import {
  CardClass,
  CardGameId,
  EnergyType,
  InternalGameState,
  Player,
} from "../../client/types";
import { vineWhip } from "./attacks";
import { bulbasaur } from "./cards";

describe("one vs one", () => {
  it("damages the opponent's active Pokemon", () => {
    const gameState: InternalGameState = {
      turnNumber: 1,
      activePlayer: Player.A,
      currentTurnAllowances: {
        canAttachFreeEnergyFromZone: true,
        canUseSupporterCard: true,
        canRetreat: true,
      },
      prizePoints: {
        [Player.A]: 0,
        [Player.B]: 0,
      },
      active: {
        [Player.A]: {
          cardReference: {
            cardId: "1" as CardGameId,
            cardStableId: bulbasaur.stableId,
            cardClass: CardClass.POKEMON,
          },
          currentHealthPoints: 70,
          attachedEnergy: {
            [EnergyType.GRASS]: 2,
          },
          attachedTool: null,
          evolvedFrom: [],
        },
        [Player.B]: {
          cardReference: {
            cardId: "2" as CardGameId,
            cardStableId: bulbasaur.stableId,
            cardClass: CardClass.POKEMON,
          },
          currentHealthPoints: 70,
          attachedEnergy: {},
          attachedTool: null,
          evolvedFrom: [],
        },
      },
      bench: {
        [Player.A]: [null, null, null],
        [Player.B]: [null, null, null],
      },
      hand: {
        [Player.A]: [],
        [Player.B]: [],
      },
      discardPile: {
        [Player.A]: [],
        [Player.B]: [],
      },
      deck: {
        [Player.A]: [],
        [Player.B]: [],
      },
    };

    const actual = vineWhip.onUse(gameState, {});
    const expected = {
      ...gameState,
      active: {
        ...gameState.active,
        [Player.B]: {
          cardReference: {
            cardId: "2" as CardGameId,
            cardStableId: bulbasaur.stableId,
            cardClass: CardClass.POKEMON,
          },
          currentHealthPoints: 30,
          attachedEnergy: {},
          attachedTool: null,
          evolvedFrom: [],
        },
      },
    };
    expect(actual).toStrictEqual(expected);
  });
});
