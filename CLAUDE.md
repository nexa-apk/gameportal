# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
NexaGames — a Miniclip-style browser game portal at **https://fun.nexahost.top**. Built with Next.js 16 (App Router), Tailwind CSS v4, and Phaser 4 for HTML5 games. Monetized via Google AdSense.

- **Host**: Proxmox LXC (Ubuntu 22.04), IP `192.168.0.103`
- **Tunnel**: Cloudflare Tunnel → `fun.nexahost.top`
- **Repo**: https://github.com/nexa-apk/gameportal (branch: `master`)
- **Process manager**: PM2, process name `gameportal`, runs `npm start` on port 3000

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — runs TypeScript check + static generation
npm run start    # production server
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

There are no tests. After any change, run `npm run build` to catch TypeScript and static generation errors before deploying.

**Deploy** (as root — root's PM2 owns port 3000):
```bash
npm run build
sudo pm2 restart gameportal
git add -A && git commit -m "feat: ..." && git push
```

> The `gamedev` user cannot bind port 3000 (owned by root's PM2 at `/root/.pm2`). Always use `sudo pm2` for deployment. The `gamedev` PM2 instance (`/home/gamedev/.pm2`) cannot start the app.

## Architecture

### Data flow
`lib/games.ts` is the single source of truth. It exports:
- `games: Game[]` — registry of all games with slug, title, description, thumbnail, category, component name, optional `featured`/`plays`/`rating`/`isNew`/`badge` fields
- `categories: Category[]`
- Helper functions: `getGame`, `getGamesByCategory`, `getFeaturedGames`, `formatPlays`

Pages are **statically generated** at build time using `generateStaticParams` (in `app/games/[slug]/page.tsx`). Adding a new game requires: registering it in `lib/games.ts`, creating `components/games/<Name>.tsx`, adding to `GameFrame.tsx`'s component map, and placing a thumbnail at `public/games/<slug>/thumb.svg`.

### Component map (GameFrame.tsx)
`GameFrame.tsx` maintains a **static map** of component name → dynamic import. This map must be updated manually whenever a new game component is added — Next.js cannot do dynamic string-based imports at build time.

```ts
const gameComponentMap: Record<string, React.ComponentType> = {
  Snake: dynamic(() => import('@/components/games/Snake'), { ssr: false }),
  // ... must list every game explicitly
}
```

### Game components pattern
All games in `components/games/` follow this pattern:
- `'use client'` directive
- `useEffect` to initialize Phaser (async import to avoid SSR)
- `useRef<HTMLDivElement>` as the Phaser mount target
- Cleanup via `gameRef.current?.destroy(true)` in the effect return
- `Phaser.Scale.FIT` + `Phaser.Scale.CENTER_BOTH` for responsive canvas
- Game logic written entirely inside `class GameScene extends Phaser.Scene` defined within the effect

Phaser is imported dynamically inside `useEffect` (`const Phaser = (await import('phaser')).default`) — never at the module level — to prevent SSR errors.

### Routing
- `/` — homepage (`app/page.tsx`): featured banner + category-filtered game grid
- `/games/[slug]` — game page (`app/games/[slug]/page.tsx`): breadcrumb + GameFrame + related games
- All routes are Server Components except `GameFrame.tsx`, `GameCard.tsx`, `GameGrid.tsx`, `AdBanner.tsx` (client components)

### Styling
Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css`). No `tailwind.config.js` — configuration is done via `@theme` blocks in CSS. Font variable `--font-geist` is set via `next/font/google` in `layout.tsx`.

### AdSense
`AdBanner.tsx` shows a dashed placeholder when `NEXT_PUBLIC_ADSENSE_ID` is unset or equals the default `ca-pub-XXXXXXXXXXXXXXXX`. Set real ID in `.env.local` to activate live ads. Never place ads inside the Phaser canvas.

## Coding Conventions
- **TypeScript strict** — no `any`. The `Phaser` namespace types come from `phaser`'s bundled types; use `import('phaser').Types.Core.GameConfig` for config types.
- **No inline styles** except where Tailwind cannot express a value (e.g., `paddingBottom: '56.25%'` for 16:9 ratio).
- **Server Components by default** — add `'use client'` only when using hooks, browser APIs, or Phaser.
- The `@/*` path alias maps to the project root (not `src/`).

## Known Issues / Gotchas
- `Phaser.Display.Color.Interpolate.ColorWithColor` changed its type signature in Phaser 4 — do not pass plain `{r,g,b,a}` objects; use `Phaser.Display.Color` instances or interpolate manually.
- Two stale files exist (`components/games/MemoryMatch.tsx`, `components/games/SpaceShooter.tsx`) and two stale asset directories (`public/games/memory-match/`, `public/games/space-shooter/`) from an earlier naming. They are not referenced by the registry and can be deleted.
- `next build` uses Turbopack. Incremental builds can leave stale route artifacts — if a newly added slug returns 404 in production, delete `.next/` and rebuild clean.
