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
