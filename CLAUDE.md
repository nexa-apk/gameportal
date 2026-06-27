# CLAUDE.md — gameportal

## Project Overview
Game portal web app with HTML5 games, built with Next.js. Monetized via Google AdSense.
Public URL: https://fun.nexahost.top

## Stack
- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Games**: Phaser.js (HTML5 game framework)
- **Process Manager**: PM2
- **Hosting**: Proxmox LXC (Ubuntu 22.04), IP 192.168.0.103
- **Tunnel**: Cloudflare Tunnel (proxmox-tunnel) → fun.nexahost.top
- **Repo**: https://github.com/nexa-apk/gameportal (branch: master)

## Directory Structure
```
/opt/gameportal/
├── app/
│   ├── page.tsx          # Homepage — game listing
│   ├── games/
│   │   └── [slug]/
│   │       └── page.tsx  # Individual game page
│   ├── layout.tsx
│   └── globals.css
├── public/
│   └── games/            # Static game assets (Phaser scenes, sprites, audio)
├── components/
│   ├── GameCard.tsx
│   ├── GameFrame.tsx
│   └── AdBanner.tsx
├── lib/
│   └── games.ts          # Game metadata/registry
├── CLAUDE.md
├── AGENTS.md
└── SKILL.md
```

## Game Registry
Games are defined in `lib/games.ts` as a typed array:
```ts
export type Game = {
  slug: string
  title: string
  description: string
  thumbnail: string
  category: string
  component: string  // Phaser scene file path
}
```

## Deploy Workflow
```bash
cd /opt/gameportal
npm run build
pm2 restart gameportal
git add -A && git commit -m "msg" && git push
```

## PM2
- Process name: `gameportal`
- Runs: `npm start` (Next.js production)
- Auto-restart: enabled via `pm2 startup`

## Coding Conventions
- Use TypeScript strictly — no `any`
- Tailwind only for styling, no inline styles
- App Router only — no `pages/` directory
- Server Components by default, Client Components only when needed (`'use client'`)
- Game components must be dynamically imported (SSR disabled):
  ```ts
  const GameComponent = dynamic(() => import('@/components/games/Snake'), { ssr: false })
  ```

## AdSense
- Placeholder component: `components/AdBanner.tsx`
- Insert ads in: homepage (between game cards), game page (below game frame)
- Do not place ads inside game canvas

## Environment Variables
```
# .env.local
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```
