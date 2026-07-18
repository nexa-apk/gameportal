'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490

type Option = { value: number; correct: boolean }

export default function TimesTables() {
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
        private questionText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private btnRects: Phaser.GameObjects.Rectangle[] = []
        private btnTexts: Phaser.GameObjects.Text[] = []
        private overlay!: Phaser.GameObjects.Container

        private score = 0
        private bestScore = 0
        private lives = 3
        private options: Option[] = []
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#f5eaff')

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#8e44ad', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(2)
          this.livesText = this.add.text(W - 14, 14, '❤❤❤', {
            fontSize: '18px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(2)

          this.questionText = this.add.text(W / 2, 150, '', {
            fontSize: '40px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(2)
          this.feedbackText = this.add.text(W / 2, 205, '', {
            fontSize: '20px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(2)

          const btnColors = [0x9b59b6, 0x8e44ad, 0xa569bd]
          for (let i = 0; i < 3; i++) {
            const y = 260 + i * 68
            const rect = this.add.rectangle(W / 2, y, 250, 56, btnColors[i], 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1).setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.answer(i))
            const txt = this.add.text(W / 2, y, '', {
              fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(2)
            this.btnRects.push(rect)
            this.btnTexts.push(txt)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('TIMES TABLES', 'Solve the multiplication\nand tap the correct answer.\nThe tables get bigger as\nyou go. 3 lives!')
        }

        setButtonsVisible(v: boolean) {
          for (let i = 0; i < 3; i++) { this.btnRects[i].setVisible(v); this.btnTexts[i].setVisible(v) }
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setButtonsVisible(false)
          this.questionText.setText('')
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 235
          const bg = this.add.rectangle(0, 0, 320, bh, 0x4a235a, 0.96).setStrokeStyle(3, 0x9b59b6)
          const ty = hasScore ? -98 : -84
          const t = this.add.text(0, ty, title, {
            fontSize: '23px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#e0c8f0', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 32, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 58, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#b89ac9', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 78
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#8e44ad', padding: { x: 18, y: 10 },
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
          this.setButtonsVisible(true)
          this.updateHud()
          this.newQuestion()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        newQuestion() {
          this.feedbackText.setText('')
          const level = Math.floor(this.score / 5)
          const maxFactor = Math.min(12, 3 + level)
          const a = 1 + Math.floor(Math.random() * maxFactor)
          const b = 1 + Math.floor(Math.random() * maxFactor)
          const answer = a * b
          this.questionText.setText(`${a} × ${b} = ?`)

          const values = new Set<number>([answer])
          let guard = 0
          while (values.size < 3 && guard < 50) {
            guard++
            const delta = (1 + Math.floor(Math.random() * Math.max(2, a))) * (Math.random() < 0.5 ? -1 : 1)
            const cand = answer + delta
            if (cand > 0) values.add(cand)
          }
          let filler = answer + 1
          while (values.size < 3) { if (filler > 0) values.add(filler); filler++ }

          const arr = Array.from(values)
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          this.options = arr.map((v) => ({ value: v, correct: v === answer }))
          for (let i = 0; i < 3; i++) {
            this.btnTexts[i].setText(String(this.options[i].value))
            this.btnRects[i].setFillStyle([0x9b59b6, 0x8e44ad, 0xa569bd][i], 1)
          }
        }

        answer(i: number) {
          if (!this.running || this.locked) return
          this.locked = true
          if (this.options[i].correct) {
            this.score++
            this.updateHud()
            this.feedbackText.setColor('#27ae60').setText('Correct! 🎉')
            this.btnRects[i].setFillStyle(0x2ecc71, 1)
            this.time.delayedCall(550, () => {
              if (!this.running) return
              this.locked = false
              this.newQuestion()
            })
          } else {
            this.lives--
            this.updateHud()
            this.feedbackText.setColor('#e74c3c').setText('Not quite!')
            this.btnRects[i].setFillStyle(0xe74c3c, 1)
            this.time.delayedCall(650, () => {
              if (this.lives <= 0) this.endGame()
              else if (this.running) { this.locked = false; this.newQuestion() }
            })
          }
        }

        endGame() {
          this.running = false
          this.locked = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You solved ${this.score} sums!`)
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
