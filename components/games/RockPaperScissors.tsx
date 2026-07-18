'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const CHOICES = ['rock', 'paper', 'scissors'] as const
type Choice = typeof CHOICES[number]
const EMOJI: Record<Choice, string> = { rock: '✊', paper: '✋', scissors: '✌️' }
// key beats value
const BEATS: Record<Choice, Choice> = { rock: 'scissors', scissors: 'paper', paper: 'rock' }
const BTN_XS = [80, 180, 280]
const BTN_Y = 400

export default function RockPaperScissors() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private scoreText!: Phaser.GameObjects.Text
        private bestText!: Phaser.GameObjects.Text
        private youEmoji!: Phaser.GameObjects.Text
        private cpuEmoji!: Phaser.GameObjects.Text
        private youLabel!: Phaser.GameObjects.Text
        private cpuLabel!: Phaser.GameObjects.Text
        private vsText!: Phaser.GameObjects.Text
        private resultText!: Phaser.GameObjects.Text
        private btnRects: Phaser.GameObjects.Rectangle[] = []
        private btnTexts: Phaser.GameObjects.Text[] = []
        private overlay!: Phaser.GameObjects.Container

        private streak = 0
        private best = 0
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#fff0f3')
          this.scoreText = this.add.text(14, 14, 'Streak: 0', {
            fontSize: '18px', color: '#e84393', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(3)
          this.bestText = this.add.text(W - 14, 14, 'Best: 0', {
            fontSize: '18px', color: '#e84393', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3)

          this.youLabel = this.add.text(95, 120, 'YOU', {
            fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.cpuLabel = this.add.text(265, 120, 'CPU', {
            fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.youEmoji = this.add.text(95, 180, '❔', { fontSize: '58px' }).setOrigin(0.5).setDepth(3)
          this.cpuEmoji = this.add.text(265, 180, '❔', { fontSize: '58px' }).setOrigin(0.5).setDepth(3)
          this.vsText = this.add.text(180, 180, 'VS', {
            fontSize: '24px', color: '#b2bec3', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)
          this.resultText = this.add.text(W / 2, 270, '', {
            fontSize: '24px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(3)

          for (let i = 0; i < 3; i++) {
            const rect = this.add.rectangle(BTN_XS[i], BTN_Y, 84, 84, 0xffffff, 1)
              .setStrokeStyle(3, 0xfab1c9).setDepth(1)
              .setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.play(CHOICES[i]))
            const txt = this.add.text(BTN_XS[i], BTN_Y, EMOJI[CHOICES[i]], { fontSize: '44px' })
              .setOrigin(0.5).setDepth(2)
            this.btnRects.push(rect)
            this.btnTexts.push(txt)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('ROCK PAPER\nSCISSORS', 'Beat the computer! Pick\nrock, paper or scissors.\nEvery win grows your streak\n— one loss ends it.')
        }

        setPlayVisible(v: boolean) {
          this.btnRects.forEach((r) => r.setVisible(v))
          this.btnTexts.forEach((t) => t.setVisible(v))
          this.youLabel.setVisible(v); this.cpuLabel.setVisible(v)
          this.youEmoji.setVisible(v); this.cpuEmoji.setVisible(v)
          this.vsText.setVisible(v)
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setPlayVisible(false)
          this.resultText.setText('')
          this.overlay.removeAll(true)
          const hasScore = this.streak > 0 || this.best > 0
          const bh = hasScore ? 270 : 240
          const bg = this.add.rectangle(0, 0, 320, bh, 0x6c2745, 0.95).setStrokeStyle(3, 0xe84393)
          const ty = hasScore ? -104 : -88
          const t = this.add.text(0, ty, title, {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            align: 'center',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 62, sub, {
            fontSize: '12px', color: '#ffd6e6', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (hasScore) {
            items.push(
              this.add.text(0, 40, `Last streak: ${this.streak}`, {
                fontSize: '15px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 62, `Best: ${this.best}`, {
                fontSize: '13px', color: '#e6a3c0', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = hasScore ? 104 : 80
          const btn = this.add.text(0, btnY, '[ PLAY ]', {
            fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#e84393', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          items.push(btn)
          this.overlay.add(items)
          this.overlay.setVisible(true)
        }

        startGame() {
          this.streak = 0
          this.locked = false
          this.running = true
          this.overlay.setVisible(false)
          this.setPlayVisible(true)
          this.youEmoji.setText('❔')
          this.cpuEmoji.setText('❔')
          this.resultText.setColor('#7f8c8d').setText('Make your move!')
          this.updateHud()
        }

        updateHud() {
          this.scoreText.setText(`Streak: ${this.streak}`)
          this.bestText.setText(`Best: ${this.best}`)
        }

        play(choice: Choice) {
          if (!this.running || this.locked) return
          this.locked = true
          const cpu = CHOICES[Math.floor(Math.random() * 3)]
          this.youEmoji.setText(EMOJI[choice])
          this.cpuEmoji.setText(EMOJI[cpu])

          if (choice === cpu) {
            this.resultText.setColor('#f39c12').setText('Tie! Go again')
            this.time.delayedCall(600, () => { if (this.running) this.locked = false })
          } else if (BEATS[choice] === cpu) {
            this.streak++
            this.best = Math.max(this.best, this.streak)
            this.updateHud()
            this.resultText.setColor('#27ae60').setText('You win! 🎉')
            this.time.delayedCall(600, () => { if (this.running) this.locked = false })
          } else {
            this.resultText.setColor('#e74c3c').setText('You lose!')
            this.time.delayedCall(800, () => this.endGame())
          }
        }

        endGame() {
          this.running = false
          this.locked = false
          this.best = Math.max(this.best, this.streak)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: this.streak } }))
          this.showOverlay('GAME OVER', `Your winning streak was ${this.streak}!`)
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
