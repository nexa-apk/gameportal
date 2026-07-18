'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const COLS = 3, ROWS = 2
const COUNT = COLS * ROWS
const CELL = 90, GAP = 14
const GRID_W = COLS * CELL + (COLS - 1) * GAP
const START_X = (W - GRID_W) / 2 + CELL / 2
const START_Y = 210
const GAME_TIME = 60000

type Cell = {
  rect: Phaser.GameObjects.Rectangle
  txt: Phaser.GameObjects.Text
  num: number
}

export default function NumberBonds() {
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
        private targetText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private cells: Cell[] = []
        private overlay!: Phaser.GameObjects.Container

        private target = 10
        private firstPick = -1
        private score = 0
        private bestScore = 0
        private timeLeft = GAME_TIME
        private running = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#eafaf1')
          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.timerText = this.add.text(W - 14, 14, 'Time: 60', {
            fontSize: '18px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)
          this.targetText = this.add.text(W / 2, 96, '', {
            fontSize: '30px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.feedbackText = this.add.text(W / 2, 150, '', {
            fontSize: '18px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          for (let i = 0; i < COUNT; i++) {
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const x = START_X + col * (CELL + GAP)
            const y = START_Y + row * (CELL + GAP)
            const rect = this.add.rectangle(x, y, CELL, CELL, 0x1abc9c, 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1).setInteractive({ useHandCursor: true })
            const txt = this.add.text(x, y, '', {
              fontSize: '36px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(2)
            const cellObj: Cell = { rect, txt, num: 0 }
            rect.on('pointerdown', () => this.pick(i))
            this.cells.push(cellObj)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('NUMBER BONDS', 'Tap two numbers that add\nup to the target number.\nMake as many pairs as you\ncan in 60 seconds!')
        }

        setCellsVisible(v: boolean) {
          this.cells.forEach((c) => { c.rect.setVisible(v); c.txt.setVisible(v) })
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setCellsVisible(false)
          this.targetText.setText('')
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 235
          const bg = this.add.rectangle(0, 0, 320, bh, 0x0e5b4a, 0.96).setStrokeStyle(3, 0x1abc9c)
          const ty = hasScore ? -98 : -84
          const t = this.add.text(0, ty, title, {
            fontSize: '23px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#c2f0e6', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 32, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 58, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#89c9bb', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 78
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#16a085', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.score = 0
          this.timeLeft = GAME_TIME
          this.firstPick = -1
          this.running = true
          this.overlay.setVisible(false)
          this.setCellsVisible(true)
          this.updateHud()
          this.newBoard()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          const secs = Math.ceil(this.timeLeft / 1000)
          this.timerText.setText(`Time: ${secs}`)
          this.timerText.setColor(secs <= 10 ? '#e74c3c' : '#16a085')
        }

        newBoard() {
          this.firstPick = -1
          this.feedbackText.setText('')
          this.target = 10 + Math.floor(Math.random() * 9) // 10..18
          this.targetText.setText(`Make ${this.target}`)
          // guarantee at least one valid pair
          const a = 1 + Math.floor(Math.random() * (this.target - 1))
          const nums = [a, this.target - a]
          while (nums.length < COUNT) nums.push(1 + Math.floor(Math.random() * (this.target - 1)))
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]]
          }
          for (let i = 0; i < COUNT; i++) {
            this.cells[i].num = nums[i]
            this.cells[i].txt.setText(String(nums[i]))
            this.cells[i].rect.setFillStyle(0x1abc9c, 1).setStrokeStyle(3, 0xffffff)
          }
        }

        pick(i: number) {
          if (!this.running) return
          const cell = this.cells[i]
          if (this.firstPick === i) {
            // deselect
            this.firstPick = -1
            cell.rect.setStrokeStyle(3, 0xffffff)
            return
          }
          if (this.firstPick === -1) {
            this.firstPick = i
            cell.rect.setStrokeStyle(4, 0xf1c40f)
            return
          }
          const sum = this.cells[this.firstPick].num + cell.num
          if (sum === this.target) {
            this.score++
            this.updateHud()
            this.feedbackText.setColor('#27ae60').setText('Nice! 🎉')
            this.newBoard()
          } else {
            this.feedbackText.setColor('#e74c3c').setText(`That makes ${sum}`)
            this.cells[this.firstPick].rect.setStrokeStyle(3, 0xffffff)
            this.firstPick = -1
          }
        }

        endGame() {
          this.running = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('TIME UP!', `You made ${this.score} number bonds!`)
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
