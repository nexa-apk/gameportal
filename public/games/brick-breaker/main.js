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
