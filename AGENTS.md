# AGENTS.md — gameportal

## Agent Roles

### 1. portal-dev
**Scope**: Next.js UI, pages, routing, layout, AdSense integration
**Responsibilities**:
- Homepage game grid/listing
- Individual game pages (`/games/[slug]`)
- Navigation, header, footer
- `GameCard.tsx`, `AdBanner.tsx` components
- Tailwind styling & dark mode
- SEO metadata (`generateMetadata`)
- Google AdSense placement

**Do not**:
- Touch Phaser.js game logic
- Modify API routes or lib files
- Run `npm run build` — leave to ops

---

### 2. game-dev
**Scope**: Phaser.js HTML5 games
**Responsibilities**:
- Build individual games in `/public/games/` or `/components/games/`
- Each game is a self-contained Phaser scene
- Register new game in `lib/games.ts`
- Game assets (sprites, audio) go in `/public/games/<slug>/`
- Ensure games work on mobile (responsive canvas)

**Conventions**:
- Each game exports a default React component wrapping Phaser
- Must use `dynamic import` with `ssr: false`
- Game canvas must be responsive — use `scale: { mode: Phaser.Scale.FIT }`

**Do not**:
- Modify portal UI or layout
- Add npm packages without checking with coding-agent

---

### 3. coding-agent
**Scope**: TypeScript logic, data structures, API routes, utilities
**Responsibilities**:
- `lib/games.ts` — game registry & types
- API routes if needed (`app/api/`)
- Shared utility functions (`lib/utils.ts`)
- Type definitions
- Performance optimizations

**Do not**:
- Modify UI components directly
- Touch Phaser game scenes

---

### 4. ops
**Scope**: Deployment, server, PM2, Git
**Responsibilities**:
- Build & deploy to LXC (`192.168.0.103`)
- PM2 process management
- Git commits & push to `nexa-apk/gameportal`
- Monitor server health

**Deploy command**:
```bash
cd /opt/gameportal
npm run build
pm2 restart gameportal
git add -A && git commit -m "msg" && git push
```

**Do not**:
- Modify source code
- Change Cloudflare tunnel config without noting it

---

## Workflow
```
game-dev / portal-dev / coding-agent
         ↓ (code changes)
        ops
         ↓ (build + deploy)
  fun.nexahost.top
```
