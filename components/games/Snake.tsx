'use client'

import { useEffect, useRef } from 'react'

const CELL = 20
const COLS = 20
const ROWS = 20
const W = CELL * COLS
const H = CELL * ROWS

export default function Snake() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default

      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private snake: { x: number; y: number }[] = []
        private dir = { x: 1, y: 0 }
        private nextDir = { x: 1, y: 0 }
        private food = { x: 0, y: 0 }
        private score = 0
        private speed = 120
        private timer = 0
        private graphics!: Phaser.GameObjects.Graphics
        private scoreText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container
        private running = false
        private dead = false

        constructor() { super('Game') }

        create() {
          this.graphics = this.add.graphics()

          this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '18px', color: '#4ade80', fontFamily: 'monospace',
          }).setDepth(1)

          this.overlay = this.add.container(W / 2, H / 2)
          const bg = this.add.rectangle(0, 0, 300, 180, 0x000000, 0.85).setStrokeStyle(2, 0x4ade80)
          const title = this.add.text(0, -55, 'SNAKE', {
            fontSize: '36px', color: '#4ade80', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const sub = this.add.text(0, 0, 'Arrow keys or swipe to move', {
            fontSize: '13px', color: '#86efac', fontFamily: 'monospace', wordWrap: { width: 260 },
          }).setOrigin(0.5)
          const btn = this.add.text(0, 55, '[ PLAY ]', {
            fontSize: '22px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#4ade80', padding: { x: 16, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, title, sub, btn])

          // Keyboard
          this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            if (!this.running) { this.startGame(); return }
            if (e.key === 'ArrowUp' && this.dir.y === 0) this.nextDir = { x: 0, y: -1 }
            if (e.key === 'ArrowDown' && this.dir.y === 0) this.nextDir = { x: 0, y: 1 }
            if (e.key === 'ArrowLeft' && this.dir.x === 0) this.nextDir = { x: -1, y: 0 }
            if (e.key === 'ArrowRight' && this.dir.x === 0) this.nextDir = { x: 1, y: 0 }
            e.preventDefault()
          })

          // Touch swipe
          let tx = 0, ty = 0
          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { tx = p.x; ty = p.y })
          this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            const dx = p.x - tx, dy = p.y - ty
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0 && this.dir.x === 0) this.nextDir = { x: 1, y: 0 }
              if (dx < 0 && this.dir.x === 0) this.nextDir = { x: -1, y: 0 }
            } else {
              if (dy > 0 && this.dir.y === 0) this.nextDir = { x: 0, y: 1 }
              if (dy < 0 && this.dir.y === 0) this.nextDir = { x: 0, y: -1 }
            }
          })
        }

        startGame() {
          this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
          this.dir = { x: 1, y: 0 }
          this.nextDir = { x: 1, y: 0 }
          this.score = 0
          this.speed = 120
          this.timer = 0
          this.dead = false
          this.running = true
          this.placeFood()
          this.overlay.setVisible(false)
          this.scoreText.setText('Score: 0')
        }

        placeFood() {
          do {
            this.food = {
              x: Math.floor(Math.random() * COLS),
              y: Math.floor(Math.random() * ROWS),
            }
          } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y))
        }

        update(_: number, delta: number) {
          if (!this.running) return

          this.timer += delta
          if (this.timer < this.speed) { this.draw(); return }
          this.timer = 0

          this.dir = { ...this.nextDir }
          const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y }

          // Wall collision
          if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            this.gameOver(); return
          }
          // Self collision
          if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver(); return
          }

          this.snake.unshift(head)

          if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10
            this.scoreText.setText(`Score: ${this.score}`)
            this.placeFood()
            if (this.score % 50 === 0) this.speed = Math.max(50, this.speed - 10)
          } else {
            this.snake.pop()
          }

          this.draw()
        }

        draw() {
          const g = this.graphics
          g.clear()
          // Background grid
          g.fillStyle(0x052e16)
          g.fillRect(0, 0, W, H)
          for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
              g.fillStyle(0x063a1a, 1)
              g.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
            }
          }
          // Food
          g.fillStyle(0xef4444)
          g.fillCircle(
            this.food.x * CELL + CELL / 2,
            this.food.y * CELL + CELL / 2,
            CELL / 2 - 2,
          )
          // Snake
          this.snake.forEach((seg, i) => {
            const t = i / this.snake.length
            g.fillStyle(i === 0 ? 0x16a34a : (
              Phaser.Display.Color.GetColor(
                Math.floor(34 * (1 - t) + 5 * t),
                Math.floor(197 * (1 - t) + 46 * t),
                Math.floor(94 * (1 - t) + 26 * t),
              )
            ))
            const pad = i === 0 ? 1 : 2
            g.fillRoundedRect(
              seg.x * CELL + pad, seg.y * CELL + pad,
              CELL - pad * 2, CELL - pad * 2, 3,
            )
          })
        }

        gameOver() {
          this.running = false
          this.dead = true

          // Rebuild overlay as game over
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.9).setStrokeStyle(2, 0xef4444)
          const title = this.add.text(0, -65, 'GAME OVER', {
            fontSize: '30px', color: '#ef4444', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const sc = this.add.text(0, -20, `Score: ${this.score}`, {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace',
          }).setOrigin(0.5)
          const btn = this.add.text(0, 50, '[ PLAY AGAIN ]', {
            fontSize: '20px', color: '#000', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#4ade80', padding: { x: 14, y: 8 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          this.overlay.add([bg, title, sc, btn])
          this.overlay.setVisible(true)
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
        height: H,
        backgroundColor: '#052e16',
        parent: containerRef.current,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
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
