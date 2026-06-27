# SKILL.md — gameportal

## Purpose
Claude Code skill untuk membangunkan game portal `fun.nexahost.top`.
Baca file ini sebelum membuat sebarang perubahan pada projek.

## Quick Reference

### Add New Game
1. Buat game component: `/components/games/<GameName>.tsx`
2. Letak assets: `/public/games/<slug>/`
3. Register dalam `lib/games.ts`:
```ts
{
  slug: 'snake',
  title: 'Snake',
  description: 'Classic snake game',
  thumbnail: '/games/snake/thumb.png',
  category: 'arcade',
  component: 'Snake'
}
```
4. Import dengan dynamic di game page

### Phaser Game Template
```tsx
'use client'
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function SnakeGame() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [GameScene],
    }
    gameRef.current = new Phaser.Game(config)
    return () => gameRef.current?.destroy(true)
  }, [])

  return <div id="phaser-game" className="w-full h-full" />
}
```

### Dynamic Import (required for all games)
```ts
import dynamic from 'next/dynamic'
const SnakeGame = dynamic(() => import('@/components/games/Snake'), { ssr: false })
```

### AdBanner Usage
```tsx
import AdBanner from '@/components/AdBanner'
<AdBanner slot="homepage-top" />
```

## Install Phaser
```bash
npm install phaser
```

## Server Info
- **Host**: LXC CT, IP `192.168.0.103`
- **App path**: `/opt/gameportal`
- **PM2 name**: `gameportal`
- **Port**: `3000`
- **Public URL**: `https://fun.nexahost.top`
- **Repo**: `https://github.com/nexa-apk/gameportal` (branch: `master`)

## Push Workflow
```bash
cd /opt/gameportal
git add -A && git commit -m "feat: description" && git push
```

## Restart App
```bash
pm2 restart gameportal
# or after major changes:
npm run build && pm2 restart gameportal
```

## Common Issues
- Game tak load → pastikan dynamic import dengan `ssr: false`
- Phaser canvas overflow → guna `Phaser.Scale.FIT` + `w-full h-full` pada container
- PM2 crash → `pm2 logs gameportal` untuk check error
