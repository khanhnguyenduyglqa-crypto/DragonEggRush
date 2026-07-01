# Dragon Egg Rush - Handover Context

## Project Status

Status:

* FEATURE COMPLETE DEMO BUILD

Current focus:

* Additional balancing
* More polished sound effects
* Additional visual polish
* Performance optimization if needed
* Release preparation

Core gameplay is stable. Future work should avoid rewrites unless explicitly requested.

---

## Game Summary

Dragon Egg Rush is a Phaser 3 6x6 Match-3 score attack game inspired by Dragon Mania Legends.

Mode:

* Score Attack
* 90 seconds
* Timer starts only after the first successful player move

Controls:

* Click-to-select and click-adjacent-to-swap
* Drag/swipe-to-swap

Egg types:

* Fire
* Ice
* Leaf
* Earth

---

## Board

Current board state:

* 6x6 board.
* Board alignment is fixed.
* Egg sprites are image-based.
* Board uses the default board background.
* Board skin switching has been removed.
* Dragon skills use visual effects instead of changing the board skin.

Relevant asset folders:

```text
assets/boards/
assets/eggs/
```

---

## Match Rules

Match 3:

* Normal destroy.

Match 4:

* Horizontal match clears a vertical column.
* Vertical match clears a horizontal row.
* Uses the swapped egg as trigger when available.
* Visual: beam effect from origin egg, firing in both directions.

Match 5:

* Destroys all eggs of the same type.
* Visual: wavy energy links to same-color eggs.

L/T Match:

* Destroys a 3x3 area.
* Visual: center egg enlarges, then detonates with a larger explosion.

Priority:

1. Match 5
2. L/T
3. Match 4
4. Match 3

---

## Delayed Special System

Match 4, Match 5, L, and T specials:

* Trigger egg remains on board.
* Trigger egg blinks.
* Other matched eggs are removed.
* Gravity and refill happen first.
* Special effect activates after the board is full again.

Match 3 remains immediate.

---

## Combo / Cascade System

Current behavior:

* Cascades and combos are supported.
* One successful player move creates one continuous combo chain.
* Combo/cascade tracking continues across delayed specials, dragon skill activations, gravity/refill, and skill-caused cascades.
* Combo count continues increasing for every destruction event in the same player-move chain.
* Combo count resets only when the entire chain is finished and player input is restored.

Pacing protection:

* Cascade cap is implemented.
* Very long automatic chains are stabilized safely.
* Dragon-skill cascades respect the same chain tracking.

Timer/game-over behavior:

* Timer starts only after the first successful player move.
* If time reaches 0 while the board is idle, Game Over appears immediately.
* If time reaches 0 during an active combo chain, player input is disabled but the active chain finishes.
* Final Game Over waits for cascades, delayed specials, queued dragon skills, gravity/refill, and skill-caused cascades.

---

## Dragon Energy

Energy requirement:

* 30

Rules:

* Only normal match destruction grants dragon energy.
* Dragon skill destruction does not grant dragon energy.
* When a dragon reaches 30, energy stays at 30/30 and the skill becomes READY.
* Energy resets only when the skill actually activates.
* Each dragon can queue only once per combo chain.
* Energy gain locks while that dragon is queued/READY.

Priority:

1. Fire
2. Earth
3. Leaf
4. Ice

Ice is intentionally last so Frozen Time starts after other queued skill animations/effects finish.

---

## Dragon Skill Names

Player-facing skill names:

Fire:

* HÀ NỘI GIỮA THÁNG 6

Ice:

* XỊT KEO LUÔN

Leaf:

* TÝ RAU TÝ BÚN

Earth:

* BÀNH TRƯỚNG LÃNH ĐỊA

Internal IDs remain:

* fire
* ice
* leaf
* earth

Skill name visibility:

* Hidden from normal dragon panels.
* Hidden from Tutorial Page 3.
* Revealed only during dragon cut-ins.

---

## Dragon Cut-Ins

Implemented:

* Fire
* Ice
* Leaf
* Earth

Cut-in duration:

* Approximately 1.5 to 2.0 seconds

Queue flow:

```text
Queued Skill
-> Cut-In
-> Skill Activation
-> Continue Queue
```

Post-cut-in board skill-name overlays have been removed.

---

## Dragon Skills

### Fire Dragon

Skill name:

* HÀ NỘI GIỮA THÁNG 6

Gameplay:

* Summons 3 meteors.
* Each meteor destroys a random 2x2 area.

Presentation:

* Fire cut-in implemented.
* Custom roar audio.
* Warning markers.
* Falling meteors.
* Impact explosions.
* Screen shake.
* Separate meteor fall and impact SFX.

---

### Ice Dragon

Skill name:

* XỊT KEO LUÔN

Gameplay:

* Freezes the timer for 5 seconds.
* Player can still play during Frozen Time.

Presentation:

* Ice cut-in implemented.
* Custom roar audio.
* Full-screen freeze effect.
* Subtle frost overlay while active.
* Timer frame visually frozen.
* Freeze start/end SFX.

---

### Leaf Dragon

Skill name:

* TÝ RAU TÝ BÚN

Gameplay:

* Next 3 successful player moves gain 2x score.
* Not time-based.

Presentation:

* Leaf cut-in implemented.
* Custom roar audio.
* Persistent buff indicator.
* Remaining charge display.
* Score UI glow while active.
* Leaf feedback on charge consumption/expiration.
* Wind/leaf activation SFX.
* Dry-leaf charge consumption SFX.

---

### Earth Dragon

Skill name:

* BÀNH TRƯỚNG LÃNH ĐỊA

Gameplay:

* Converts 10 random non-earth eggs into Earth Eggs.
* Destroys all Earth Eggs.
* Skill destruction does not grant dragon energy.

Presentation:

* Earth cut-in implemented.
* Custom roar audio.
* Slower visible conversion animation.
* Short hold before destruction.
* Petrify and shatter SFX.

---

## UI

Current UI systems:

* Wooden sign header.
* Improved title readability.
* Custom image-based stat cards.
* Score / Timer / Combo cards.
* Options button in the screen corner.
* Options popup.
* Tutorial modal.
* Dragon portraits and energy panels.
* Dragon READY state.
* Dragon info tooltips.
* Game over overlay.

Options menu contains:

* Music ON/OFF
* SFX ON/OFF
* Music Volume slider
* SFX Volume slider
* Restart Game
* Tutorial

Tutorial:

* Auto-opens every time the game launches.
* Closing and reopening the browser shows Tutorial again.
* 3 pages: Basic Controls, Special Matches, Dragon Skills.
* Uses visual DOM/CSS illustrations and diagrams.
* Basic Controls shows click/tap, drag/swipe, and adjacent-swap examples.
* Special Matches shows Match 3, Match 4, Match 5, and L/T diagrams.
* Dragon Skills explains gameplay effects without revealing skill names.
* Blocks board input while open.
* Does not create gameplay-board demo objects.
* Mobile landscape layout support has been improved.

Tooltips:

* Desktop hover over info icon.
* 150ms hover delay.
* English descriptions.
* Hide immediately on pointer exit.
* Mobile/touch tap toggles tooltip visibility.
* Tapping another info icon switches tooltip content.
* Tapping outside hides the tooltip.
* Tooltip positioning avoids visible viewport edges.

Mobile/web support:

* Responsive scaling keeps the game inside the visible browser/Electron viewport.
* Local mobile testing via Live Server is supported.
* Mobile landscape play is supported.
* Mobile portrait shows a rotate-phone overlay.
* Drag/swipe input uses scaled pointer coordinates after responsive layout changes.
* Game remains playable in mobile browser tabs, although normal browser UI bars may remain visible.

---

## Audio

Audio manager:

* Centralized.
* Supports Music and SFX channels.
* Settings persist in localStorage.
* First-time defaults are Music 35% and SFX 25%.
* SFX settings apply to cut-in roars and skill SFX.
* Dragon roars and skill SFX use the reduced SFX default volume.
* Missing asset files fall back safely without crashing.

Dragon roar files:

```text
assets/audio/dragons/fire-roar.mp3
assets/audio/dragons/ice-roar.mp3
assets/audio/dragons/leaf-roar.mp3
assets/audio/dragons/earth-roar.mp3
```

Dragon skill SFX files:

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

* Replace the file with the same filename.
* Relaunch the game.
* No code change required.

---

## Restart / Safety

Hard restart is implemented.

Restart:

* Increments the run/session token.
* Stops old combo chains.
* Blocks stale async work from scoring or modifying the new board.
* Stops pending dragon skills.
* Stops cut-ins and temporary gameplay effects.
* Resets score, timer, combo, energy, buffs, Frozen Time, selected egg, and board.
* Rebuilds a fresh board.

Known fixed issues:

* Restart during combo no longer leaves old combo/effects running.
* Score no longer increases from old async chains after restart.
* Tutorial rendering no longer replaces the real gameplay board.
* Tutorial uses visual DOM/CSS diagrams while staying isolated from gameplay.
* Skill names are hidden from normal panels and Tutorial Page 3.
* Dragon info tooltips work on desktop hover and mobile tap.
* Responsive scaling and drag/swipe input were improved for web/mobile.
* Asset loading issues were resolved.
* Dragon skill queue stability improved.
* Combo/cascade tracking remains continuous across dragon skill activations.
* Game Over waits for an active final combo chain to finish before showing the final score.

---

## Known Future Improvements

Recommended future work:

* Additional balancing.
* More polished sound effects.
* Additional visual polish.
* Performance optimization if needed.
* More refined final art/audio assets.
* Release/build packaging.

---

## Important Development Rule

Read `PROJECT_CONTEXT.md` first, then `PROJECT_HANDOVER.md`.

Do not rewrite existing gameplay systems unless explicitly requested.

Avoid changing:

* Core match detection
* Gravity/refill
* Combo resolution architecture
* Dragon queue priority
* Dragon skill gameplay effects
* Score architecture

Prefer:

* Integrating with existing systems
* Keeping asset paths replaceable by filename
* Focused UI/audio/visual polish changes
* Small, testable edits
