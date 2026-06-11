# Dragon Egg Rush - Handover Context

## Project Status

Core gameplay is considered stable and committed to GitHub.

Current focus:

* UI polish
* Visual effects
* Audio
* Presentation

---

## Game

Dragon Egg Rush

6x6 Match-3 game inspired by Dragon Mania Legends.

Mode:

* Score Attack
* 90 seconds

Timer starts only after the first successful move.

---

## Egg Types

* Fire
* Ice
* Leaf
* Earth

Egg sprites already exist and are loaded from:

assets/eggs/

---

## Board

Board background exists.

Board alignment has been fixed.

Board skin switching has been removed.

Dragon skills will use visual effects instead.

---

## Match Rules

Match 3:

* Normal destroy

Match 4:

* Horizontal match clears a vertical column
* Vertical match clears a horizontal row
* Uses swapped egg as trigger

Match 5:

* Destroy all eggs of the same type

L Shape:

* 3x3 explosion around center

T Shape:

* 3x3 explosion around center

Priority:

1. Match 5
2. L/T
3. Match 4
4. Match 3

---

## Delayed Special System

Match 4 / Match 5 / L / T:

* Trigger egg remains on board
* Trigger egg blinks
* Other matched eggs are removed
* Gravity + refill happen first
* Then special effect activates

Match 3 remains instant.

---

## Dragon Energy

Only eggs destroyed by matches generate dragon energy.

Eggs destroyed by dragon skills DO NOT generate dragon energy.

Energy requirement:
30

When reaching 30:

* Skill becomes READY
* Energy stays at 30/30
* Energy gain is locked
* Skill is queued

Energy resets to 0 only when the skill actually activates.

---

## Dragon Queue Rules

Only one queued activation per dragon per combo chain.

Energy gain is locked while that dragon is READY.

Priority:

1. Ice
2. Leaf
3. Fire
4. Earth

Queued skills activate after combo resolution finishes.

---

## Dragon Skills

### Fire Dragon

Fire Storm

Current version:

* 3 random 2x2 explosions
* Not 5x5 anymore

---

### Ice Dragon

Frozen Time

* Freeze timer
* 5 seconds

---

### Leaf Dragon

Nature Blessing

Current version:

* Next 3 successful player moves gain x2 score

Not time based anymore.

---

### Earth Dragon

Petrify

* Convert 10 random non-earth eggs into Earth eggs
* Then destroy all Earth eggs
* Similar to Match 5

---

## Dragon Portraits

Assets:

assets/dragons/

Portrait UI already exists.

Need further polish.

---

## Current TODO

High Priority:

1. Dragon skill cut-in animations

Example:

* Fire Dragon portrait appears fullscreen
* "FIRE STORM!"
* Then skill activates

2. Dragon visual effects

Fire:

* Meteor falls before explosions

Ice:

* Snow / freeze overlay

Leaf:

* Giant leaf sweeps across screen

Earth:

* Screen shake

3. UI polish

4. Audio

5. Final balancing

---

## Important Rule

Read PROJECT_CONTEXT.md first.

Then read PROJECT_HANDOVER.md.

Do NOT rewrite existing gameplay systems unless explicitly requested.
