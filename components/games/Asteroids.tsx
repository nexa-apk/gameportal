'use client'
import { useEffect, useRef } from 'react'

const W = 480, H = 480
type Vec = { x: number; y: number }
type Rock = { x: number; y: number; vx: number; vy: number; size: number; angle: number; spin: number; points: Vec[] }
type Bullet = { x: number; y: number; vx: number; vy: number; life: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }

function wrap(v: number, max: number) { return ((v % max) + max) % max }
function randomRockPoints(r: number): Vec[] {
  const pts: Vec[] = []
  const n = 8 + Math.floor(Math.random() * 4)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const d = r * (0.7 + Math.random() * 0.3)
    pts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d })
  }
  return pts
}

export default function Asteroids() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private sx = W / 2; private sy = H / 2
        private angle = -Math.PI / 2; private rotSpeed = 0
        private vx = 0; private vy = 0
        private thrustOn = false
        private rocks: Rock[] = []
        private bullets: Bullet[] = []
        private particles: Particle[] = []
        private lives = 3
        private score = 0
        private wave = 1
        private fireTimer = 0
        private invincible = 0
        private running = false
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private livesText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private fireKey!: Phaser.Input.Keyboard.Key
        private stars: { x: number; y: number; r: number }[] = []
        private touchAngle = -Math.PI / 2

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#000')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', color: '#fff', fontFamily: 'monospace' }).setDepth(2)
          this.livesText = this.add.text(W - 10, 10, '♥♥♥', { fontSize: '16px', color: '#f87', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(2)
          this.stars = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < 0.2 ? 1.5 : 1 }))
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('ASTEROIDS', '← → rotate  ↑ thrust  Space shoot')
          this.cursors = this.input.keyboard!.createCursorKeys()
          this.fireKey = this.input.keyboard!.addKey('Z')
          // Touch: tap right = rotate right, tap left = rotate left, hold center = thrust, tap upper = shoot
          let touchFireCooldown = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            if (p.y < H / 3) { this.shoot(); return }
            if (p.x > W * 0.65) this.rotSpeed = 2.5
            else if (p.x < W * 0.35) this.rotSpeed = -2.5
            else this.thrustOn = true
            touchFireCooldown = 0
          })
          this.input.on('pointerup', () => { this.rotSpeed = 0; this.thrustOn = false })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, 190, 0x000000, 0.92).setStrokeStyle(2, 0xffffff)
          const t = this.add.text(0, -60, title, { fontSize: '28px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -15, sub, { fontSize: '12px', color: '#888', fontFamily: 'monospace', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5)
          const sc = this.score > 0 ? this.add.text(0, 20, `Score: ${this.score}`, { fontSize: '16px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 60, '[ PLAY ]', { fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#ffffff', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          this.sx = W / 2; this.sy = H / 2; this.angle = -Math.PI / 2
          this.vx = 0; this.vy = 0; this.thrustOn = false; this.rotSpeed = 0
          this.rocks = []; this.bullets = []; this.particles = []
          this.lives = 3; this.score = 0; this.wave = 1; this.invincible = 2000
          this.running = true; this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
          this.livesText.setText('♥♥♥')
          this.spawnWave()
        }

        spawnWave() {
          for (let i = 0; i < 2 + this.wave; i++) {
            const side = Math.random() < 0.5
            const x = side ? (Math.random() < 0.5 ? -50 : W + 50) : Math.random() * W
            const y = side ? Math.random() * H : (Math.random() < 0.5 ? -50 : H + 50)
            this.spawnRock(x, y, 40)
          }
        }

        spawnRock(x: number, y: number, size: number) {
          const speed = (80 + Math.random() * 60) * (1 + this.wave * 0.1)
          const dir = Math.random() * Math.PI * 2
          this.rocks.push({ x, y, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, size, angle: 0, spin: (Math.random() - 0.5) * 2, points: randomRockPoints(size) })
        }

        shoot() {
          if (this.fireTimer > 0) return
          this.fireTimer = 200
          this.bullets.push({ x: this.sx + Math.cos(this.angle) * 16, y: this.sy + Math.sin(this.angle) * 16, vx: Math.cos(this.angle) * 500, vy: Math.sin(this.angle) * 500, life: 1200 })
        }

        update(_: number, delta: number) {
          if (!this.running) return
          const dt = delta / 1000
          if (this.invincible > 0) this.invincible -= delta
          if (this.fireTimer > 0) this.fireTimer -= delta

          // Input
          if (this.cursors.left?.isDown) this.rotSpeed = -2.5
          else if (this.cursors.right?.isDown) this.rotSpeed = 2.5
          else if (!this.input.pointer1.isDown) this.rotSpeed = 0

          if (this.cursors.up?.isDown) this.thrustOn = true
          else if (!this.input.pointer1.isDown) this.thrustOn = false

          if ((this.cursors.space?.isDown || this.fireKey?.isDown) && this.fireTimer <= 0) this.shoot()

          // Ship
          this.angle += this.rotSpeed * dt
          if (this.thrustOn) { this.vx += Math.cos(this.angle) * 300 * dt; this.vy += Math.sin(this.angle) * 300 * dt }
          const speed = Math.hypot(this.vx, this.vy)
          if (speed > 400) { this.vx *= 400 / speed; this.vy *= 400 / speed }
          this.vx *= 0.99; this.vy *= 0.99
          this.sx = wrap(this.sx + this.vx * dt, W)
          this.sy = wrap(this.sy + this.vy * dt, H)

          // Bullets
          this.bullets.forEach(b => { b.x = wrap(b.x + b.vx * dt, W); b.y = wrap(b.y + b.vy * dt, H); b.life -= delta })
          this.bullets = this.bullets.filter(b => b.life > 0)

          // Rocks
          this.rocks.forEach(r => { r.x = wrap(r.x + r.vx * dt, W); r.y = wrap(r.y + r.vy * dt, H); r.angle += r.spin * dt })

          // Bullet-rock collisions
          for (const b of this.bullets) {
            for (const r of this.rocks) {
              if (!b.life) continue
              if (Math.hypot(b.x - r.x, b.y - r.y) < r.size) {
                b.life = 0
                this.explode(r.x, r.y)
                this.score += r.size > 25 ? 20 : r.size > 12 ? 50 : 100
                this.scoreText.setText(`Score: ${this.score}`)
                if (r.size > 25) { this.spawnRock(r.x, r.y, 20); this.spawnRock(r.x, r.y, 20) }
                else if (r.size > 12) { this.spawnRock(r.x, r.y, 10); this.spawnRock(r.x, r.y, 10) }
                r.size = 0
              }
            }
          }
          this.rocks = this.rocks.filter(r => r.size > 0)

          // Ship-rock collisions
          if (this.invincible <= 0) {
            for (const r of this.rocks) {
              if (Math.hypot(this.sx - r.x, this.sy - r.y) < r.size + 10) {
                this.lives--
                this.livesText.setText('♥'.repeat(Math.max(0, this.lives)))
                this.explode(this.sx, this.sy)
                if (this.lives <= 0) { this.running = false; window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } })); this.showOverlay('GAME OVER', `Score: ${this.score}`); return }
                this.sx = W / 2; this.sy = H / 2; this.vx = 0; this.vy = 0; this.invincible = 2500
                break
              }
            }
          }

          if (!this.rocks.length) { this.wave++; this.spawnWave() }

          // Particles
          this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= delta })
          this.particles = this.particles.filter(p => p.life > 0)

          this.draw()
        }

        explode(x: number, y: number) {
          for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 100
            this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 500 + Math.random() * 300, maxLife: 800 })
          }
        }

        draw() {
          const g = this.gfx; g.clear()
          // Stars
          this.stars.forEach(s => { g.fillStyle(0xffffff, 0.5); g.fillCircle(s.x, s.y, s.r) })
          // Rocks
          for (const r of this.rocks) {
            g.lineStyle(2, 0x88aaff)
            const pts = r.points.map(p => {
              const cos = Math.cos(r.angle), sin = Math.sin(r.angle)
              return { x: r.x + p.x * cos - p.y * sin, y: r.y + p.x * sin + p.y * cos }
            })
            for (let i = 0; i < pts.length; i++) {
              const a = pts[i], b = pts[(i + 1) % pts.length]
              g.lineBetween(a.x, a.y, b.x, b.y)
            }
          }
          // Bullets
          g.fillStyle(0xffff00)
          this.bullets.forEach(b => g.fillCircle(b.x, b.y, 3))
          // Ship
          if (this.invincible <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
            const cos = Math.cos(this.angle), sin = Math.sin(this.angle)
            const tip = { x: this.sx + cos * 16, y: this.sy + sin * 16 }
            const l = { x: this.sx + Math.cos(this.angle + 2.4) * 12, y: this.sy + Math.sin(this.angle + 2.4) * 12 }
            const r2 = { x: this.sx + Math.cos(this.angle - 2.4) * 12, y: this.sy + Math.sin(this.angle - 2.4) * 12 }
            g.lineStyle(2, 0x00ffcc)
            g.lineBetween(tip.x, tip.y, l.x, l.y)
            g.lineBetween(tip.x, tip.y, r2.x, r2.y)
            g.lineBetween(l.x, l.y, r2.x, r2.y)
            if (this.thrustOn) { g.lineStyle(2, 0xff6600); g.lineBetween(this.sx + cos * -8, this.sy + sin * -8, this.sx + cos * -18 - sin * 6, this.sy + sin * -18 + cos * 6) }
          }
          // Particles
          this.particles.forEach(p => {
            g.fillStyle(0xff6600, p.life / p.maxLife)
            g.fillRect(p.x - 2, p.y - 2, 4, 4)
          })
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
