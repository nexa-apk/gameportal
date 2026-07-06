(function () {
  const W = 800, H = 300;

  class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
      this.speed = 300;
      this.score = 0;
      this.gameOver = false;
      this.doubleJumpAvailable = false;
      this.isSliding = false;
      this.onGround = false;
      this.playerVY = 0;
      this.GRAVITY = 1200;
      this.playerX = 120;
      this.playerY = H - 60;
      this.playerW = 30;
      this.playerH = 50;
      this.GROUND_Y = H - 30;

      // BG
      this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);

      // Ground
      this.groundGfx = this.add.rectangle(W / 2, H - 15, W, 30, 0x00ff88);

      // Player (manual physics, no arcade body issues)
      this.playerGfx = this.add.rectangle(this.playerX, this.playerY, this.playerW, this.playerH, 0x00cfff);

      // Obstacles
      this.obstacles = [];

      // Score text
      this.scoreTxt = this.add.text(16, 16, 'Score: 0', {
        fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
      });
      this.speedTxt = this.add.text(W - 150, 16, 'Speed: 1x', {
        fontSize: '16px', fill: '#aaffaa', fontFamily: 'monospace'
      });
      this.hintTxt = this.add.text(W / 2, H / 2, 'Press SPACE to start!', {
        fontSize: '20px', fill: '#ffdd00', fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.on('pointerdown', () => this.tryJump());

      this.started = false;

      // Spawn timer
      this.spawnTimer = this.time.addEvent({
        delay: 1600,
        callback: this.spawnObstacle,
        callbackScope: this,
        loop: true,
        paused: true
      });

      // Score ticker
      this.time.addEvent({
        delay: 100,
        callback: () => {
          if (!this.gameOver && this.started) {
            this.score++;
            this.scoreTxt.setText('Score: ' + this.score);
            if (this.score % 20 === 0) {
              this.speed = Math.min(this.speed + 20, 700);
              this.speedTxt.setText('Speed: ' + (this.speed / 300).toFixed(1) + 'x');
            }
          }
        },
        loop: true
      });
    }

    tryJump() {
      if (this.gameOver) return;

      if (!this.started) {
        this.started = true;
        this.hintTxt.setVisible(false);
        this.spawnTimer.paused = false;
        this.spawnObstacle();
      }

      if (this.onGround) {
        this.playerVY = -580;
        this.doubleJumpAvailable = true;
        this.isSliding = false;
        this.playerH = 50;
      } else if (this.doubleJumpAvailable) {
        this.playerVY = -480;
        this.doubleJumpAvailable = false;
        // Flash effect
        this.tweens.add({ targets: this.playerGfx, alpha: 0.3, duration: 80, yoyo: true, repeat: 1 });
      }
    }

    spawnObstacle() {
      if (this.gameOver || !this.started) return;
      const type = Phaser.Math.Between(0, 2);
      let obs = { x: W + 30, active: true };

      if (type === 0) {
        // Tall — must jump
        obs.w = 25; obs.h = 60;
        obs.y = this.GROUND_Y - obs.h / 2;
        obs.color = 0xff4444;
      } else if (type === 1) {
        // Low wide — must slide
        obs.w = 60; obs.h = 28;
        obs.y = this.GROUND_Y - obs.h / 2;
        obs.color = 0xffaa00;
      } else {
        // Floating — jump over or duck under
        obs.w = 25; obs.h = 40;
        obs.y = this.GROUND_Y - 90;
        obs.color = 0xff00ff;
      }

      obs.gfx = this.add.rectangle(obs.x, obs.y, obs.w, obs.h, obs.color);
      this.obstacles.push(obs);
    }

    update(time, delta) {
      if (this.gameOver) return;
      const dt = delta / 1000;

      // Jump keys
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.wKey)) {
        this.tryJump();
      }

      // Slide
      const slideDown = this.cursors.down.isDown || this.sKey.isDown;
      if (slideDown && this.onGround && this.started) {
        if (!this.isSliding) {
          this.isSliding = true;
          this.playerH = 25;
        }
      } else if (!slideDown && this.isSliding) {
        this.isSliding = false;
        this.playerH = 50;
      }

      // Gravity
      if (!this.onGround) {
        this.playerVY += this.GRAVITY * dt;
      }

      this.playerY += this.playerVY * dt;

      // Ground check
      const groundTop = this.GROUND_Y - this.playerH / 2;
      if (this.playerY >= groundTop) {
        this.playerY = groundTop;
        this.playerVY = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }

      // Update player visual
      this.playerGfx.setPosition(this.playerX, this.playerY);
      this.playerGfx.setDisplaySize(this.playerW, this.playerH);

      // Move & check obstacles
      this.obstacles = this.obstacles.filter(obs => {
        obs.x -= this.speed * dt;
        obs.gfx.setPosition(obs.x, obs.y);

        // Collision (AABB)
        const px = this.playerX, py = this.playerY;
        const pw = this.playerW / 2 - 3, ph = this.playerH / 2 - 3;
        const ow = obs.w / 2 - 2, oh = obs.h / 2 - 2;
        if (Math.abs(px - obs.x) < pw + ow && Math.abs(py - obs.y) < ph + oh) {
          if (!this.gameOver) this.endGame();
        }

        if (obs.x < -80) {
          obs.gfx.destroy();
          return false;
        }
        return true;
      });
    }

    endGame() {
      this.gameOver = true;
      this.spawnTimer.remove();

      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65);
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
    width: W, height: H,
    backgroundColor: '#1a1a2e',
    parent: 'game-container',
    scene: GameScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  new Phaser.Game(config);
})();
