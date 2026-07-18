'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490

type Option = { value: number; correct: boolean }

export default function KidsMath() {
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
          this.cameras.main.setBackgroundColor('#fff6e6')

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#e67e22', fontFamily: 'monospace', fontStyle: 'bold',
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

          const btnColors = [0x3498db, 0x9b59b6, 0x1abc9c]
          for (let i = 0; i < 3; i++) {
            const y = 260 + i * 68
            const rect = this.add.rectangle(W / 2, y, 250, 56, btnColors[i], 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1)
              .setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.answer(i))
            const txt = this.add.text(W / 2, y, '', {
              fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(2)
            this.btnRects.push(rect)
            this.btnTexts.push(txt)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('KIDS MATH', 'Solve the sum and tap the\ncorrect answer. You have\n3 lives — good luck!')
        }

        setButtonsVisible(v: boolean) {
          for (let i = 0; i < 3; i++) {
            this.btnRects[i].setVisible(v)
            this.btnTexts[i].setVisible(v)
          }
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setButtonsVisible(false)
          this.questionText.setText('')
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 250 : 210
          const bg = this.add.rectangle(0, 0, 310, bh, 0xffffff, 0.97).setStrokeStyle(3, 0xe67e22)
          const ty = hasScore ? -95 : -75
          const t = this.add.text(0, ty, title, {
            fontSize: '26px', color: '#e67e22', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 48, sub, {
            fontSize: '12px', color: '#555555', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 275 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 22, `Score: ${this.score}`, {
                fontSize: '18px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 50, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#999999', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 96 : 60
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#e67e22', padding: { x: 18, y: 10 },
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
          const maxNum = Math.min(50, 9 + level * 4)
          const useSub = this.score >= 4 && Math.random() < 0.45
          let a: number, b: number, answer: number, opSym: string
          if (useSub) {
            a = 2 + Math.floor(Math.random() * maxNum)
            b = Math.floor(Math.random() * (a + 1))
            answer = a - b
            opSym = '−'
          } else {
            a = 1 + Math.floor(Math.random() * maxNum)
            b = 1 + Math.floor(Math.random() * maxNum)
            answer = a + b
            opSym = '+'
          }
          this.questionText.setText(`${a} ${opSym} ${b} = ?`)

          // Build distractors
          const values = new Set<number>([answer])
          const spread = Math.max(2, Math.floor(maxNum / 4))
          let guard = 0
          while (values.size < 3 && guard < 40) {
            guard++
            const delta = (1 + Math.floor(Math.random() * spread)) * (Math.random() < 0.5 ? -1 : 1)
            const cand = answer + delta
            if (cand >= 0) values.add(cand)
          }
          // Fallback fill if collisions prevented 3 unique values
          let filler = answer + 1
          while (values.size < 3) { if (filler >= 0) values.add(filler); filler++ }

          const arr = Array.from(values)
          // Fisher-Yates shuffle
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          this.options = arr.map((v) => ({ value: v, correct: v === answer }))
          for (let i = 0; i < 3; i++) {
            this.btnTexts[i].setText(String(this.options[i].value))
            this.btnRects[i].setFillStyle([0x3498db, 0x9b59b6, 0x1abc9c][i], 1)
          }
        }

        answer(i: number) {
          if (!this.running || this.locked) return
          this.locked = true
          const opt = this.options[i]
          if (opt.correct) {
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
            this.feedbackText.setColor('#e74c3c').setText('Oops! Try again')
            this.btnRects[i].setFillStyle(0xe74c3c, 1)
            this.time.delayedCall(650, () => {
              if (this.lives <= 0) {
                this.endGame()
              } else if (this.running) {
                this.locked = false
                this.newQuestion()
              }
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
