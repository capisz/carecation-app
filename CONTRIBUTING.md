# Contributing to Carecation

Thanks for contributing. This guide keeps changes easy to review and safe to ship.

## 1. Local setup

### Prerequisites

- Node.js 20+ recommended
- pnpm 10+

### Install and run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

### Required environment variables

Set these in `.env.local`:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`

Do not commit secrets or `.env.local`.

## 2. Before you open a PR

Run:

```bash
pnpm lint
pnpm build
```

If your change affects UI, include screenshots in your PR.

## 3. Branching workflow

- Branch from `main`.
- Use short, descriptive branch names:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`

Examples:

- `feat/hotel-filters`
- `fix/itinerary-currency-rounding`

## 4. Pull request steps

1. Push your branch to GitHub.
2. Open a PR into `main`.
3. Fill out the PR template completely.
4. Link related issue(s) using `Fixes #<issue-number>`.
5. Wait for CI to pass.
6. Request review from code owners.

## 5. Code style expectations

- Keep PRs focused (one concern per PR when possible).
- Prefer clear naming and small, readable functions.
- Update docs when behavior or setup changes.

