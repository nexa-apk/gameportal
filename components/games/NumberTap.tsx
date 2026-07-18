'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const GRID_N = 3
const COUNT = GRID_N * GRID_N
const GAME_TIME = 45000

type Cell = {
  rect: Phaser.GameObjects.Rectangle
  txt: Phaser.GameObjects.Text
  num: number
  done: boolean
}

export default function NumberTap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private scoreText!: Phaser.GameObjects.Text
        private timerText!: Phaser.GameObjects.Text
        private promptText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private cells: Cell[] = []
        private current = 1
        private score = 0
        private bestScore = 0
        private timeLeft = GAME_TIME
        private running = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#eaf6ff')
          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#2980b9', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.timerText = this.add.text(W - 14, 14, 'Time: 45', {
            fontSize: '18px', color: '#2980b9', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)
          this.promptText = this.add.text(W / 2, 62, 'Tap 1', {
            fontSize: '20px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('NUMBER TAP', 'Tap the numbers in order,\nstarting from 1. Clear the\ngrid for bonus time. How\nhigh can you count?')
        }

        clearCells() {
          this.cells.forEach((c) => { c.rect.destroy(); c.txt.destroy() })
          this.cells = []
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.clearCells()
          this.promptText.setVisible(false)
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 250 : 230
          const bg = this.add.rectangle(0, 0, 320, bh, 0x1b3a4b, 0.95).setStrokeStyle(3, 0x3498db)
          const ty = hasScore ? -95 : -82
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#bcdff0', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 30, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 56, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#8fb8ca', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 98 : 76
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#3498db', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.timeLeft = GAME_TIME
          this.running = true
          this.overlay.setVisible(false)
          this.promptText.setVisible(true)
          this.updateHud()
          this.newBoard()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          const secs = Math.ceil(this.timeLeft / 1000)
          this.timerText.setText(`Time: ${secs}`)
          this.timerText.setColor(secs <= 10 ? '#e74c3c' : '#2980b9')
          this.promptText.setText(`Tap ${this.current}`)
        }

        newBoard() {
          this.clearCells()
          this.current = 1
          const nums = Array.from({ length: COUNT }, (_, i) => i + 1)
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]]
          }
          const board = 300, gap = 8
          const cell = (board - (GRID_N - 1) * gap) / GRID_N
          const startX = (W - board) / 2 + cell / 2
          const startY = 116 + cell / 2
          for (let i = 0; i < COUNT; i++) {
            const col = i % GRID_N
            const row = Math.floor(i / GRID_N)
            const x = startX + col * (cell + gap)
            const y = startY + row * (cell + gap)
            const rect = this.add.rectangle(x, y, cell, cell, 0x3498db, 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1)
              .setInteractive({ useHandCursor: true })
            const txt = this.add.text(x, y, String(nums[i]), {
              fontSize: '34px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(2)
            const cellObj: Cell = { rect, txt, num: nums[i], done: false }
            rect.on('pointerdown', () => this.pick(cellObj))
            this.cells.push(cellObj)
          }
          this.updateHud()
        }

        pick(cell: Cell) {
          if (!this.running || cell.done) return
          if (cell.num === this.current) {
            cell.done = true
            cell.rect.setFillStyle(0x2ecc71, 1).disableInteractive()
            cell.txt.setColor('#eafff0')
            this.current++
            this.score++
            if (this.current > COUNT) {
              this.timeLeft = Math.min(GAME_TIME, this.timeLeft + 8000)
              this.updateHud()
              this.newBoard()
            } else {
              this.updateHud()
            }
          } else {
            this.timeLeft = Math.max(0, this.timeLeft - 2000)
            cell.rect.setFillStyle(0xe74c3c, 1)
            this.time.delayedCall(220, () => {
              if (!cell.done) cell.rect.setFillStyle(0x3498db, 1)
            })
            this.updateHud()
          }
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('TIME UP!', `You tapped ${this.score} in order!`)
        }

        update(_time: number, delta: number) {
          if (this.running) {
            this.timeLeft -= delta
            if (this.timeLeft <= 0) {
              this.timeLeft = 0
              this.updateHud()
              this.endGame()
            } else {
              this.updateHud()
            }
          }
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
