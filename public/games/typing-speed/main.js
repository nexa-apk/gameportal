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
