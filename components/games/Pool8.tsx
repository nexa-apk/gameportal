'use client'
import { useEffect, useRef } from 'react'

const W = 720, H = 480
const TL = 60, TR = 660, TT = 80, TB = 380
const MID_X = (TL + TR) / 2
const MID_Y = (TT + TB) / 2
const BALL_R = 9
const POCKET_R = 14
const FRICTION_K = 0.70
const CUSHION_REST = 0.78
const BALL_REST = 0.97
const STOP_V = 1.2
const CUE_LEN = 158
const MAX_PULLBACK = 46
const MAX_SHOT_SPEED = 920
const CHARGE_RATE = 0.62
const SHOOT_ANIM_DUR = 0.20
const METER_CX = 690
const METER_W = 14
const METER_TOP = TT + 5
const METER_BOT = TB - 5
const SPIN_CX = 690
const SPIN_CY = 430
const SPIN_R = 22
const TIMER_MAX = 30

const POCKETS: { x: number; y: number }[] = [
  { x: TL, y: TT }, { x: MID_X, y: TT }, { x: TR, y: TT },
  { x: TL, y: TB }, { x: MID_X, y: TB }, { x: TR, y: TB },
]
const BALL_COLORS: number[] = [
  0xfafafa, 0xf5c400, 0x1a3fce, 0xd62020, 0x7c22c8,
  0xe85c00, 0x15822d, 0x8b1520, 0x111111,
  0xf5c400, 0x1a3fce, 0xd62020, 0x7c22c8,
  0xe85c00, 0x15822d, 0x8b1520,
]
const IS_STRIPE: boolean[] = [
  false, false, false, false, false, false, false, false, false,
  true, true, true, true, true, true, true,
]
const RACK: number[][] = [
  [1], [9, 2], [3, 8, 10], [11, 4, 12, 5], [6, 13, 7, 14, 15],
]

type Ball = { x: number; y: number; vx: number; vy: number; num: number; active: boolean }
type GamePhase = 'ready' | 'rolling' | 'ballInHand' | 'win'
type Group = 'solid' | 'stripe' | null
type CpuDiff = 'easy' | 'medium' | 'hard'

export default function Pool8() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      const Phaser = (await import('phaser')).default
      if (!mounted || !containerRef.current || gameRef.current) return

      class PoolScene extends Phaser.Scene {
        // ── Core state ──────────────────────────────────────────────────────────
        private screen: 'menu' | 'game' = 'menu'
        private phase: GamePhase = 'ready'
        private vsMode: 'cpu' | 'hotseat' = 'cpu'
        private cpuDiff: CpuDiff = 'medium'

        // ── Player / rules ──────────────────────────────────────────────────────
        private currentPlayer = 0
        private playerName = ['Player 1', 'Player 2']
        private playerGroup: [Group, Group] = [null, null]
        private isBreak = true
        private cueFirstHit: Ball | null = null
        private pottedThisTurn: number[] = []
        private cuePottedThisTurn = false
        private winner = -1

        // ── Ball-in-hand ────────────────────────────────────────────────────────
        private placeX = MID_X
        private placeY = MID_Y

        // ── Foul popup ──────────────────────────────────────────────────────────
        private foulTimer = 0

        // ── Aiming ──────────────────────────────────────────────────────────────
        private aimAngle = 0
        private power = 0
        private charging = false
        private spin = { x: 0, y: 0 }
        private spinDragging = false
        private shootAnim = -1
        private shotPower = 0
        private shotAngle = 0
        private shotSpinX = 0
        private shotSpinY = 0

        // ── Turn timer ───────────────────────────────────────────────────────────
        private timerRemaining = TIMER_MAX
        private timerActive = false

        // ── Stats ────────────────────────────────────────────────────────────────
        private playerBallsPotted: [number, number] = [0, 0]
        private playerFouls: [number, number] = [0, 0]
        private playerShots: [number, number] = [0, 0]

        // ── Phaser objects ──────────────────────────────────────────────────────
        private balls: Ball[] = []
        private texts: (Phaser.GameObjects.Text | null)[] = []
        private gfx!: Phaser.GameObjects.Graphics
        private menuItems: Phaser.GameObjects.GameObject[] = []
        private winObjs: Phaser.GameObjects.GameObject[] = []
        private cpuTimer: Phaser.Time.TimerEvent | null = null

        // HUD texts (game screen only)
        private hudP1!: Phaser.GameObjects.Text
        private hudP2!: Phaser.GameObjects.Text
        private hudTurn!: Phaser.GameObjects.Text
        private hudFoul!: Phaser.GameObjects.Text
        private pwrLabel!: Phaser.GameObjects.Text
        private spinLabel!: Phaser.GameObjects.Text

        constructor() { super('Pool8') }

        // ── create ──────────────────────────────────────────────────────────────
        create() {
          this.cameras.main.setBackgroundColor('#0a0a14')
          this.gfx = this.add.graphics()

          this.pwrLabel = this.add.text(METER_CX, METER_TOP - 14, 'PWR', {
            fontSize: '9px', color: '#777777', fontFamily: 'monospace',
          }).setOrigin(0.5).setDepth(10).setVisible(false)

          this.spinLabel = this.add.text(SPIN_CX, SPIN_CY - SPIN_R - 10, 'SPIN', {
            fontSize: '9px', color: '#777777', fontFamily: 'monospace',
          }).setOrigin(0.5).setDepth(10).setVisible(false)

          this.hudTurn = this.add.text(MID_X, TB + 8, '', {
            fontSize: '12px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5, 0).setDepth(10).setVisible(false)

          this.hudP1 = this.add.text(8, TB + 8, '', {
            fontSize: '11px', color: '#cccccc', fontFamily: 'monospace',
          }).setDepth(10).setVisible(false)

          this.hudP2 = this.add.text(W - 8, TB + 8, '', {
            fontSize: '11px', color: '#cccccc', fontFamily: 'monospace',
          }).setOrigin(1, 0).setDepth(10).setVisible(false)

          this.hudFoul = this.add.text(MID_X, TB + 52, '', {
            fontSize: '13px', color: '#ff5555', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5, 0).setDepth(10).setVisible(false)

          this.setupInput()
          this.showMenu()
        }

        // ── Input ───────────────────────────────────────────────────────────────
        private setupInput() {
          this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
            if (this.screen !== 'game') return

            if (this.phase === 'ballInHand' && !this.isCpuTurn()) {
              this.placeX = Phaser.Math.Clamp(ptr.x, TL + BALL_R + 1, TR - BALL_R - 1)
              this.placeY = Phaser.Math.Clamp(ptr.y, TT + BALL_R + 1, TB - BALL_R - 1)
              return
            }

            const cue = this.getCue()
            if (cue) this.aimAngle = Math.atan2(ptr.y - cue.y, ptr.x - cue.x)

            if (this.spinDragging) {
              const dx = ptr.x - SPIN_CX, dy = ptr.y - SPIN_CY
              const d = Math.hypot(dx, dy)
              if (d < 0.001) return
              const s = Math.min(d, SPIN_R) / SPIN_R
              this.spin.x = (dx / d) * s; this.spin.y = (dy / d) * s
            }
          })

          this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            if (this.screen !== 'game') return
            if (this.phase === 'win') return  // handled by win screen buttons

            if (this.phase === 'ballInHand') {
              if (this.isCpuTurn()) return
              if (this.validPlacement(this.placeX, this.placeY))
                this.placeCueBall(this.placeX, this.placeY)
              return
            }

            if (this.phase !== 'ready' || this.shootAnim >= 0) return
            if (this.isCpuTurn()) return

            if (Math.hypot(ptr.x - SPIN_CX, ptr.y - SPIN_CY) <= SPIN_R + 4) {
              this.spinDragging = true
              const dx = ptr.x - SPIN_CX, dy = ptr.y - SPIN_CY
              const d = Math.max(Math.hypot(dx, dy), 0.001)
              this.spin.x = (dx / d) * Math.min(d, SPIN_R) / SPIN_R
              this.spin.y = (dy / d) * Math.min(d, SPIN_R) / SPIN_R
              return
            }

            this.charging = true
            this.power = 0
          })

          this.input.on('pointerup', () => {
            if (this.screen !== 'game') return
            this.spinDragging = false
            if (!this.charging) return
            this.charging = false
            if (this.phase !== 'ready' || this.power < 0.02 || this.shootAnim >= 0) return
            if (this.isCpuTurn()) return

            this.shotPower = this.power; this.shotAngle = this.aimAngle
            this.shotSpinX = this.spin.x; this.shotSpinY = this.spin.y
            this.shootAnim = SHOOT_ANIM_DUR; this.power = 0
          })
        }

        private isCpuTurn() {
          return this.vsMode === 'cpu' && this.currentPlayer === 1
        }

        // ── Menu ────────────────────────────────────────────────────────────────
        private showMenu() {
          this.screen = 'menu'
          this.cpuTimer?.remove(); this.cpuTimer = null
          this.winObjs.forEach(o => o.destroy()); this.winObjs = []
          this.timerActive = false
          this.menuItems.forEach(o => o.destroy()); this.menuItems = []
          this.texts.forEach(t => t?.destroy()); this.texts = []; this.balls = []
          this.hudP1.setVisible(false); this.hudP2.setVisible(false)
          this.hudTurn.setVisible(false); this.hudFoul.setVisible(false)
          this.pwrLabel.setVisible(false); this.spinLabel.setVisible(false)

          const add = (x: number, y: number, txt: string, size: string, col: string, bold = true) => {
            const t = this.add.text(x, y, txt, {
              fontSize: size, color: col, fontFamily: 'monospace', fontStyle: bold ? 'bold' : 'normal',
            }).setOrigin(0.5).setDepth(20)
            this.menuItems.push(t); return t
          }

          add(W / 2, 72, '8-BALL POOL', '34px', '#ffd700')
          add(W / 2, 114, 'NexaGames', '13px', '#666666', false)

          const btnCfg = (col: string) => ({
            fontSize: '17px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: col, padding: { x: 22, y: 11 },
          })

          const cpuBtn = this.add.text(W / 2 - 105, 174, '  vs CPU  ', btnCfg('#1a5c2a'))
            .setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true })
          cpuBtn.on('pointerover', () => cpuBtn.setStyle({ color: '#ffdd00' }))
          cpuBtn.on('pointerout',  () => cpuBtn.setStyle({ color: '#ffffff' }))
          cpuBtn.on('pointerdown', () => { this.vsMode = 'cpu'; this.playerName[1] = 'CPU'; this.startGame() })
          this.menuItems.push(cpuBtn)

          const fsBtn = this.add.text(W / 2 + 110, 174, '  vs Friend  ', btnCfg('#1a2c5c'))
            .setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true })
          fsBtn.on('pointerover', () => fsBtn.setStyle({ color: '#ffdd00' }))
          fsBtn.on('pointerout',  () => fsBtn.setStyle({ color: '#ffffff' }))
          fsBtn.on('pointerdown', () => { this.vsMode = 'hotseat'; this.playerName[1] = 'Player 2'; this.startGame() })
          this.menuItems.push(fsBtn)

          add(W / 2, 236, 'CPU DIFFICULTY', '11px', '#888888')

          const diffs: CpuDiff[] = ['easy', 'medium', 'hard']
          const dCols: Record<CpuDiff, string> = { easy: '#33cc44', medium: '#ffcc00', hard: '#ff4433' }
          diffs.forEach((d, i) => {
            const active = this.cpuDiff === d
            const btn = this.add.text(W / 2 + (i - 1) * 118, 264, d.toUpperCase(), {
              fontSize: '13px', color: active ? dCols[d] : '#444444',
              fontFamily: 'monospace', fontStyle: 'bold',
              backgroundColor: active ? '#1a1a1a' : '#0d0d0d',
              padding: { x: 14, y: 7 },
            }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true })
            btn.on('pointerdown', () => { this.cpuDiff = d; this.showMenu() })
            this.menuItems.push(btn)
          })

          add(W / 2, 320, 'Hold to charge power  •  Release to shoot', '10px', '#444444', false)
          add(W / 2, 340, 'Click SPIN circle for english  •  Ball-in-hand after fouls', '10px', '#444444', false)
        }

        private startGame() {
          this.menuItems.forEach(o => o.destroy()); this.menuItems = []
          this.screen = 'game'
          this.pwrLabel.setVisible(true); this.spinLabel.setVisible(true)
          this.hudP1.setVisible(true); this.hudP2.setVisible(true); this.hudTurn.setVisible(true)
          this.doRack()
        }

        // ── Rack & turn management ───────────────────────────────────────────────
        private doRack() {
          this.winObjs.forEach(o => o.destroy()); this.winObjs = []
          this.playerBallsPotted = [0, 0]
          this.playerFouls = [0, 0]
          this.playerShots = [0, 0]
          this.balls = []
          const rackX = TL + (TR - TL) * 0.75
          const dX = BALL_R * 2, dY = BALL_R * Math.sqrt(3)
          for (let col = 0; col < RACK.length; col++) {
            const cn = RACK[col], ci = (cn.length - 1) / 2
            for (let row = 0; row < cn.length; row++)
              this.balls.push({ x: rackX + col * dX, y: MID_Y + (row - ci) * dY, vx: 0, vy: 0, num: cn[row], active: true })
          }
          this.balls.push({ x: TL + (TR - TL) / 4, y: MID_Y, vx: 0, vy: 0, num: 0, active: true })

          this.texts.forEach(t => t?.destroy())
          this.texts = this.balls.map(b => {
            if (b.num === 0) return null
            return this.add.text(b.x, b.y, String(b.num), {
              fontSize: b.num >= 10 ? '6px' : '7px',
              color: b.num === 8 ? '#ffffff' : '#000000',
              fontFamily: 'Arial', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(6)
          })

          this.currentPlayer = 0; this.playerGroup = [null, null]
          this.isBreak = true; this.winner = -1
          this.hudFoul.setVisible(false)
          this.startTurn()
        }

        private startTurn() {
          this.cueFirstHit = null; this.pottedThisTurn = []; this.cuePottedThisTurn = false
          this.power = 0; this.charging = false; this.spin = { x: 0, y: 0 }
          this.shootAnim = -1; this.phase = 'ready'
          this.timerRemaining = TIMER_MAX
          this.timerActive = !this.isCpuTurn()
          this.updateHUD()

          if (this.isCpuTurn()) {
            this.cpuTimer = this.time.delayedCall(880, () => {
              if (this.phase === 'ready' && this.isCpuTurn() && this.screen === 'game')
                this.doCpuShot()
            })
          }
        }

        private updateHUD() {
          const p = this.currentPlayer
          const grpStr = (g: Group) => g === 'solid' ? 'Solids' : g === 'stripe' ? 'Stripes' : '?'
          const rem = (i: number) => {
            const g = this.playerGroup[i]
            if (!g) return 7
            return this.balls.filter(b => b.active && b.num !== 0 && b.num !== 8 && IS_STRIPE[b.num] === (g === 'stripe')).length
          }

          const p1active = p === 0, p2active = p === 1
          this.hudP1.setColor(p1active ? '#44ff88' : '#888888')
          this.hudP2.setColor(p2active ? '#44ff88' : '#888888')

          this.hudP1.setText(`${this.playerName[0]}\n${grpStr(this.playerGroup[0])}\n${rem(0)} balls`)
          this.hudP2.setText(`${this.playerName[1]}\n${grpStr(this.playerGroup[1])}\n${rem(1)} balls`)

          if (this.phase === 'win') {
            this.hudTurn.setColor('#ffd700').setText('')
          } else if (this.phase === 'ballInHand') {
            this.hudTurn.setColor('#ff9944').setText(`${this.playerName[p]}: place cue ball anywhere, then click`)
          } else {
            const indicator = this.isCpuTurn() ? '[ CPU thinking... ]' : '[ Your shot ]'
            this.hudTurn.setColor('#ffd700').setText(`${this.playerName[p]}  ${indicator}`)
          }
        }

        // ── Rules ────────────────────────────────────────────────────────────────
        private evaluateTurn() {
          const p = this.currentPlayer, opp = 1 - p
          let foul = false, foulReason = ''

          if (this.cuePottedThisTurn) { foul = true; foulReason = 'Scratch!' }

          if (!foul && !this.isBreak && this.playerGroup[p] !== null) {
            if (!this.cueFirstHit) {
              foul = true; foulReason = 'No contact!'
            } else {
              const hitStripe = IS_STRIPE[this.cueFirstHit.num]
              if (hitStripe !== (this.playerGroup[p] === 'stripe')) {
                foul = true; foulReason = 'Wrong ball hit!'
              }
            }
          }

          if (this.pottedThisTurn.includes(8)) {
            if (this.isBreak) {
              const eb = this.balls.find(b => b.num === 8)
              if (eb) { eb.active = true; eb.x = TL + (TR - TL) * 0.75; eb.y = MID_Y; eb.vx = 0; eb.vy = 0 }
              this.pottedThisTurn = this.pottedThisTurn.filter(n => n !== 8)
            } else if (!foul) {
              const ownLeft = this.getOwnBalls(p).length
              this.endGame(ownLeft === 0 ? p : opp); return
            }
          }

          if (foul) {
            this.playerFouls[p]++
            const cue = this.balls.find(b => b.num === 0)
            if (cue) { cue.active = false; cue.vx = 0; cue.vy = 0 }
            this.placeX = MID_X; this.placeY = MID_Y
            this.showFoul(foulReason + '  Ball in hand.')
            this.currentPlayer = opp; this.isBreak = false
            this.phase = 'ballInHand'; this.updateHUD()
            if (this.isCpuTurn()) {
              this.time.delayedCall(700, () => {
                if (this.phase === 'ballInHand' && this.isCpuTurn()) this.cpuPlaceBall()
              })
            }
            return
          }

          if (this.playerGroup[p] === null) {
            const first = this.pottedThisTurn.find(n => n !== 8)
            if (first !== undefined) {
              const stripe = IS_STRIPE[first]
              this.playerGroup[p] = stripe ? 'stripe' : 'solid'
              this.playerGroup[opp] = stripe ? 'solid' : 'stripe'
            }
          }

          const ownPotted = this.pottedThisTurn.filter(n => n !== 8 &&
            (this.playerGroup[p] === null || IS_STRIPE[n] === (this.playerGroup[p] === 'stripe')))
          this.playerBallsPotted[p] += ownPotted.length

          this.isBreak = false
          if (ownPotted.length > 0) { this.startTurn() } else { this.currentPlayer = opp; this.startTurn() }
        }

        private getOwnBalls(p: number): Ball[] {
          const g = this.playerGroup[p]
          if (!g) return []
          return this.balls.filter(b => b.active && b.num !== 0 && b.num !== 8 && IS_STRIPE[b.num] === (g === 'stripe'))
        }

        private showFoul(msg: string) {
          this.hudFoul.setText(msg).setVisible(true)
          this.foulTimer = 2.8
        }

        private endGame(winnerIdx: number) {
          this.winner = winnerIdx; this.phase = 'win'
          this.hudFoul.setVisible(false)
          this.timerActive = false
          this.cpuTimer?.remove(); this.cpuTimer = null
          this.updateHUD()
          const score = winnerIdx === 0 ? 100 : 0
          if (typeof window !== 'undefined')
            window.dispatchEvent(new CustomEvent('nexagames:score', {
              detail: { game: 'pool-8', player: this.playerName[winnerIdx], score }
            }))
          this.showWinScreen()
        }

        private showWinScreen() {
          this.winObjs.forEach(o => o.destroy()); this.winObjs = []
          const w = this.winner
          const winColor = w === 0 ? '#44ff88' : '#ff6644'

          const bg = this.add.graphics().setDepth(50)
          bg.fillStyle(0x000000, 0.84); bg.fillRect(0, 0, W, H)
          bg.fillStyle(0x111122, 0.95); bg.fillRoundedRect(W/2 - 220, 60, 440, 330, 12)
          bg.lineStyle(2, w === 0 ? 0x44ff88 : 0xff6644, 0.7)
          bg.strokeRoundedRect(W/2 - 220, 60, 440, 330, 12)
          this.winObjs.push(bg)

          const trophy = this.add.text(W / 2, 102, '\u{1F3C6}', {
            fontSize: '38px', fontFamily: 'monospace',
          }).setOrigin(0.5).setDepth(51)
          this.winObjs.push(trophy)

          const title = this.add.text(W / 2, 152, `${this.playerName[w]} WINS!`, {
            fontSize: '30px', color: winColor, fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(51)
          this.winObjs.push(title)

          // Stats table
          const p0 = this.playerName[0].substring(0, 10)
          const p1 = this.playerName[1].substring(0, 10)
          const col0w = 110
          const statsHeader = this.add.text(W / 2, 198,
            `${''.padEnd(16)}${p0.padEnd(col0w / 8)}   ${p1}`, {
            fontSize: '12px', color: '#aaaaaa', fontFamily: 'monospace', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(51)
          this.winObjs.push(statsHeader)

          const statsRows = [
            ['Balls Potted', this.playerBallsPotted[0], this.playerBallsPotted[1]],
            ['Fouls', this.playerFouls[0], this.playerFouls[1]],
            ['Shots Taken', this.playerShots[0], this.playerShots[1]],
          ] as [string, number, number][]

          const statsBlock = statsRows.map(([label, v0, v1]) =>
            `${label.padEnd(14)}   ${String(v0).padStart(3)}             ${String(v1).padStart(3)}`
          ).join('\n')

          const statsText = this.add.text(W / 2, 218, statsBlock, {
            fontSize: '13px', color: '#cccccc', fontFamily: 'monospace', lineSpacing: 8,
          }).setOrigin(0.5, 0).setDepth(51)
          this.winObjs.push(statsText)

          // Divider
          const div = this.add.graphics().setDepth(51)
          div.lineStyle(1, 0x333355, 0.8); div.lineBetween(W/2 - 180, 312, W/2 + 180, 312)
          this.winObjs.push(div)

          // Rematch button
          const remBtn = this.add.text(W / 2 - 90, 340, '  REMATCH  ', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#1a5c2a', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true })
          remBtn.on('pointerover', () => remBtn.setStyle({ color: '#ffdd00' }))
          remBtn.on('pointerout',  () => remBtn.setStyle({ color: '#ffffff' }))
          remBtn.on('pointerdown', () => {
            this.winObjs.forEach(o => o.destroy()); this.winObjs = []
            this.doRack()
          })
          this.winObjs.push(remBtn)

          // Main Menu button
          const menuBtn = this.add.text(W / 2 + 100, 340, '  MAIN MENU  ', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
            backgroundColor: '#2a1a4c', padding: { x: 18, y: 10 },
          }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true })
          menuBtn.on('pointerover', () => menuBtn.setStyle({ color: '#ffdd00' }))
          menuBtn.on('pointerout',  () => menuBtn.setStyle({ color: '#ffffff' }))
          menuBtn.on('pointerdown', () => {
            this.winObjs.forEach(o => o.destroy()); this.winObjs = []
            this.showMenu()
          })
          this.winObjs.push(menuBtn)
        }

        // ── Ball-in-hand ─────────────────────────────────────────────────────────
        private validPlacement(x: number, y: number): boolean {
          if (x - BALL_R < TL || x + BALL_R > TR || y - BALL_R < TT || y + BALL_R > TB) return false
          return !this.balls.some(b => b.active && b.num !== 0 && Math.hypot(x - b.x, y - b.y) < BALL_R * 2 + 1)
        }

        private placeCueBall(x: number, y: number) {
          let cue = this.balls.find(b => b.num === 0)
          if (!cue) { cue = { x, y, vx: 0, vy: 0, num: 0, active: true }; this.balls.push(cue); this.texts.push(null) }
          else { cue.x = x; cue.y = y; cue.vx = 0; cue.vy = 0; cue.active = true }
          this.startTurn()
        }

        private cpuPlaceBall() {
          const candidates = [
            { x: TL + (TR - TL) * 0.25, y: MID_Y },
            { x: TL + (TR - TL) * 0.20, y: MID_Y - 45 },
            { x: TL + (TR - TL) * 0.20, y: MID_Y + 45 },
            { x: TL + (TR - TL) * 0.30, y: MID_Y - 25 },
            { x: TL + (TR - TL) * 0.30, y: MID_Y + 25 },
          ]
          for (const pos of candidates) {
            if (this.validPlacement(pos.x, pos.y)) { this.placeCueBall(pos.x, pos.y); return }
          }
          for (let i = 0; i < 40; i++) {
            const x = TL + BALL_R * 2 + Math.random() * (TR - TL - BALL_R * 4)
            const y = TT + BALL_R * 2 + Math.random() * (TB - TT - BALL_R * 4)
            if (this.validPlacement(x, y)) { this.placeCueBall(x, y); return }
          }
        }

        // ── Turn timer expiry ─────────────────────────────────────────────────────
        private timerExpired() {
          this.playerFouls[this.currentPlayer]++
          const opp = 1 - this.currentPlayer
          const cue = this.balls.find(b => b.num === 0)
          if (cue) { cue.active = false; cue.vx = 0; cue.vy = 0 }
          this.placeX = MID_X; this.placeY = MID_Y
          this.showFoul("Time's up!  Ball in hand.")
          this.currentPlayer = opp; this.isBreak = false
          this.phase = 'ballInHand'; this.updateHUD()
          if (this.isCpuTurn()) {
            this.time.delayedCall(700, () => {
              if (this.phase === 'ballInHand' && this.isCpuTurn()) this.cpuPlaceBall()
            })
          }
        }

        // ── CPU AI ───────────────────────────────────────────────────────────────
        private doCpuShot() {
          const cue = this.getCue(); if (!cue) return
          const grp = this.playerGroup[1]
          let ownBalls = this.balls.filter(b => b.active && b.num !== 0 && b.num !== 8 &&
            (grp === null || IS_STRIPE[b.num] === (grp === 'stripe')))
          if (ownBalls.length === 0) ownBalls = this.balls.filter(b => b.active && b.num === 8)

          if (this.cpuDiff === 'easy') {
            this.cpuEasyShot(cue, ownBalls)
          } else if (this.cpuDiff === 'medium') {
            this.cpuMediumShot(cue, ownBalls)
          } else {
            this.cpuHardShot(cue, ownBalls)
          }
        }

        private cpuEasyShot(cue: Ball, targets: Ball[]) {
          if (targets.length === 0) { this.fireCpuShot(Math.random() * Math.PI * 2, 0.30 + Math.random() * 0.30); return }
          const ball = targets[Math.floor(Math.random() * targets.length)]
          let bestPocket = POCKETS[0], bestDist = Infinity
          for (const pk of POCKETS) {
            const d = Math.hypot(pk.x - ball.x, pk.y - ball.y)
            if (d < bestDist) { bestDist = d; bestPocket = pk }
          }
          const bpDx = bestPocket.x - ball.x, bpDy = bestPocket.y - ball.y
          const bpLen = Math.hypot(bpDx, bpDy)
          const ghostX = ball.x - (bpDx / bpLen) * BALL_R * 2
          const ghostY = ball.y - (bpDy / bpLen) * BALL_R * 2
          let angle = Math.atan2(ghostY - cue.y, ghostX - cue.x)
          angle += (Math.random() - 0.5) * 0.58
          this.fireCpuShot(angle, 0.30 + Math.random() * 0.32)
        }

        private cpuMediumShot(cue: Ball, targets: Ball[]) {
          const best = this.findBestPot(cue, targets)
          if (best) {
            this.fireCpuShot(best.angle + (Math.random() - 0.5) * 0.10, 0.40 + Math.random() * 0.35)
          } else {
            this.cpuEasyShot(cue, targets)
          }
        }

        private cpuHardShot(cue: Ball, targets: Ball[]) {
          const best = this.findBestPot(cue, targets)
          if (best && best.score > 0.18) {
            this.fireCpuShot(best.angle + (Math.random() - 0.5) * 0.03, 0.45 + Math.random() * 0.35)
          } else {
            // Safe shot: push own ball toward a cushion, minimise opponent opportunity
            if (targets.length > 0) {
              const ball = targets[Math.floor(Math.random() * targets.length)]
              const angle = Math.atan2(ball.y - cue.y, ball.x - cue.x) + (Math.random() - 0.5) * 0.15
              this.fireCpuShot(angle, 0.22 + Math.random() * 0.20)
            } else {
              this.fireCpuShot(Math.random() * Math.PI * 2, 0.20 + Math.random() * 0.20)
            }
          }
        }

        private findBestPot(cue: Ball, targets: Ball[]): { score: number; angle: number } | null {
          let best: { score: number; angle: number } | null = null
          for (const ball of targets) {
            for (const pk of POCKETS) {
              const r = this.cpuRatePot(cue, ball, pk)
              if (r && (!best || r.score > best.score)) best = r
            }
          }
          return best
        }

        private cpuRatePot(cue: Ball, ball: Ball, pocket: { x: number; y: number }): { score: number; angle: number } | null {
          const bpDx = pocket.x - ball.x, bpDy = pocket.y - ball.y
          const bpLen = Math.hypot(bpDx, bpDy)
          if (bpLen < 2) return null
          const bpNx = bpDx / bpLen, bpNy = bpDy / bpLen
          const ghostX = ball.x - bpNx * BALL_R * 2, ghostY = ball.y - bpNy * BALL_R * 2
          const aDx = ghostX - cue.x, aDy = ghostY - cue.y
          const aLen = Math.hypot(aDx, aDy)
          if (aLen < 2) return null
          const aNx = aDx / aLen, aNy = aDy / aLen

          // Check cue path for obstructions
          for (const b of this.balls) {
            if (!b.active || b === ball || b.num === 0) continue
            const ex = cue.x - b.x, ey = cue.y - b.y
            const bv = ex * aNx + ey * aNy, cv = ex * ex + ey * ey - 4 * BALL_R * BALL_R
            const disc = bv * bv - cv
            if (disc >= 0) { const t = -bv - Math.sqrt(disc); if (t > 2 && t < aLen - BALL_R) return null }
          }
          // Check ball-to-pocket path for obstructions
          for (const b of this.balls) {
            if (!b.active || b === ball) continue
            const ex = ball.x - b.x, ey = ball.y - b.y
            const bv = ex * bpNx + ey * bpNy, cv = ex * ex + ey * ey - 4 * BALL_R * BALL_R
            const disc = bv * bv - cv
            if (disc >= 0) { const t = -bv - Math.sqrt(disc); if (t > 2 && t < bpLen - BALL_R) return null }
          }

          const cutCos = Math.max(0, aNx * bpNx + aNy * bpNy)
          const distScore = Math.exp(-aLen / 400)
          const pocketScore = Math.exp(-bpLen / 250)
          const score = cutCos * 0.55 + distScore * 0.25 + pocketScore * 0.20
          return { score, angle: Math.atan2(aDy, aDx) }
        }

        private fireCpuShot(angle: number, power: number) {
          this.aimAngle = angle; this.shotAngle = angle
          this.shotPower = Math.min(1, Math.max(0.10, power))
          this.power = this.shotPower
          this.shotSpinX = 0; this.shotSpinY = 0
          this.shootAnim = SHOOT_ANIM_DUR
        }

        // ── Update ───────────────────────────────────────────────────────────────
        update(_t: number, delta: number) {
          const dt = Math.min(delta / 1000, 0.05)

          if (this.foulTimer > 0) {
            this.foulTimer -= dt
            if (this.foulTimer <= 0) this.hudFoul.setVisible(false)
          }

          if (this.screen === 'menu') { this.drawMenu(); return }

          // Turn timer — only ticks during ready phase, not while balls move
          if (this.timerActive && this.phase === 'ready') {
            this.timerRemaining -= dt
            if (this.timerRemaining <= 0) {
              this.timerActive = false
              this.timerExpired()
            }
          }

          if (this.charging && this.phase === 'ready' && !this.isCpuTurn())
            this.power = Math.min(1, this.power + CHARGE_RATE * dt)

          if (this.shootAnim >= 0) {
            this.shootAnim -= dt
            if (this.shootAnim <= 0) { this.shootAnim = -1; this.fireShot() }
          }

          if (this.phase === 'rolling') {
            this.stepPhysics(dt)
            if (this.allStopped()) {
              for (const b of this.balls) if (b.active) { b.vx = 0; b.vy = 0 }
              this.evaluateTurn()
            }
          }

          this.drawGame()
        }

        private getCue(): Ball | undefined { return this.balls.find(b => b.active && b.num === 0) }

        private fireShot() {
          const cue = this.getCue(); if (!cue) return
          this.playerShots[this.currentPlayer]++
          const speed = this.shotPower * MAX_SHOT_SPEED
          const ax = Math.cos(this.shotAngle), ay = Math.sin(this.shotAngle)
          const fwd = 1 - this.shotSpinY * 0.08
          cue.vx = ax * speed * fwd + (-ay) * this.shotSpinX * speed * 0.10
          cue.vy = ay * speed * fwd + ( ax) * this.shotSpinX * speed * 0.10
          this.phase = 'rolling'
        }

        // ── Physics ──────────────────────────────────────────────────────────────
        private allStopped() {
          return this.balls.every(b => !b.active || (Math.abs(b.vx) < STOP_V && Math.abs(b.vy) < STOP_V))
        }

        private stepPhysics(dt: number) {
          const ff = Math.exp(-FRICTION_K * dt)
          for (const b of this.balls) {
            if (!b.active) continue
            b.vx *= ff; b.vy *= ff
            if (Math.hypot(b.vx, b.vy) < STOP_V) { b.vx = 0; b.vy = 0; continue }
            b.x += b.vx * dt; b.y += b.vy * dt
          }
          for (const b of this.balls) {
            if (!b.active) continue
            for (const p of POCKETS) {
              if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R + BALL_R * 0.4) {
                b.active = false
                if (b.num === 0) this.cuePottedThisTurn = true
                else if (!this.pottedThisTurn.includes(b.num)) this.pottedThisTurn.push(b.num)
                break
              }
            }
          }
          for (const b of this.balls) {
            if (!b.active) continue
            if (b.x - BALL_R < TL) { b.x = TL + BALL_R; b.vx =  Math.abs(b.vx) * CUSHION_REST }
            if (b.x + BALL_R > TR) { b.x = TR - BALL_R; b.vx = -Math.abs(b.vx) * CUSHION_REST }
            if (b.y - BALL_R < TT) { b.y = TT + BALL_R; b.vy =  Math.abs(b.vy) * CUSHION_REST }
            if (b.y + BALL_R > TB) { b.y = TB - BALL_R; b.vy = -Math.abs(b.vy) * CUSHION_REST }
          }
          for (let iter = 0; iter < 3; iter++)
            for (let i = 0; i < this.balls.length - 1; i++) {
              if (!this.balls[i].active) continue
              for (let j = i + 1; j < this.balls.length; j++) {
                if (!this.balls[j].active) continue
                this.solveBall(this.balls[i], this.balls[j])
              }
            }
        }

        private solveBall(a: Ball, b: Ball) {
          const dx = b.x - a.x, dy = b.y - a.y
          const d2 = dx * dx + dy * dy, minD = BALL_R * 2
          if (d2 >= minD * minD || d2 < 1e-6) return
          const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist
          const ov = (minD - dist) * 0.5
          a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov
          const dvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
          if (dvn >= 0) return
          if (!this.cueFirstHit) {
            if (a.num === 0) this.cueFirstHit = b
            else if (b.num === 0) this.cueFirstHit = a
          }
          const j = dvn * BALL_REST
          a.vx += j * nx; a.vy += j * ny; b.vx -= j * nx; b.vy -= j * ny
        }

        // ── Ray casting ───────────────────────────────────────────────────────────
        private wallT(cx: number, cy: number, dx: number, dy: number): number {
          let t = 2000
          if (dx < -0.001) t = Math.min(t, (TL + BALL_R - cx) / dx)
          if (dx >  0.001) t = Math.min(t, (TR - BALL_R - cx) / dx)
          if (dy < -0.001) t = Math.min(t, (TT + BALL_R - cy) / dy)
          if (dy >  0.001) t = Math.min(t, (TB - BALL_R - cy) / dy)
          return Math.max(t, 1)
        }

        private computeAim(cue: Ball) {
          const dx = Math.cos(this.aimAngle), dy = Math.sin(this.aimAngle)
          const cx = cue.x, cy = cue.y
          let minT = Infinity, hitBall: Ball | null = null
          for (const b of this.balls) {
            if (!b.active || b.num === 0) continue
            const ex = cx - b.x, ey = cy - b.y
            const bv = 2 * (ex * dx + ey * dy)
            const cv = ex * ex + ey * ey - 4 * BALL_R * BALL_R
            const disc = bv * bv - 4 * cv
            if (disc < 0) continue
            const t = (-bv - Math.sqrt(disc)) / 2
            if (t > 2 && t < minT) { minT = t; hitBall = b }
          }
          const wt = this.wallT(cx, cy, dx, dy)
          if (hitBall && minT < wt) {
            const ghostX = cx + dx * minT, ghostY = cy + dy * minT
            return { endX: ghostX, endY: ghostY, ghostX, ghostY, hitBall,
              tnx: (hitBall.x - ghostX) / (2 * BALL_R), tny: (hitBall.y - ghostY) / (2 * BALL_R) }
          }
          const endX = cx + dx * wt, endY = cy + dy * wt
          return { endX, endY, ghostX: endX, ghostY: endY, hitBall: null as Ball | null, tnx: 0, tny: 0 }
        }

        // ── Colour lerp ───────────────────────────────────────────────────────────
        private lerpCol(a: number, b: number, t: number): number {
          const r  = Math.round(((a >> 16) & 0xff) + (((b >> 16) & 0xff) - ((a >> 16) & 0xff)) * t)
          const gv = Math.round(((a >>  8) & 0xff) + (((b >>  8) & 0xff) - ((a >>  8) & 0xff)) * t)
          const bv = Math.round(( a        & 0xff) + (( b        & 0xff) - ( a        & 0xff)) * t)
          return (r << 16) | (gv << 8) | bv
        }

        // ── Draw dispatch ─────────────────────────────────────────────────────────
        private drawMenu() {
          const g = this.gfx; g.clear()
          g.fillStyle(0x06060f); g.fillRect(0, 0, W, H)
          g.fillStyle(0x0d3d14, 0.25); g.fillRect(TL, TT, TR - TL, TB - TT)
          g.lineStyle(1.5, 0x1a6b2e, 0.4); g.strokeRect(TL, TT, TR - TL, TB - TT)
          g.fillStyle(0x060606)
          for (const p of POCKETS) g.fillCircle(p.x, p.y, POCKET_R * 0.6)
        }

        private drawGame() {
          const g = this.gfx; g.clear()
          this.drawTable(g)
          const cue = this.getCue()
          const inAim = this.phase === 'ready' && !!cue && this.shootAnim < 0 && !this.isCpuTurn()
          if (inAim) this.drawAimGuide(g, cue!)
          this.drawBalls(g)
          if (this.phase === 'ballInHand' && !this.isCpuTurn()) this.drawBallInHand(g)
          if (cue && (inAim || this.shootAnim >= 0)) this.drawCueStick(g, cue)
          this.drawPowerMeter(g)
          this.drawSpinControl(g)
          this.drawPlayerPanels(g)
          if (this.timerActive && this.phase === 'ready') this.drawTimerBar(g)
        }

        // ── Timer bar ─────────────────────────────────────────────────────────────
        private drawTimerBar(g: Phaser.GameObjects.Graphics) {
          const frac = Math.max(0, this.timerRemaining / TIMER_MAX)
          const p = this.currentPlayer
          const bx = p === 0 ? 3 : W - 283
          const by = H - 12
          const bw = 280
          g.fillStyle(0x111111, 0.85); g.fillRect(bx, by, bw, 7)
          const col = frac > 0.66 ? 0x33cc44 : frac > 0.33 ? 0xffcc00 : 0xff4433
          g.fillStyle(col, 0.92); g.fillRect(bx, by, bw * frac, 7)
          g.lineStyle(0.5, 0x444444, 0.7); g.strokeRect(bx, by, bw, 7)
        }

        // ── Ball-in-hand ghost ────────────────────────────────────────────────────
        private drawBallInHand(g: Phaser.GameObjects.Graphics) {
          const ok = this.validPlacement(this.placeX, this.placeY)
          g.lineStyle(2, ok ? 0x44ff88 : 0xff4444, 0.85)
          g.strokeCircle(this.placeX, this.placeY, BALL_R)
          g.fillStyle(0xfafafa, ok ? 0.45 : 0.2)
          g.fillCircle(this.placeX, this.placeY, BALL_R)
          g.fillStyle(0xffffff, 0.55)
          g.fillCircle(this.placeX - BALL_R * 0.28, this.placeY - BALL_R * 0.32, BALL_R * 0.27)
        }

        // ── Player panels ─────────────────────────────────────────────────────────
        private drawPlayerPanels(g: Phaser.GameObjects.Graphics) {
          const p = this.currentPlayer
          const panelH = H - TB - 6
          g.lineStyle(1.5, p === 0 ? 0x44ff88 : 0x225522, p === 0 ? 0.7 : 0.25)
          g.strokeRect(3, TB + 3, 280, panelH)
          g.lineStyle(1.5, p === 1 ? 0x44ff88 : 0x225522, p === 1 ? 0.7 : 0.25)
          g.strokeRect(W - 283, TB + 3, 280, panelH)

          this.drawBallDots(g, 0, 16, TB + 62)
          this.drawBallDots(g, 1, W - 16, TB + 62)
        }

        private drawBallDots(g: Phaser.GameObjects.Graphics, player: number, anchorX: number, y: number) {
          const grp = this.playerGroup[player]; if (!grp) return
          const nums = grp === 'solid' ? [1,2,3,4,5,6,7] : [9,10,11,12,13,14,15]
          const dir = player === 0 ? 1 : -1
          const startX = player === 0 ? anchorX : anchorX - nums.length * 15 + dir
          nums.forEach((n, i) => {
            const alive = this.balls.find(b => b.num === n)?.active ?? false
            const cx = startX + i * 15
            if (alive) {
              g.fillStyle(BALL_COLORS[n]); g.fillCircle(cx, y, 5.5)
              g.lineStyle(0.5, 0x000000, 0.3); g.strokeCircle(cx, y, 5.5)
            } else {
              g.lineStyle(0.7, 0x333333); g.strokeCircle(cx, y, 5.5)
              g.fillStyle(0x111111); g.fillCircle(cx, y, 3)
            }
          })
        }

        // ── Aim guide ─────────────────────────────────────────────────────────────
        private drawAimGuide(g: Phaser.GameObjects.Graphics, cue: Ball) {
          const aim = this.computeAim(cue)
          const dx = Math.cos(this.aimAngle), dy = Math.sin(this.aimAngle)
          const dist = Math.hypot(aim.endX - cue.x, aim.endY - cue.y)
          for (let t = BALL_R + 6; t < dist; t += 9) {
            g.fillStyle(0xffffff, 0.48 * (1 - t / (dist + 60) * 0.4))
            g.fillCircle(cue.x + dx * t, cue.y + dy * t, 1.8)
          }
          if (aim.hitBall) {
            g.lineStyle(1.5, 0xffffff, 0.48); g.strokeCircle(aim.ghostX, aim.ghostY, BALL_R)
            g.fillStyle(0xffffff, 0.12); g.fillCircle(aim.ghostX, aim.ghostY, BALL_R)
            const ex = aim.hitBall.x + aim.tnx * 68, ey = aim.hitBall.y + aim.tny * 68
            g.lineStyle(2, 0xffd040, 0.72); g.lineBetween(aim.hitBall.x, aim.hitBall.y, ex, ey)
            const pnx = -aim.tny, pny = aim.tnx
            g.fillStyle(0xffd040, 0.72)
            g.fillTriangle(ex, ey,
              ex - aim.tnx * 9 + pnx * 4, ey - aim.tny * 9 + pny * 4,
              ex - aim.tnx * 9 - pnx * 4, ey - aim.tny * 9 - pny * 4)
          }
        }

        // ── Cue stick helpers ─────────────────────────────────────────────────────
        private quad(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, stroke = false) {
          g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.lineTo(x3,y3); g.lineTo(x4,y4); g.closePath()
          stroke ? g.strokePath() : g.fillPath()
        }

        private drawCueStick(g: Phaser.GameObjects.Graphics, cue: Ball) {
          const angle = this.shootAnim >= 0 ? this.shotAngle : this.aimAngle
          const ax = Math.cos(angle), ay = Math.sin(angle), px = -ay, py = ax
          const pb = this.shootAnim >= 0
            ? this.shotPower * MAX_PULLBACK * (1 - (1 - this.shootAnim / SHOOT_ANIM_DUR))
            : this.power * MAX_PULLBACK
          const tipX = cue.x - ax * (BALL_R + 3 + pb), tipY = cue.y - ay * (BALL_R + 3 + pb)
          const butX = tipX - ax * CUE_LEN, butY = tipY - ay * CUE_LEN
          g.fillStyle(0xb8793a)
          this.quad(g, tipX+px*1.25,tipY+py*1.25, tipX-px*1.25,tipY-py*1.25, butX-px*4,butY-py*4, butX+px*4,butY+py*4)
          const gX = butX + ax*CUE_LEN*0.14, gY = butY + ay*CUE_LEN*0.14
          g.fillStyle(0x221100)
          this.quad(g, gX+px*3.5,gY+py*3.5, gX-px*3.5,gY-py*3.5, butX-px*4,butY-py*4, butX+px*4,butY+py*4)
          const tE = tipX-ax*5, tF = tipY-ay*5
          g.fillStyle(0x3399cc)
          this.quad(g, tipX+px*1.25,tipY+py*1.25, tipX-px*1.25,tipY-py*1.25, tE-px*0.8,tF-py*0.8, tE+px*0.8,tF+py*0.8)
          g.lineStyle(0.7, 0x000000, 0.28)
          this.quad(g, tipX+px*1.25,tipY+py*1.25, tipX-px*1.25,tipY-py*1.25, butX-px*4,butY-py*4, butX+px*4,butY+py*4, true)
        }

        // ── Power meter ───────────────────────────────────────────────────────────
        private drawPowerMeter(g: Phaser.GameObjects.Graphics) {
          const bx = METER_CX - METER_W / 2, mH = METER_BOT - METER_TOP
          g.fillStyle(0x111111, 0.85); g.fillRoundedRect(bx-3, METER_TOP-3, METER_W+6, mH+6, 3)
          g.fillStyle(0x1a1a1a); g.fillRect(bx, METER_TOP, METER_W, mH)
          const p = this.shootAnim >= 0 ? this.shotPower : this.power
          const fh = p * mH
          if (fh > 1) {
            const col = p < 0.5 ? this.lerpCol(0x22cc55, 0xffcc00, p/0.5) : this.lerpCol(0xffcc00, 0xff2200, (p-0.5)/0.5)
            g.fillStyle(col); g.fillRect(bx, METER_BOT - fh, METER_W, fh)
            g.fillStyle(col, 0.32); g.fillRect(bx-1, METER_BOT-fh-2, METER_W+2, 3)
          }
          g.lineStyle(0.8, 0x444444, 0.65)
          for (let i=1;i<10;i++) g.lineBetween(bx, METER_BOT-(i/10)*mH, bx+METER_W, METER_BOT-(i/10)*mH)
          g.lineStyle(1, 0x555555); g.strokeRect(bx, METER_TOP, METER_W, mH)
        }

        // ── Spin control ──────────────────────────────────────────────────────────
        private drawSpinControl(g: Phaser.GameObjects.Graphics) {
          g.fillStyle(0x0a0a0a, 0.88); g.fillCircle(SPIN_CX, SPIN_CY, SPIN_R+5)
          g.fillStyle(0x0d3d14); g.fillCircle(SPIN_CX, SPIN_CY, SPIN_R)
          g.lineStyle(0.7, 0x1a8040, 0.45)
          g.lineBetween(SPIN_CX-SPIN_R, SPIN_CY, SPIN_CX+SPIN_R, SPIN_CY)
          g.lineBetween(SPIN_CX, SPIN_CY-SPIN_R, SPIN_CX, SPIN_CY+SPIN_R)
          g.fillStyle(0x33aa55, 0.55); g.fillCircle(SPIN_CX, SPIN_CY, 2.5)
          const sdx = this.spin.x*(SPIN_R-6), sdy = this.spin.y*(SPIN_R-6)
          g.fillStyle(0xffffff, 0.92); g.fillCircle(SPIN_CX+sdx, SPIN_CY+sdy, 4.5)
          g.lineStyle(1, 0x555555); g.strokeCircle(SPIN_CX+sdx, SPIN_CY+sdy, 4.5)
          g.lineStyle(1.5, 0x666666, 0.65); g.strokeCircle(SPIN_CX, SPIN_CY, SPIN_R)
        }

        // ── Table ─────────────────────────────────────────────────────────────────
        private drawTable(g: Phaser.GameObjects.Graphics) {
          g.fillStyle(0x2e1200); g.fillRect(0, 0, W, H)
          g.fillStyle(0x4a2000); g.fillRect(TL-18, TT-18, TR-TL+36, TB-TT+36)
          g.fillStyle(0x0d4d1a); g.fillRect(TL-13, TT-13, TR-TL+26, TB-TT+26)
          g.fillStyle(0x1a6b2e); g.fillRect(TL, TT, TR-TL, TB-TT)
          g.lineStyle(1, 0x176027, 0.12)
          for (let y=TT+30;y<TB;y+=30) g.lineBetween(TL,y,TR,y)
          for (let x=TL+30;x<TR;x+=30) g.lineBetween(x,TT,x,TB)
          g.fillStyle(0x28a048, 0.5)
          g.lineStyle(1, 0x28a048, 0.22); g.lineBetween(TL+(TR-TL)/4, TT, TL+(TR-TL)/4, TB)
          g.fillCircle(MID_X, MID_Y, 3); g.fillCircle(TL+(TR-TL)*0.75, MID_Y, 3)
          g.fillStyle(0xf0e68c, 0.75)
          for (let i=1;i<=7;i++) { const dx=TL+(TR-TL)*i/8; g.fillCircle(dx,TT-7,2.5); g.fillCircle(dx,TB+7,2.5) }
          for (let i=1;i<=3;i++) { const dy=TT+(TB-TT)*i/4; g.fillCircle(TL-7,dy,2.5); g.fillCircle(TR+7,dy,2.5) }
          g.lineStyle(3, 0x6b3800); g.strokeRect(TL-20, TT-20, TR-TL+40, TB-TT+40)
          for (const p of POCKETS) {
            g.fillStyle(0x000000,0.6); g.fillCircle(p.x,p.y,POCKET_R+4)
            g.fillStyle(0x060606); g.fillCircle(p.x,p.y,POCKET_R)
            g.lineStyle(3,0x2e1200); g.strokeCircle(p.x,p.y,POCKET_R+2)
          }
        }

        // ── Balls ─────────────────────────────────────────────────────────────────
        private drawBalls(g: Phaser.GameObjects.Graphics) {
          for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i], txt = this.texts[i]
            if (!b.active) { txt?.setVisible(false); continue }
            const col = BALL_COLORS[b.num], stripe = IS_STRIPE[b.num]
            if (stripe) {
              g.fillStyle(0xffffff); g.fillCircle(b.x, b.y, BALL_R)
              const band = Math.floor(BALL_R * 0.56); g.fillStyle(col)
              for (let dy=-band;dy<=band;dy++) {
                const hw = Math.sqrt(Math.max(0, BALL_R*BALL_R - dy*dy))
                g.fillRect(b.x-hw+0.5, b.y+dy, hw*2-1, 1)
              }
            } else { g.fillStyle(col); g.fillCircle(b.x, b.y, BALL_R) }
            g.lineStyle(1, 0x000000, 0.4); g.strokeCircle(b.x, b.y, BALL_R)
            g.fillStyle(0xffffff, b.num===0?0.72:0.42); g.fillCircle(b.x-BALL_R*0.28, b.y-BALL_R*0.32, BALL_R*0.27)
            txt?.setPosition(b.x, b.y).setVisible(true)
          }
        }
      }

      const config: import('phaser').Types.Core.GameConfig = {
        type: Phaser.AUTO, width: W, height: H,
        parent: containerRef.current,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [PoolScene],
        backgroundColor: '#06060f',
      }
      gameRef.current = new Phaser.Game(config)
    }

    init()
    return () => {
      mounted = false
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
