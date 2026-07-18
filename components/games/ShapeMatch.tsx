'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'] as const
type Shape = typeof SHAPES[number]
const COLORS = [0xe74c3c, 0x3498db, 0x2ecc71, 0x9b59b6, 0xf1c40f, 0xe67e22]

type Option = { shape: Shape; color: number; correct: boolean }

const CARD_XS = [72, 180, 288]
const CARD_Y = 350
const CARD_SIZE = 94

export default function ShapeMatch() {
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
        private livesText!: Phaser.GameObjects.Text
        private promptText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private cards: Phaser.GameObjects.Rectangle[] = []
        private overlay!: Phaser.GameObjects.Container

        private target: Shape = 'circle'
        private targetColor = 0xe74c3c
        private options: Option[] = []
        private score = 0
        private bestScore = 0
        private lives = 3
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#eef2ff')
          // depth 2 so option shapes render ON TOP of the white cards (depth 1)
          this.gfx = this.add.graphics()
          this.gfx.setDepth(2)

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#6c5ce7', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.livesText = this.add.text(W - 14, 14, '❤❤❤', {
            fontSize: '18px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)

          this.promptText = this.add.text(W / 2, 66, 'Find this shape:', {
            fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          this.feedbackText = this.add.text(W / 2, 250, '', {
            fontSize: '20px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          for (let i = 0; i < 3; i++) {
            const rect = this.add.rectangle(CARD_XS[i], CARD_Y, CARD_SIZE, CARD_SIZE, 0xffffff, 1)
              .setStrokeStyle(3, 0xd6dbf5).setDepth(1)
              .setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.answer(i))
            this.cards.push(rect)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('SHAPE MATCH', 'Look at the shape at the top,\nthen tap the card with the\nsame shape. 3 lives!')
        }

        setCardsVisible(v: boolean) {
          this.cards.forEach((c) => c.setVisible(v))
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setCardsVisible(false)
          this.promptText.setVisible(false)
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 250 : 210
          const bg = this.add.rectangle(0, 0, 320, bh, 0xffffff, 0.97).setStrokeStyle(3, 0x6c5ce7)
          const ty = hasScore ? -95 : -75
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#6c5ce7', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#555555', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 26, `Score: ${this.score}`, {
                fontSize: '18px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 52, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#999999', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 98 : 62
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#6c5ce7', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.lives = 3
          this.locked = false
          this.running = true
          this.overlay.setVisible(false)
          this.setCardsVisible(true)
          this.promptText.setVisible(true)
          this.updateHud()
          this.newRound()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        newRound() {
          this.feedbackText.setText('')
          this.target = SHAPES[Math.floor(Math.random() * SHAPES.length)]
          this.targetColor = COLORS[Math.floor(Math.random() * COLORS.length)]

          // pick two other distinct shapes
          const others = SHAPES.filter((s) => s !== this.target)
          for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]]
          }
          const chosen: Shape[] = [this.target, others[0], others[1]]
          for (let i = chosen.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chosen[i], chosen[j]] = [chosen[j], chosen[i]]
          }
          this.options = chosen.map((shape) => ({
            shape,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            correct: shape === this.target,
          }))
          this.cards.forEach((c) => c.setStrokeStyle(3, 0xd6dbf5))
        }

        answer(i: number) {
          if (!this.running || this.locked) return
          this.locked = true
          if (this.options[i].correct) {
            this.score++
            this.updateHud()
            this.feedbackText.setColor('#27ae60').setText('Correct! 🎉')
            this.cards[i].setStrokeStyle(4, 0x2ecc71)
            this.time.delayedCall(550, () => {
              if (!this.running) return
              this.locked = false
              this.newRound()
            })
          } else {
            this.lives--
            this.updateHud()
            this.feedbackText.setColor('#e74c3c').setText('Not that one!')
            this.cards[i].setStrokeStyle(4, 0xe74c3c)
            this.time.delayedCall(650, () => {
              if (this.lives <= 0) {
                this.endGame()
              } else if (this.running) {
                this.locked = false
                this.newRound()
              }
            })
          }
        }

        endGame() {
          this.running = false
          this.locked = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You matched ${this.score} shapes!`)
        }

        drawShape(g: Phaser.GameObjects.Graphics, shape: Shape, cx: number, cy: number, r: number, color: number) {
          g.fillStyle(color, 1)
          if (shape === 'circle') {
            g.fillCircle(cx, cy, r)
          } else if (shape === 'square') {
            g.fillRect(cx - r, cy - r, r * 2, r * 2)
          } else if (shape === 'triangle') {
            g.fillTriangle(cx, cy - r, cx - r, cy + r, cx + r, cy + r)
          } else if (shape === 'diamond') {
            g.fillPoints([
              new Phaser.Math.Vector2(cx, cy - r), new Phaser.Math.Vector2(cx + r, cy),
              new Phaser.Math.Vector2(cx, cy + r), new Phaser.Math.Vector2(cx - r, cy),
            ], true)
          } else {
            const pts: Phaser.Math.Vector2[] = []
            for (let i = 0; i < 10; i++) {
              const ang = -Math.PI / 2 + (i * Math.PI) / 5
              const rad = i % 2 === 0 ? r : r * 0.45
              pts.push(new Phaser.Math.Vector2(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad))
            }
            g.fillPoints(pts, true)
          }
        }

        draw() {
          const g = this.gfx
          g.clear()
          if (!this.running) return

          // target shape
          this.drawShape(g, this.target, W / 2, 160, 46, this.targetColor)

          // option shapes on cards
          for (let i = 0; i < this.options.length; i++) {
            this.drawShape(g, this.options[i].shape, CARD_XS[i], CARD_Y, 32, this.options[i].color)
          }
        }

        update() {
          this.draw()
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
