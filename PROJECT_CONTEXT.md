# Dragon Egg Rush - Project Context

## Overview

Dragon Egg Rush is a fast-paced Match-3 score attack game inspired by Dragon Mania Legends.

Platform:

* Web (Phaser 3)
* Planned Electron desktop build

Game duration:

* 90 seconds

Goal:

* Earn the highest possible score before time runs out.

---

# Board

Board Size:

* 6 rows x 6 columns

Egg Types:

* Fire
* Ice
* Leaf
* Earth

Board Rules:

* Eggs fall from top to bottom.
* Empty spaces are filled using gravity.
* New eggs spawn from the top.
* Combo chains are supported.

---

# Scoring

Base Score:

* 10 points per egg destroyed

All scoring should use:

addScore(baseScore)

This allows score multipliers to work correctly.

---

# Match Rules

## Match 3

Requirement:

* 3 eggs of the same type
* Horizontal or vertical

Effect:

* Destroy matched eggs

---

## Match 4

Requirement:

* 4 eggs of the same type
* Horizontal or vertical

Effect:

Horizontal Match 4:

* Creates a vertical beam
* Clears an entire column

Vertical Match 4:

* Creates a horizontal beam
* Clears an entire row

Beam Origin:

* Uses the swapped egg position
* If unavailable (combo chain), use fallback center

---

## Match 5

Requirement:

* 5 eggs of the same type

Effect:

* Destroy all eggs of that type currently on the board

---

## L Shape

Requirement:

X
X
X X X

or rotated variants

Effect:

* Destroy 3x3 area around center

Priority:

* Higher than Match 3
* Lower than Match 5

---

## T Shape

Requirement:

X X X
X
X

or rotated variants

Effect:

* Destroy 3x3 area around center

Priority:

* Higher than Match 3
* Lower than Match 5

---

# Match Priority

Highest → Lowest

1. Match 5
2. L Shape / T Shape
3. Match 4
4. Match 3

---

# Combo Resolution

Board resolution pipeline:

Detect Effects
→ Sort by Priority
→ Apply Effects
→ Destroy Eggs
→ Gravity
→ Refill
→ Repeat

Continue until no effects remain.

---

# Dragon Energy System

Every destroyed egg grants +1 energy to its matching dragon.

Fire Egg
→ Fire Dragon Energy

Ice Egg
→ Ice Dragon Energy

Leaf Egg
→ Leaf Dragon Energy

Earth Egg
→ Earth Dragon Energy

Energy Requirement:

* 30 energy

When reaching 30:

* Reset energy to 0
* Queue skill activation

Dragon skills should activate AFTER combo resolution is finished.

Skills must never interrupt an active combo chain.

---

# Fire Dragon

Skill:
Fire Storm

Activation:

* Auto

Effect:

* 5x5 explosion

Explosion Center:
Randomly chosen from one of the 4 middle cells:

(2,2)
(2,3)
(3,2)
(3,3)

Bonus:

* +50 score

Uses:

* Existing destroy
* Gravity
* Refill
* Combo systems

---

# Ice Dragon

Skill:
Frozen Time

Activation:

* Auto

Effect:

* Freeze countdown timer

Duration:

* 5 seconds

Rules:

* Timer does not decrease
* Player can still play
* Combos continue
* Dragon skills continue

If activated while already active:

* Refresh duration
* Do not stack

---

# Leaf Dragon

Skill:
Nature Blessing

Activation:

* Auto

Effect:

* Score multiplier x2

Duration:

* 5 seconds

Rules:

* Applies to ALL scoring sources
* Refresh duration if triggered again
* Never stack above x2

---

# Earth Dragon

Skill:
Petrify

Activation:

* Auto

Effect:

* Convert 10 random non-earth eggs into Earth eggs

Rules:

* Do not directly destroy eggs
* Wait briefly
* Run normal match detection
* Allow combo chains

Purpose:

* Manipulate board state
* Create unexpected combos

---

# Game Over

When timer reaches 0:

* Disable player input
* Stop combo resolution
* Stop gravity/refill
* Stop dragon skill activation
* Stop score changes
* Show final score panel

Board remains visible but frozen.

---

# Restart

Restart must reset:

* Score
* Timer
* Board
* Selected egg
* Dragon energies
* Active buffs
* Combo state
* Frozen Time state
* Pending dragon skills

Then rebuild the board.

---

# Important Development Rule

When modifying the game:

DO:

* Reuse existing systems
* Reuse gravity
* Reuse refill
* Reuse resolveBoard()

DO NOT:

* Rewrite core match detection
* Create duplicate gravity systems
* Create duplicate score systems
* Create separate board resolution pipelines

Always integrate with the existing architecture.
PROJECT_CONTEXT.md - UPDATE

## Dragon Energy

Energy Requirement:
30

When reaching 30:

* Skill becomes READY
* Energy remains locked at max
* Energy gain stops
* Skill enters queue

Energy resets only after skill activation.

---

## Dragon Queue Priority

1. Ice
2. Leaf
3. Fire
4. Earth

Only one queued activation per dragon.

Skills activate after combo resolution.

---

## Dragon Skill Display

Skill names are hidden during normal gameplay UI.

Skill names are displayed only during dragon cut-ins.

---

## Fire Dragon

Display Name:
HÀ NỘI GIỮA THÁNG 6

Gameplay:

* 3 random 2x2 explosions

Visual:

* Meteor strike sequence

---

## Ice Dragon

Display Name:
LỜI TỪ CHỐI CỦA CRUSH

Gameplay:

* Freeze timer for 5 seconds

Visual:

* Fullscreen freeze effect
* Frozen timer frame

---

## Leaf Dragon

Display Name:
RAU SẠCH CẤP ĐẠI HỌC

Gameplay:

* Next 3 successful player moves gain x2 score

Planned UI:

* Visible remaining charges
* Leaf buff indicator

---

## Earth Dragon

Display Name:
BÀNH TRƯỚNG LÃNH ĐỊA

Gameplay:

* Convert 10 random non-earth eggs
* Destroy all earth eggs

Visual:

* Delayed visible petrification phase

---

## Special Match Presentation

Match 4:

* Beam attack presentation

Match 5:

* Wavy energy link presentation

L/T:

* Enlarged trigger egg
* Charge-up
* Explosion

These are visual-only improvements.
Gameplay logic remains unchanged.
