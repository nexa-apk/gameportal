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
