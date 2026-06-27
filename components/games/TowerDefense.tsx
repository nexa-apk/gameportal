'use client'
import { useEffect, useRef } from 'react'

const W = 480, H = 480
const CELL = 40, COLS = 12, ROWS = 12
const PATH: [number, number][] = [[0,5],[1,5],[2,5],[3,5],[3,4],[3,3],[4,3],[5,3],[6,3],[6,4],[6,5],[6,6],[6,7],[7,7],[8,7],[9,7],[9,6],[9,5],[10,5],[11,5]]

type Tower = { col: number; row: number; level: number; cooldown: number; range: number; damage: number }
type Enemy = { x: number; y: number; pathIdx: number; hp: number; maxHp: number; speed: number; reward: number; id: number }
type Bullet = { x: number; y: number; tx: number; ty: number; speed: number; damage: number; color: number }

const PATH_SET = new Set(PATH.map(([c, r]) => `${c},${r}`))

export default function TowerDefense() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      let enemyId = 0

      class GameScene extends Phaser.Scene {
        private towers: Tower[] = []
        private enemies: Enemy[] = []
        private bullets: Bullet[] = []
        private gold = 100; private lives = 20; private wave = 0
        private score = 0; private running = false
        private spawnTimer = 0; private spawnLeft = 0
        private waveTimer = 3000
        private selectedCol = -1; private selectedRow = -1
        private gfx!: Phaser.GameObjects.Graphics
        private ui!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#1a2e1a')
          this.gfx = this.add.graphics()
          this.ui = this.add.text(4, 4, '', { fontSize: '12px', color: '#fff', fontFamily: 'monospace' }).setDepth(3)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('TOWER DEFENSE', 'Click empty tile to place tower\nCost: 50 gold each\nDon\'t let enemies reach the end!')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const c = Math.floor(p.x / CELL), r = Math.floor(p.y / CELL)
            if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return
            if (PATH_SET.has(`${c},${r}`)) return
            if (this.towers.find(t => t.col === c && t.row === r)) return
            if (this.gold >= 50) {
              this.towers.push({ col: c, row: r, level: 1, cooldown: 0, range: CELL * 2.5, damage: 10 })
              this.gold -= 50
            }
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 320, 220, 0x0d1f0d, 0.95).setStrokeStyle(2, 0x44ff44)
          const t = this.add.text(0, -80, title, { fontSize: '22px', color: '#44ff44', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -30, sub, { fontSize: '11px', color: '#aaa', fontFamily: 'monospace', align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 20, `Score: ${this.score}  Wave: ${this.wave}`, { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 75, '[ DEFEND! ]', { fontSize: '18px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#44ff44', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.towers = []; this.enemies = []; this.bullets = []
          this.gold = 100; this.lives = 20; this.wave = 0; this.score = 0
          this.spawnLeft = 0; this.waveTimer = 3000
          this.running = true; this.overlay.setVisible(false)
        }

        startWave() {
          this.wave++
          this.spawnLeft = 5 + this.wave * 2
          this.spawnTimer = 0
        }

        spawnEnemy() {
          const hp = 30 + this.wave * 15
          const [sc, sr] = PATH[0]
          this.enemies.push({ x: sc * CELL + CELL / 2, y: sr * CELL + CELL / 2, pathIdx: 0, hp, maxHp: hp, speed: 60 + this.wave * 5, reward: 10 + this.wave * 2, id: enemyId++ })
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000

          // Wave logic
          if (this.spawnLeft === 0 && this.enemies.length === 0) {
            this.waveTimer -= delta
            if (this.waveTimer <= 0) { this.startWave(); this.waveTimer = 5000 }
          }
          if (this.spawnLeft > 0) {
            this.spawnTimer -= delta
            if (this.spawnTimer <= 0) { this.spawnEnemy(); this.spawnLeft--; this.spawnTimer = 800 }
          }

          // Move enemies
          for (const e of this.enemies) {
            if (e.pathIdx >= PATH.length - 1) { this.lives--; e.hp = 0; continue }
            const [tc, tr] = PATH[e.pathIdx + 1]
            const tx = tc * CELL + CELL / 2, ty = tr * CELL + CELL / 2
            const dx = tx - e.x, dy = ty - e.y
            const dist = Math.hypot(dx, dy)
            if (dist < 3) { e.x = tx; e.y = ty; e.pathIdx++ }
            else { const spd = e.speed * dt; e.x += (dx / dist) * spd; e.y += (dy / dist) * spd }
          }
          this.enemies = this.enemies.filter(e => e.hp > 0)

          // Towers shoot
          for (const t of this.towers) {
            if (t.cooldown > 0) { t.cooldown -= delta; continue }
            let closest: Enemy | null = null, closestDist = Infinity
            for (const e of this.enemies) {
              const d = Math.hypot(e.x - (t.col * CELL + CELL / 2), e.y - (t.row * CELL + CELL / 2))
              if (d < t.range && d < closestDist) { closest = e; closestDist = d }
            }
            if (closest) {
              this.bullets.push({ x: t.col * CELL + CELL / 2, y: t.row * CELL + CELL / 2, tx: closest.x, ty: closest.y, speed: 300, damage: t.damage, color: 0xffff00 })
              t.cooldown = 800
            }
          }

          // Move bullets
          for (const b of this.bullets) {
            const dx = b.tx - b.x, dy = b.ty - b.y
            const dist = Math.hypot(dx, dy)
            if (dist < 8) {
              for (const e of this.enemies) {
                if (Math.hypot(e.x - b.tx, e.y - b.ty) < 20) {
                  e.hp -= b.damage
                  if (e.hp <= 0) { this.gold += e.reward; this.score += e.reward }
                }
              }
              b.speed = 0
            } else {
              const spd = b.speed * dt
              b.x += (dx / dist) * spd; b.y += (dy / dist) * spd
            }
          }
          this.bullets = this.bullets.filter(b => b.speed > 0)
          this.enemies = this.enemies.filter(e => e.hp > 0)

          if (this.lives <= 0) { this.running = false; this.showOverlay('GAME OVER', `Wave: ${this.wave}  Score: ${this.score}`); return }
          if (this.wave >= 10 && this.enemies.length === 0 && this.spawnLeft === 0) { this.running = false; this.showOverlay('YOU WIN! 🏆', `Score: ${this.score}`); return }

          this.ui.setText(`Gold: ${this.gold}  Lives: ${this.lives}  Wave: ${this.wave}/10  Score: ${this.score}`)
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          // Grid
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const isPath = PATH_SET.has(`${c},${r}`)
              g.fillStyle(isPath ? 0x8b7355 : 0x2d5a27); g.fillRect(c * CELL, r * CELL, CELL, CELL)
              g.lineStyle(1, 0x1a3d1a); g.strokeRect(c * CELL, r * CELL, CELL, CELL)
            }
          }
          // Path arrows
          for (let i = 0; i < PATH.length - 1; i++) {
            const [c, r] = PATH[i]; const [nc, nr] = PATH[i + 1]
            const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2
            const nx = nc * CELL + CELL / 2, ny = nr * CELL + CELL / 2
            g.lineStyle(2, 0xffffff, 0.2); g.lineBetween(x, y, nx, ny)
          }
          // Towers
          for (const t of this.towers) {
            const x = t.col * CELL + CELL / 2, y = t.row * CELL + CELL / 2
            g.fillStyle(0x2255bb); g.fillRect(t.col * CELL + 4, t.row * CELL + 4, CELL - 8, CELL - 8)
            g.fillStyle(0x4488ff); g.fillRect(t.col * CELL + 8, t.row * CELL + 8, CELL - 16, CELL - 16)
            g.lineStyle(1, 0x88aaff, 0.2); g.strokeCircle(x, y, t.range)
          }
          // Enemies
          for (const e of this.enemies) {
            g.fillStyle(0xff4444); g.fillCircle(e.x, e.y, 10)
            g.fillStyle(0x333); g.fillRect(e.x - 10, e.y - 16, 20, 4)
            g.fillStyle(0x44ff44); g.fillRect(e.x - 10, e.y - 16, 20 * (e.hp / e.maxHp), 4)
          }
          // Bullets
          for (const b of this.bullets) { g.fillStyle(b.color); g.fillCircle(b.x, b.y, 4) }
          // Wave countdown
          if (this.spawnLeft === 0 && this.enemies.length === 0) {
            const sec = Math.ceil(this.waveTimer / 1000)
            g.fillStyle(0x000, 0.6); g.fillRoundedRect(W / 2 - 80, H - 30, 160, 24, 6)
          }
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO, width: W, height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [GameScene],
      }
      gameRef.current = new Phaser.Game(config)
    }
    init()
    return () => { isMounted = false; gameRef.current?.destroy(true); gameRef.current = null }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
