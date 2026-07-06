# NexaGames — Add 5 New Games (Part A: Games 1–3)
# Run this in Claude Code on server 192.168.0.103 at /opt/gameportal

---

## GAME 1: Endless Runner (`/games/endless-runner`)

### File: `src/app/games/endless-runner/page.tsx`

```tsx
import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Endless Runner — NexaGames',
  description: 'Run, jump and slide to dodge obstacles in this addictive endless runner! How far can you go?',
  openGraph: {
    title: 'Endless Runner — NexaGames',
    description: 'Run, jump and slide to dodge obstacles. No download needed!',
    url: 'https://fun.nexahost.top/games/endless-runner',
  },
}

export default function EndlessRunnerPage() {
  return (
    <GameWrapper
      gameId="endless-runner"
      title="Endless Runner"
      description="Run, jump and slide to dodge obstacles! How far can you go?"
      genre="arcade"
      controls={[
        { key: 'Space / ↑', action: 'Jump' },
        { key: 'Space (air)', action: 'Double Jump' },
        { key: '↓ / S', action: 'Slide' },
      ]}
    />
  )
}
```

### File: `src/app/games/endless-runner/game.ts`

```typescript
// Phaser game config loader for Endless Runner
export const gameConfig = {
  id: 'endless-runner',
  script: '/games/endless-runner/main.js',
  width: 800,
  height: 300,
}
```

### File: `public/games/endless-runner/main.js`

```javascript
(function () {
  const W = 800, H = 300;

  class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    preload() {
      // Draw assets via graphics — no external files needed
    }

    create() {
      this.speed = 300;
      this.score = 0;
      this.gameOver = false;
      this.doubleJumpAvailable = false;
      this.isSliding = false;

      // Ground
      this.ground = this.add.rectangle(W / 2, H - 10, W, 20, 0x00ff88);

      // Player
      this.player = this.add.rectangle(120, H - 50, 30, 50, 0x00cfff);
      this.physics.add.existing(this.player);
      this.player.body.setGravityY(800);
      this.player.body.setCollideWorldBounds(true);

      // Ground physics
      this.groundGroup = this.physics.add.staticGroup();
      const groundPhys = this.add.rectangle(W / 2, H - 10, W, 20, 0x00ff88);
      this.groundGroup.add(groundPhys);
      this.physics.add.collider(this.player, this.groundGroup);

      // Obstacles group
      this.obstacles = this.physics.add.group();

      // Score text
      this.scoreTxt = this.add.text(16, 16, 'Score: 0', {
        fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
      });

      // Combo / speed text
      this.speedTxt = this.add.text(W - 150, 16, 'Speed: 1x', {
        fontSize: '16px', fill: '#aaffaa', fontFamily: 'monospace'
      });

      // Controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.input.on('pointerdown', () => this.tryJump());

      // Spawn obstacles
      this.obstacleTimer = this.time.addEvent({
        delay: 1600,
        callback: this.spawnObstacle,
        callbackScope: this,
        loop: true
      });

      // Score ticker
      this.time.addEvent({
        delay: 100,
        callback: () => {
          if (!this.gameOver) {
            this.score++;
            this.scoreTxt.setText('Score: ' + this.score);
            // Every 10 pts increase speed
            if (this.score % 20 === 0) {
              this.speed = Math.min(this.speed + 20, 700);
              const mult = (this.speed / 300).toFixed(1);
              this.speedTxt.setText('Speed: ' + mult + 'x');
            }
          }
        },
        loop: true
      });

      // Collision = game over
      this.physics.add.overlap(this.player, this.obstacles, () => {
        if (!this.gameOver) this.endGame();
      });
    }

    tryJump() {
      if (this.gameOver) return;
      const onGround = this.player.body.blocked.down;
      if (onGround) {
        this.player.body.setVelocityY(-550);
        this.doubleJumpAvailable = true;
        this.isSliding = false;
        this.player.height = 50;
        this.player.body.reset(this.player.x, this.player.y);
      } else if (this.doubleJumpAvailable) {
        this.player.body.setVelocityY(-480);
        this.doubleJumpAvailable = false;
        // Flash player cyan
        this.tweens.add({ targets: this.player, alpha: 0.4, duration: 80, yoyo: true });
      }
    }

    spawnObstacle() {
      if (this.gameOver) return;
      const type = Phaser.Math.Between(0, 2);
      let obs;
      if (type === 0) {
        // Tall block
        obs = this.obstacles.create(W + 20, H - 50, null);
        obs.setDisplaySize(25, 60);
        obs.setTint(0xff4444);
      } else if (type === 1) {
        // Low wide block (must slide)
        obs = this.obstacles.create(W + 20, H - 25, null);
        obs.setDisplaySize(60, 30);
        obs.setTint(0xffaa00);
      } else {
        // Floating block (must duck under or jump over)
        obs = this.obstacles.create(W + 20, H - 110, null);
        obs.setDisplaySize(25, 40);
        obs.setTint(0xff00ff);
      }
      obs.body.setAllowGravity(false);
      obs.body.setVelocityX(-this.speed);
    }

    update() {
      if (this.gameOver) return;

      const onGround = this.player.body.blocked.down;

      // Jump
      if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
           Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
           Phaser.Input.Keyboard.JustDown(this.wKey))) {
        this.tryJump();
      }

      // Slide
      if ((this.cursors.down.isDown || this.sKey.isDown) && onGround) {
        if (!this.isSliding) {
          this.isSliding = true;
          this.player.setDisplaySize(40, 25);
        }
      } else if (!this.cursors.down.isDown && !this.sKey.isDown && this.isSliding) {
        this.isSliding = false;
        this.player.setDisplaySize(30, 50);
      }

      // Clean up off-screen obstacles
      this.obstacles.getChildren().forEach(obs => {
        if (obs.x < -60) obs.destroy();
      });
    }

    endGame() {
      this.gameOver = true;
      this.obstacleTimer.remove();

      // Dark overlay
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

      this.add.text(W / 2, H / 2 - 40, 'GAME OVER', {
        fontSize: '36px', fill: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(W / 2, H / 2, 'Score: ' + this.score, {
        fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0.5);

      const restart = this.add.text(W / 2, H / 2 + 50, '[ PLAY AGAIN ]', {
        fontSize: '20px', fill: '#00ff88', fontFamily: 'monospace'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      restart.on('pointerover', () => restart.setFill('#ffffff'));
      restart.on('pointerout', () => restart.setFill('#00ff88'));
      restart.on('pointerdown', () => this.scene.restart());
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#1a1a2e',
    parent: 'game-container',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: GameScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    }
  };

  new Phaser.Game(config);
})();
```

---

## GAME 2: Simon Says (`/games/simon-says`)

### File: `src/app/games/simon-says/page.tsx`

```tsx
import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Simon Says — NexaGames',
  description: 'Watch the pattern, repeat it back. How many rounds can you remember?',
  openGraph: {
    title: 'Simon Says — NexaGames',
    description: 'Memory pattern game. Watch, listen, repeat!',
    url: 'https://fun.nexahost.top/games/simon-says',
  },
}

export default function SimonSaysPage() {
  return (
    <GameWrapper
      gameId="simon-says"
      title="Simon Says"
      description="Watch the colour pattern, then repeat it back! Each round adds one more step."
      genre="puzzle"
      controls={[
        { key: 'Mouse Click', action: 'Select colour' },
        { key: 'Touch', action: 'Tap colour (mobile)' },
      ]}
    />
  )
}
```

### File: `public/games/simon-says/main.js`

```javascript
(function () {
  const W = 500, H = 520;

  const COLORS = [
    { key: 'green',  hex: 0x00cc44, lit: 0x00ff66, x: 0, y: 0 },
    { key: 'red',    hex: 0xcc2200, lit: 0xff4422, x: 1, y: 0 },
    { key: 'yellow', hex: 0xccaa00, lit: 0xffdd00, x: 0, y: 1 },
    { key: 'blue',   hex: 0x0044cc, lit: 0x2266ff, x: 1, y: 1 },
  ];

  class SimonScene extends Phaser.Scene {
    constructor() { super('SimonScene'); }

    create() {
      this.sequence = [];
      this.playerSeq = [];
      this.round = 0;
      this.accepting = false;
      this.pads = [];

      // Background
      this.add.rectangle(W / 2, H / 2, W, H, 0x111122);

      // Title
      this.add.text(W / 2, 28, 'SIMON SAYS', {
        fontSize: '26px', fill: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Round / status
      this.roundTxt = this.add.text(W / 2, 62, 'Round: 0', {
        fontSize: '18px', fill: '#aaaaff', fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.statusTxt = this.add.text(W / 2, 88, 'Press START', {
        fontSize: '16px', fill: '#88ff88', fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Build 4 coloured pads
      const padSize = 160;
      const gap = 10;
      const startX = W / 2 - padSize - gap / 2;
      const startY = 120;

      COLORS.forEach((c, i) => {
        const px = startX + c.x * (padSize + gap) + padSize / 2;
        const py = startY + c.y * (padSize + gap) + padSize / 2;

        const pad = this.add.rectangle(px, py, padSize, padSize, c.hex, 1)
          .setInteractive({ useHandCursor: true });

        pad.colorIndex = i;
        pad.baseColor = c.hex;
        pad.litColor = c.lit;

        pad.on('pointerdown', () => this.playerTap(i));
        pad.on('pointerover', () => { if (this.accepting) pad.setFillStyle(c.lit); });
        pad.on('pointerout', () => { if (this.accepting) pad.setFillStyle(c.hex); });

        this.pads.push(pad);
      });

      // Corner labels
      const labels = ['▲', '▶', '◀', '▼'];
      COLORS.forEach((c, i) => {
        const pad = this.pads[i];
        this.add.text(pad.x, pad.y, labels[i], {
          fontSize: '36px', fill: '#ffffff', alpha: 0.3, fontFamily: 'monospace'
        }).setOrigin(0.5).setAlpha(0.3);
      });

      // Start button
      this.startBtn = this.add.text(W / 2, H - 40, '[ START ]', {
        fontSize: '22px', fill: '#00ff88', fontFamily: 'monospace'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      this.startBtn.on('pointerover', () => this.startBtn.setFill('#ffffff'));
      this.startBtn.on('pointerout', () => this.startBtn.setFill('#00ff88'));
      this.startBtn.on('pointerdown', () => this.startGame());
    }

    startGame() {
      this.sequence = [];
      this.round = 0;
      this.startBtn.setVisible(false);
      this.nextRound();
    }

    nextRound() {
      this.round++;
      this.roundTxt.setText('Round: ' + this.round);
      this.statusTxt.setText('Watch carefully...');
      this.accepting = false;
      this.playerSeq = [];

      // Add random colour to sequence
      this.sequence.push(Phaser.Math.Between(0, 3));

      // Play sequence after short delay
      this.time.delayedCall(600, () => this.playSequence(0));
    }

    playSequence(idx) {
      if (idx >= this.sequence.length) {
        this.statusTxt.setText('Your turn!');
        this.accepting = true;
        return;
      }
      const colorIdx = this.sequence[idx];
      this.flashPad(colorIdx, () => {
        this.time.delayedCall(200, () => this.playSequence(idx + 1));
      });
    }

    flashPad(colorIdx, onComplete) {
      const pad = this.pads[colorIdx];
      const litColor = COLORS[colorIdx].lit;
      const baseColor = COLORS[colorIdx].hex;

      pad.setFillStyle(litColor);
      this.time.delayedCall(400, () => {
        pad.setFillStyle(baseColor);
        if (onComplete) onComplete();
      });
    }

    playerTap(colorIdx) {
      if (!this.accepting) return;

      this.flashPad(colorIdx);
      this.playerSeq.push(colorIdx);

      const pos = this.playerSeq.length - 1;

      if (this.playerSeq[pos] !== this.sequence[pos]) {
        // Wrong!
        this.accepting = false;
        this.statusTxt.setText('❌ Wrong! Game over.');

        // Flash all pads red
        this.pads.forEach(p => p.setFillStyle(0xff0000));
        this.time.delayedCall(600, () => {
          this.pads.forEach((p, i) => p.setFillStyle(COLORS[i].hex));
          this.statusTxt.setText('Score: Round ' + this.round + ' — try again!');
          this.startBtn.setText('[ PLAY AGAIN ]').setVisible(true);
          this.roundTxt.setText('Round: 0');
        });
        return;
      }

      if (this.playerSeq.length === this.sequence.length) {
        // Correct round!
        this.accepting = false;
        this.statusTxt.setText('✅ Correct!');
        this.pads.forEach(p => p.setFillStyle(0x00ff88));
        this.time.delayedCall(700, () => {
          this.pads.forEach((p, i) => p.setFillStyle(COLORS[i].hex));
          this.nextRound();
        });
      }
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#111122',
    parent: 'game-container',
    scene: SimonScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  new Phaser.Game(config);
})();
```

---

## GAME 3: Ping Pong (`/games/ping-pong`)

### File: `src/app/games/ping-pong/page.tsx`

```tsx
import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Ping Pong — NexaGames',
  description: 'Classic table tennis vs the CPU. First to 7 wins!',
  openGraph: {
    title: 'Ping Pong — NexaGames',
    description: 'Classic table tennis vs CPU. First to 7 wins!',
    url: 'https://fun.nexahost.top/games/ping-pong',
  },
}

export default function PingPongPage() {
  return (
    <GameWrapper
      gameId="ping-pong"
      title="Ping Pong"
      description="Classic table tennis! Move your paddle to beat the CPU. First to 7 wins!"
      genre="sports"
      controls={[
        { key: '↑ / ↓', action: 'Move paddle' },
        { key: 'W / S', action: 'Move paddle (alt)' },
        { key: 'Mouse', action: 'Move paddle' },
      ]}
    />
  )
}
```

### File: `public/games/ping-pong/main.js`

```javascript
(function () {
  const W = 700, H = 450;
  const PAD_W = 12, PAD_H = 80, BALL_R = 8;
  const WIN_SCORE = 7;

  class PongScene extends Phaser.Scene {
    constructor() { super('PongScene'); }

    create() {
      this.playerY = H / 2;
      this.cpuY = H / 2;
      this.ballX = W / 2;
      this.ballY = H / 2;
      this.ballVX = 260 * (Math.random() > 0.5 ? 1 : -1);
      this.ballVY = 180 * (Math.random() > 0.5 ? 1 : -1);
      this.playerScore = 0;
      this.cpuScore = 0;
      this.running = false;
      this.cpuSpeed = 220;

      // Background
      this.add.rectangle(W / 2, H / 2, W, H, 0x0d0d1a);

      // Centre line (dashed)
      for (let y = 10; y < H; y += 28) {
        this.add.rectangle(W / 2, y + 8, 3, 16, 0x334455);
      }

      // Net border lines
      this.add.rectangle(W / 2, 0, W, 3, 0x223344);
      this.add.rectangle(W / 2, H, W, 3, 0x223344);

      // Paddles
      this.playerPad = this.add.rectangle(30, H / 2, PAD_W, PAD_H, 0x00cfff);
      this.cpuPad = this.add.rectangle(W - 30, H / 2, PAD_W, PAD_H, 0xff4466);

      // Ball
      this.ball = this.add.circle(W / 2, H / 2, BALL_R, 0xffffff);

      // Score
      this.playerScoreTxt = this.add.text(W / 4, 20, '0', {
        fontSize: '40px', fill: '#00cfff', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.cpuScoreTxt = this.add.text(3 * W / 4, 20, '0', {
        fontSize: '40px', fill: '#ff4466', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Status
      this.statusTxt = this.add.text(W / 2, H / 2, 'Click or press SPACE\nto start', {
        fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace', align: 'center'
      }).setOrigin(0.5);

      // Controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      this.input.on('pointerdown', () => { if (!this.running) this.startGame(); });
      this.spaceKey.on('down', () => { if (!this.running) this.startGame(); });

      // Mouse paddle control
      this.input.on('pointermove', (ptr) => {
        if (this.running) this.playerY = Phaser.Math.Clamp(ptr.y, PAD_H / 2, H - PAD_H / 2);
      });
    }

    startGame() {
      this.running = true;
      this.statusTxt.setVisible(false);
      this.resetBall();
    }

    resetBall() {
      this.ballX = W / 2;
      this.ballY = H / 2;
      const speed = 260;
      this.ballVX = speed * (Math.random() > 0.5 ? 1 : -1);
      this.ballVY = (100 + Math.random() * 100) * (Math.random() > 0.5 ? 1 : -1);
    }

    update(time, delta) {
      if (!this.running) return;
      const dt = delta / 1000;

      // Player keyboard control
      const speed = 360;
      if (this.cursors.up.isDown || this.wKey.isDown) {
        this.playerY = Math.max(PAD_H / 2, this.playerY - speed * dt);
      }
      if (this.cursors.down.isDown || this.sKey.isDown) {
        this.playerY = Math.min(H - PAD_H / 2, this.playerY + speed * dt);
      }

      // CPU AI — tracks ball with slight imperfection
      const cpuTarget = this.ballY + (Math.sin(time / 600) * 15);
      const diff = cpuTarget - this.cpuY;
      const move = Math.sign(diff) * Math.min(Math.abs(diff), this.cpuSpeed * dt);
      this.cpuY = Phaser.Math.Clamp(this.cpuY + move, PAD_H / 2, H - PAD_H / 2);

      // Move ball
      this.ballX += this.ballVX * dt;
      this.ballY += this.ballVY * dt;

      // Wall bounce (top/bottom)
      if (this.ballY - BALL_R <= 0) { this.ballY = BALL_R; this.ballVY = Math.abs(this.ballVY); }
      if (this.ballY + BALL_R >= H) { this.ballY = H - BALL_R; this.ballVY = -Math.abs(this.ballVY); }

      // Player paddle collision
      if (
        this.ballX - BALL_R <= 30 + PAD_W / 2 &&
        this.ballX - BALL_R >= 30 - PAD_W / 2 &&
        Math.abs(this.ballY - this.playerY) < PAD_H / 2 + BALL_R
      ) {
        this.ballVX = Math.abs(this.ballVX) * 1.05;
        const angle = (this.ballY - this.playerY) / (PAD_H / 2);
        this.ballVY = angle * 350;
        this.ballX = 30 + PAD_W / 2 + BALL_R;
      }

      // CPU paddle collision
      if (
        this.ballX + BALL_R >= W - 30 - PAD_W / 2 &&
        this.ballX + BALL_R <= W - 30 + PAD_W / 2 &&
        Math.abs(this.ballY - this.cpuY) < PAD_H / 2 + BALL_R
      ) {
        this.ballVX = -Math.abs(this.ballVX) * 1.05;
        const angle = (this.ballY - this.cpuY) / (PAD_H / 2);
        this.ballVY = angle * 350;
        this.ballX = W - 30 - PAD_W / 2 - BALL_R;
      }

      // Cap ball speed
      const maxSpeed = 700;
      if (Math.abs(this.ballVX) > maxSpeed) this.ballVX = Math.sign(this.ballVX) * maxSpeed;

      // Scoring
      if (this.ballX < 0) {
        this.cpuScore++;
        this.cpuScoreTxt.setText(this.cpuScore);
        this.checkWin() || this.resetBall();
      }
      if (this.ballX > W) {
        this.playerScore++;
        this.playerScoreTxt.setText(this.playerScore);
        this.checkWin() || this.resetBall();
      }

      // Update visuals
      this.playerPad.setPosition(30, this.playerY);
      this.cpuPad.setPosition(W - 30, this.cpuY);
      this.ball.setPosition(this.ballX, this.ballY);
    }

    checkWin() {
      const winner = this.playerScore >= WIN_SCORE ? 'YOU WIN! 🏆'
                   : this.cpuScore >= WIN_SCORE   ? 'CPU WINS'
                   : null;
      if (!winner) return false;

      this.running = false;
      this.add.rectangle(W / 2, H / 2, 340, 160, 0x000000, 0.75);
      this.add.text(W / 2, H / 2 - 35, winner, {
        fontSize: '32px', fill: this.playerScore >= WIN_SCORE ? '#00ff88' : '#ff4466',
        fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);

      const restart = this.add.text(W / 2, H / 2 + 30, '[ PLAY AGAIN ]', {
        fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      restart.on('pointerdown', () => {
        this.playerScore = 0; this.cpuScore = 0;
        this.scene.restart();
      });
      return true;
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: W, height: H,
    backgroundColor: '#0d0d1a',
    parent: 'game-container',
    scene: PongScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  new Phaser.Game(config);
})();
```

---

## UPDATE GAMES LIST (after Part B, update this file)

### File: `src/lib/games.ts` — ADD these 3 entries to the games array:

```typescript
  {
    id: 'endless-runner',
    title: 'Endless Runner',
    description: 'Run, jump and slide to dodge obstacles! Double-jump over big barriers, slide under low ones. How far can you go?',
    genre: 'arcade',
    tags: ['HOT'],
    thumbnail: '/thumbnails/endless-runner.svg',
    plays: 0,
  },
  {
    id: 'simon-says',
    title: 'Simon Says',
    description: 'Watch the colour pattern light up, then repeat it back in order. Each round adds one more step. How far can your memory go?',
    genre: 'puzzle',
    tags: [],
    thumbnail: '/thumbnails/simon-says.svg',
    plays: 0,
  },
  {
    id: 'ping-pong',
    title: 'Ping Pong',
    description: 'Classic table tennis vs the CPU! Control your paddle with mouse or keys. First to 7 points wins.',
    genre: 'sports',
    tags: [],
    thumbnail: '/thumbnails/ping-pong.svg',
    plays: 0,
  },
```
