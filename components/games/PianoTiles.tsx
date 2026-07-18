'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const COLS = 4
const COL_W = W / COLS
const ROW_H = 98

const TILE_COLORS = [0x3498db, 0x9b59b6, 0x2ecc71, 0xe67e22, 0xe74c3c, 0x1abc9c]

type Row = {
  activeCol: number
  color: number
  tapped: boolean
  y: number
}

export default function PianoTiles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private gfx!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private rows: Row[] = []
        private score = 0
        private bestScore = 0
        private speed = 150
        private colorIdx = 0
        private running = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#f4f6fb')
          this.gfx = this.add.graphics()
          this.scoreText = this.add.text(W / 2, 16, '0', {
            fontSize: '30px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5, 0).setDepth(3)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('PIANO TILES', 'Tap the colored tile in each\nrow before it reaches the\nbottom. Tap the wrong lane\nand it is game over!')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handleTap(p.x))
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 225
          const bg = this.add.rectangle(0, 0, 320, bh, 0x2c3e50, 0.96).setStrokeStyle(3, 0x3498db)
          const ty = hasScore ? -98 : -80
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#bdc3c7', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 30, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 56, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#95a5a6', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 74
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#3498db', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        newRow(y: number): Row {
          const color = TILE_COLORS[this.colorIdx % TILE_COLORS.length]
          this.colorIdx++
          return { activeCol: Math.floor(Math.random() * COLS), color, tapped: false, y }
        }

        startGame() {
          this.score = 0
          this.speed = 150
          this.colorIdx = 0
          this.rows = []
          // seed rows stacked upward, lowest around the middle so there is time
          for (let k = 0; k < 6; k++) {
            this.rows.push(this.newRow(200 - k * ROW_H))
          }
          this.running = true
          this.overlay.setVisible(false)
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(String(this.score))
        }

        targetRow(): Row | null {
          let best: Row | null = null
          for (const r of this.rows) {
            if (!r.tapped && (!best || r.y > best.y)) best = r
          }
          return best
        }

        handleTap(px: number) {
          if (!this.running) return
          const col = Phaser.Math.Clamp(Math.floor(px / COL_W), 0, COLS - 1)
          const target = this.targetRow()
          if (!target) return
          if (col === target.activeCol) {
            target.tapped = true
            this.score++
            this.speed = Math.min(430, 150 + this.score * 6)
            this.updateHud()
          } else {
            this.endGame()
          }
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You hit ${this.score} tiles!`)
        }

        update(_time: number, delta: number) {
          if (this.running) {
            const dy = this.speed * delta / 1000
            let topmostY = Infinity
            for (const r of this.rows) {
              r.y += dy
              if (r.y < topmostY) topmostY = r.y
            }
            // spawn a new row above when there is a gap
            if (topmostY > -ROW_H + 2) {
              this.rows.push(this.newRow(topmostY - ROW_H))
            }
            // missed active tile passed the bottom?
            const target = this.targetRow()
            if (target && target.y > H) {
              this.endGame()
            }
            // drop rows fully off-screen
            this.rows = this.rows.filter((r) => r.y <= H + ROW_H)
          }
          this.draw()
        }

        draw() {
          const g = this.gfx
          g.clear()

          for (const r of this.rows) {
            for (let c = 0; c < COLS; c++) {
              const x = c * COL_W
              if (c === r.activeCol) {
                g.fillStyle(r.tapped ? 0xd0d6de : r.color, 1)
                g.fillRect(x + 2, r.y + 2, COL_W - 4, ROW_H - 4)
                if (!r.tapped) {
                  g.fillStyle(0xffffff, 0.22)
                  g.fillRect(x + 2, r.y + 2, COL_W - 4, 12)
                }
              } else {
                g.fillStyle(0xffffff, 1)
                g.fillRect(x + 2, r.y + 2, COL_W - 4, ROW_H - 4)
                g.lineStyle(1, 0xe3e7ee, 1)
                g.strokeRect(x + 2, r.y + 2, COL_W - 4, ROW_H - 4)
              }
            }
          }

          // lane separators
          g.lineStyle(1, 0xdfe4ec, 1)
          for (let c = 1; c < COLS; c++) g.lineBetween(c * COL_W, 0, c * COL_W, H)

          // score backdrop
          g.fillStyle(0xf4f6fb, 0.85)
          g.fillRect(0, 0, W, 52)
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
