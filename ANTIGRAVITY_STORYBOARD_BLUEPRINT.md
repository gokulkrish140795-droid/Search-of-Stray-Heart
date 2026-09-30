# Living Glass: The 29-Card Anniversary WebAR Odyssey
## Complete Architectural Blueprint & Antigravity Storyboard Specification

**Target Experience:** Cinematic Interactive WebAR Scavenger Hunt & Memory Scrapbook  
**Engine & Tech Stack:** React 19 + TypeScript + Vite, MindAR / 8th Wall Image Tracking, WebGL Shaders, Web Audio Engine, Tailwind CSS, Lucide Icons.

---

## 1. High-Level Concept & Design Narrative

```
+-----------------------------------------------------------------------------------+
|                              LIVING GLASS EXPERIENCE                               |
|                                                                                   |
|  [ Prologue ]  --->  [ Act I: Memories ]  --->  [ Act II: Milestones ]  --->     |
|   (Riddle Intro)      (Cards 01-10: 10 Tokens)   (Cards 11-20: 10 Tokens)         |
|                             |                               |                     |
|                             v                               v                     |
|                       [ Act III: Future ]   --->  [ Epilogue: Secret Vault ]      |
|                        (Cards 21-29: 9 Tokens)     (Final Anagram & Proposal)     |
+-----------------------------------------------------------------------------------+
```

### The Core Loop
1. **The Riddle Clue (Search Phase):**
   - The user is presented with a poetic clue hinting at a real-world location (e.g. *"Taped under the computer table"* or *"Inside the kitchen cutlery drawer"*).
   - The user searches the physical environment to find the corresponding physical photograph card.
2. **The Living Glass Lens (WebAR Recognition):**
   - The user points the mobile camera at the card.
   - The Computer Vision Engine (8th Wall / MindAR with trained `.mind` / JSON feature descriptors) scans the photograph planar surface.
   - Once recognized, the physical photo comes alive with particle shimmers, chime sound effects, and floating rune tokens.
3. **The Reveal & Scrapbook (Reward Phase):**
   - The card flips open to reveal an emotional memory snippet, date, and collectible letter tokens.
   - The tokens automatically slot into the player's secret cipher vault.
   - Audio feedback plays custom sound bites and voice lines.
4. **The Final Vault (Epilogue):**
   - All 29 cards assembled provide the letters needed to decipher the grand love letter / final anniversary surprise.

---

## 2. System Architecture & Component Hierarchy

```
                          [ App.tsx ]
                               |
       +-----------------------+-----------------------+
       |                                               |
 [ State Management ]                          [ Audio Engine ]
 - Active Step / Card                         - Web Audio API Sfx
 - Collected Letters & Progress               - Ambient Music Looper
 - Sound Mute / Rehearsal Mode                - Voice Clip Trigger
       |
       +-----------------------------------------------+
       |                                               |
       v                                               v
[ Step Switcher Router ]                      [ Global Modals ]
├── WelcomeHeroStep.tsx                        ├── RehearsalModal.tsx (All 29 Cards)
├── PrologueStep.tsx                           ├── ScrapbookModal.tsx (Collected Grid)
├── ScreenHuntStep.tsx (Core AR Viewfinder)    └── FinalVaultModal.tsx (Secret Letters)
│   ├── MindAR Controller Hook
│   ├── 8th Wall Pipeline Module
│   ├── Viewfinder Reticle & HUD
│   ├── Slide-Out Riddle Drawer
│   └── Celebration Overlay
└── EpilogueStep.tsx (Grand Proposal)
```

---

## 3. Data Pipeline & Schema Specification

### 3.1 Card Schema (`huntData.ts`)
```typescript
interface HuntCard {
  id: string;              // "01" to "29"
  chapter: 1 | 2 | 3;      // Act I, Act II, Act III
  step: number;            // 1 to 29
  letters: string;         // e.g. "M - I - X"
  location: string;        // Physical hiding spot hint
  bypass: string[];        // Fallback passcodes (e.g. ["mix", "coffee table"])
  quote: string;           // Romantic sentiment
  miniMe: string;          // Assistant speech bubble dialog
  riddle: string[];        // 4-line poetic rhyming clue
}
```

### 3.2 Target Dataset Structure (`public/ar/`)
```
public/ar/
├── eighthwall/
│   ├── image-targets/
│   │   ├── card-01.json (Planar descriptor + metadata)
│   │   ├── card-01_luminance.jpg
│   │   ├── card-01_cropped.jpg
│   │   └── card-02.json ... (up to card-29.json)
│   ├── assets/ (Full-resolution card art card-01.jpg - card-29.jpg)
│   └── external/ (8th Wall XR WebGL Engine & SLAM runtimes)
└── targets/
    ├── photo-crop.mind (Precompiled MindAR binary features)
    └── card_01_photo.png (Exact reference crop)
```

---

## 4. WebAR Tracking State Machine

```
               [ CAMERA OFF / STANDBY ]
                          |
             (User taps "Activate Lens")
                          |
                          v
               [ INITIALIZING ENGINE ]
     - Requests getUserMedia({ facingMode: 'environment' })
     - Loads 8th Wall / MindAR WebGL Pipeline
                          |
          +---------------+---------------+
          |                               |
          v                               v
   [ 8th Wall Active ]            [ MindAR Active ]
   Listens to postMessage         Processes video canvas
   from XR iframe/pipeline        via WebGL Controller
          |                               |
          +---------------+---------------+
                          |
                          v
                  [ SCANNING SCENE ]
           Reticle pulse: 1.2s sine wave
           User moves phone over card
                          |
                          +-------------------------------+
                          |                               |
                          v                               v
             [ TARGET MATCHED (Card X) ]     [ WRONG/FUTURE TARGET ]
              - Triggers 'sfx_revelio'        - Triggers 'sfx_wings'
              - Plays 'voice_tap_yay'         - Toast: "Card Y spotted!
              - Fires particle burst                   Active is Card X"
              - Unlocks letter tokens
                          |
                          v
             [ CELEBRATION & CARD REVEAL ]
              - Shows memory card popup
              - Auto-advances to Card X+1
```

---

## 5. Storyboard Sequence for Antigravity (Scene-by-Scene)

### **SCENE 1: The Golden Gate (Welcome Hero)**
- **Visuals:** Deep midnight obsidian background (`#060B14`) with starlight particle field. Gold parchment trim (`#E8C56A`).
- **Elements:**
  - Golden compass header with subtle 3D hover tilt.
  - "Living Glass" title in Baskerville/Playfair serif with glowing gold gradient text.
  - Mini-Me avatar giving a welcoming smile.
  - Call to Action: *“Accept Quest & Open the Lens”*.
- **Audio:** Gentle mystic harp chime (`sfx_harp_gliss`).

---

### **SCENE 2: The Oath & Prologue**
- **Visuals:** Old-world parchment card with wax seal.
- **Narrative:** Explains that 29 enchanted memory cards are scattered across the room.
- **Interactive Action:** Tapping *"Begin Chapter 1"* starts the first clue.

---

### **SCENE 3: The Viewfinder (Core ScreenHunt)**
- **Visuals:** Full-bleed camera feed with a glowing art-deco targeting reticle in the center.
  - **Top HUD:** Shows *"Card 01/29 • Act I: The Spark"*, Sound Toggle button, and Rehearsal mode icon.
  - **Slide-Out Riddle Drawer:** Accessible at any moment via the *"Clue"* button. Reveals the 4-line rhyme without showing the spoiler image.
  - **Bottom HUD:** Shows mini-me encouragement quote, tokens collected so far, and an *"Enter Code"* button for quick manual entry.
- **Interactive Trigger:**
  - Physical Card #01 is placed in view.
  - The reticle snaps to green/gold.
  - Golden burst animation flashes on screen.

---

### **SCENE 4: Card Unlock Celebration**
- **Visuals:** The physical card transforms on screen into a floating 3D Polaroid with rounded gold borders.
- **Content:**
  - Date & location of the memory.
  - Extracted letter tokens (e.g. `[M] [I] [X]`) floating into the vault bar.
  - Button: *"Next Clue ➔"*.
- **Audio:** Bell chime + celebration voice bite (*"Yay!"*).

---

### **SCENE 5: The Grand Epilogue (Secret Vault Decipher)**
- **Visuals:** The 29 collected letter tokens align in a circular constellation.
- **Mechanic:** The user rearranges or submits the assembled letters to crack the final romantic cipher.
- **Finale:** Unlocks the final video message, love letter, and celebration fireworks.

---

## 6. Antigravity Prompt Template for Node/Scene Generation

When generating or styling these scenes in Antigravity or any visual storyboard engine, use this unified prompt pattern:

```text
Style: Cinematic Luxury Dark Gold & Obsidian UI, Harry Potter Marauder's Map meets Apple VisionOS.
Palette: Deep Obsidian (#060B14), Mystic Slate (#0B1220), Ancient Gold (#E8C56A), Radiant Champagne (#FFE7A8), Starfire Cyan (#7EF0FF).
Typography: Playfair Display / Baskerville for headers, JetBrains Mono for token ciphers, Inter for HUD.
Key Elements: Holographic camera viewfinder reticle, floating Polaroid memories, glowing rune letter chips, parchment drawers, particle sparks.
Camera/Framing: Mobile viewport (9:16 portrait aspect ratio), sleek tactile bottom controls, zero-distraction camera view.
```

---

## 7. Key Architecture Safeguards Implemented
1. **Dtype/Tensor Safety:** Protected against WebGL canvas memory desync so camera tracking never crashes even on low-memory mobile browsers.
2. **Dual-Engine Redundancy:** 8th Wall local descriptor matching operates as primary; MindAR acts as secondary; manual passcode bypass acts as ultimate zero-failure guarantee.
3. **No-Spoiler Policy:** Clue screens never reveal the target photo before the user finds it in the real world.
