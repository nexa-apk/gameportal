'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490

export default function QuickMath() {
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
        private eqText!: Phaser.GameObjects.Text
        private feedbackText!: Phaser.GameObjects.Text
        private yesRect!: Phaser.GameObjects.Rectangle
        private noRect!: Phaser.GameObjects.Rectangle
        private yesText!: Phaser.GameObjects.Text
        private noText!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        private score = 0
        private bestScore = 0
        private lives = 3
        private isTrue = true
        private qTime = 0
        private qMax = 3800
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#eafaf1')
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.livesText = this.add.text(W - 14, 14, '❤❤❤', {
            fontSize: '18px', color: '#e74c3c', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)

          this.eqText = this.add.text(W / 2, 150, '', {
            fontSize: '42px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.feedbackText = this.add.text(W / 2, 250, '', {
            fontSize: '20px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          this.yesRect = this.add.rectangle(105, 360, 130, 90, 0x2ecc71, 1)
            .setStrokeStyle(3, 0xffffff).setDepth(1).setInteractive({ useHandCursor: true })
          this.yesRect.on('pointerdown', () => this.answer(true))
          this.yesText = this.add.text(105, 360, '✓', {
            fontSize: '54px', color: '#ffffff', fontFamily: 'sans-serif', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(2)

          this.noRect = this.add.rectangle(255, 360, 130, 90, 0xe74c3c, 1)
            .setStrokeStyle(3, 0xffffff).setDepth(1).setInteractive({ useHandCursor: true })
          this.noRect.on('pointerdown', () => this.answer(false))
          this.noText = this.add.text(255, 360, '✗', {
            fontSize: '54px', color: '#ffffff', fontFamily: 'sans-serif', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(2)

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('QUICK MATH', 'Is the sum correct? Tap ✓\nif it is right, ✗ if it is\nwrong — before the timer\nruns out! 3 lives.')
        }

        setPlayVisible(v: boolean) {
          this.yesRect.setVisible(v); this.noRect.setVisible(v)
          this.yesText.setVisible(v); this.noText.setVisible(v)
          this.eqText.setVisible(v)
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setPlayVisible(false)
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 235
          const bg = this.add.rectangle(0, 0, 320, bh, 0x145a4a, 0.95).setStrokeStyle(3, 0x2ecc71)
          const ty = hasScore ? -98 : -84
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#c8f0e2', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 32, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 58, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#8fc9b8', fontFamily: 'monospace',
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
          this.lives = 3
          this.locked = false
          this.running = true
          this.overlay.setVisible(false)
          this.setPlayVisible(true)
          this.updateHud()
          this.newQuestion()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        newQuestion() {
          this.feedbackText.setText('')
          this.locked = false
          const maxNum = Math.min(30, 6 + this.score)
          const useSub = this.score >= 4 && Math.random() < 0.45
          let a: number, b: number, correct: number, op: string
          if (useSub) {
            a = 2 + Math.floor(Math.random() * maxNum)
            b = Math.floor(Math.random() * (a + 1))
            correct = a - b; op = '−'
          } else {
            a = 1 + Math.floor(Math.random() * maxNum)
            b = 1 + Math.floor(Math.random() * maxNum)
            correct = a + b; op = '+'
          }
          this.isTrue = Math.random() < 0.5
          let shown = correct
          if (!this.isTrue) {
            const off = (1 + Math.floor(Math.random() * 3)) * (Math.random() < 0.5 ? -1 : 1)
            shown = Math.max(0, correct + off)
            if (shown === correct) shown = correct + 1
          }
          this.eqText.setText(`${a} ${op} ${b} = ${shown}`)
          this.qMax = Math.max(1500, 3800 - this.score * 90)
          this.qTime = this.qMax
        }

        answer(saidTrue: boolean) {
          if (!this.running || this.locked) return
          this.locked = true
          if (saidTrue === this.isTrue) {
            this.score++
            this.updateHud()
            this.feedbackText.setColor('#27ae60').setText('Correct! 🎉')
            this.time.delayedCall(320, () => { if (this.running) this.newQuestion() })
          } else {
            this.loseLife('Wrong!')
          }
        }

        loseLife(msg: string) {
          this.lives--
          this.updateHud()
          this.feedbackText.setColor('#e74c3c').setText(msg)
          this.time.delayedCall(500, () => {
            if (this.lives <= 0) this.endGame()
            else if (this.running) this.newQuestion()
          })
        }

        endGame() {
          this.running = false
          this.locked = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You answered ${this.score} correctly!`)
        }

        update(_time: number, delta: number) {
          if (this.running && !this.locked) {
            this.qTime -= delta
            if (this.qTime <= 0) {
              this.qTime = 0
              this.locked = true
              this.loseLife('Too slow!')
            }
          }
          this.draw()
        }

        draw() {
          const g = this.gfx
          g.clear()
          if (!this.running) return
          // timer bar
          const barW = 260, barH = 14, bx = (W - barW) / 2, by = 200
          g.fillStyle(0xd5f0e8, 1)
          g.fillRoundedRect(bx, by, barW, barH, 7)
          const frac = Phaser.Math.Clamp(this.qTime / this.qMax, 0, 1)
          const col = frac > 0.5 ? 0x2ecc71 : frac > 0.25 ? 0xf1c40f : 0xe74c3c
          g.fillStyle(col, 1)
          if (frac > 0) g.fillRoundedRect(bx, by, barW * frac, barH, 7)
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
