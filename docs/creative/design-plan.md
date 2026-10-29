# Poocho — design plan

## The idea

Every Indian classroom has the same anonymous Q&A system: a chit (पर्ची). You tear a strip from a ruled notebook, write a question, fold it, and pass it along. Nobody knows who wrote it, and the person who opens it decides what to do with it.

Poocho is that chit, rebuilt for Instagram stories. The concept drives every visual and motion decision:

| Product truth (from the PRD) | How the design expresses it |
| --- | --- |
| Questions are anonymous | Questions are written on ruled notebook chits in a handwriting face, so they read as "someone wrote this", without a name |
| Every question is real (no bots) | Asking is a physical act: the chit folds and is passed to a tray. Nothing appears in an inbox unless a person folded it |
| AI filters cruel questions first | Rude chits get a rubber stamp and drop into a separate Filtered tray, and the hero demo lets visitors try it |
| Answers become story cards | Cards reuse the same paper vocabulary: notebook, ballpoint ink, haldi highlighter, margin red, chalkboard |
| India-first, Hindi + English | Type families from Indian foundries with full Devanagari support, and a Hindi toggle on the first screen |

## Tokens

### Colour

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#2940D9` | Ballpoint-pen blue. Brand field, primary actions on paper |
| `navy` | `#13195A` | Ink at full saturation. Body text, outlines, hard shadows |
| `paper` | `#F5F7FD` | Cool notebook white (deliberately not cream) |
| `rule` | `#C3CEF3` | Notebook lines |
| `margin` | `#E8445F` | The red margin line. Filtered states and stamps |
| `haldi` | `#FFD43B` | Highlighter yellow. Focus rings, active tabs, primary action on blue |
| `leaf` | `#0E8A5C` | Delivered and safe states |
| `chalk` | `#23423A` | Blackboard, used only by the Chalkboard story card |

### Type

- **Anek Devanagari** (Ek Type, OFL, variable weight 100–800 and width 75–125). Handles the UI, the headlines and Hindi. The width axis is part of the design: headlines pair a wide line with a condensed one instead of colouring a single word.
- **Kalam** (Indian Type Foundry, OFL, Latin + Devanagari). Used only for handwriting: anything an asker writes, plus the pledge signature.
- Both are self-hosted via Fontsource, as the PRD asks.
- Scale (px): 14 · 17 (body) · 21 · 28 · 36 · 48 · 72 · 96. Body line-height is 1.55, line length stays under 70ch.

### Shape and depth

- Paper elements (chits, cards) have a 3–4px radius, a torn top edge and a soft layered paper shadow.
- Interactive elements (buttons, toggles) are pill-shaped stickers with a 2px navy outline and a hard 4px offset shadow that collapses when pressed.
- Panels have a 20px radius. Each tier of the hierarchy has its own radius rather than one radius everywhere.

## Layout

The hero is split on desktop and stacks on mobile, with left-aligned type.

```
desktop                                          mobile
┌──────────────────────────────────────────┐    ┌──────────────────┐
│ logo            EN/हिं  sample  [link]   │    │ logo  हिं  [link]│
│                         ◇                │    │ Get asked        │
│ Get asked anything.   ┌──── chit ────┐ ◇ │    │ anything.        │
│ Only by real people.  │ Ask me…      │   │    │ Only by real…    │
│                       │ ___________  │   │    │ body             │
│ body                  │ ___________  │   │    │ [link] sample    │
│ [Get your link]  ◇    └──────[Send]──┘   │    │ ┌── chit ──────┐ │
│ trust chips           [Inbox] [Filtered] │    │ └──────────────┘ │
└──────────────────────────────────────────┘    │ [Inbox][Filtered]│
                                                └──────────────────┘
```

The page then runs: How it works (a real four-step sequence, so numbered) → story card fan → the pledge on a notebook page (on the blue field) → claim your link → footer.

## Motion

All motion follows paper physics: toss, fold, pass, stamp, unfold. The client asked for creative animation, so motion carries the concept, and every effect maps to an action in the real product.

1. **Page load (once):** example chits are tossed onto the blue desk with spring physics. They are decorative and can be dragged.
2. **Send (signature):** the chit folds in half twice, then flies on an arc to the Inbox tray. A rude question is stamped first and lands in Filtered.
3. **Pledge (in view, once):** ticks are drawn beside each promise, then the signature writes itself.
4. **Inbox:** new questions drop in from another tab live, and opening one unfolds it into the answer composer (a shared-layout transition).
5. **Tabs:** a highlighter stroke slides to the active tab.

Under `prefers-reduced-motion`, folds and flights become short crossfades and nothing is tossed. Every state still changes visibly.

## Avoided defaults

- No cream + terracotta, no black + acid accent. The palette comes from a school notebook and a ballpoint pen.
- No all-caps eyebrows, no "→" on buttons, no single-word colour accent in headlines.
- No fade-up-on-scroll for every section. The one scroll-linked effect (the How it works path) uses CSS scroll timelines and degrades to a static line.
- Numbered markers appear only where the content really is a sequence (How it works, onboarding steps).
