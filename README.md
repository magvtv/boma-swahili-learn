# Jasmin Swahili Lab

A modern, mobile-first Swahili learning web application inspired by Kenyan and East African culinary culture.

## Features

- **Dashboard**: Overview of all learning modules, daily practice goal progress bar, and cultural notes.
- **English ↔ Kiswahili Translator** (`/translator`): Bidirectional translation powered by Azure AI Translator (via a Vercel `/api/translate` proxy), with MyMemory as a fallback when Azure is unavailable, plus swap controls, clipboard copy, sample phrases, and `localStorage` translation history caching.
- **Culinary Phrasebook** (`/phrasebook`): 24 curated kitchen tools, ingredients, cooking actions, and hospitality phrases with category filters, search, mastery tracking, and Web Speech API pronunciation.
- **Interactive Flashcards** (`/flashcards`): 3D flip cards with `Known` / `Still Learning` tracking persisted in `localStorage`, shuffle, and unknown-only review mode.
- **Quizzes** (`/quizzes`): Multiple-choice and typed-translation quizzes pulled from the culinary phrasebook, with instant feedback, answer review, and `localStorage` high scores.
- **Grammar** (`/grammar`): Four concise Swahili lessons covering noun classes (*Ngeli*), verb tenses (`-na-`, `-li-`, `-ta-`), polite requests, and describing food.
- **Community** (`/community`): Learner discussion board with `localStorage`-backed comments and a local visitor counter.
- **Global Search**: Header search bar that filters across both Phrasebook entries and Grammar lessons.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router v7**
- **Lucide React** icons

## Folder Structure

```text
src/
├── components/ui/       # Reusable Button, Card, Input, Modal, Badge, ProgressBar
├── data/                # Feature metadata, phrases.json, grammar lessons
├── features/            # Feature modules (translator, flashcards, quizzes, phrasebook, grammar, community)
├── hooks/               # Custom hooks (usePhraseProgress, useMediaQuery)
├── layouts/             # Responsive AppLayout (header, sidebar, mobile drawer, bottom nav)
├── pages/               # DashboardPage
└── utils/               # Classname and Web Speech API helpers
```

## Local Development

```bash
pnpm install
pnpm dev
```

Or with npm:

```bash
npm install
npm run dev
```

## Build & Lint

```bash
pnpm build
pnpm lint
```

## Deployment (Vercel)

`vercel.json` is pre-configured with an SPA rewrite that serves `index.html` for client routes while leaving `/api/*` serverless functions alone. Connect the repository to Vercel and use:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Set these environment variables in the Vercel project settings:

- `AZURE_TRANSLATOR_KEY` — Translator resource key
- `AZURE_TRANSLATOR_REGION` — optional; required only for regional resources (e.g. `eastus`). Leave unset for a Global resource.

For local translation against the serverless proxy, use `vercel dev` with a `.env` file based on `.env.example` (plain `vite` / `pnpm dev` does not serve `/api`).
