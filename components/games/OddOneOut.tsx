'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const BASE_COLORS = [0x3498db, 0x2ecc71, 0xe67e22, 0x9b59b6, 0xe74c3c, 0x16a085, 0xf39c12, 0x2980b9]

export default function OddOneOut() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private scoreText!: Phaser.GameObjects.Text
        private livesText!: Phaser.GameObjects.Text
        private promptText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private cells: Phaser.GameObjects.Rectangle[] = []
        private score = 0
        private bestScore = 0
        private lives = 3
        private gridN = 2
        private oddIndex = 0
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#f3f5fb')
          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#34495e', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.livesText = this.add.text(W - 14, 14, '❤❤❤', {
            fontSize: '18px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)
          this.promptText = this.add.text(W / 2, 58, 'Tap the odd one out!', {
            fontSize: '17px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.feedbackText = this.add.text(W / 2, 84, '', {
            fontSize: '15px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('ODD ONE OUT', 'One tile has a slightly\ndifferent colour. Tap it!\nThe grid grows and the\ncolours get closer. 3 lives.')
        }

        clearCells() {
          this.cells.forEach((c) => c.destroy())
          this.cells = []
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.clearCells()
          this.promptText.setVisible(false)
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 235
          const bg = this.add.rectangle(0, 0, 320, bh, 0x2c3e50, 0.95).setStrokeStyle(3, 0x3498db)
          const ty = hasScore ? -98 : -84
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
              this.add.text(0, 32, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 58, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#95a5a6', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 76
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
          this.lives = 3
          this.locked = false
          this.running = true
          this.overlay.setVisible(false)
          this.promptText.setVisible(true)
          this.updateHud()
          this.newRound()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        shiftColor(base: number, delta: number): number {
          const r = (base >> 16) & 0xff
          const g = (base >> 8) & 0xff
          const b = base & 0xff
          const sign = (r + g + b) / 3 > 128 ? -1 : 1
          const nr = Phaser.Math.Clamp(r + sign * delta, 0, 255)
          const ng = Phaser.Math.Clamp(g + sign * delta, 0, 255)
          const nb = Phaser.Math.Clamp(b + sign * delta, 0, 255)
          return (nr << 16) | (ng << 8) | nb
        }

        newRound() {
          this.feedbackText.setText('')
          this.clearCells()
          this.gridN = Math.min(6, 2 + Math.floor(this.score / 3))
          const N = this.gridN
          const board = 300, gap = 6
          const cell = (board - (N - 1) * gap) / N
          const startX = (W - board) / 2 + cell / 2
          const startY = 116 + cell / 2
          const base = BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)]
          const delta = Math.max(14, 58 - this.score * 3)
          const odd = this.shiftColor(base, delta)
          this.oddIndex = Math.floor(Math.random() * N * N)

          for (let i = 0; i < N * N; i++) {
            const col = i % N
            const row = Math.floor(i / N)
            const x = startX + col * (cell + gap)
            const y = startY + row * (cell + gap)
            const rect = this.add.rectangle(x, y, cell, cell, i === this.oddIndex ? odd : base, 1)
              .setDepth(1).setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.pick(i))
            this.cells.push(rect)
          }
        }

        pick(i: number) {
          if (!this.running || this.locked) return
          if (i === this.oddIndex) {
            this.score++
            this.updateHud()
            this.locked = true
            this.feedbackText.setColor('#27ae60').setText('Nice! 🎉')
            this.time.delayedCall(350, () => {
              if (!this.running) return
              this.locked = false
              this.newRound()
            })
          } else {
            this.lives--
            this.updateHud()
            this.feedbackText.setColor('#e74c3c').setText('Not that one!')
            if (this.lives <= 0) this.endGame()
          }
        }

        endGame() {
          this.running = false
          this.locked = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You found ${this.score} odd tiles!`)
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
