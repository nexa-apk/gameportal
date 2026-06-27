'use client'
import { useEffect, useRef } from 'react'

const COLS = 4, ROWS = 4, TOTAL = COLS * ROWS
const CARD_W = 80, CARD_H = 80, PAD = 8
const W = COLS * (CARD_W + PAD) + PAD + 40, H = ROWS * (CARD_H + PAD) + PAD + 90
const EMOJIS = ['🐱', '🐶', '🦊', '🐸', '🦋', '🌸', '⭐', '🍕']

type Card = { emoji: string; flipped: boolean; matched: boolean; flipAnim: number }

export default function MemoryMatchGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      const Phaser = (await import('phaser')).default
      if (!isMounted || !containerRef.current || gameRef.current) return

      class GameScene extends Phaser.Scene {
        private cards: Card[] = []
        private flippedIdx: number[] = []
        private matched = 0
        private moves = 0
        private elapsed = 0
        private running = false
        private lockInput = false
        private gfx!: Phaser.GameObjects.Graphics
        private cardTexts: Phaser.GameObjects.Text[] = []
        private hud!: Phaser.GameObjects.Text
        private overlay!: Phaser.GameObjects.Container

        constructor() { super('Game') }

        create() {
          this.cameras.main.setBackgroundColor('#0f172a')
          this.gfx = this.add.graphics()
          this.hud = this.add.text(W / 2, 10, 'Moves: 0  Time: 0s', { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0).setDepth(2)
          this.overlay = this.add.container(W / 2, H / 2).setDepth(5)
          this.showOverlay('MEMORY MATCH', 'Flip cards to find\nall matching pairs!')

          this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!this.running) { this.startGame(); return }
            if (this.lockInput) return
            const offX = 20, offY = 60
            const c = Math.floor((p.x - offX) / (CARD_W + PAD))
            const r = Math.floor((p.y - offY) / (CARD_H + PAD))
            if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return
            const idx = r * COLS + c
            const card = this.cards[idx]
            if (!card || card.flipped || card.matched) return
            this.flipCard(idx)
          })
        }

        showOverlay(title: string, sub: string) {
          this.overlay.removeAll(true)
          const bg = this.add.rectangle(0, 0, 280, 200, 0x0f172a, 0.95).setStrokeStyle(2, 0xa855f7)
          const t = this.add.text(0, -70, title, { fontSize: '22px', color: '#a855f7', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5)
          const s = this.add.text(0, -25, sub, { fontSize: '13px', color: '#ccc', fontFamily: 'monospace', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5)
          const sc = this.moves > 0 ? this.add.text(0, 15, `${this.moves} moves in ${Math.round(this.elapsed)}s`, { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null
          const btn = this.add.text(0, 65, '[ PLAY ]', { fontSize: '20px', color: '#fff', fontFamily: 'monospace', fontStyle: 'bold', backgroundColor: '#a855f7', padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          btn.on('pointerdown', () => this.startGame())
          const items: Phaser.GameObjects.GameObject[] = [bg, t, s, btn]
          if (sc) items.push(sc)
          this.overlay.add(items); this.overlay.setVisible(true)
        }

        startGame() {
          const pairs = [...EMOJIS, ...EMOJIS]
          for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[pairs[i], pairs[j]] = [pairs[j], pairs[i]] }
          this.cards = pairs.map(e => ({ emoji: e, flipped: false, matched: false, flipAnim: 0 }))
          this.flippedIdx = []; this.matched = 0; this.moves = 0; this.elapsed = 0; this.lockInput = false
          this.running = true; this.overlay.setVisible(false)
          this.cardTexts.forEach(t => t.destroy()); this.cardTexts = []
        }

        flipCard(idx: number) {
          this.cards[idx].flipped = true
          this.flippedIdx.push(idx)
          if (this.flippedIdx.length === 2) {
            this.moves++
            const [a, b] = this.flippedIdx
            if (this.cards[a].emoji === this.cards[b].emoji) {
              this.cards[a].matched = true; this.cards[b].matched = true
              this.matched++; this.flippedIdx = []
              if (this.matched === TOTAL / 2) {
                this.running = false
                const memScore = Math.max(0, 10000 - this.moves * 100 - Math.round(this.elapsed) * 10)
                window.dispatchEvent(new CustomEvent('nexagames:score', { detail: { score: memScore } }))
                this.time.delayedCall(500, () => this.showOverlay('YOU WIN! 🎉', `${this.moves} moves in ${Math.round(this.elapsed)}s`))
              }
            } else {
              this.lockInput = true
              this.time.delayedCall(800, () => {
                this.cards[a].flipped = false; this.cards[b].flipped = false
                this.flippedIdx = []; this.lockInput = false
              })
            }
          }
        }

        update(_: number, delta: number) {
          if (this.running) this.elapsed += delta / 1000
          this.hud.setText(`Moves: ${this.moves}  Time: ${Math.round(this.elapsed)}s  Pairs: ${this.matched}/${TOTAL / 2}`)
          this.draw()
        }

        draw() {
          const g = this.gfx; g.clear()
          const offX = 20, offY = 60
          this.cardTexts.forEach(t => t.setVisible(false))
          let textIdx = 0
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const idx = r * COLS + c
              const card = this.cards[idx]
              const x = offX + c * (CARD_W + PAD), y = offY + r * (CARD_H + PAD)
              if (!card) {
                g.fillStyle(0x334155); g.fillRoundedRect(x, y, CARD_W, CARD_H, 10)
                continue
              }
              if (card.matched) {
                g.fillStyle(0x166534); g.fillRoundedRect(x, y, CARD_W, CARD_H, 10)
                g.fillStyle(0x22c55e, 0.3); g.fillRoundedRect(x, y, CARD_W, CARD_H, 10)
              } else if (card.flipped) {
                g.fillStyle(0x1e3a5f); g.fillRoundedRect(x, y, CARD_W, CARD_H, 10)
                g.lineStyle(2, 0x60a5fa); g.strokeRoundedRect(x, y, CARD_W, CARD_H, 10)
              } else {
                g.fillStyle(0x334155); g.fillRoundedRect(x, y, CARD_W, CARD_H, 10)
                g.fillStyle(0x475569, 0.5)
                for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect(x + 8 + i * 24, y + 8 + j * 24, 16, 16)
              }
              if (card.flipped || card.matched) {
                if (!this.cardTexts[textIdx]) {
                  this.cardTexts[textIdx] = this.add.text(0, 0, '', { fontSize: '32px' }).setDepth(1)
                }
                this.cardTexts[textIdx].setText(card.emoji).setPosition(x + CARD_W / 2, y + CARD_H / 2).setOrigin(0.5).setVisible(true)
                textIdx++
              }
            }
          }
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO, width: W, height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [GameScene],
      }
      gameRef.current = new Phaser.Game(config)
    }
    init()
    return () => { isMounted = false; gameRef.current?.destroy(true); gameRef.current = null }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
