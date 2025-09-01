# **TCGP Game Engine Design Doc**

## _Aug 31, 2025 [Vinesh Kannan](https://github.com/vingkan)_

# **Requirements**

## **Overview**

The TCGP Game Engine enables programmatic simulation of games following the rules of TCG Pocket. The engine will be built to support the rules and cards of the TCG Pocket game. The engine will be followed by a card list, a deck builder, a game application, and a bot framework.

## **Out of Scope**

1. No visualization or user interface. Can be built on top of the game engine.
2. No bots or player logic. Can be built on top of the game engine.
3. Card set-agnostic. Provides a schema to configure cards, but not the cards themselves.
4. Deck-agnostic. Validates deck requirements, but can use any deck built of cards configured in the accepted schema.
5. No time limits. Purely tracks game state and actions, does not enforce time limits so that state can be frozen.

## **Functional Requirements**

1. A deck must contain 20 cards.
2. A deck must contain at least one basic Pokemon card.
3. A deck cannot contain more than two of the same card.
4. A deck must declare at least one type of energy.
5. The energy types are: grass, fire, water, lightning, fighting, psychic, darkness, and metal.
6. The class of a card can be: Pokemon card, item card, tool card, or supporter card.
7. A Pokemon card has the following properties:
   1. Base health points
   2. Type
   3. Basic or evolved
   4. If evolved, what Pokemon it evolves from
   5. If evolved, what stage
      1. Stage 1 for a Pokemon that evolves from a basic Pokemon
      2. Stage 2 for a Pokemon that evolves from an evolved Pokemon
   6. Optional EX designation
   7. Optional Mega EX designation
   8. Optional fossil designation
   9. Zero or one ability
   10. One or more attacks
   11. One or more weaknesses
   12. Retreat cost
8. The Pokemon types are: grass, fire, water, lightning, fighting, psychic, darkness, metal, colorless, and dragon.
9. Pokemon have base health points that determine their starting health points.
10. When a Pokemon's health points reach zero, they are knocked out.
11. When a Pokemon is knocked out, the opponent gets prize points:
    1. One point for regular Pokemon
    2. Two points for EX
    3. Three points for Mega EX
12. When one player gets three or more prize points, they win the game.
13. When a Pokemon is knocked out, that Pokemon, any Pokemon it was evolved from, any cards attached to it, and all energy attached to it, go to its player's discard pile.
14. The game can end in a draw if both players win on the same turn with the same number of prize points.
15. If a player’s active Pokemon was knocked out and the game has not yet been won, the player must choose a Pokemon from their bench to replace it.
16. If a player’s active Pokemon was knocked out and there are no benched Pokemon to replace it, the opponent wins.
17. At the start of the game, flip a coin, if heads, the second player goes first, otherwise the first player goes first.
18. At the start of the game, each player draws five cards from their deck, which is guaranteed to include at least one basic Pokemon.
19. At the start of the game, each player chooses a starting active basic Pokemon.
20. At the start of the game, each player can optionally play up to three additional basic Pokemon to their bench.
21. Each player's bench can have up to three Pokemon.
22. At the start of their turn, the player draws a card from their deck, if any are left.
23. On their turn, the player can take the following actions:
    1. Attach free energy from their energy zone at most once
    2. Play a supporter card at most once
    3. Play basic Pokemon to the bench
    4. Evolve eligible Pokemon
    5. Retreat their active Pokemon up to once
    6. Attach tool cards to Pokemon
    7. Play item cards
    8. Use Pokemon abilities up to once per ability
    9. Use an attack of their active Pokemon and end turn
    10. End turn without attacking
24. After the first turn of the game, each player's energy zone generates one energy per turn from one of the energy types in their deck, chosen at random.
25. The effects of cards can also cause the energy zone to generate energy types that are not in the deck.
26. Supporter cards can:
    1. Switch the opponent's active Pokemon
    2. Draw cards
    3. Find cards within the deck
    4. Heal Pokemon
    5. and more…
27. Tool cards can:
    1. Increase a Pokemon's base health
    2. Cause status conditions to the opponent's Pokemon when attacked
    3. and more…
28. Item cards can:
    1. Heal Pokemon
    2. Find cards within the deck
    3. Evolve a Pokemon that otherwise would not be eligible to evolve
    4. and more…
29. Pokemon abilities can:
    1. Draw cards
    2. Heal damage
    3. Draw cards
    4. and more…
30. Pokemon attacks can:
    1. Cause damage
    2. Cause status conditions
    3. Heal Pokemon
    4. Draw cards
    5. Attach energy to Pokemon
    6. and more…
31. An attack may cost zero or more energy.
32. Pokemon attacks can create effects that could apply to any Pokemon on the field.
33. The effects of a Pokemon attack can:
    1. Prevent status conditions
    2. Prevent damage from attacks
    3. Reduce damage from attacks
    4. and more…
34. Pokemon can use attacks if they have enough quantity and type of energy attached to meet the requirements of the attack.
35. Pokemon may have to discard energy after using an attack.
36. Pokemon may not be able to use an attack due to:
    1. An ability
    2. An effect
    3. or more…
37. An attack may not do any damage or cause any effects due to:
    1. An ability
    2. An effect
    3. or more…
38. Pokemon can have one or more type weaknesses.
39. If a Pokemon takes damage from an attack from a Pokemon whose type they have a weakness to, then the damage taken is increased by 20 damage.
40. Status conditions can be burn, poison, sleep, paralysis, or confusion.
41. If a Pokemon is burned, flip a coin between turns, if heads, then burn subsides, if tails, then burn persists and the Pokemon takes 20 damage.
42. If a Pokemon is poisoned, the Pokemon takes 10 damage between turns.
43. If a Pokemon is asleep, flip a coin between turns, if heads, then sleep subsides, if tails, then sleep persists and the Pokemon cannot attack or retreat.
44. If a Pokemon is paralyzed, it cannot attack or retreat on the next turn, paralysis subsides after the next turn.
45. If a Pokemon is confused, flip a coin before each attack, if tails, then the attack fails and the Pokemon takes 10 damage.
46. Pokemon can retreat if there is a Pokemon on the bench to switch with and if their retreat cost is satisfied.
47. Pokemon are eligible for an evolution if they were not played on this turn and the chosen evolution card evolves from them.
48. An ability can allow EX Pokemon to evolve.
49. Retreat cost could be zero or more energy.
50. Retreat cost can be affected by supporter cards, tool cards, item cards, abilities, move effects, and more.
51. When a Pokemon is affected with a status condition, they are cured of their previous status condition, if any.
52. When Pokemon retreat to the bench, they are cured of status conditions.
53. When Pokemon are evolved, they are cured of status conditions.
54. Players can count how many cards are in their opponent’s hand.
55. Players can count how many cards are left in their own deck or in their opponent’s deck.
56. Players can view all the cards in their own discard pile or their opponent’s discard pile.
57. Players can view the log of all actions that have happened in the game so far.

## **Non Functional Requirements**

1. Make it easy to write functional tests that prevent regressions to known cases.
2. Make it easy to write functional tests that add new cases to expand coverage.
3. Allow functional tests to override random chance to ensure deterministic outcomes.
4. Allow random chance in functional tests whose outcome is not affected by chance.
5. Prevent overriding random chance in real or simulated games.
6. Make it less time consuming to configure new cards.
7. Allow bots to play the game.
8. Allow implementing cards that are not in the real game.
9. Allow previewing the outcome of attacks.
10. Handle single vs continuous coin flip separately internally to simplify attack previews.
11. Start by implementing attacks as functions, then find out whether they can be expressed through content configuration.
12. Start by having each attack implement its own preview logic, then find out whether the preview can be derived from its configuration and parameters.
13. Allow game engine functions to be serialized from simple text to make it easier to write clients in any programming language or protocol.
14. Attack implementations should return a game state where damaged Pokemon have zero or negative health points and leave the responsibility for resolving knockouts to the game engine. This can also allow abilities that reduce damage to return new game states that edit the damage done in case that would allow a Pokemon to survive.

## **Estimates**

1. How many cards, moves, and abilities will we have to configure?
   1. Assume 100 cards per set
   2. Assume 10 sets
   3. Assume 2 moves per card
   4. Assume 1 ability per card
   5. Expect to configure 1,000 cards
   6. Expect to configure 2,000 moves
   7. Expect to configure 100 abilities
2. Should we return the entire game state in one call or split it up into smaller calls?
   1. Will estimate the bandwidth cost of this later…

## **Sequencing**

1. Core game framework
   1. Game state
   2. Health
   3. Energy
   4. Attacks with damage (no status, no effects)
   5. Knockout
   6. Win conditions
2. Pokemon framework
   1. Weaknesses
   2. Evolution
3. Attack framework
   1. Attacks with status conditions
   2. Attacks with other effects
4. Gameplay framework
   1. Initial game set up
   2. Retreating Pokemon
   3. Benching Pokemon
   4. Evolving Pokemon
   5. Deck state
   6. Discard pile state
5. Ability framework
   1. Ability events
6. Trainer card framework
   1. Item cards
   2. Supporter cards
   3. Tool cards
7. Preview framework
   1. Attack previews
8. Additional card sets
   1. Attack refactors
   2. Ability refactors
   3. Trainer card refactors
9. Deck builder
   1. Card validation
   2. Deck validation
10. Bot framework
    1. Game simulation
    2. Basic heuristics
    3. Command serialization
    4. LLM-backed bots
11. Game application
    1. Deck builder user interface
    2. Game user interface
    3. Time limits
    4. Play against bots
    5. Play against other users

# **Contracts**

## **External APIs**

### **Common Errors**

1. `CardNotFoundError`
2. `CardDoesNotBelongToActivePlayerError`
3. `ImproperCardClassError`
4. `InvalidParamsError`

### **Setup**

1. `getTurnOrder() -> TurnOrderOutcome`
2. `playInitialBasicPokemon(activeCardId, benchCardId[]) -> void`

### **Turn**

1. `canPlayBasicPokemon() -> bool`
2. `playBasicPokemon(cardId) -> bool`
3. `evolveTo(targetCardId, evolvedCardId) -> void`
   1. `raises NotEligibleToEvolveError`
   2. `raises DoesNotEvolveIntoError`
4. `canPlaySupporterCard() -> bool`
5. `playSupporterCard(cardId, cardParams) -> CardOutcome`
   1. `raises AlreadyPlayedSupporterError`
6. `playItemCard(cardId, cardParams) -> CardOutcome`
7. `canAttachToolCard(targetCardId) -> bool`
8. `attachToolCard(targetCardId, toolCardId) -> void`
9. `attachFreeEnergyFromZone(targetCardId) -> void`
   1. `raises AlreadyAttachedEnergyError`
10. `canRetreat() -> bool`
11. `retreatTo(nextActiveCardId) -> void`
    1. `raises CannotRetreatError`
12. `canUseAttack(attackId) -> bool`
13. `useAttack(attackId, attackParams) -> AttackOutcome`
    1. `raises EnergyCostNotMetError`
14. `getPreviewAttack(attackId, attackParams) -> AttackOutcome`
15. `useEndTurn() -> void`
16. `replaceKnockedOutPokemon(nextActiveCardId) -> void`

### **Game Information**

17. `getCardById(cardId) -> CardDetail`
18. `getEffectById(effectId) -> EffectDetail`
19. `getOwnDeckList() -> CardReference[]`
20. `getOpponentDeckList() -> CardReference[]`
    1. `raises ClosedDeckListError`

### **Game State**

1. `getTurnNumber() -> int`
2. `getGameLog() -> LogEntry[]`
3. `getGameState() -> GameState`

If we separate game state:

1. `getBoardCards() -> BoardState`
2. `getBoardEffects() -> EffectReference[]`
3. `countOwnPrizePoints() -> int`
4. `countOpponentPrizePoints() -> int`
5. `getHandCards() -> CardReference[]`
6. `countOpponentHand() -> int`
7. `getOwnDiscardPile() -> CardReference[]`
8. `getOpponentDiscardPile() -> CardReference[]`
9. `countOwnDeckCardsLeft() -> int`
10. `countOpponentDeckCardsLeft() -> int`

## **External Schemas**

### **Game Configuration**

1. Abilities
   1. Ability ID
   2. Name
   3. Description
   4. Ability event function IDs
   5. With params schema
2. Attacks
   1. Attack ID
   2. Name
   3. Required energy types and quantities
   4. Attack description
   5. Damage description
   6. With params schema
3. Effects
   1. Effect ID
   2. Name
   3. Description
   4. Effect event function IDs
4. Effect event functions
   1. Effect event function ID
5. Item functions
   1. Item function ID
   2. With params schema
6. Tool event functions
   1. Tool event function ID
   2. With params schema
7. Supporter functions
   1. Supporter function ID
   2. With params schema

### **Deck Configuration**

1. Name
2. Energy types
3. Card stable IDs and quantities

### **Card Configuration**

1. Name
2. Stable ID
3. Class
4. Pokemon Card Fields
   1. Species ID
   2. Type
   3. Base health points
   4. Evolves from species ID or null
   5. Stage: Basic, stage 1, stage 2
   6. Is EX?
   7. Is Mega EX?
   8. Is fossil?
   9. Ability ID or null
   10. Attack IDs
   11. Type weaknesses
   12. Retreat cost
5. Item Card Fields
   1. Effect description
   2. Item function ID
6. Tool Card Fields
   1. Effect description
   2. Tool on attach function ID
   3. Tool on attacked function ID
   4. Tool between turn function ID
7. Supporter Card Fields
   1. Effect description
   2. Supporter function ID

### **Immutable Game State**

1. Game State
   1. Turn number
   2. Active player
   3. Hand
      1. Card references
   4. Prize points
      1. Own
      2. Opponent
   5. Board state
      1. Own side state
      2. Opponent side state
      3. Board effect references
   6. Allowances
      1. Can attach free energy from zone
      2. Can use supporter card
      3. Can retreat
   7. Discard pile state
      1. Own card references
      2. Opponent card references
   8. Deck state
      1. Own cards left count
      2. Opponent cards left count
      3. Invisible: Own ordered card references
      4. Invisible: Opponent ordered card references
2. Card reference
   1. Card game ID
   2. Card stable ID
   3. Card class
3. Side state
   1. Active Pokemon state
   2. Benched Pokemon states
4. Pokemon state
   1. Card reference
   2. Current health points
   3. Current status condition
   4. Current effect references
   5. Attached energy
   6. Attached tool card
   7. Allowed attack IDs
   8. Evolved from Pokemon card references
5. Effect reference
   1. Effect ID
   2. Source card reference

## **Internal APIs**

To implement attacks, abilities, effects, and other cards:

1. `onAttackUsed(gameState, attackParams) -> GameState`
2. `onAttackPreviewed(gameState) -> AttackPreview`
3. `onAbilityUsed(gameState, eventParams) -> GameState`
4. `onAbilityHolderAttacked(gameState, eventParams) -> GameState`
5. `onAbilityBetweenTurns(gameState) -> GameState`
6. `onItemCardPlayed(gameState, cardParams) -> GameState`
7. `onToolCardAttached(gameState, cardParams) -> GameState`
8. `onToolHolderAttacked(gameState, eventParams) -> GameState`
9. `onToolBetweenTurns(gameState) -> GameState`
10. `onSupporterCardPlayed(gameState, cardParams) -> GameState`

## **Turn State Machine**

TODO
