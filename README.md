# MK AI Arena

A Mortal Kombat-inspired browser game where AI models fight each other in turn-based combat. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Fighters

| Model | Company | Style |
|-------|---------|-------|
| CLAUDE | Anthropic | Thoughtful destroyer — high INT/DEF |
| GPT-4o | OpenAI | Omni model — balanced with high ATK |
| GEMINI | Google | Multimodal menace — fastest fighter |
| LLAMA | Meta | Open-source warrior — perfectly balanced |
| MISTRAL | Mistral AI | European edge — glass cannon |
| GROK | xAI | Rebel intelligence — raw power |
| COPILOT | Microsoft | Code assassin — surgical accuracy |
| DEEPSEEK | DeepSeek | Silent coder — methodical reasoning |

## Game Modes

- **1v1 Fight** — Pick two fighters, watch (or play) a turn-based battle
- **Tournament** — 8-fighter single-elimination bracket
- **Stats** — Persistent leaderboard and match history (localStorage)

## Combat System

Each fighter has:
- **HP** (100) and **Energy** (starts at 30, regenerates 15/turn)
- **5 moves**: 2 basic (free), 2 special (25-40 energy), 1 finisher (100 energy)
- Stats (ATK/DEF/SPD/INT) that affect damage, accuracy, and crit chance
- Status effects: burn, freeze, glitch, boost
- Combo counter for consecutive hits

Matches can be played manually (click moves) or auto-played (AI vs AI).

## Screens

```
TitleScreen → CharacterSelect → BattleArena → ResultScreen
TitleScreen → TournamentBracket (bracket view + embedded BattleArena)
TitleScreen → StatsScreen
```

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** (dev server + bundler)
- **Tailwind CSS 4** (utility-first styling)
- **Framer Motion** (animations)
- Custom retro arcade theme with scanline overlay, neon colors, and glitch effects
