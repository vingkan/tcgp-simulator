import { describe, expect, it } from "vitest";

import { doTurn } from "./demo";
import { GameState } from "./types";

describe("doTurn", () => {
  it("increments the turn number", () => {
    const gameState = { turnNumber: 1 } satisfies GameState;
    const actual = doTurn(gameState);
    const expected = { turnNumber: 2 } satisfies GameState;
    expect(actual).toStrictEqual(expected);
  });
});
