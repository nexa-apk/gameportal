'use client'

import { useEffect, useRef } from 'react'

const W = 480
const H = 640
const PLAYER_SPEED = 300
const BULLET_SPEED = 500
const ENEMY_BULLET_SPEED = 220
const FIRE_RATE = 300
const ENEMY_COLS = 8
const ENEMY_ROWS = 4
const ENEMY_SPACING = 50

type Entity = { x: number; y: number; alive: boolean }
type Enemy = Entity & { col: number; row: number }
type Bullet = Entity & { vy: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: number }

export default function SpaceInvaders() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private playerX = W / 2
        private playerY = H - 70
        private bullets: Bullet[] = []
        private enemyBullets: Bullet[] = []
        private enemies: Enemy[] = []
        private particles: Particle[] = []
        private score = 0
        private lives = 3
        private wave = 1
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private livesText!: Phaser.GameObjects.Text
        private waveText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private running = false
        private fireTimer = 0
        private enemyMoveTimer = 0
        private enemyMoveInterval = 800
        private enemyDir = 1
        private enemyShootTimer = 0
        private stars: { x: number; y: number; speed: number; size: number }[] = []
        private ptrX = W / 2
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        private fireKey!: Phaser.Input.Keyboard.Key
        private invincible = 0

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#020617')
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '16px', color: '#e2e8f0', fontFamily: 'monospace',
          }).setDepth(2)
          this.livesText = this.add.text(W - 10, 10, '♥♥♥', {
            fontSize: '16px', color: '#f87171', fontFamily: 'monospace',
          }).setOrigin(1, 0).setDepth(2)
          this.waveText = this.add.text(W / 2, 10, 'Wave 1', {
            fontSize: '16px', color: '#a5b4fc', fontFamily: 'monospace',
          }).setOrigin(0.5, 0).setDepth(2)

          this.stars = Array.from({ length: 80 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            speed: 30 + Math.random() * 60,
            size: Math.random() < 0.2 ? 2 : 1,
          }))

          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('SPACE\nINVADERS', 'Arrow keys + Z/Space to shoot\nor touch to play')

          this.cursors = this.input.keyboard!.createCursorKeys()
          this.fireKey = this.input.keyboard!.addKey('Z')
          this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.ptrX = p.x })
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.ptrX = p.x
            if (!this.running) this.startGame()
            else this.fireBullet()
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const lines = title.split('\n').length
          const bg = this.add.rectangle(0, 0, 320, lines > 1 ? 230 : 210, 0x000000, 0.92).setStrokeStyle(2, 0x6366f1)
          const t = this.add.text(0, lines > 1 ? -75 : -65, title, {
            fontSize: '36px', color: '#818cf8', fontFamily: 'monospace', fontStyle: 'bold',
            align: 'center',
          }).setOrigin(0.5)
          const s = this.add.text(0, lines > 1 ? -5 : -10, sub, {
            fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 300 },
          }).setOrigin(0.5)
          const scText = this.score > 0
            ? this.add.text(0, lines > 1 ? 40 : 30, `Score: ${this.score}`, {
                fontSize: '18px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5)
            : null
          const btn = this.add.text(0, lines > 1 ? 85 : 70, '[ PLAY ]', {
            fontSize: '22px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#6366f1', padding: { x: 16, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (scText) items.push(scText)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.lives = 3
          this.wave = 1
          this.bullets = []
          this.enemyBullets = []
          this.particles = []
          this.playerX = W / 2
          this.fireTimer = 0
          this.enemyMoveInterval = 800
          this.invincible = 0
          this.running = true
          this.overlay.setVisible(false)
          this.spawnWave()
          this.updateHUD()
        }

        spawnWave() {
          this.enemies = []
          const ox = (W - ENEMY_COLS * ENEMY_SPACING) / 2 + ENEMY_SPACING / 2
          for (let r = 0; r < ENEMY_ROWS; r++) {
            for (let c = 0; c < ENEMY_COLS; c++) {
              this.enemies.push({
                x: ox + c * ENEMY_SPACING,
                y: 80 + r * 42,
                alive: true, col: c, row: r,
              })
            }
          }
          this.enemyDir = 1
          this.enemyMoveTimer = 0
          this.enemyShootTimer = 0
        }

        fireBullet() {
          if (!this.running) return
          this.bullets.push({ x: this.playerX, y: this.playerY - 20, alive: true, vy: -BULLET_SPEED })
          this.fireTimer = 0
        }

        updateHUD() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('♥'.repeat(this.lives))
          this.waveText.setText(`Wave ${this.wave}`)
        }

        update(_: number, delta: number) {
          const dt = delta / 1000
          if (this.invincible > 0) this.invincible -= delta

          this.stars.forEach(s => {
            s.y += s.speed * dt
            if (s.y > H) { s.y = 0; s.x = Math.random() * W }
          })

          if (!this.running) { this.drawScene(dt); return }

          if (this.cursors.left?.isDown) this.playerX -= PLAYER_SPEED * dt
          else this.playerX += (this.ptrX - this.playerX) * Math.min(1, dt * 8)
          if (this.cursors.right?.isDown) this.playerX += PLAYER_SPEED * dt
          this.playerX = Phaser.Math.Clamp(this.playerX, 28, W - 28)

          this.fireTimer += delta
          if (
            (this.fireTimer >= FIRE_RATE) &&
            (this.cursors.up?.isDown || this.fireKey?.isDown || this.cursors.space?.isDown)
          ) {
            this.fireBullet()
          }

          this.bullets.forEach(b => { b.y += b.vy * dt; if (b.y < -10) b.alive = false })
          this.enemyBullets.forEach(b => { b.y += b.vy * dt; if (b.y > H + 10) b.alive = false })
          this.bullets = this.bullets.filter(b => b.alive)
          this.enemyBullets = this.enemyBullets.filter(b => b.alive)

          this.enemyMoveTimer += delta
          if (this.enemyMoveTimer >= this.enemyMoveInterval) {
            this.enemyMoveTimer = 0
            const alive = this.enemies.filter(e => e.alive)
            const minX = Math.min(...alive.map(e => e.x))
            const maxX = Math.max(...alive.map(e => e.x))
            const step = 24
            let drop = false
            if (maxX + step > W - 20 && this.enemyDir > 0) drop = true
            if (minX - step < 20 && this.enemyDir < 0) drop = true
            if (drop) {
              this.enemies.forEach(e => { e.y += 24; e.alive && (e.alive = e.y < H - 80) })
              this.enemyDir *= -1
            } else {
              this.enemies.forEach(e => { if (e.alive) e.x += step * this.enemyDir })
            }
            const remaining = this.enemies.filter(e => e.alive).length
            this.enemyMoveInterval = Math.max(100, 800 * (remaining / (ENEMY_COLS * ENEMY_ROWS)))
          }

          this.enemyShootTimer += delta
          if (this.enemyShootTimer > 1200 - this.wave * 80) {
            this.enemyShootTimer = 0
            const alive = this.enemies.filter(e => e.alive)
            if (alive.length) {
              const shooter = alive[Math.floor(Math.random() * alive.length)]
              this.enemyBullets.push({ x: shooter.x, y: shooter.y + 16, alive: true, vy: ENEMY_BULLET_SPEED })
            }
          }

          for (const b of this.bullets) {
            for (const e of this.enemies) {
              if (!b.alive || !e.alive) continue
              if (Math.abs(b.x - e.x) < 18 && Math.abs(b.y - e.y) < 14) {
                b.alive = false; e.alive = false
                this.score += (ENEMY_ROWS - e.row) * 10
                this.spawnParticles(e.x, e.y, 0xf97316)
                this.updateHUD()
              }
            }
          }

          if (this.invincible <= 0) {
            for (const b of this.enemyBullets) {
              if (!b.alive) continue
              if (Math.abs(b.x - this.playerX) < 22 && Math.abs(b.y - this.playerY) < 24) {
                b.alive = false
                this.lives--
                this.invincible = 2000
                this.spawnParticles(this.playerX, this.playerY, 0x60a5fa)
                this.updateHUD()
                if (this.lives <= 0) {
                  this.running = false
                  window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
                  this.showOverlay('GAME OVER', `Wave: ${this.wave}`)
                }
                break
              }
            }
          }

          if (this.enemies.some(e => e.alive && e.y > H - 100)) {
            this.running = false
            window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
            this.showOverlay('GAME OVER', `Wave: ${this.wave}`)
          }

          if (this.enemies.every(e => !e.alive)) {
            this.wave++
            this.updateHUD()
            this.spawnWave()
            this.enemyMoveInterval = Math.max(200, 800 - this.wave * 60)
          }

          this.particles.forEach(p => {
            p.x += p.vx * dt; p.y += p.vy * dt; p.life -= delta
          })
          this.particles = this.particles.filter(p => p.life > 0)

          this.drawScene(dt)
        }

        spawnParticles(x: number, y: number, color: number) {
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5
            const speed = 60 + Math.random() * 100
            this.particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 400 + Math.random() * 300,
              color,
            })
          }
        }

        drawScene(dt: number) {
          const g = this.gfx
          g.clear()

          this.stars.forEach(s => {
            g.fillStyle(0xffffff, 0.4 + s.size * 0.3)
            g.fillRect(s.x, s.y, s.size, s.size)
          })

          this.enemies.forEach(e => {
            if (!e.alive) return
            const colors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e][Math.min(e.row, 3)]
            g.fillStyle(colors)
            g.fillRect(e.x - 14, e.y - 8, 28, 16)
            g.fillRect(e.x - 8, e.y - 14, 4, 8)
            g.fillRect(e.x + 4, e.y - 14, 4, 8)
            g.fillRect(e.x - 16, e.y + 6, 6, 4)
            g.fillRect(e.x + 10, e.y + 6, 6, 4)
            g.fillStyle(0xffffff)
            g.fillRect(e.x - 8, e.y - 4, 5, 5)
            g.fillRect(e.x + 3, e.y - 4, 5, 5)
            g.fillStyle(0x000000)
            g.fillRect(e.x - 7, e.y - 3, 3, 3)
            g.fillRect(e.x + 4, e.y - 3, 3, 3)
          })

          const showPlayer = this.invincible <= 0 || Math.floor(Date.now() / 120) % 2 === 0
          if (showPlayer) {
            g.fillStyle(0x38bdf8)
            g.fillTriangle(
              this.playerX, this.playerY - 26,
              this.playerX - 22, this.playerY + 14,
              this.playerX + 22, this.playerY + 14,
            )
            g.fillStyle(0x7dd3fc)
            g.fillTriangle(
              this.playerX, this.playerY - 14,
              this.playerX - 12, this.playerY + 8,
              this.playerX + 12, this.playerY + 8,
            )
            g.fillStyle(0x0ea5e9)
            g.fillTriangle(
              this.playerX - 22, this.playerY + 14,
              this.playerX - 38, this.playerY + 22,
              this.playerX - 14, this.playerY + 6,
            )
            g.fillTriangle(
              this.playerX + 22, this.playerY + 14,
              this.playerX + 38, this.playerY + 22,
              this.playerX + 14, this.playerY + 6,
            )
            g.fillStyle(0xf97316, 0.8)
            g.fillCircle(this.playerX, this.playerY + 18, 7)
            g.fillStyle(0xfef08a)
            g.fillCircle(this.playerX, this.playerY + 18, 4)
          }

          this.bullets.forEach(b => {
            if (!b.alive) return
            g.fillStyle(0x38bdf8)
            g.fillRect(b.x - 3, b.y - 10, 6, 20)
            g.fillStyle(0xbfdbfe)
            g.fillRect(b.x - 1, b.y - 10, 2, 20)
          })

          this.enemyBullets.forEach(b => {
            if (!b.alive) return
            g.fillStyle(0xef4444)
            g.fillRect(b.x - 3, b.y - 8, 6, 16)
          })

          this.particles.forEach(p => {
            g.fillStyle(p.color, p.life / 700)
            g.fillRect(p.x - 2, p.y - 2, 4, 4)
          })
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
        height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [GameScene],
      }
      gameRef.current = new Phaser.Game(config)
    }

    init()
    return () => {
      isMounted = false
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
