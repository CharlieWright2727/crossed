# Crossed Basketball Crossword

Crossed is a lightweight, account-free daily basketball crossword game built with Vite, React, and TypeScript. It is inspired by compact daily games like Wordle and mini crosswords, without using NBA/team branding, logos, or player imagery.

## Run Locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
npm run audit
```

## Puzzle Content

Puzzle files live in two folders:

- `content/puzzles/public/YYYY-MM-DD.json`
- `content/puzzles/answers/YYYY-MM-DD.answers.json`

The public JSON contains the date, title, grid layout, clue positions, text prompts, and optional local image prompts. The answer JSON contains the solution grid and clue answers. The app loads both at build time with `import.meta.glob`, merges them, and validates every puzzle during typecheck/build/dev startup.

### Public Puzzle JSON

Use `.` for open cells and `#` for blocked cells.

```json
{
  "id": "2026-06-10",
  "date": "2026-06-10",
  "title": "Opening Tip",
  "size": { "rows": 3, "cols": 3 },
  "layout": [
    [".", ".", "."],
    [".", ".", "."],
    [".", ".", "."]
  ],
  "clues": {
    "across": [
      {
        "number": 1,
        "prompt": { "text": "League for the Finals and All-Star Weekend" },
        "row": 0,
        "col": 0
      }
    ],
    "down": []
  }
}
```

### Answer JSON

```json
{
  "id": "2026-06-10",
  "date": "2026-06-10",
  "cells": [
    ["N", "B", "A"],
    ["B", "O", "S"],
    ["A", "S", "T"]
  ],
  "clues": {
    "across": [{ "number": 1, "answer": "NBA" }],
    "down": []
  }
}
```

`displayAnswer` is optional and can be used for human-readable answer labels, for example `"displayAnswer": "Derrick White"` while the grid answer is `"DERRICKWHITE"`.

## Image Clues

Image clues must use local paths only, such as `/clue-images/player-placeholder.svg`. Do not use arbitrary remote URLs in puzzle JSON. Every image clue must include alt text.

```json
{
  "number": 1,
  "prompt": {
    "text": "Guard shown in the image prompt",
    "imageSrc": "/clue-images/player-placeholder.svg",
    "imageAlt": "Illustrated placeholder portrait for a basketball player image clue",
    "imageCredit": "Local placeholder artwork"
  },
  "row": 0,
  "col": 0
}
```

## Stats And Streaks

Stats are stored only in `localStorage` on the current browser/device. There is no account system, analytics, backend profile, or cross-device sync.

Tracked values include completed dates, current streak, max streak, total completed puzzles, and completion times. Completing the same puzzle again does not increment the streak again.

## Security Model

This repo is currently a static client app. The public and answer puzzle JSON files are split so authors have a clean workflow and answer files are not placed in `public/` as static assets.

Important limitation: because Vite bundles imported JSON into the client, static mode is still scrapeable. Users can inspect built JavaScript and recover answers. This is not a secure answer-hiding architecture.

To prevent Inspect Element answer scraping, deploy a server/API mode:

- Keep answer content in a private repo, private storage bucket, database, or environment-protected source.
- Serve only public puzzle metadata to the browser.
- Validate guesses or completed grids through a serverless/API endpoint.
- Never bundle raw answers into browser JavaScript.

Since this repository is public, truly hidden answers require a private content source, private repo, environment secret, or database.

## Disclaimer

Unofficial basketball trivia game. Not affiliated with the NBA, any league, or any team.
