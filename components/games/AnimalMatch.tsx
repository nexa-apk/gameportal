'use client'
import { useEffect, useRef } from 'react'

const W = 360, H = 490
const COLS = 4, ROWS = 4
const CARD_W = 74, CARD_H = 78
const GAP = 8
const GRID_W = COLS * CARD_W + (COLS - 1) * GAP
const START_X = (W - GRID_W) / 2 + CARD_W / 2
const START_Y = 96

const ANIMALS = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐸']

type Card = {
  animal: string
  state: 'down' | 'up' | 'matched'
}

export default function AnimalMatch() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private movesText!: Phaser.GameObjects.Text
        private pairsText!: Phaser.GameObjects.Text
        private cardRects: Phaser.GameObjects.Rectangle[] = []
        private cardTexts: Phaser.GameObjects.Text[] = []
        private overlay!: Phaser.GameObjects.Container

        private cards: Card[] = []
        private firstPick = -1
        private moves = 0
        private matchedPairs = 0
        private bestMoves = 0
        private running = false
        private locked = false

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#eafaf1')

          this.movesText = this.add.text(14, 14, 'Moves: 0', {
            fontSize: '18px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setDepth(2)
          this.pairsText = this.add.text(W - 14, 14, 'Pairs: 0/8', {
            fontSize: '18px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(2)

          for (let i = 0; i < COLS * ROWS; i++) {
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const x = START_X + col * (CARD_W + GAP)
            const y = START_Y + row * (CARD_H + GAP)
            const rect = this.add.rectangle(x, y, CARD_W, CARD_H, 0x1abc9c, 1)
              .setStrokeStyle(3, 0xffffff).setDepth(1)
              .setInteractive({ useHandCursor: true })
            rect.on('pointerdown', () => this.pick(i))
            const txt = this.add.text(x, y, '', {
              fontSize: '40px', fontFamily: 'sans-serif',
            }).setOrigin(0.5).setDepth(2)
            this.cardRects.push(rect)
            this.cardTexts.push(txt)
          }

          this.overlay = this.add.container(W / 2, H / 2).setDepth(10)
          this.showOverlay('ANIMAL MATCH', 'Flip two cards to find\nmatching animals. Match all\n8 pairs in as few moves\nas you can!')
        }

        setCardsVisible(v: boolean) {
          for (let i = 0; i < this.cardRects.length; i++) {
            this.cardRects[i].setVisible(v)
            this.cardTexts[i].setVisible(v)
          }
        }

        showOverlay(title: string, sub: string) {
          this.running = false
          this.setCardsVisible(false)
          this.overlay.removeAll(true)
          const done = this.matchedPairs === ANIMALS.length
          const bh = done ? 250 : 230
          const bg = this.add.rectangle(0, 0, 320, bh, 0xffffff, 0.97).setStrokeStyle(3, 0x16a085)
          const ty = done ? -95 : -78
          const t = this.add.text(0, ty, title, {
            fontSize: '24px', color: '#16a085', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5)
          const s = this.add.text(0, ty + 46, sub, {
            fontSize: '12px', color: '#555555', fontFamily: 'monospace',
            align: 'center', wordWrap: { width: 285 },
          }).setOrigin(0.5)
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s]
          if (done) {
            items.push(
              this.add.text(0, 30, `Done in ${this.moves} moves!`, {
                fontSize: '16px', color: '#27ae60', fontFamily: 'monospace', fontStyle: 'bold',
              }).setOrigin(0.5),
              this.add.text(0, 54, `Best: ${this.bestMoves} moves`, {
                fontSize: '13px', color: '#999999', fontFamily: 'monospace',
              }).setOrigin(0.5),
            )
          }
          const btnY = done ? 98 : 74
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
          const deck = [...ANIMALS, ...ANIMALS]
          for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]
          }
          this.cards = deck.map((animal) => ({ animal, state: 'down' as const }))
          this.firstPick = -1
          this.moves = 0
          this.matchedPairs = 0
          this.locked = false
          this.running = true
          this.overlay.setVisible(false)
          this.setCardsVisible(true)
          this.refresh()
          this.updateHud()
        }

        updateHud() {
          this.movesText.setText(`Moves: ${this.moves}`)
          this.pairsText.setText(`Pairs: ${this.matchedPairs}/${ANIMALS.length}`)
        }

        refresh() {
          for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i]
            const rect = this.cardRects[i]
            const txt = this.cardTexts[i]
            if (card.state === 'down') {
              rect.setFillStyle(0x1abc9c, 1).setStrokeStyle(3, 0xffffff)
              txt.setText('?').setFontSize(34).setColor('#ffffff')
            } else if (card.state === 'up') {
              rect.setFillStyle(0xffffff, 1).setStrokeStyle(3, 0xf1c40f)
              txt.setText(card.animal).setFontSize(40)
            } else {
              rect.setFillStyle(0xd5f5e3, 1).setStrokeStyle(3, 0x2ecc71)
              txt.setText(card.animal).setFontSize(40)
            }
          }
        }

        pick(i: number) {
          if (!this.running || this.locked) return
          const card = this.cards[i]
          if (card.state !== 'down') return

          card.state = 'up'
          this.refresh()

          if (this.firstPick === -1) {
            this.firstPick = i
            return
          }

          // second pick
          this.moves++
          this.updateHud()
          const first = this.cards[this.firstPick]
          if (first.animal === card.animal && this.firstPick !== i) {
            first.state = 'matched'
            card.state = 'matched'
            this.matchedPairs++
            this.firstPick = -1
            this.refresh()
            this.updateHud()
            if (this.matchedPairs === ANIMALS.length) {
              this.time.delayedCall(400, () => this.endGame())
            }
          } else {
            this.locked = true
            const a = this.firstPick
            const b = i
            this.firstPick = -1
            this.time.delayedCall(750, () => {
              if (this.cards[a].state === 'up') this.cards[a].state = 'down'
              if (this.cards[b].state === 'up') this.cards[b].state = 'down'
              this.locked = false
              this.refresh()
            })
          }
        }

        endGame() {
          this.running = false
          this.bestMoves = this.bestMoves === 0 ? this.moves : Math.min(this.bestMoves, this.moves)
          const score = Math.max(60, 900 - this.moves * 18)
          window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score } }))
          this.showOverlay('YOU WIN! 🎉', `All pairs matched!`)
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
