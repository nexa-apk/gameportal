'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const LAND_Y = 344
const BTN_XS = [64, 180, 296]
const BTN_Y = 420

type Option = { value: number; correct: boolean }

export default function MathRain() {
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
        private btnRects: Phaser.GameObjects.Rectangle[] = []
        private btnTexts: Phaser.GameObjects.Text[] = []
        private overlay!: Phaser.GameObjects.Container

        private score = 0
        private bestScore = 0
        private lives = 3
        private options: Option[] = []
        private eqY = 90
        private speed = 55
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0f2027')
          this.gfx = this.add.graphics()

          this.scoreText = this.add.text(14, 14, 'Score: 0', {
            fontSize: '18px', color: '#48dbfb', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.livesText = this.add.text(W - 14, 14, '❤❤❤', {
            fontSize: '18px', color: '#ff6b81', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)

          this.eqText = this.add.text(W / 2, 90, '', {
            fontSize: '34px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.feedbackText = this.add.text(W / 2, 370, '', {
            fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          const colors = [0x0abde3, 0x54a0ff, 0x00d2d3]
          for (let i = 0; i < 3; i++) {
            const rect = this.add.rectangle(BTN_XS[i], BTN_Y, 104, 62, colors[i], 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1).setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.answer(i))
            const txt = this.add.text(BTN_XS[i], BTN_Y, '', {
              fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(2)
            this.btnRects.push(rect)
            this.btnTexts.push(txt)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('MATH RAIN', 'A sum falls from the top.\nTap its answer below before\nit reaches the bottom line!\n3 lives.')
        }

        setPlayVisible(v: boolean) {
          for (let i = 0; i < 3; i++) { this.btnRects[i].setVisible(v); this.btnTexts[i].setVisible(v) }
          this.eqText.setVisible(v)
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setPlayVisible(false)
          this.feedbackText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.score > 0
          const bh = hasScore ? 255 : 235
          const bg = this.add.rectangle(0, 0, 320, bh, 0x0a2833, 0.96).setStrokeStyle(3, 0x0abde3)
          const ty = hasScore ? -98 : -84
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#48dbfb', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#a8e6ef', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 32, `Score: ${this.score}`, {
                fontSize: '18px', color: '#2ecc71', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 58, `Best: ${this.bestScore}`, {
                fontSize: '13px', color: '#7fb3bf', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 100 : 78
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#08313d', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#0abde3', padding: { x: 18, y: 10 },
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
          this.newEquation()
        }

        updateHud() {
          this.scoreText.setText(`Score: ${this.score}`)
          this.livesText.setText('❤'.repeat(Math.max(0, this.lives)))
        }

        newEquation() {
          this.feedbackText.setText('')
          this.locked = false
          this.eqY = 84
          const maxNum = Math.min(20, 5 + this.score)
          const useSub = this.score >= 4 && Math.random() < 0.4
          let a: number, b: number, answer: number, op: string
          if (useSub) {
            a = 2 + Math.floor(Math.random() * maxNum)
            b = Math.floor(Math.random() * (a + 1))
            answer = a - b; op = '−'
          } else {
            a = 1 + Math.floor(Math.random() * maxNum)
            b = 1 + Math.floor(Math.random() * maxNum)
            answer = a + b; op = '+'
          }
          this.eqText.setText(`${a} ${op} ${b}`)
          this.eqText.setY(this.eqY)
          this.speed = Math.min(165, 55 + this.score * 4)

          const values = new Set<number>([answer])
          let guard = 0
          while (values.size < 3 && guard < 40) {
            guard++
            const delta = (1 + Math.floor(Math.random() * 4)) * (Math.random() < 0.5 ? -1 : 1)
            const cand = answer + delta
            if (cand >= 0) values.add(cand)
          }
          let filler = answer + 1
          while (values.size < 3) { if (filler >= 0) values.add(filler); filler++ }
          const arr = Array.from(values)
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          this.options = arr.map((v) => ({ value: v, correct: v === answer }))
          for (let i = 0; i < 3; i++) {
            this.btnTexts[i].setText(String(this.options[i].value))
            this.btnRects[i].setFillStyle([0x0abde3, 0x54a0ff, 0x00d2d3][i], 1)
          }
        }

        answer(i: number) {
          if (!this.running || this.locked) return
          this.locked = true
          if (this.options[i].correct) {
            this.score++
            this.updateHud()
            this.feedbackText.setColor('#2ecc71').setText('Correct! 🎉')
            this.btnRects[i].setFillStyle(0x2ecc71, 1)
            this.time.delayedCall(280, () => { if (this.running) this.newEquation() })
          } else {
            this.btnRects[i].setFillStyle(0xe74c3c, 1)
            this.loseLife('Wrong!')
          }
        }

        loseLife(msg: string) {
          this.lives--
          this.updateHud()
          this.feedbackText.setColor('#ff6b81').setText(msg)
          this.time.delayedCall(500, () => {
            if (this.lives <= 0) this.endGame()
            else if (this.running) this.newEquation()
          })
        }

        endGame() {
          this.running = false
          this.locked = false
          this.bestScore = Math.max(this.bestScore, this.score)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.score } }))
          this.showOverlay('GAME OVER', `You solved ${this.score} sums!`)
        }

        update(_time: number, delta: number) {
          if (this.running && !this.locked) {
            this.eqY += this.speed * delta / 1000
            this.eqText.setY(this.eqY)
            if (this.eqY >= LAND_Y) {
              this.locked = true
              this.loseLife('Missed!')
            }
          }
          this.draw()
        }

        draw() {
          const g = this.gfx
          g.clear()
          // land line
          g.lineStyle(2, 0xff6b81, 0.6)
          g.lineBetween(20, LAND_Y, W - 20, LAND_Y)
          g.fillStyle(0xff6b81, 0.08)
          g.fillRect(0, LAND_Y, W, H - LAND_Y)
          // HUD backdrop
          g.fillStyle(0x0f2027, 0.85)
          g.fillRect(0, 0, W, 46)
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
