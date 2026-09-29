# Architectural Blueprint: Project AR — The Search for a Stray Heart
*A Private Living Glass AR Scavenger Hunt & Reliquary for Aishwarya’s 30th Birthday*

---

## 1. High-Level Concept & Design Philosophy

The application is structured as a **hybrid reality experience**:
- **Physical Realm:** 27 clue cards + 3 household vaults hidden across the home, leading up to a surprise gift.
- **Digital Realm (The "Living Glass"):** An enchanted mobile interface serving as the looking glass (camera AR, audio narration, caption rail, and anagram vault locks).
- **Emotional Arc:** A lighthearted prank gateway evolves into an intimate romantic quest, culminating in a phone-dimming *"Look up, Gokul is the gift"* finale.

```
[Gateway] ──► [Prank Screen] ──► [Act I: Hunt 01-09] ──► [Vault 1: Anagram]
                                         │
                                         ▼
                                 [Act II: Hunt 11-19] ──► [Vault 2: Anagram]
                                         │
                                         ▼
                                [Act III: Hunt 21-29] ──► [Vault 3: Anagram]
                                         │
                                         ▼
                                 [Finale: Protocol 0510]
                                         │
                                         ▼
                        [Living Glass Memory Scrapbook & Journal]
```

---

## 2. System Architecture & Component Hierarchy

The application runs as a **single-page mobile web application (React + Vite + Tailwind CSS + Lucide Icons)** with audio engine support and an AR camera feed.

```
App.tsx (Root Orchestrator & State Container)
 │
 ├── DeviceFrame (Universal immersive wrapper: status bar, mute, Scrapbook counter)
 │    │
 │    ├── ScreenGateway (Prologue & Quest Acceptance)
 │    │
 │    ├── ScreenPrank (Humorous distraction screen before the real hunt)
 │    │
 │    ├── ScreenHuntStep (Camera Viewfinder + AR Engine + Manual Code Fallback)
 │    │    ├── Viewfinder / Camera Stream
 │    │    ├── Live Clue Bottom Sheet (Physical location hints & riddles)
 │    │    ├── Manual Passcode Fallback Dialog (If camera/lighting fails)
 │    │    ├── Found Celebration Modal (Letter tokens & Gokul's note)
 │    │    └── Dynamic Token Strip (Shows only letters discovered so far)
 │    │
 │    ├── ScreenVault (Milestone Anagram Decryption Rack)
 │    │    ├── Target Password Slot (Scrabble tile layout)
 │    │    ├── Available Tile Rack (Interactive tap/keyboard support)
 │    │    ├── Decoy Tile Warning & Filtering System
 │    │    └── Whisper Hint Drawer (Mini-Me voice assistance)
 │    │
 │    ├── ScreenFinale (Grand Conclusion: Protocol 0510)
 │    │    ├── 4-Digit Birthday PIN Input (0-5-1-0)
 │    │    └── Soft-off Transition: "Look up... Gokul is the gift"
 │    │
 │    └── CaptionRail (Mini-Me reactive commentary across all states)
 │
 ├── ScrapbookModal (Universal Reliquary Drawer)
 │    ├── Act Filters: All (29), Act I, Act II, Act III
 │    ├── Progress Bar (0% to 100%)
 │    └── Polaroid Memory Cards (Handwriting script, quotes, hidden locations)
 │
 └── RehearsalModal (Hidden Developer/Partner Master Control)
      ├── Instant Step Jump (0 to 31)
      ├── Card Preview & Master Override Codes
      └── State Reset Tools
```

---

## 3. Data & State Invariants

### A. Step Routing Matrix
| Step Number | Type | Target | Password / Code | Reward / Note |
|---|---|---|---|---|
| **0** | Gateway | Introduction | — | Accepts Quest |
| **1 – 9** | Hunt | Cards 01 to 09 (Act I) | Specific 4-digit card codes | Collects 21 Act I letter tokens |
| **10** | Vault | Milestone Vault 1 | `MICROWAVE CUPBOARD` | Gift in Kitchen Upper Shelf |
| **11 – 19** | Hunt | Cards 11 to 19 (Act II) | Specific 4-digit card codes | Collects 21 Act II letter tokens + Decoys |
| **20** | Vault | Milestone Vault 2 | `BALCONY CHAIR POUF` | Gift under Balcony Ottoman |
| **21 – 29** | Hunt | Cards 21 to 29 (Act III) | Specific 4-digit card codes | Collects 21 Act III letter tokens + Decoys |
| **30** | Vault | Milestone Vault 3 | `BEDROOM SHOE RACK` | Gift in Master Bedroom |
| **31** | Finale | Grand Conclusion | `0510` (Oct 5th Birthday) | Screen Dims, Physical Reveal |

### B. Progression & Token Invariant
- **Rule:** `foundCardIds` strictly includes cards where `card.step < currentStep`.
- **Safety Guarantee:** Future cards or cards in the current step cannot prematurely inject letters into the token strip.
- **Scope Isolation:** Tokens displayed on the viewfinder strip belong only to the **active chapter**. Once a chapter completes, tokens cleanly roll into the chapter's vault rack.

---

## 4. Subsystems & Engines

### A. AR Engine (`/src/utils/arEngine.ts`)
1. **Camera Stream Access:** Requests `facingMode: 'environment'` with fallback to user-facing camera.
2. **Target Recognition:** MindAR / marker image matching against compiled `.mind` target files in `/public/ar/targets/`.
3. **Graceful Fallback:** If camera access is denied, lighting is dim, or image detection lags, the user can click **`[Code]`** to enter the physical card’s stamped 4-digit passcode, never blocking progress.

### B. Audio Engine (`/src/utils/sound.ts`)
- **Background Music (BGM):**
  - Intro: `bgm_intro` (Ethereal wonder)
  - Act I: `bgm_act1` (Cozy, warm acoustic)
  - Act II: `bgm_act2` (Nocturnal mystery / playful investigation)
  - Act III: `bgm_act3` (Uplifting adventure / celebratory crescendo)
- **Sound Effects (SFX):**
  - `sfx_wand_swish`: Action / UI transition
  - `sfx_revelio_bell`: Card discovered / revelation
  - `sfx_tile_clack`: Tile placed or removed in anagram rack
  - `sfx_vault_alohomora`: Vault successfully unlocked
- **Mini-Me Vocal Reactions:**
  - `voice_tap_yay`: Correct entry / victory
  - `voice_no_nice_try`: Incorrect code / gentle guidance
  - `voice_idle_hmm`: Hint inquiry / clue thinking

### C. Persistent Storage (`localStorage`)
- `project_ar_step`: Persists current step (1 to 31) across page refreshes.
- `project_ar_state`: Current screen state (`gateway` | `prank` | `hunt` | `vault` | `finale`).
- `project_ar_found_cards`: JSON array of unlocked card IDs for scrapbook review.
- `project_ar_audio_muted`: User's mute preference.

---

## 5. Directory & Asset Layout

```
├── public/
│   ├── ar/
│   │   ├── targets/          # Compiled .mind marker files for physical cards
│   │   └── vendor/           # MindAR / Three.js vendor dependencies
│   ├── audio/                # High-fidelity BGM, SFX, and Mini-Me vocal clips
│   └── avatar.png            # Mini-Me 3D companion avatar
├── src/
│   ├── components/
│   │   ├── CaptionRail.tsx    # Bottom dialog strip for companion commentary
│   │   ├── DeviceFrame.tsx   # Glassmorphic phone container & status bar
│   │   ├── ErrorBoundary.tsx # Production error protection
│   │   ├── RehearsalModal.tsx# Host rehearsal / rapid testing panel
│   │   ├── ScrapbookModal.tsx# Unlocked memory reliquary & Polaroid journal
│   │   ├── ScreenFinale.tsx  # Protocol 0510 grand finale screen
│   │   ├── ScreenGateway.tsx # Entry portal
│   │   ├── ScreenHuntStep.tsx# Viewfinder, clue sheet, and token collector
│   │   ├── ScreenPrank.tsx   # Playful misdirection screen
│   │   └── ScreenVault.tsx   # Interactive Scrabble anagram solver
│   ├── data/
│   │   └── huntData.ts       # Single source of truth (29 cards, 3 vaults, clues)
│   ├── utils/
│   │   ├── arEngine.ts       # WebRTC video feed & AR target listener
│   │   └── sound.ts          # Web Audio API singleton sound manager
│   ├── App.tsx               # Primary state machine & navigation controller
│   ├── index.css             # Tailwind CSS & custom handwriting typography
│   └── main.tsx              # React mounting root
├── ARCHITECTURE.md           # Master System Blueprint for safe keeping
├── index.html                # PWA meta tags & viewport scaling constraints
├── metadata.json             # Applet capabilities & platform configuration
└── vite.config.ts            # Bundler settings
```

---

## 6. How to Safely Reopen & Resume in the Future

- **Clean Compilation:** The project has zero compilation warnings and strict TypeScript typing (`npm run lint` / `tsc --noEmit`).
- **Data Customization:** To update or add new riddles, physical hiding spots, or love notes, edit only `src/data/huntData.ts`. The rest of the app dynamically reflects changes across the HUD, Vaults, and Scrapbook.
- **Testing Shortcut:** Long-press the compass icon at the top of any screen (or use the Rehearsal modal) to jump directly to any card, vault, or the finale without running through the entire hunt.
