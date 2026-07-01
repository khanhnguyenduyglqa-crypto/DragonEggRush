# Dragon Egg Rush - Project Context

## Overview

Dragon Egg Rush is a fast-paced Phaser 3 Match-3 score attack game inspired by Dragon Mania Legends.

Platform:

* Web (Phaser 3)
* Planned Electron desktop build

Current status:

* Feature complete demo build
* Current focus is polish, balancing, audio quality, and performance cleanup if needed

Game duration:

* 90 seconds
* Timer starts only after the first successful player move

Goal:

* Earn the highest possible score before time runs out.

---

# Board

Board size:

* 6 rows x 6 columns

Egg types:

* Fire
* Ice
* Leaf
* Earth

Board rules:

* Eggs fall from top to bottom.
* Empty spaces are filled using gravity.
* New eggs spawn from the top.
* Cascades and combo chains are supported.
* Board skin switching has been removed.
* The board uses the default visual background while dragon skills use visual effects.

Input:

* Click one egg, then click an adjacent egg to swap.
* Drag or swipe an egg toward an adjacent cell to swap.
* Invalid swaps roll back.

---

# Scoring

Base score:

* 10 points per egg destroyed

All scoring should use:

```js
addScore(baseScore)
```

This keeps score multipliers and stale-run safety centralized.

Dragon skill destruction:

* Still gives score.
* Does not grant dragon energy.
* Leaf x2 score can still multiply dragon skill score when the skill is part of an active boosted move chain.

---

# Match Rules

## Match 3

Requirement:

* 3 eggs of the same type
* Horizontal or vertical

Effect:

* Destroy matched eggs immediately.

---

## Match 4

Requirement:

* 4 eggs of the same type
* Horizontal or vertical

Effect:

* Horizontal Match 4 clears a vertical column.
* Vertical Match 4 clears a horizontal row.

Visual:

* Beam effect from the trigger egg.
* Beam fires in both directions along the clear direction.

Trigger:

* Uses the swapped egg when available.
* Uses a fallback/key cell during automatic combo chains.

---

## Match 5

Requirement:

* 5 eggs of the same type

Effect:

* Destroy all eggs of that type currently on the board.

Visual:

* Wavy energy links connect the trigger egg to same-color eggs before destruction.

---

## L Shape / T Shape

Requirement:

* L or T pattern of the same egg type.

Effect:

* Destroy a 3x3 area around the center/trigger egg.

Visual:

* Center egg enlarges dramatically.
* Larger explosion effect detonates over the 3x3 area.

---

# Match Priority

Highest to lowest:

1. Match 5
2. L Shape / T Shape
3. Match 4
4. Match 3

---

# Delayed Special System

Match 4, Match 5, L, and T specials use delayed activation:

* Trigger egg remains on board.
* Trigger egg blinks while waiting.
* Other matched eggs are removed first.
* Gravity and refill happen.
* The special effect activates from the trigger egg after the board is full again.

Match 3 does not use delayed activation.

---

# Combo Resolution

Resolution pipeline:

```text
Detect Effects
-> Sort by Priority
-> Apply Effects
-> Destroy Eggs
-> Gravity
-> Refill
-> Repeat
```

Combo chain rules:

* One successful player move creates one continuous combo chain.
* Combo tracking remains continuous across normal cascades, delayed specials, dragon skills, gravity, refill, and skill-caused cascades.
* Combo count continues increasing for every destruction event in the same player-move chain.
* Combo count resets only after the full chain ends and input is about to return.

Cascade pacing:

* A cascade cap prevents extremely long automatic chains.
* Player chain cap and skill chain cap are configurable in code.
* If the cap is reached, the board stabilizes safely and returns control without leaving holes or stale async steps.

---

# Timer / Game Over

Timer behavior:

* Timer starts only after the first successful player move.
* If the timer reaches 0 while the board is idle, Game Over appears immediately.
* If the timer reaches 0 during an active combo chain, player input is disabled immediately.
* The active final chain is allowed to finish before Game Over appears.

Final-chain wait includes:

* Cascades
* Delayed specials
* Queued dragon skills
* Gravity/refill
* Skill-caused cascades

---

# Dragon Energy System

Energy requirement:

* 30

Energy gain:

* Only eggs destroyed by normal match resolution grant dragon energy.
* Eggs destroyed by dragon skills do not grant dragon energy.

When energy reaches 30:

* Energy clamps at 30/30.
* Skill is marked READY.
* Skill is queued.
* Energy gain for that dragon is locked.
* Energy does not reset yet.

When the queued skill actually activates:

* Energy resets to 0.
* READY state is removed.

Queue safety:

* Each dragon can queue only once per combo chain.
* Duplicate queued skills are skipped.
* Locked dragons ignore additional energy until the chain and pending skills finish.

Dragon priority:

1. Fire
2. Earth
3. Leaf
4. Ice

Ice is last so Frozen Time begins after other queued skill animations/effects finish.

---

# Dragon Skills

## Fire Dragon

Player-facing skill name:

* HÀ NỘI GIỮA THÁNG 6

Gameplay:

* Cut-in implemented.
* Summons 3 meteors.
* Each meteor targets a random 2x2 area.
* Each meteor destroys its 2x2 area.
* Overlapping explosion cells are deduplicated with Sets where appropriate.

Visual/audio:

* Fire Dragon cut-in.
* Custom cut-in roar audio.
* Meteor warning markers.
* Falling meteor visuals.
* Explosion impact visuals.
* Separate meteor fall and impact SFX.

---

## Ice Dragon

Player-facing skill name:

* XỊT KEO LUÔN

Gameplay:

* Cut-in implemented.
* Freezes the timer for 5 seconds.
* Player can still play while the timer is frozen.
* Refreshes duration if triggered while already active.

Visual/audio:

* Full-screen freeze effect.
* Subtle frost overlay during Frozen Time.
* Timer frame visually freezes.
* Frozen visual fades when time resumes.
* Custom cut-in roar audio.
* Freeze start/end SFX.

---

## Leaf Dragon

Player-facing skill name:

* TÝ RAU TÝ BÚN

Gameplay:

* Cut-in implemented.
* Next 3 successful player moves gain x2 score.
* Not time-based.
* Buff refreshes back to 3 moves if activated again.
* Buff consumes only after a successful player move and its full combo chain finish.

Visual/audio:

* Leaf Dragon cut-in.
* Persistent leaf buff indicator.
* Remaining charge display.
* Score UI glow while active.
* Leaf feedback when charges are consumed or expire.
* Custom cut-in roar audio.
* Wind/leaf activation SFX.
* Dry-leaf charge consumption SFX.

---

## Earth Dragon

Player-facing skill name:

* BÀNH TRƯỚNG LÃNH ĐỊA

Gameplay:

* Cut-in implemented.
* Converts 10 random non-earth eggs into Earth Eggs.
* Then destroys all Earth Eggs on the board.
* Earth skill destruction does not grant dragon energy.

Visual/audio:

* Earth Dragon cut-in.
* Slower visible petrification/conversion animation.
* Short hold so players can see converted eggs.
* Earth shatter/destruction phase.
* Custom cut-in roar audio.
* Petrify and shatter SFX.

---

# UI

Current UI systems:

* Wooden sign header.
* Improved title readability.
* Custom image-based stat cards.
* Dragon portrait and energy UI.
* Dragon READY state.
* Options menu.
* Tutorial system.
* Dragon info tooltip system.
* Game over overlay.

Header:

* Uses a wooden hanging sign image.
* Title sits directly on the sign.
* Score, Timer, and Combo use replaceable stat-card assets.

Options menu contains:

* Music toggle
* SFX toggle
* Music volume slider
* SFX volume slider
* Restart Game
* Tutorial

Tutorial:

* Modal popup overlay.
* 3 pages: Basic Controls, Special Matches, Dragon Skills.
* Auto-opens every time the game launches.
* Closing and reopening the browser shows the Tutorial again.
* Uses visual illustrations and diagrams built with DOM/CSS.
* Basic Controls shows click/tap, drag/swipe, and adjacent-swap examples.
* Special Matches shows Match 3, Match 4, Match 5, and L/T diagrams.
* Dragon Skills explains gameplay effects without revealing skill names.
* Blocks board input while open.
* Tutorial visuals are isolated from gameplay and do not replace the real board.
* Mobile landscape layout support has been improved.

Tooltips:

* Dragon info icons show English descriptions.
* Desktop: tooltip appears after 150ms hover delay and hides on pointer exit.
* Mobile/touch: tapping an info icon toggles the tooltip.
* Tapping another info icon switches the tooltip.
* Tapping outside hides the tooltip.
* Tooltip positioning avoids visible viewport edges.

Dragon skill presentation:

* Skill names are hidden from normal dragon panels.
* Skill names are hidden from Tutorial Page 3.
* Skill names are revealed only during dragon cut-ins.

---

# Mobile / Web Support

Current support:

* Responsive scaling keeps the game inside the visible browser/Electron viewport.
* Local mobile testing via Live Server is supported.
* Mobile landscape play is supported.
* Mobile portrait shows a rotate-phone overlay.
* Drag/swipe swap uses scaled pointer coordinates so it works after responsive layout changes.
* Dragon info tooltips support mobile tap interaction.
* Normal mobile browser tabs remain subject to browser UI bars, which may stay visible.

---

# Audio

Audio settings:

* Music ON/OFF
* SFX ON/OFF
* Music Volume
* SFX Volume
* Settings persist in localStorage.
* First-time defaults are music volume 35% and SFX volume 25%.

Audio systems:

* Centralized audio manager.
* Procedural fallback sounds for missing assets.
* Asset-based dragon cut-in roars.
* Asset-based dragon skill effect SFX.
* Dragon roars and skill SFX respect the SFX channel and reduced default volume.

Dragon cut-in roar assets:

```text
assets/audio/dragons/fire-roar.mp3
assets/audio/dragons/ice-roar.mp3
assets/audio/dragons/leaf-roar.mp3
assets/audio/dragons/earth-roar.mp3
```

Dragon skill SFX assets:

```text
assets/audio/skills/fire-meteor-fall.mp3
assets/audio/skills/fire-meteor-impact.mp3
assets/audio/skills/ice-freeze-start.mp3
assets/audio/skills/ice-freeze-end.mp3
assets/audio/skills/leaf-blessing-start.mp3
assets/audio/skills/leaf-charge-used.mp3
assets/audio/skills/earth-petrify.mp3
assets/audio/skills/earth-shatter.mp3
```

Replaceable asset rule:

* Replace files with the same filenames.
* Relaunch the game.
* No code changes required.

---

# Restart / Hard Reset

Restart is a hard reset.

It must:

* Increment the run/session token.
* Stop old combo resolution.
* Stop old async steps from modifying the new run.
* Stop pending dragon skills.
* Stop delayed specials.
* Stop active cut-ins and temporary effects.
* Reset score, timer, combo, board, energy, buffs, Frozen Time, selected egg, and input state.
* Rebuild a fresh board.

Stale async protection:

* Async gameplay flows check the current run id before continuing after waits, timers, tweens, or delayed calls.
* Old score events should not apply after restart.

---

# Bug Fixes / Stability

Recent stability fixes:

* Restart during combo no longer leaves old combo chains running.
* Old score events are blocked after restart.
* Tutorial rendering no longer replaces the gameplay board.
* Tutorial has visual DOM/CSS diagrams without touching gameplay board objects.
* Dragon skill names are hidden from Tutorial Page 3 and normal dragon panels.
* Dragon info tooltips work on desktop hover and mobile tap.
* Responsive scaling and drag/swipe input have been improved for web/mobile.
* Board asset loading issues were resolved.
* Dragon portrait asset paths were cleaned up.
* Dragon skill queue stability was improved.
* Cascade tracking remains continuous across dragon skills.
* Combo pacing cap prevents very long autoplay sequences.
* Game Over waits for an active final combo chain to fully finish before showing the final score.

---

# Important Development Rule

When modifying the game:

DO:

* Reuse existing systems.
* Reuse gravity.
* Reuse refill.
* Reuse resolveBoard().
* Integrate with the existing dragon skill queue.
* Keep asset systems replaceable by filename when possible.

DO NOT:

* Rewrite core match detection.
* Rewrite gravity/refill.
* Rewrite combo resolution architecture.
* Create duplicate score systems.
* Create separate board resolution pipelines.
* Change dragon gameplay rules unless explicitly requested.

Always integrate with the existing architecture.
