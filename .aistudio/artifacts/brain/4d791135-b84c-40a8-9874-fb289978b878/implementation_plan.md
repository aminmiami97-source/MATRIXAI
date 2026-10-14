# Implementation Plan: Matrix Cyberpunk Experience & Engagement Upgrade

Elevate **matrixAI** with a visually distinctive Matrix Cyberpunk dark aesthetic (cyan & violet neon accents), an interactive Persona Protocol switcher, curated cyber prompt starters to spark conversations, optional synthesized sound effects, and an update announcement in the notification center.

---

## 1. Visual Styling: Matrix Cyberpunk Aesthetic

- **Color Palette & Atmosphere**:
  - Base: Deep Obsidian Black (`#050811` and `#080C14`).
  - Primary Accent: Cyber Cyan (`#00E5FF`) with soft ambient bloom.
  - Secondary Accent: Electric Violet / Neon Purple (`#8B5CF6` / `#A855F7`).
  - Subtle animated Matrix cyber grid/scanline texture in the background (pure CSS/Tailwind, zero performance impact).
  - High-tech glowing border highlights on active containers, modals, and input fields.
- **Micro-Interactions**:
  - Neon glow hover states on conversation items, model badges, and action buttons.
  - Distinctive visual treatment distinguishing **Matrix Lite** (Cyber Cyan) from **Matrix Base** (Electric Violet).

---

## 2. New Engagement Feature: Persona Protocols & Prompt Arsenal

- **Interactive Persona Protocols**:
  - Add quick persona selector in the chat view:
    1. **System Architect**: Tailored for software engineering, system architecture, and code analysis.
    2. **Terminal Analyst**: Ultra-concise, rapid technical answers with zero fluff.
    3. **Creative Synthesizer**: Deep brainstorming, expansive conceptual reasoning, and writing.
    4. **Standard Operator**: Balanced, everyday intelligence.
  - Injects specialized system guidance directly into the session prompt for noticeably tailored, engaging responses.
- **Cyberpunk Prompt Starter Cards**:
  - Upgrade the Empty Chat screen with categorised, intriguing prompt starters that users can trigger with a single click.

---

## 3. Cyber Sound Effects (Web Audio API)

- Synthesized audio feedback (no heavy MP3s or network requests):
  - Subtle futuristic sound cue on message transmission.
  - Subtle chime on model response completion.
  - Clean sound toggle button (`Volume2` / `VolumeX`) in the top navigation bar with persistent user preference.

---

## 4. Notification Center & Version Bump (v3.8)

- Update `src/config/version.ts` to `v3.8`.
- Add a dedicated feature announcement in `NotificationsModal.tsx`:
  - **Title**: *Matrix Cyberpunk Overhaul & Persona Protocols*
  - **Description**: *Immersive cyan & violet visual redesign, specialized Persona Protocols, curated prompt starters, and synthesized cyber soundscapes.*

---

## Verification Plan

1. **Compilation & Linting**:
   - Run `lint_applet` and `compile_applet` to ensure error-free TypeScript build.
2. **Audio & Persona Testing**:
   - Verify Web Audio sound generator works cleanly across browsers without console warnings.
   - Verify persona selection modifies model prompt behavior and updates active badge.
3. **Responsive Visual Testing**:
   - Verify contrast and readability on mobile and desktop viewports.
   - Verify Notification Center displays the v3.8 release notes.
