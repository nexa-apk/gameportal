# NexaGames — Add 5 New Games (Part B: Games 4–5 + Thumbnails + Final Steps)

---

## GAME 4: Typing Speed (`/games/typing-speed`)

### File: `src/app/games/typing-speed/page.tsx`

```tsx
import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Typing Speed — NexaGames',
  description: 'Type the falling words before they hit the ground! Test your WPM and reflexes.',
  openGraph: {
    title: 'Typing Speed — NexaGames',
    description: 'Type falling words before they hit the ground!',
    url: 'https://fun.nexahost.top/games/typing-speed',
  },
}

export default function TypingSpeedPage() {
  return (
    <GameWrapper
      gameId="typing-speed"
      title="Typing Speed"
      description="Type the falling words before they hit the ground! Each correct word scores points and removes it. Miss 3 and it's game over."
      genre="puzzle"
      controls={[
        { key: 'Keyboard', action: 'Type the word shown' },
        { key: 'Enter', action: 'Submit word (auto on match)' },
      ]}
    />
  )
}
```

### File: `public/games/typing-speed/main.js`

```javascript
(function () {
  const W = 700, H = 480;
  const WORDS = [
    'run','cat','dog','sun','sky','fly','red','big','fun','win',
    'jump','fire','game','fast','cool','play','star','word','type','move',
    'speed','level','score','combo','dodge','blast','storm','night','space','laser',
    'phaser','portal','rocket','planet','galaxy','turbo','pixel','arcade','shield','power',
    'keyboard','infinite','champion','lightning','adventure','superhero','explosion','developer'
  ];

  class TypingScene extends Phaser.Scene {
    constructor() { super('TypingScene'); }

    create() {
      this.lives = 3;
      this.score = 0;
      this.combo = 0;
      this.level = 1;
      this.wordSpeed = 45; // px per second
      this.spawnDelay = 2200;
      this.activeWords = [];
      this.typedText = '';
      this.gameOver = false;

      // BG
      this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

      // Danger zone line
      this.dangerLine = this.add.rectangle(W / 2, H - 55, W, 2, 0xff3300, 0.6);

      // HUD
      this.scoreTxt = this.add.text(16, 16, 'Score: 0', {
        fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
      });
      this.levelTxt = this.add.text(W / 2, 16, 'Level 1', {
        fontSize: '20px', fill: '#aaaaff', fontFamily: 'monospace'
      }).setOrigin(0.5, 0);
      this.comboTxt = this.add.text(W - 16, 16, '', {
        fontSize: '18px', fill: '#ffdd00', fontFamily: 'monospace'
      }).setOrigin(1, 0);
      this.livesTxt = this.add.text(16, H - 45, '❤️❤️❤️', {
        fontSize: '22px', fontFamily: 'monospace'
      });

      // Input display
      this.inputBg = this.add.rectangle(W / 2, H - 22, W - 40, 30, 0x111133);
      this.inputTxt = this.add.text(W / 2, H - 22, '', {
        fontSize: '20px', fill: '#00ff88', fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Spawn timer
      this.spawnTimer = this.time.addEvent({
        delay: this.spawnDelay,
        callback: this.spawnWord,
        callbackScope: this,
        loop: true
      });

      // Spawn first word immediately
      this.time.delayedCall(300, this.spawnWord, [], this);

      // Keyboard input
      this.input.keyboard.on('keydown', (e) => this.handleKey(e));

      // Level up every 10 points
      this.lastLevelScore = 0;
    }

    spawnWord() {
      if (this.gameOver) return;
      const word = Phaser.Utils.Array.GetRandom(WORDS.filter(w =>
        w.length <= 4 + this.level * 1.5 && !this.activeWords.find(a => a.word === w)
      )) || Phaser.Utils.Array.GetRandom(WORDS);

      const x = Phaser.Math.Between(60, W - 60);
      const txt = this.add.text(x, -20, word, {
        fontSize: '22px', fill: '#ffffff', fontFamily: 'monospace',
        backgroundColor: '#1a1a3a', padding: { x: 8, y: 4 }
      }).setOrigin(0.5, 0);

      this.activeWords.push({ word, txt, y: -20 });
    }

    handleKey(e) {
      if (this.gameOver) return;

      if (e.key === 'Backspace') {
        this.typedText = this.typedText.slice(0, -1);
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        this.typedText += e.key.toLowerCase();
        this.checkMatch();
      }
      this.inputTxt.setText(this.typedText + '|');
      this.highlightMatching();
    }

    checkMatch() {
      const idx = this.activeWords.findIndex(a => a.word === this.typedText);
      if (idx !== -1) {
        const { txt } = this.activeWords[idx];
        // Pop effect
        this.tweens.add({
          targets: txt, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 200,
          onComplete: () => txt.destroy()
        });
        this.activeWords.splice(idx, 1);

        this.combo++;
        const pts = 10 + (this.combo > 2 ? this.combo * 3 : 0);
        this.score += pts;
        this.scoreTxt.setText('Score: ' + this.score);
        this.comboTxt.setText(this.combo > 1 ? 'COMBO x' + this.combo + '!' : '');

        // Float score popup
        const popup = this.add.text(
          Phaser.Math.Between(200, 500), 200,
          '+' + pts + (this.combo > 2 ? ' COMBO!' : ''),
          { fontSize: '18px', fill: '#ffdd00', fontFamily: 'monospace' }
        ).setOrigin(0.5);
        this.tweens.add({ targets: popup, y: 140, alpha: 0, duration: 700, onComplete: () => popup.destroy() });

        this.typedText = '';
        this.inputTxt.setText('|');

        // Level up check
        if (this.score - this.lastLevelScore >= 50) {
          this.lastLevelScore = this.score;
          this.level++;
          this.wordSpeed = Math.min(this.wordSpeed + 8, 130);
          this.spawnDelay = Math.max(this.spawnDelay - 150, 900);
          this.spawnTimer.delay = this.spawnDelay;
          this.levelTxt.setText('Level ' + this.level);
          const lvlPop = this.add.text(W / 2, H / 2, 'LEVEL ' + this.level + '!', {
            fontSize: '32px', fill: '#00ff88', fontFamily: 'monospace', fontStyle: 'bold'
          }).setOrigin(0.5);
          this.tweens.add({ targets: lvlPop, alpha: 0, y: H / 2 - 60, duration: 1000, onComplete: () => lvlPop.destroy() });
        }
      }
    }

    highlightMatching() {
      this.activeWords.forEach(({ word, txt }) => {
        if (word.startsWith(this.typedText) && this.typedText.length > 0) {
          txt.setColor('#ffdd00');
        } else {
          txt.setColor('#ffffff');
        }
      });
    }

    update(time, delta) {
      if (this.gameOver) return;
      const dt = delta / 1000;

      this.activeWords = this.activeWords.filter(({ word, txt }) => {
        txt.y += this.wordSpeed * dt;
        if (txt.y > H - 55) {
          // Hit danger zone
          txt.destroy();
          this.lives--;
          this.combo = 0;
          this.comboTxt.setText('');
          const hearts = ['', '❤️', '❤️❤️', '❤️❤️❤️'][this.lives] || '';
          this.livesTxt.setText(hearts);

          if (this.lives <= 0) {
            this.endGame();
          }
          return false;
        }
        return true;
      });
    }

    endGame() {
      this.gameOver = true;
      this.spawnTimer.remove();
      this.activeWords.forEach(({ txt }) => txt.destroy());
      this.activeWords = [];

      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
      this.add.text(W / 2, H / 2 - 60, 'GAME OVER', {
        fontSize: '38px', fill: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(W / 2, H / 2 - 10, 'Score: ' + this.score + '  |  Level: ' + this.level, {
        fontSize: '22px', fill: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0.5);

      const restart = this.add.text(W / 2, H / 2 + 50, '[ PLAY AGAIN ]', {
        fontSize: '22px', fill: '#00ff88', fontFamily: 'monospace'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      restart.on('pointerdown', () => this.scene.restart());
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: W, height: H,
    backgroundColor: '#0a0a1a',
    parent: 'game-container',
    scene: TypingScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  new Phaser.Game(config);
})();
```

---

## GAME 5: Brick Breaker Deluxe (`/games/brick-breaker`)

### File: `src/app/games/brick-breaker/page.tsx`

```tsx
import type { Metadata } from 'next'
import GameWrapper from '@/components/GameWrapper'

export const metadata: Metadata = {
  title: 'Brick Breaker Deluxe — NexaGames',
  description: 'Break all the bricks with power-ups, multi-ball and explosive effects!',
  openGraph: {
    title: 'Brick Breaker Deluxe — NexaGames',
    description: 'Breakout upgraded — power-ups, multi-ball, explosive bricks!',
    url: 'https://fun.nexahost.top/games/brick-breaker',
  },
}

export default function BrickBreakerPage() {
  return (
    <GameWrapper
      gameId="brick-breaker"
      title="Brick Breaker Deluxe"
      description="Upgraded Breakout with power-ups! Catch multi-ball, wide paddle, and explosive brick power-ups as you clear every row."
      genre="arcade"
      controls={[
        { key: '← / →', action: 'Move paddle' },
        { key: 'Mouse', action: 'Move paddle' },
        { key: 'Space', action: 'Launch ball' },
      ]}
    />
  )
}
```

### File: `public/games/brick-breaker/main.js`

```javascript
(function () {
  const W = 700, H = 500;
  const PAD_W = 90, PAD_H = 12, BALL_R = 8;
  const BRICK_COLS = 10, BRICK_ROWS = 6;
  const BRICK_W = Math.floor((W - 40) / BRICK_COLS);
  const BRICK_H = 22;

  const BRICK_COLORS = [0xff3333, 0xff7700, 0xffcc00, 0x33cc33, 0x3399ff, 0xcc44ff];
  const POWERUP_TYPES = ['multi', 'wide', 'fast', 'slow'];

  class BBScene extends Phaser.Scene {
    constructor() { super('BBScene'); }

    create() {
      this.score = 0;
      this.lives = 3;
      this.launched = false;
      this.balls = [];
      this.bricks = [];
      this.powerups = [];
      this.padX = W / 2;
      this.padWidth = PAD_W;
      this.ballSpeed = 320;

      // BG
      this.add.rectangle(W / 2, H / 2, W, H, 0x090915);

      // HUD
      this.scoreTxt = this.add.text(16, 6, 'Score: 0', { fontSize: '18px', fill: '#fff', fontFamily: 'monospace' });
      this.livesTxt = this.add.text(W - 16, 6, '❤️❤️❤️', { fontSize: '18px', fontFamily: 'monospace' }).setOrigin(1, 0);

      // Paddle
      this.paddle = this.add.rectangle(W / 2, H - 30, PAD_W, PAD_H, 0x00cfff);

      // Ball
      this.spawnBall(W / 2, H - 50);

      // Bricks
      this.buildBricks();

      // Controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.on('pointermove', ptr => { this.padX = Phaser.Math.Clamp(ptr.x, this.padWidth / 2, W - this.padWidth / 2); });
      this.input.on('pointerdown', () => { if (!this.launched) this.launchBall(); });
      this.spaceKey.on('down', () => { if (!this.launched) this.launchBall(); });

      // Prompt
      this.launchTxt = this.add.text(W / 2, H / 2 + 40, 'Click or SPACE to launch', {
        fontSize: '18px', fill: '#aaaaff', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    spawnBall(x, y, vx, vy) {
      const ball = {
        x, y,
        vx: vx || 0,
        vy: vy || 0,
        gfx: this.add.circle(x, y, BALL_R, 0xffffff),
        active: true
      };
      this.balls.push(ball);
      return ball;
    }

    launchBall() {
      if (this.launched) return;
      this.launched = true;
      this.launchTxt.setVisible(false);
      const angle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);
      this.balls[0].vx = Math.sin(angle) * this.ballSpeed;
      this.balls[0].vy = -Math.cos(angle) * this.ballSpeed;
    }

    buildBricks() {
      this.bricks.forEach(b => b.gfx.destroy());
      this.bricks = [];
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          const bx = 20 + col * BRICK_W + BRICK_W / 2;
          const by = 60 + row * (BRICK_H + 4);
          const hp = row < 2 ? 1 : row < 4 ? 2 : 3;
          const gfx = this.add.rectangle(bx, by, BRICK_W - 3, BRICK_H - 2, BRICK_COLORS[row]);
          // HP label for multi-hit bricks
          const label = hp > 1 ? this.add.text(bx, by, hp, { fontSize: '12px', fill: '#fff', fontFamily: 'monospace' }).setOrigin(0.5) : null;
          this.bricks.push({ x: bx, y: by, hp, maxHp: hp, gfx, label, row, col });
        }
      }
    }

    dropPowerup(x, y) {
      if (Math.random() > 0.25) return; // 25% chance
      const type = Phaser.Utils.Array.GetRandom(POWERUP_TYPES);
      const colors = { multi: 0xff00ff, wide: 0x00ff88, fast: 0xff4400, slow: 0x0088ff };
      const gfx = this.add.rectangle(x, y, 22, 12, colors[type]);
      const txt = this.add.text(x, y, type[0].toUpperCase(), { fontSize: '10px', fill: '#fff', fontFamily: 'monospace' }).setOrigin(0.5);
      this.powerups.push({ x, y, vy: 90, type, gfx, txt, active: true });
    }

    applyPowerup(type) {
      if (type === 'multi') {
        // Clone all current balls
        const existing = [...this.balls];
        existing.forEach(b => {
          const angle = Phaser.Math.Between(-30, 30) * Math.PI / 180;
          const cos = Math.cos(angle), sin = Math.sin(angle);
          const nvx = b.vx * cos - b.vy * sin;
          const nvy = b.vx * sin + b.vy * cos;
          this.spawnBall(b.x, b.y, nvx, nvy);
        });
      } else if (type === 'wide') {
        this.padWidth = Math.min(this.padWidth + 40, 220);
        this.paddle.setDisplaySize(this.padWidth, PAD_H);
        this.time.delayedCall(6000, () => {
          this.padWidth = Math.max(PAD_W, this.padWidth - 40);
          this.paddle.setDisplaySize(this.padWidth, PAD_H);
        });
      } else if (type === 'slow') {
        this.balls.forEach(b => { b.vx *= 0.6; b.vy *= 0.6; });
        this.time.delayedCall(4000, () => {
          this.balls.forEach(b => { b.vx *= (1 / 0.6); b.vy *= (1 / 0.6); });
        });
      } else if (type === 'fast') {
        this.balls.forEach(b => { b.vx *= 1.4; b.vy *= 1.4; });
      }
    }

    update(time, delta) {
      const dt = delta / 1000;

      // Paddle movement
      const speed = 420;
      if (this.cursors.left.isDown) this.padX = Math.max(this.padWidth / 2, this.padX - speed * dt);
      if (this.cursors.right.isDown) this.padX = Math.min(W - this.padWidth / 2, this.padX + speed * dt);
      this.paddle.setPosition(this.padX, H - 30);

      if (!this.launched) {
        this.balls[0].x = this.padX;
        this.balls[0].gfx.setPosition(this.padX, H - 50);
        return;
      }

      // Update balls
      this.balls = this.balls.filter(ball => {
        if (!ball.active) { ball.gfx.destroy(); return false; }

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Wall bounces
        if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
        if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
        if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

        // Paddle collision
        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= H - 30 - PAD_H / 2 &&
          ball.y + BALL_R <= H - 30 + PAD_H / 2 + 4 &&
          Math.abs(ball.x - this.padX) < this.padWidth / 2 + BALL_R
        ) {
          ball.vy = -Math.abs(ball.vy);
          const offset = (ball.x - this.padX) / (this.padWidth / 2);
          ball.vx = offset * this.ballSpeed;
          ball.y = H - 30 - PAD_H / 2 - BALL_R;
        }

        // Lost ball
        if (ball.y > H + 20) {
          ball.gfx.destroy();
          return false;
        }

        // Brick collision
        for (let i = this.bricks.length - 1; i >= 0; i--) {
          const b = this.bricks[i];
          if (!b.gfx.active) continue;
          const dx = Math.abs(ball.x - b.x);
          const dy = Math.abs(ball.y - b.y);
          if (dx < BRICK_W / 2 + BALL_R && dy < BRICK_H / 2 + BALL_R) {
            // Which side hit?
            if (dx / (BRICK_W / 2) > dy / (BRICK_H / 2)) ball.vx = -ball.vx;
            else ball.vy = -ball.vy;

            b.hp--;
            if (b.hp <= 0) {
              this.score += 10 * (b.maxHp);
              this.scoreTxt.setText('Score: ' + this.score);
              this.dropPowerup(b.x, b.y);
              b.gfx.destroy();
              if (b.label) b.label.destroy();
              this.bricks.splice(i, 1);

              if (this.bricks.length === 0) {
                this.winLevel();
              }
            } else {
              // Darken brick based on damage
              const ratio = b.hp / b.maxHp;
              b.gfx.setAlpha(0.4 + 0.6 * ratio);
              if (b.label) b.label.setText(b.hp);
            }
            break;
          }
        }

        ball.gfx.setPosition(ball.x, ball.y);
        return true;
      });

      // Check all balls lost
      if (this.launched && this.balls.length === 0) {
        this.lives--;
        const hearts = ['', '❤️', '❤️❤️', '❤️❤️❤️'][this.lives] || '';
        this.livesTxt.setText(hearts);
        if (this.lives <= 0) {
          this.endGame();
        } else {
          // Respawn ball
          this.launched = false;
          this.launchTxt.setVisible(true);
          this.spawnBall(this.padX, H - 50);
        }
      }

      // Powerups
      this.powerups = this.powerups.filter(p => {
        if (!p.active) { p.gfx.destroy(); p.txt.destroy(); return false; }
        p.y += p.vy * dt;
        p.gfx.setPosition(p.x, p.y);
        p.txt.setPosition(p.x, p.y);

        // Catch by paddle
        if (
          Math.abs(p.x - this.padX) < this.padWidth / 2 + 11 &&
          Math.abs(p.y - (H - 30)) < PAD_H / 2 + 6
        ) {
          this.applyPowerup(p.type);
          p.gfx.destroy(); p.txt.destroy();
          return false;
        }
        if (p.y > H + 20) { p.gfx.destroy(); p.txt.destroy(); return false; }
        return true;
      });
    }

    winLevel() {
      this.launched = false;
      this.balls.forEach(b => { b.active = false; b.gfx.destroy(); });
      this.balls = [];

      const win = this.add.text(W / 2, H / 2, '🎉 CLEARED! 🎉', {
        fontSize: '36px', fill: '#00ff88', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.time.delayedCall(1500, () => {
        win.destroy();
        this.ballSpeed += 20;
        this.buildBricks();
        this.launchTxt.setVisible(true);
        this.spawnBall(this.padX, H - 50);
      });
    }

    endGame() {
      this.launched = false;
      this.balls.forEach(b => b.gfx.destroy());
      this.balls = [];
      this.add.rectangle(W / 2, H / 2, 380, 170, 0x000000, 0.8);
      this.add.text(W / 2, H / 2 - 45, 'GAME OVER', { fontSize: '36px', fill: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(W / 2, H / 2, 'Score: ' + this.score, { fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const r = this.add.text(W / 2, H / 2 + 50, '[ PLAY AGAIN ]', { fontSize: '20px', fill: '#00ff88', fontFamily: 'monospace' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      r.on('pointerdown', () => this.scene.restart());
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: W, height: H,
    backgroundColor: '#090915',
    parent: 'game-container',
    scene: BBScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  new Phaser.Game(config);
})();
```

---

## THUMBNAILS — Create these 5 SVG files in `public/thumbnails/`

### `public/thumbnails/endless-runner.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="0" y="260" width="400" height="40" fill="#00ff88"/>
  <rect x="80" y="210" width="30" height="50" fill="#00cfff"/>
  <rect x="220" y="240" width="25" height="60" fill="#ff4444"/>
  <rect x="320" y="220" width="60" height="30" fill="#ffaa00"/>
  <text x="200" y="180" font-family="monospace" font-size="28" fill="white" text-anchor="middle" font-weight="bold">ENDLESS</text>
  <text x="200" y="210" font-family="monospace" font-size="18" fill="#00ff88" text-anchor="middle">RUNNER</text>
</svg>
```

### `public/thumbnails/simon-says.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#111122"/>
  <rect x="30" y="80" width="155" height="130" rx="8" fill="#00cc44"/>
  <rect x="215" y="80" width="155" height="130" rx="8" fill="#cc2200"/>
  <rect x="30" y="220" width="155" height="50" rx="8" fill="#ccaa00" opacity="0.4"/>
  <rect x="215" y="220" width="155" height="50" rx="8" fill="#0044cc" opacity="0.4"/>
  <text x="200" y="50" font-family="monospace" font-size="28" fill="white" text-anchor="middle" font-weight="bold">SIMON SAYS</text>
</svg>
```

### `public/thumbnails/ping-pong.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#0d0d1a"/>
  <line x1="200" y1="0" x2="200" y2="300" stroke="#334455" stroke-width="3" stroke-dasharray="20,12"/>
  <rect x="15" y="110" width="12" height="80" fill="#00cfff"/>
  <rect x="373" y="110" width="12" height="80" fill="#ff4466"/>
  <circle cx="200" cy="150" r="12" fill="white"/>
  <text x="80" y="60" font-family="monospace" font-size="44" fill="#00cfff" text-anchor="middle" font-weight="bold">3</text>
  <text x="320" y="60" font-family="monospace" font-size="44" fill="#ff4466" text-anchor="middle" font-weight="bold">5</text>
  <text x="200" y="270" font-family="monospace" font-size="24" fill="white" text-anchor="middle" font-weight="bold">PING PONG</text>
</svg>
```

### `public/thumbnails/typing-speed.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#0a0a1a"/>
  <rect x="0" y="240" width="400" height="3" fill="#ff3300" opacity="0.6"/>
  <text x="80" y="100" font-family="monospace" font-size="22" fill="#ffdd00">ROCKET</text>
  <text x="220" y="150" font-family="monospace" font-size="22" fill="white">SPEED</text>
  <text x="60" y="200" font-family="monospace" font-size="22" fill="#ff4444">COMBO</text>
  <rect x="30" y="255" width="340" height="30" rx="4" fill="#111133"/>
  <text x="200" y="275" font-family="monospace" font-size="18" fill="#00ff88" text-anchor="middle">TYPE HERE|</text>
  <text x="200" y="35" font-family="monospace" font-size="22" fill="white" text-anchor="middle" font-weight="bold">TYPING SPEED</text>
</svg>
```

### `public/thumbnails/brick-breaker.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#090915"/>
  <rect x="20" y="40" width="360" height="20" rx="3" fill="#ff3333"/>
  <rect x="20" y="65" width="360" height="20" rx="3" fill="#ff7700"/>
  <rect x="20" y="90" width="170" height="20" rx="3" fill="#ffcc00"/>
  <rect x="210" y="90" width="170" height="20" rx="3" fill="#ffcc00"/>
  <rect x="20" y="115" width="75" height="20" rx="3" fill="#33cc33"/>
  <rect x="105" y="115" width="75" height="20" rx="3" fill="#33cc33"/>
  <circle cx="200" cy="200" r="10" fill="white"/>
  <rect x="130" y="260" width="140" height="14" rx="4" fill="#00cfff"/>
  <text x="200" y="20" font-family="monospace" font-size="16" fill="white" text-anchor="middle" font-weight="bold">BRICK BREAKER DELUXE</text>
</svg>
```

---

## FINAL STEP — Add to `src/lib/games.ts`

Add these 2 entries (games 4 & 5) to the games array (in addition to the 3 from Part A):

```typescript
  {
    id: 'typing-speed',
    title: 'Typing Speed',
    description: 'Type the falling words before they hit the ground! Each word scores points. Miss 3 and it\'s game over. How high can you level?',
    genre: 'puzzle',
    tags: ['NEW'],
    thumbnail: '/thumbnails/typing-speed.svg',
    plays: 0,
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker Deluxe',
    description: 'Break bricks with power-ups: multi-ball, wide paddle, speed boosts! Clear every row to advance. How many levels can you beat?',
    genre: 'arcade',
    tags: ['NEW'],
    thumbnail: '/thumbnails/brick-breaker.svg',
    plays: 0,
  },
```

---

## CHECKLIST (jalankan dalam Claude Code)

```bash
# 1. Create all directories
mkdir -p /opt/gameportal/src/app/games/endless-runner
mkdir -p /opt/gameportal/src/app/games/simon-says
mkdir -p /opt/gameportal/src/app/games/ping-pong
mkdir -p /opt/gameportal/src/app/games/typing-speed
mkdir -p /opt/gameportal/src/app/games/brick-breaker
mkdir -p /opt/gameportal/public/games/endless-runner
mkdir -p /opt/gameportal/public/games/simon-says
mkdir -p /opt/gameportal/public/games/ping-pong
mkdir -p /opt/gameportal/public/games/typing-speed
mkdir -p /opt/gameportal/public/games/brick-breaker

# 2. Create all files as listed above

# 3. Update src/lib/games.ts with all 5 new entries

# 4. Build & check for errors
cd /opt/gameportal && npm run build

# 5. Restart (Wan buat manually)
# sudo pm2 restart gameportal
```
