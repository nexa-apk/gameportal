export type GameContent = {
  howToPlay: string[]
  about: string
  tips: string[]
}

const gameContent: Record<string, GameContent> = {
  snake: {
    howToPlay: [
      'Use the Arrow Keys to change direction — Up, Down, Left, Right.',
      'On mobile, swipe in any direction to steer.',
      'Guide the snake to eat the green food that appears on the grid.',
      'Each piece of food makes the snake one segment longer.',
      'The game ends if you run into the wall or your own tail.',
    ],
    about: `Snake traces its roots to 1976, when it appeared in arcades under the name Blockade as a two-player competitive game. The concept was simple but fiendishly moreish: steer a line that grows with every pickup, and don't let it collide with itself. The game became truly iconic in 1997 when Nokia pre-installed it on the 6110 handset — overnight, millions of people who had never touched an arcade machine found themselves hunched over a tiny monochrome screen during their commute. That phone version is widely credited as one of the defining mobile gaming moments of the pre-smartphone era. This version keeps the spirit of the original: a tight grid, instant controls, and a score that climbs with every morsel eaten. The challenge scales naturally — as the snake grows, the safe space to maneuver shrinks, turning a relaxed start into a white-knuckle endgame. It's a masterclass in elegant game design.`,
    tips: [
      'Plan your route two or three moves ahead rather than just reacting.',
      'Stay near the edges early on so your longer tail has room to coil in the center.',
      'Never chase food into a corner — approach from the side so you have an exit.',
      'Slow down deliberately if the food appears right next to your tail to avoid a loop trap.',
      'A score above 20 is good; above 40 is excellent. Anything past 60 is rare.',
    ],
  },

  tetris: {
    howToPlay: [
      'Use Left and Right Arrow Keys to move the falling piece sideways.',
      'Press Up Arrow to rotate the piece clockwise.',
      'Press Down Arrow to soft-drop the piece faster.',
      'On mobile, swipe left/right to move and swipe up to rotate.',
      'Fill a complete horizontal row to clear it and earn points. The game ends when pieces stack above the top of the board.',
    ],
    about: `Tetris was created in 1984 by Soviet software engineer Alexey Pajitnov while he was working at the Dorodnicyn Computing Centre in Moscow. He built it on an Electronika 60, a Soviet computer with no graphics — the pieces were rendered with ASCII brackets. The game spread rapidly through the Soviet Union on pirated floppy disks before a complicated licensing saga saw it reach Western markets through Nintendo's Game Boy in 1989. That handheld launch turned Tetris into a global phenomenon, making it the best-selling game on the device and cementing it as one of the best-selling video games of all time. Psychologists have studied the "Tetris effect," a documented phenomenon where players visualize falling shapes in real life after extended play. The game's seven falling pieces — known as Tetriminoes — are deceptively simple, yet the interplay of shapes, gaps, and rising stacks creates genuine strategy depth that keeps players returning for decades.`,
    tips: [
      'Always keep a one-cell gap on the right or left as an escape route for the long I-piece.',
      'Build flat across the board rather than allowing tall spikes — spikes create voids underneath.',
      'The S and Z pieces are the hardest to place cleanly; deal with them first rather than leaving them.',
      'Clearing four rows at once (a Tetris) gives far more points than four single-line clears.',
      'When the board gets high, switch to fast survival mode: place pieces quickly and accept one-liners.',
    ],
  },

  'flappy-bird': {
    howToPlay: [
      'Click the mouse button, tap the screen, or press any key to make the bird flap upward.',
      'Release to let gravity pull the bird back down.',
      'Navigate through the gaps in the green pipes without touching them or the ground.',
      'The game starts the moment you tap — no countdown.',
      'Your score increases by one for each pipe you clear successfully.',
    ],
    about: `Flappy Bird was created by Vietnamese developer Dong Nguyen and released in 2013 under his studio dotGEARS. It sat quietly in the App Store for nearly a year before going viral in early 2014, reaching 50 million downloads and generating an estimated $50,000 per day in ad revenue. Then, in February 2014, Nguyen abruptly removed it from all stores, citing concern over the addictive stress it was causing players. The game's sudden disappearance only amplified its legend — phones with Flappy Bird installed were listed on eBay for thousands of dollars. What makes it remarkable from a design standpoint is how little it contains: one tapping mechanic, procedurally spaced pipes, and an unforgiving collision system. That minimalism is precisely why it's so compelling. Every run takes under a minute, failure is instant and clearly your own fault, and the dopamine loop of "just one more attempt" kicks in immediately. This browser version faithfully recreates that punishing, joyful loop.`,
    tips: [
      'Keep the bird in the middle vertical third of the screen — that gives you the most reaction time.',
      'Use short rapid taps rather than long holds to make finer height adjustments.',
      'Watch the bottom of the upcoming pipe gap, not the top — it gives you the clearest target line.',
      'Don\'t celebrate early — the hitbox extends to the edge of the pipe sprite, not just the interior.',
      'Scores of 10+ are solid; 20+ puts you in the top tier of players.',
    ],
  },

  '2048': {
    howToPlay: [
      'Use the Arrow Keys to slide all tiles in one direction at once.',
      'On mobile, swipe in any direction to move tiles.',
      'When two tiles with the same number collide, they merge into a single tile with their combined value.',
      'A new tile (value 2 or 4) appears after each move.',
      'Reach the 2048 tile to win — but you can keep playing to push your score higher.',
    ],
    about: `2048 was created by Italian developer Gabriele Cirulli and released in March 2014 as a weekend project. He was 19 years old. Within a week the game had attracted 4 million visitors, and within a month that figure surpassed 10 million. Cirulli has openly acknowledged it was inspired by Threes!, a paid iOS game by Asher Vollmer and Greg Wohlwend, though the mechanics differ in important ways. The elegance of 2048 lies in how it bridges arithmetic and spatial reasoning — every move changes every tile on the board simultaneously, so you're constantly balancing local merges against global board state. Mathematically, the highest theoretically achievable tile is 131,072 (2 to the power of 17), though very few players ever break past 4096 in practice. The game triggered an explosion of variants: 1024, Fibonacci, hex-board, and others. Despite its simplicity, it has been used in academic research on AI planning algorithms because the game tree is deep enough to challenge machine solvers.`,
    tips: [
      'Pick one corner — usually bottom-left or bottom-right — and keep your highest tile there always.',
      'Build a snake pattern along the bottom row to keep large numbers adjacent and ready to merge.',
      'Never slide in the direction that would displace your highest corner tile unless absolutely forced.',
      'Prioritize merges in the bottom row; only merge upward once the bottom row is ordered.',
      'If the board gets full, look for a move that creates the most merges in a single swipe.',
    ],
  },

  breakout: {
    howToPlay: [
      'Move the paddle by moving your mouse left and right across the screen.',
      'On touch devices, drag your finger to position the paddle.',
      'Click or tap to launch the ball at the start of each life.',
      'Bounce the ball off the paddle to hit and destroy all the bricks above.',
      'You have three lives — if the ball falls past the paddle, you lose one.',
    ],
    about: `Breakout was developed by Atari in 1976, with the hardware prototype famously built by Steve Wozniak (who would co-found Apple the same year). The original design challenge was to reduce the component count of Pong from around 150 chips to as few as possible — Wozniak allegedly got it down to 42 chips in four nights, a feat so impressive Atari engineers initially assumed the design contained an error. The game's core concept — bouncing a ball to destroy a wall of bricks — became enormously influential, directly spawning the Arkanoid series, which added power-ups and boss levels in 1986, and countless variations that followed. Breakout is an elegant physics puzzle at heart: the angle the ball deflects depends on where it hits the paddle, giving skilled players precise control over their shot. Destroying corner bricks creates narrow angles that trace fast ricocheting paths through the remaining rows, rewarding players who break through the grid strategically rather than randomly.`,
    tips: [
      'Aim for the sides early to create a channel — once the ball breaks through, it bounces rapidly in the ceiling zone and clears bricks fast.',
      'When the ball is in the upper zone, hold the paddle still and let the physics work rather than chasing it.',
      'Hit the paddle near its edges to sharpen the deflection angle; center hits give flatter trajectories.',
      'Focus on clearing the top rows first — they\'re worth more points and breaking through unlocks ceiling play.',
      'Don\'t panic-track the ball; position the paddle ahead of where the ball is heading, not where it is.',
    ],
  },

  'space-invaders': {
    howToPlay: [
      'Use Left and Right Arrow Keys to move your cannon horizontally.',
      'Press Z or Spacebar to fire a laser upward.',
      'On touch devices, touch the left or right side of the screen to move, and the top to shoot.',
      'Destroy all rows of aliens before they reach the bottom of the screen.',
      'The aliens descend faster as their numbers decrease — don\'t let them land.',
    ],
    about: `Space Invaders was created by Tomohiro Nishikado and released by Taito in Japan in 1978. It was the first game to introduce a high-score table that retained the top ten scores, creating competitive replay long before online leaderboards existed. An interesting piece of hardware history: the original arcade cabinet's processor was too slow to update all 55 aliens at full speed, so the enemies moved faster as they were destroyed — a bug that became the game's defining feature, since the frantic final few aliens are far more nerve-wracking than the opening wave. Space Invaders is credited with establishing the shoot-'em-up as a genre and is often cited as the game that saved the arcade industry following the 1977 video game crash. In Japan, it caused a nationwide shortage of 100-yen coins. This browser version recreates the descending alien formation, the increasing speed mechanic, and the satisfying rhythm of systematic alien elimination.`,
    tips: [
      'Clear one side column top to bottom first — removing a flank prevents flanking shots from those angles.',
      'The aliens in the bottom row are worth fewer points but removing them slows the descent timer.',
      'Shoot the mystery UFO that crosses the top of the screen — it awards bonus points.',
      'As the formation shrinks, prioritize shooting the fastest-moving remaining aliens.',
      'Don\'t stand still — the alien laser fire pattern targets your current position, so keep moving.',
    ],
  },

  'pac-man': {
    howToPlay: [
      'Use the Arrow Keys to steer Pac-Man through the maze.',
      'On mobile, swipe in the direction you want to move.',
      'Eat all the small white dots to complete the level.',
      'Collect a Power Pellet (the four large dots in the corners) to turn the ghosts blue — then eat them for bonus points.',
      'Avoid the ghosts when they are their normal colors; if they catch you, you lose a life.',
    ],
    about: `Pac-Man was designed by Toru Iwatani at Namco and released in Japanese arcades in May 1980. Iwatani has said the character design was inspired by looking at a pizza with a slice removed. Unusually for its era, the game was explicitly designed to appeal to female players and couples — Iwatani wanted a game where people ate things rather than shot things, featuring bright colors and cute characters. It worked: Pac-Man became the best-selling arcade game of all time, with over 400,000 cabinets sold. The four ghosts — Blinky, Pinky, Inky, and Clyde — each follow distinct AI patterns. Blinky chases directly; Pinky targets four tiles ahead of Pac-Man; Inky uses a complex formula involving both the player position and Blinky's location; Clyde chases until close, then retreats to his corner. Understanding these patterns transforms the game from frantic scrambling into precise choreography.`,
    tips: [
      'Learn the ghost AI: Blinky follows you, Pinky leads ahead — use that to set ambushes for power pellets.',
      'Eat power pellets only when multiple ghosts are nearby to maximize the blue-ghost bonus chain.',
      'Fruit items appear in the center of the maze twice per level and are worth large bonus points — grab them.',
      'If cornered, loop through a tunnel exit — ghosts cannot enter the tunnels at full speed.',
      'The T-intersections near ghost house are danger zones; move through them quickly and predictably.',
    ],
  },

  pong: {
    howToPlay: [
      'Move the mouse up and down to control your paddle on the left side.',
      'On touch devices, drag your finger vertically to steer.',
      'You can also use the Up and Down Arrow Keys on keyboard.',
      'Hit the ball past the CPU paddle on the right to score a point.',
      'First player to reach 10 points wins the match.',
    ],
    about: `Pong was developed by Allan Alcorn under Atari founder Nolan Bushnell and released in 1972, making it the first commercially successful arcade video game. Alcorn has said the project was designed as a training exercise — Bushnell never expected it to become a real product. The first prototype cabinet was installed in a bar in Sunnyvale, California; within days, the machine broke down because it was overflowing with quarters. Pong is a deliberate simplification of table tennis: two paddles, one ball, two numbers. That reduction to pure essentials is why it remains playable over fifty years later. The ball's angle of deflection changes depending on where it hits the paddle — hitting the edge sends it at a steep angle, while a center hit returns it straight. This single mechanic creates meaningful strategy, allowing skilled players to deliberately target the extremes of the opponent's reach.`,
    tips: [
      'Position your paddle based on where the ball is heading, not where it is — anticipate, don\'t chase.',
      'Aim for the top or bottom edges of the CPU paddle rather than its center to create awkward deflections.',
      'Hit the ball with the top or bottom edge of your own paddle to send it at sharp angles the CPU struggles with.',
      'When the CPU returns a steep angle, the ball will travel fast — start moving your paddle immediately.',
      'After scoring, reset to center position so you\'re ready for the next serve.',
    ],
  },

  asteroids: {
    howToPlay: [
      'Press Left and Right Arrow Keys to rotate your ship.',
      'Press Up Arrow to thrust forward in the direction you are facing.',
      'Press Spacebar to fire bullets.',
      'On touch devices, tap the left half to rotate, the right half to thrust, and the top to shoot.',
      'Shoot asteroids to break them into smaller pieces. Large asteroids split into two medium ones; medium split into two small ones. Destroy all of them to survive.',
    ],
    about: `Asteroids was developed by Ed Logg at Atari and released in 1979, becoming the highest-grossing Atari game of all time. The game used vector graphics rather than raster pixels, drawing shapes as geometric lines on a special display — a technique that gave it a distinctive look and remarkable clarity at the time. The game world wraps around: a ship or asteroid that crosses one edge of the screen reappears on the opposite side, a feature that becomes strategically important when managing multiple targets. Asteroids is often cited as one of the games most directly influenced by physics — the ship retains momentum after thrust, requiring players to think in terms of velocity and trajectory rather than simply pointing and moving. The UFO enemy that occasionally crosses the screen fires aimed shots, and its presence during a cluttered asteroid field is genuinely tense. Lyle Rains at Atari reportedly pushed for the momentum-based flight model specifically because he felt it created more interesting player decisions.`,
    tips: [
      'After firing thrust, immediately counter-thrust to stop drifting — uncontrolled momentum is the main killer.',
      'Always keep a clear escape corridor; shoot a path before flying through a dense cluster.',
      'The UFO is worth more points than most asteroids — prioritize it when the field is manageable.',
      'Large asteroids move slowly and are easy to hit; clear small ones first as they are the most dangerous.',
      'Use the screen wrap tactically to escape — fly off one edge to reappear behind chasing debris.',
    ],
  },

  minesweeper: {
    howToPlay: [
      'Left-click any cell to reveal it.',
      'The number that appears tells you how many mines are hidden in the eight surrounding cells.',
      'Right-click a cell to place or remove a flag marking a suspected mine.',
      'Your very first click is always guaranteed safe — it will never hit a mine.',
      'Reveal all non-mine cells to win. Clicking a mine ends the game.',
    ],
    about: `Minesweeper has murky origins — variants existed on mainframes in the 1960s — but its most famous form was included with Windows 3.1 in 1992, where it was explicitly intended to teach users how to use a mouse: left-click for primary action, right-click for secondary. That educational purpose is long forgotten, but the game has endured as one of the most-played puzzle games in history by sheer default installation count. The game is fundamentally a logic puzzle: given numerical clues about mine density, deduce the safe cells through deduction and probability. Expert players use "chording" — clicking both mouse buttons simultaneously on a numbered cell once all its neighboring mines are flagged — to rapidly reveal large areas. The game has an active speedrunning community, with the world record for the intermediate difficulty set cleared in under 10 seconds. There is a theoretical element of luck when the puzzle reaches a state with two equally probable solutions, but skilled play minimizes how often you reach those positions.`,
    tips: [
      'Open with a center click to maximize the chance of opening a large safe area on the first reveal.',
      'Work from the corners of numbered groups — corner cells have fewer neighbors, giving faster deductions.',
      'When a "1" is adjacent to only one unrevealed cell, that cell is always a mine: flag it immediately.',
      'Use flags liberally early on; removing mental load from flagged mines speeds up later deductions.',
      'If you must guess, choose cells surrounded by many revealed neighbors — more information means better odds.',
    ],
  },

  'fruit-ninja': {
    howToPlay: [
      'Click and drag the mouse in a slicing motion across the screen to cut flying fruits.',
      'On touch devices, swipe your finger through fruits to slice them.',
      'Slice multiple fruits with a single swipe for combo bonuses.',
      'You have three lives — missing a fruit counts as one miss. Miss three and the game ends.',
      'Avoid the bombs that appear among the fruits — slicing one ends your run immediately.',
    ],
    about: `Fruit Ninja was developed by Halfbrick Studios in Brisbane, Australia, and launched in 2010. It became one of the defining early smartphone games, reaching 300 million downloads within three years of launch. The game's core insight was that touchscreen swipe gestures could be directly mapped to a satisfying physical action — slicing — in a way that felt intuitive in a way no previous mobile game had achieved. The visual and audio feedback of a clean slice across a watermelon or pineapple is carefully tuned for satisfaction, with juice sprays, satisfying sound effects, and slow-motion replays for multi-fruit combos. The game has appeared in research studies examining fine motor coordination, reaction time, and attentional speed. The floating fruit arcs follow realistic ballistic trajectories, meaning experienced players learn to read the launch angle and time their swipes to intercept multiple fruits at the apex of their arc, where they cluster most closely together.`,
    tips: [
      'Let fruits reach the top of their arc before slicing — they slow down at the peak, making multi-fruit swipes easier.',
      'Slice at an angle across the fruit cluster rather than vertically — diagonal cuts cover more area.',
      'Prioritize slicing grouped fruits over isolated ones; a single miss is less costly than missing a combo.',
      'If a bomb appears inside a cluster, cut around it — target fruits on either side and leave the center.',
      'Keep your cursor moving in gentle arcs even between fruits so you can quickly redirect when a new wave launches.',
    ],
  },

  'doodle-jump': {
    howToPlay: [
      'Use the Left and Right Arrow Keys to move the character side to side.',
      'On touch devices, touch the left or right half of the screen to steer.',
      'The character automatically jumps each time it lands on a platform.',
      'Your goal is to climb as high as possible by landing on platforms that appear above you.',
      'Falling off the bottom of the screen ends the game.',
    ],
    about: `Doodle Jump was created by Igor and Marko Pusenjak at Lima Sky and released in 2009, becoming one of the most successful early smartphone games with over 15 million downloads in its first year. The game was inspired by a simple prototype that used the iPhone accelerometer for steering — the Pusenjak brothers realized that tilting a phone to move a character felt natural in a way digital joysticks did not. The premise is pure vertical momentum: land, bounce, climb, never stop. The visual style — hand-drawn on graph paper — was deliberately lo-fi and stood out sharply from the polished 3D aesthetics dominating gaming at the time. Platforms vary by type: solid green ones always hold, blue ones move horizontally, brown ones crumble underfoot, and white ones are cloud-like and disappear on contact. Enemies appear at higher altitudes, requiring precise jumping to land on top and defeat them. The score in Doodle Jump is measured in altitude, not time, encouraging vertical efficiency over safe survival.`,
    tips: [
      'Stay near the center of the screen horizontally — you have less time to react when near the edges.',
      'Look ahead at the next two or three platforms and plan your trajectory, not just the immediate landing.',
      'When platforms get sparse at higher altitudes, prioritize stable green platforms over moving ones.',
      'The character wraps around the screen edges — use this to cut diagonally across the board when platforms are offset.',
      'Don\'t overthink landings on small platforms; slight overshoots are recoverable if you react quickly.',
    ],
  },

  'crossy-road': {
    howToPlay: [
      'Press the Up Arrow to hop forward, Down to step back, Left to step left, Right to step right.',
      'On touch devices, swipe in the direction you want to move.',
      'Time your forward hops to dodge moving cars on roads and leap between logs on rivers.',
      'Step onto lily pads and logs to cross water sections — falling in ends the game.',
      'Your score is the number of forward hops you complete.',
    ],
    about: `Crossy Road was developed by Hipster Whale and released in 2014, earning over 10 million downloads in its first three weeks. It is a modernized take on the 1981 arcade classic Frogger, replacing the fixed grid with a smooth isometric 3D world built from voxel blocks. Where Frogger challenged players to reach a fixed destination, Crossy Road removed the finish line entirely — the road keeps generating endlessly, shifting the goal from completion to pure distance. The game's voxel aesthetic was a deliberate design choice: the blocky characters are playful and immediately recognizable from a distance, making the game legible at any screen size. The rhythm of crossing is deeply satisfying — car dodging uses quick timing, while log hopping requires reading flow patterns across multiple water lanes simultaneously. The game popularized the "endless hopper" genre and has since received multiple sequels, crossovers with Disney, and has been cited as a reference design in mobile game development courses.`,
    tips: [
      'Rivers are usually more dangerous than roads — spend extra time reading the log flow before committing.',
      'On roads, wait for a gap that covers two or three lanes so you can run through without stopping.',
      'Step sideways when a gap in traffic passes to align yourself for the next row rather than waiting in the same column.',
      'Logs on the edge of the screen move off-screen, taking you with them — never stand on an edge-bound log.',
      'Keep a steady hopping rhythm; hesitating in the middle of a road is worse than a slow but consistent pace.',
    ],
  },

  'bubble-shooter': {
    howToPlay: [
      'Move your mouse to aim the launcher at the bottom of the screen.',
      'Click to fire a bubble toward your target.',
      'Match three or more bubbles of the same color to pop them and clear them from the board.',
      'Bubbles that are left disconnected from the top after a match also fall and add to your score.',
      'The game ends if the bubble cluster descends too low.',
    ],
    about: `Bubble Shooter is directly descended from Puzzle Bobble, released by Taito in Japanese arcades in 1994 and internationally as Bust-a-Move. The original game starred Bub and Bob from Bubble Bobble (1986), and its matching mechanic — fire a colored sphere at a cluster, match three, create chain reactions — proved endlessly replayable. The game spawned a genre that remains one of the top-grossing mobile game categories three decades later. The physics model is deceptively deep: bubbles can be banked off the side walls to reach otherwise inaccessible areas of the cluster, and creating large drops by popping clusters holding many unattached bubbles above them is a core strategic move. Professional players read the entire cluster before each shot, planning two or three moves ahead to set up cascades that clear entire sections in a single turn. This browser version preserves the wall-bounce mechanic and drop-chain scoring that makes Puzzle Bobble so much richer than it first appears.`,
    tips: [
      'Bank shots off the side walls to reach bubbles deep in narrow columns that a direct shot can\'t access.',
      'Look for bubbles attached to a single connection point — clearing that connection drops the entire sub-cluster.',
      'Match bubbles near the top of the board first; popping them drops everything below without using additional shots.',
      'If the next bubble is a color you can\'t immediately use, aim it into a corner to keep the main cluster clear.',
      'Never waste shots randomly — every bubble fired that doesn\'t result in a match raises the cluster slightly.',
    ],
  },

  'tower-defense': {
    howToPlay: [
      'Click any empty grid tile to place a tower. Each tower costs 50 gold.',
      'Towers automatically shoot at enemies that enter their range.',
      'Enemies follow a fixed path across the grid toward your base on the right.',
      'Survive each wave to earn gold and maintain your 20 lives.',
      'Each enemy that reaches the base costs one life — lose all 20 and the game ends.',
    ],
    about: `Tower defense as a genre grew out of real-time strategy custom maps, most famously a StarCraft scenario called "Turret Defense" in the late 1990s. The concept crystallized into its own genre with Desktop Tower Defense in 2007, a Flash game by Paul Preece that became a viral hit and remains a design reference point. The appeal lies in the tension between optimal efficiency and reactive adaptation: you plan tower placement before enemies arrive, but the ideal layout is never obvious until a wave reveals the enemy's speed, health, or path pattern. Mazing — building tower rows in a way that forces enemies to take longer paths — is the defining high-level technique, transforming the map into a labyrinth that multiplies tower damage. This version uses a single tower type that shoots any enemy in range, making placement and timing the primary decisions. The gold economy demands balancing tower count against wave pressure: buy too few towers and enemies rush through; buy too many and you won\'t have gold available to plug emergent gaps.`,
    tips: [
      'Place towers to force enemies to zigzag — longer paths mean more shots land before an enemy escapes.',
      'The center of the path is the highest-value tower position because enemies spend the most time near the middle.',
      'Save 100 gold in reserve at all times so you can place two towers immediately if a wave breaks through.',
      'Cluster towers close together so multiple guns cover the same narrow corridor for maximum damage.',
      'Later waves move faster — prioritize blocking path shortcuts enemies could use to bypass your maze.',
    ],
  },

  'memory-match': {
    howToPlay: [
      'Click any face-down card to flip it and reveal its symbol.',
      'Click a second card to reveal it.',
      'If the two cards match, they stay face-up and are removed from play.',
      'If they don\'t match, both cards flip back face-down after a brief pause.',
      'Complete the entire board in the fewest moves to get the best score.',
    ],
    about: `Memory matching card games predate video games by decades, with the tile-flipping format appearing in educational card sets throughout the early twentieth century. The digital version gained wide recognition through Milton Bradley's Electronic Simon in 1978 and later as a standard Windows accessory in the 1990s. Cognitively, the game exercises working memory and spatial recall: each flip encodes the position and symbol of a card, and the challenge is holding that information accurately across a growing number of turns. Research published in psychology journals has used memory match as a benchmark task for studying visual memory capacity, attention, and the effect of aging on short-term recall. Strategy in the game is about more than simply remembering cards — it's about the order in which you flip unknowns. Flipping cards near known unmatched cards first gives you the best chance of incidentally revealing a match while filling in the information map, reducing total moves needed.`,
    tips: [
      'Flip cards in a systematic row-by-row order rather than randomly — systematic scanning builds a complete mental map faster.',
      'When you reveal a card that matches one you\'ve already seen, complete that match immediately before flipping anything else.',
      'Focus on the edges and corners first; they are easier to locate precisely on subsequent turns.',
      'If you don\'t remember a card\'s location, flip near the card you are trying to match — adjacent tiles are misremembered less often.',
      'Aim for under 30 moves on a 4×4 board; under 20 is a near-perfect run.',
    ],
  },

  'whack-a-mole': {
    howToPlay: [
      'Click or tap a mole as soon as it pops up from its hole to whack it.',
      'Each successful whack earns one point.',
      'Moles appear randomly across the grid and disappear quickly if you miss them.',
      'You have exactly 30 seconds per game — whack as many as possible.',
      'Missing moles doesn\'t end the game, but each one is a lost scoring opportunity.',
    ],
    about: `Whack-a-Mole originated in Japan in the 1970s as a physical amusement park game called Mogura Tataki, meaning "Mole Bashing." Players used a padded mallet to hit plastic moles that popped from holes in a table surface. The game arrived in US arcades in the 1980s and became a staple of arcades and carnival midways. Its video game adaptations date to the early PC era, and the game's simple premise — click the thing before it disappears — translated naturally to touchscreens, making it a recurring format in mobile gaming. The psychological appeal comes from the interplay of reaction time, divided attention, and the satisfaction of accurate targeting under time pressure. Studies in human factors engineering have used whack-a-mole paradigms to measure response latency and multi-target tracking performance. Speed increases as the game progresses in many versions, but this browser version keeps a steady pace where spatial awareness and prioritization — recognizing which moles will disappear soonest — matter more than raw reaction speed.`,
    tips: [
      'Keep your cursor or finger near the center of the grid so you can reach any hole in one quick motion.',
      'Glance across the whole grid after each hit rather than fixating on where you just clicked.',
      'Moles that just appeared are safer to chase than ones that have been up a while — those are about to leave.',
      'Don\'t click empty holes after a mole retreats; reset your attention to the full grid immediately.',
      'Aim for 20+ points; consistent players can reach 25–30 on a focused run.',
    ],
  },

  'color-switch': {
    howToPlay: [
      'Click the mouse button or tap the screen to make the ball jump upward.',
      'Release and the ball falls back down under gravity.',
      'The rotating obstacles are divided into colored segments matching the ball\'s current color.',
      'Pass only through the segment that matches the color of your ball.',
      'Touching any differently colored segment ends the game. Collect color-change stars to switch your ball\'s color.',
    ],
    about: `Color Switch was developed by Fortafy Games and released in 2015, reaching 50 million downloads within a year and peaking at number one on the App Store in 100 countries. The game's mechanic is deliberately counterintuitive — obstacles that look threatening are safe if your color matches, while gaps in an obstacle become impassable if you are the wrong color. This inversion of the usual "gap = safe" spatial logic means players must override an instinctive response and substitute a color-matching awareness, which creates a genuinely unusual cognitive challenge. The game operates in a vertical world with only one control: tap to rise. Every design decision flows from that constraint. The gradually increasing obstacle speed and density form a difficulty curve that feels fair even when death is instantaneous, because the rule never changes. Color Switch popularized a subgenre of "one-touch precision" games and has been widely studied in mobile game monetization research as an example of a game loop that retains players through intrinsic satisfaction rather than extrinsic reward schedules.`,
    tips: [
      'Watch the color star to know what color you are about to become — plan your gap selection one move ahead.',
      'Position yourself in the correct lane before the obstacle arrives rather than making last-second corrections.',
      'Tap in short controlled bursts to maintain a steady altitude rather than big jumps that overshoot gaps.',
      'Don\'t fixate on your ball; keep your gaze on the next obstacle above so you see its rotation and gap alignment early.',
      'Scores above 20 require memorizing the obstacle sequence — write down the pattern if you want to push high.',
    ],
  },

  'pool-8': {
    howToPlay: [
      'Move the mouse around the cue ball to aim your shot — the cue line shows the direction.',
      'Hold down the mouse button to charge shot power; a power meter fills as you hold.',
      'Release the mouse button to take the shot.',
      'Choose VS CPU to play against the computer or Hot Seat to pass the device with a friend.',
      'Pot all your assigned balls (solids or stripes) and then sink the 8-ball to win. Potting the 8-ball early — or scratching on it — loses the game immediately.',
    ],
    about: `Eight-ball pool is played on a six-pocket billiard table and is the most popular pool game in the world. The format traces its origins to American pool halls in the early 1900s, where 15-ball rotation games gave way to the two-group (solids and stripes) structure that defines 8-ball today. The World Pool-Billiard Association formalized the international rules in the 1990s, though regional rule variations still exist, particularly around fouls on the black. In competitive play, the break shot — the opening collision with the racked balls — is critically important: a powerful, precise break can pot one or more balls and immediately give the breaking player a strategic advantage by revealing which ball groups are easiest to run. This browser version uses a physics engine to model realistic ball collisions, roll friction, and pocket suction, offering a faithful simulation of the key decision at the heart of pool: balancing shot selection against cue ball position control, known as "leaving a good leave."`,
    tips: [
      'Always plan two shots ahead — where the cue ball will end up after this shot shapes your next option.',
      'Low power shots give you far more cue ball position control than full-power shots.',
      'Clear your problem ball — the one that\'s nearly blocking a pocket — early, not last.',
      'When playing CPU, take your time on aim; the AI does not have a turn timer.',
      'Avoid leaving the cue ball near the 8-ball when you still have remaining balls — accidental 8-ball pots lose immediately.',
    ],
  },

  'endless-runner': {
    howToPlay: [
      'Press Spacebar or Up Arrow to jump over obstacles.',
      'Press Spacebar or Up Arrow a second time while airborne to perform a double jump.',
      'Press Down Arrow or S to slide under low barriers.',
      'The character runs automatically — you only control jumping and sliding.',
      'Survive as long as possible. The speed increases over time.',
    ],
    about: `The endless runner genre exploded with Temple Run in 2011 by Imangi Studios and was further popularized by Subway Surfers in 2012, together accumulating over three billion downloads. The core appeal is the simplest possible loop: infinite forward momentum interrupted by obstacles requiring binary reactions — jump or duck. What keeps it engaging is the escalating speed; what begins as a leisurely jog becomes a sprint requiring split-second decisions. The genre is often used as a benchmark in game feel research because the quality of jump arc physics — the precise curve of ascent and fall — directly determines whether players feel "in control" or "at the mercy of the game." Double-jump mechanics, as featured here, add a second window of air control that dramatically expands strategic options, allowing players to react to obstacles they would otherwise have committed past. The slide action creates a complementary low-profile dodge that requires recognizing obstacle type before reacting, adding visual reading skill to the timing challenge.`,
    tips: [
      'Use the first jump conservatively and save the double jump as a safety net for mid-air obstacle sightings.',
      'Start the slide input slightly early — the slide animation has a brief startup that can miss a narrow window.',
      'Obstacles tend to cluster; after a jump, stay alert rather than relaxing until the path is clearly clear.',
      'At high speeds, focus on the near-middle distance rather than directly in front of the character for earlier reaction time.',
      'Scores in the high hundreds require committing to fast reads — don\'t hesitate between jump and slide once you see the obstacle type.',
    ],
  },

  'simon-says': {
    howToPlay: [
      'Watch the sequence as colored buttons light up in order.',
      'After the sequence plays, click or tap each button in the same order to repeat it.',
      'Each successful round adds one more color to the sequence.',
      'On mobile, tap the color panels with your finger.',
      'Making a mistake ends the game — concentration and short-term memory are everything.',
    ],
    about: `Simon Says derives from the electronic game Simon, invented by Ralph Baer and Howard Morrison and launched by Milton Bradley in 1978. Baer — who also invented the first home video game console, the Magnavox Odyssey — designed Simon as a compact four-button memory device with a distinctive circular shape and colored segments. The game became an immediate cultural touchstone, selling millions of units through the 1980s. It is directly based on a cognitive psychology task called the digit span test, where subjects repeat sequences of numbers of increasing length to measure working memory capacity. The average person can hold approximately seven items in working memory (plus or minus two), but Simon's interleaving of color and audio cues can push beyond that limit through a technique called "chunking" — grouping sequences into rhythmic sub-patterns. This browser version presents the four classic colors — green, red, yellow, blue — and challenges you to match sequences that grow by one step each round. Reaching level 10 is a respectable milestone; level 20 requires active chunking strategies.`,
    tips: [
      'Vocalize the color names as the sequence plays — hearing and saying them builds a stronger memory trace than watching alone.',
      'Group long sequences into rhythmic chunks of three or four, like memorizing a phone number.',
      'Don\'t rush your input — take a breath after the sequence ends before you begin repeating.',
      'If you lose track mid-sequence, pause and reconstruct from the last chunk you are confident about.',
      'Practice sequences up to level 8 before pushing for records — building consistent short-sequence recall is faster than brute-forcing long ones.',
    ],
  },

  'ping-pong': {
    howToPlay: [
      'Move the mouse up and down to control your paddle on the left side of the table.',
      'Use the Up and Down Arrow Keys or W and S keys as an alternative.',
      'Hit the ball back across the net past the CPU paddle on the right to score a point.',
      'The ball speeds up slightly after each exchange.',
      'First to reach 7 points wins the match.',
    ],
    about: `Table tennis, more commonly known as ping-pong, was invented in England in the late 1890s as an after-dinner parlour game for the upper classes. Early versions used books as a net, champagne corks as balls, and cigar box lids as paddles. The sport was formalized by the International Table Tennis Federation in 1926 and became an Olympic sport in 1988. In competitive play, table tennis is among the fastest reflex sports in the world — elite professionals can return balls traveling at over 170 kilometers per hour, with reaction windows under 150 milliseconds. The digital version traces directly to Atari's Pong (1972), which abstracted the sport to its mathematical essentials: two paddles, one ball, two scores. This browser version adds CPU difficulty that escalates with each game, rewarding players who develop angle control over raw paddle speed. The key strategic element carried over from the real sport is deflection angle: hitting the ball with the edge of the paddle sends it at a sharp angle that is harder for the CPU to reach.`,
    tips: [
      'Aim for the corners of the CPU side — the CPU paddle has to travel its full length to reach corner shots.',
      'Let the ball come to your paddle rather than chasing it; you\'ll have more control at the moment of contact.',
      'Return steep angles with steep angles to prevent the CPU from getting reset position.',
      'When the ball is moving slowly after an edge hit, that\'s the ideal moment to place a precise corner shot.',
      'Don\'t tunnel-vision on the ball; keep track of CPU paddle position to identify which corner is unprotected.',
    ],
  },

  'typing-speed': {
    howToPlay: [
      'Type the word shown on each falling object using your keyboard.',
      'The word disappears when you type it correctly — no need to press Enter.',
      'Words fall at increasing speed as your level rises.',
      'You have three lives — if a word hits the bottom without being typed, you lose one life.',
      'Scoring higher words gives more points; longer and less common words are worth more.',
    ],
    about: `Typing speed games trace their lineage to the early 1980s, when educational software titles like Mavis Beacon Teaches Typing used game-like tasks to make touch-typing practice engaging. The falling-word format specifically popularized in the 2000s through web games like ZType and Typer Shark, which added a threat element to typing practice by making speed and accuracy matter for survival. Words per minute — the standard measure of typing speed — combines both speed and accuracy: the average adult types around 40 WPM, while professional typists and programmers often exceed 80–100 WPM. This game format is an excellent real-world typing trainer because the threat of falling words creates genuine urgency, activating the same focused attention state found in competitive typing. The game also implicitly rewards touch-typing (using all fingers without looking at the keyboard) over hunt-and-peck typing, as visual scanning of the keyboard takes critical time away from reading and tracking the falling words.`,
    tips: [
      'Keep your eyes on the screen, not your keyboard — looking down is the single biggest speed killer.',
      'Type the highest-positioned falling word first; let lower, newer words wait.',
      'If two words appear simultaneously, prioritize the longer one — it\'s harder to type fast under pressure.',
      'After finishing one word, scan immediately for the next before it gets dangerously low.',
      'At higher levels, start typing the moment a word appears even if it\'s still high on screen — every second counts.',
    ],
  },

  'brick-breaker': {
    howToPlay: [
      'Move the mouse left and right to control the paddle at the bottom of the screen.',
      'Use the Left and Right Arrow Keys as an alternative control.',
      'Press Spacebar to launch the ball at the start of a round.',
      'Destroy all bricks above to advance to the next level.',
      'Collect falling power-ups for bonuses: multi-ball splits the ball into three, wide paddle extends your reach, and speed boost accelerates the ball.',
    ],
    about: `Brick Breaker Deluxe is a modern evolution of the Breakout formula that Atari introduced in 1976. The key innovation that separates it from its ancestor is the power-up system, which was first introduced in Taito's Arkanoid in 1986. Power-ups transformed the game from a deterministic physics puzzle into a resource management challenge — the wide paddle that saves you on level three may not drop on level six when you need it most, demanding adaptability. Modern brick-breaker titles have further expanded the formula with boss bricks, indestructible obstacles, multi-colored brick health bars, and themed level layouts. This version features the three most celebrated power-ups: multi-ball (which turns one ball into three, dramatically increasing clear rate at the cost of paddle management complexity), wide paddle (which extends the catch zone, reducing loss risk), and speed boost (which increases scoring rate but demands faster reaction time). Managing the tradeoff between these effects while maintaining ball control is the genuine skill expression that separates casual players from expert runs.`,
    tips: [
      'Aim deliberately for corner bricks first — breaking through creates an upper-zone channel where the ball ricochets rapidly.',
      'When multi-ball is active, focus on the lowest ball first since higher balls can still reach bricks even if you miss briefly.',
      'Hit the ball with the paddle edge to add angle — flatter shots return to the same column repeatedly rather than clearing rows.',
      'Speed boost power-ups are double-edged: grab them only when the remaining brick count is low enough to manage at high speed.',
      'Always launch the ball at an angle rather than straight up — a vertical ball bounces back and forth predictably and clears slowly.',
    ],
  },
  'gem-blast': {
    howToPlay: [
      'Click or tap a gem on the board to select it — it will show a white ring.',
      'Click or tap an adjacent gem (up, down, left, or right) to swap the two.',
      'The swap only goes through if it creates a match of 3 or more same-colored gems in a row or column.',
      'If the swap would not create a match, the gems bounce back and no move is used.',
      'You have 20 moves. After each valid swap the board refills from above and any chain reactions score automatically.',
    ],
    about: `Match-3 puzzle games trace their lineage to the 1994 Japanese puzzle game Chain Shot, but the format reached mainstream audiences with Bejeweled, released by PopCap in 2001. Bejeweled was one of the first games to prove that a casual puzzle title could sustain a global audience of hundreds of millions, and its gem-swapping mechanic became one of the defining interaction patterns of the entire mobile gaming era. Candy Crush Saga, launched by King in 2012, pushed the format to extraordinary commercial heights — at its peak it was generating over a million dollars per day. The appeal of match-3 lies in a satisfying cognitive loop: scan, plan, swap, watch chain reactions cascade. The cascade mechanic in particular — where clearing one set of gems causes new ones to fall and create further matches without player input — produces a sense of lucky discovery that keeps players engaged across thousands of sessions. Gem Blast distills this loop to its essentials: a clean 8×8 board, 6 jewel colors, 20 moves, and a combo multiplier that rewards the patient player who sets up multi-step cascades over reactive single-match swaps.`,
    tips: [
      'Scan the whole board before every move — near-matches one swap away are often hidden in busy rows.',
      'Combo multipliers stack quickly: a chain reaction after a valid swap scores at 1.5× and each cascade adds another 0.5×, so setting up multi-step falls is far more efficient than isolated matches.',
      'Vertical matches (columns) are often easier to set up and more valuable than horizontal ones since gravity naturally refills columns.',
      'Save your moves when you spot a potential 5-gem match — the 100-point base value plus a combo multiplier can swing your score dramatically.',
      'When moves run low (five or fewer), the board edge pulses red — at that point focus on any valid swap rather than hunting for long matches.',
    ],
  },

  'balloon-pop': {
    howToPlay: [
      'Tap or click a balloon to pop it before it floats off the top of the screen.',
      'Each ordinary balloon is worth 1 point; the rarer gold balloons are worth 5.',
      'Balloons rise faster and spawn more often as your score climbs, so keep your eyes moving.',
      'The round lasts 60 seconds — pop as many as you can before the timer reaches zero.',
      'When time runs out your score is recorded. Tap PLAY to try to beat it.',
    ],
    about: `Balloon Pop belongs to a family of "tap-to-clear" games that became hugely popular on touchscreens because they translate a simple real-world joy — popping a balloon — into an instantly understandable digital action. There is no manual to read and no controls to learn: you see a balloon, you tap it, it pops with a satisfying burst. That immediacy is exactly why games of this style are among the first that very young children can play unaided, and why they remain a staple of educational and casual game collections. Beneath the simplicity sits a gentle skill curve built entirely around hand-eye coordination and prioritisation. As the spawn rate rises the player must decide in a fraction of a second which balloon to reach for, and the occasional high-value gold balloon introduces a small risk-reward choice: chase the bonus, or clear the easy points in front of you. This version keeps the presentation bright and friendly — a clear blue sky, drifting clouds, and a countdown timer that turns red in its final seconds to build a little excitement without ever feeling stressful.`,
    tips: [
      'Pop balloons near the top of the screen first — they are the closest to escaping and being lost.',
      'Always divert to gold balloons when one appears; a single gold is worth five ordinary pops.',
      'Use two thumbs on a touchscreen so you can clear both sides of the screen at once.',
      'Do not tunnel-vision on one balloon — keep your eyes scanning the whole sky for the next target.',
      'In the final ten seconds go for volume: tap quickly and steadily rather than aiming for perfect pops.',
    ],
  },

  'kids-math': {
    howToPlay: [
      'Read the sum shown in the middle of the screen — it will be an addition or a subtraction.',
      'Three answer buttons appear below it; tap the one you think is correct.',
      'A correct answer scores a point and brings up the next, slightly harder sum.',
      'A wrong answer costs you one of your three hearts.',
      'The game ends when all three hearts are gone — try to solve as many sums as you can!',
    ],
    about: `Kids Math sits in the long and well-studied tradition of "drill and practice" educational games, a category that researchers have found genuinely effective for building arithmetic fluency in early learners. The core idea is simple: repeated, low-pressure exposure to number facts helps them move from slow, effortful counting to fast, automatic recall. What a game adds over a worksheet is immediate feedback and a light layer of motivation — a score to grow, hearts to protect, and a cheerful "Correct!" the moment a child gets an answer right. This version starts with small addition problems and gradually introduces subtraction and larger numbers as the player's score rises, a pacing approach known as adaptive difficulty that keeps the challenge in the sweet spot between boring and frustrating. The three-answer multiple-choice format is deliberate: it keeps young children reading and comparing numbers rather than being blocked by having to type, and the wrong answers are chosen to be close to the right one so that a child has to actually work out the sum rather than guess by size alone.`,
    tips: [
      'For addition, count on from the larger number — it is faster than starting from the smaller one.',
      'For subtraction, think "what do I add to the small number to reach the big one?"',
      'The wrong answers are usually close to the right one, so double-check before you tap.',
      'Do not rush — there is no timer, so accuracy matters far more than speed here.',
      'If you lose a heart, stay calm; a steady run of correct answers will quickly rebuild your score.',
    ],
  },

  'animal-match': {
    howToPlay: [
      'All sixteen cards start face down, showing a question mark.',
      'Tap a card to flip it over and reveal the animal hiding underneath.',
      'Tap a second card to try to find its matching pair.',
      'If the two animals match they stay face up; if they do not, both flip back over.',
      'Find all eight pairs to win — and try to do it in as few moves as possible!',
    ],
    about: `Animal Match is a classic concentration game — the same "turn two cards and find the pair" format that has been played with physical cards for well over a century and that child-development specialists still recommend today. Its enduring place in early education is no accident: matching games are one of the most reliable ways to exercise a young child's short-term visual memory, because success depends entirely on remembering where a picture was seen a few moves earlier. Each turn is a tiny memory test, and because the feedback is instant and the theme is friendly, children happily repeat that test dozens of times in a single sitting. Choosing animals as the picture set adds a second layer of value — recognising and naming the dog, cat, fox or panda turns the game into gentle vocabulary practice alongside the memory work. This version uses a four-by-four grid of eight pairs, a size large enough to be a real challenge for the memory yet small enough that a determined young player can clear the whole board, and it counts your moves so that older children can turn it into a personal challenge to beat their own best.`,
    tips: [
      'Start by flipping cards in a steady order so you build a mental map of where each animal sits.',
      'When you reveal a new animal, take a moment to note its position before moving on.',
      'If you have already seen an animal, go straight for its partner rather than flipping at random.',
      'Work along rows or columns rather than jumping around — it is far easier to remember an orderly search.',
      'Fewer moves means a higher score, so patience and memory beat fast random guessing every time.',
    ],
  },

  'catch-the-fruit': {
    howToPlay: [
      'Move the basket left and right along the bottom of the screen.',
      'Drag with your finger or mouse, or use the Left and Right arrow keys.',
      'Catch the falling fruit to score a point for each piece.',
      'Avoid the dark bombs — catching one costs you a life, and you only have three.',
      'The fruit falls faster and faster as your score grows. The game ends when your lives run out.',
    ],
    about: `Catch the Fruit is a modern take on the "catcher" genre, one of the oldest and most intuitive video game formats in existence — the idea of steering a paddle or basket to catch falling objects dates back to the earliest days of arcade gaming in the 1970s. Its staying power comes from how naturally it maps onto a single, continuous skill: tracking a moving object and positioning yourself to intercept it. Because that skill is something children practise constantly in the physical world, a catcher game feels immediately familiar even to a player who has never held a controller. The design introduces a clean risk element in the form of bombs, which transforms the game from a passive catch-everything exercise into a series of quick decisions — is that falling object worth reaching for, or should I stay clear? As the fall speed ramps up with the score, the window for each of those decisions narrows, producing a difficulty curve that rewards calm, anticipatory movement over frantic reaction. Bright fruit, a friendly wooden basket, and a simple three-life structure keep the whole experience welcoming for younger players while still offering a satisfying high-score chase for anyone who wants to master it.`,
    tips: [
      'Watch the top of the screen, not the basket — reading where fruit spawns gives you time to line up the catch.',
      'Move to where the fruit will land, then wait there rather than chasing it down.',
      'When a bomb and a fruit fall close together, give up the fruit — a life is worth far more than one point.',
      'Small, early adjustments beat big last-second dashes as the speed increases.',
      'On a touchscreen, keep your finger just above the basket so your hand never blocks your view of the falling items.',
    ],
  },

  'piano-tiles': {
    howToPlay: [
      'Colored tiles scroll down the screen in four lanes.',
      'Tap the colored tile in each row — one lane in every row is coloured.',
      'Work from the bottom upward: always tap the lowest coloured tile next.',
      'If you tap the wrong lane, or let a coloured tile slip off the bottom, the game ends.',
      'Every correct tap scores a point and the tiles speed up a little.',
    ],
    about: `Piano Tiles is one of the most successful mobile game formats of the 2010s — the original "Don't Tap the White Tile" became a worldwide sensation by reducing a game to a single, perfectly clear rule: hit the black tiles, never the white ones. That clarity is what makes the genre so accessible to children and newcomers; there is nothing to read, no strategy to learn, just a stream of targets and the simple instruction to tap them in order. Underneath the simplicity is a genuine test of reaction speed and sustained focus. Because the tiles accelerate as your score climbs, every run becomes a gradually tightening challenge that ends the instant your attention slips, which produces the "just one more try" pull that defines the format. This version keeps the friendly essentials — four lanes, brightly coloured tiles, and a clean white board — while removing anything that might frustrate a young player, so the only thing standing between them and a new high score is how quickly and accurately they can tap.`,
    tips: [
      'Keep your eyes near the bottom of the board where the next tile to tap appears.',
      'Rest a finger or thumb over each side of the screen so you can reach any lane instantly.',
      'Tap in a steady rhythm rather than rushing — most misses come from panicking as the speed rises.',
      'Do not look at the tile you are tapping; look ahead to the next one so you are always prepared.',
      'If you feel overwhelmed, slow your breathing — a calm, even tapping pace beats frantic stabbing.',
    ],
  },

  'shape-match': {
    howToPlay: [
      'A single shape appears near the top of the screen.',
      'Three cards below show different shapes, each in its own colour.',
      'Tap the card whose shape matches the one at the top.',
      'The colours may be different — match by the shape, not the colour.',
      'A correct match scores a point; a wrong one costs a life. You have three lives.',
    ],
    about: `Shape Match is built around one of the earliest and most important skills a young child develops: visual discrimination, the ability to notice how one form differs from another. Long before children can read or count reliably, they can learn to tell a circle from a square or a star from a triangle, and matching games like this one turn that learning into play. Educators have used shape-sorting activities for generations precisely because recognising and naming shapes lays groundwork for later skills, from letter recognition to geometry. By deliberately giving the shapes different colours, this version pushes the player to focus on form rather than taking the shortcut of matching by colour — a small design choice that makes the game a genuine shape-recognition exercise rather than a colour-matching one. The three-lives structure keeps the stakes gentle and forgiving, so a child can make a mistake or two and keep playing, while the steadily growing score gives them a clear, encouraging sense of progress.`,
    tips: [
      'Name the top shape out loud — "star" or "square" — before you look at the cards.',
      'Ignore the colours completely; they are there to trick you into a wrong tap.',
      'Look at the corners: a triangle has three, a square four, a diamond sits on its point.',
      'There is no timer, so take a moment to be sure before you tap.',
      'A star and a diamond are the two most confused shapes — count the points to be certain.',
    ],
  },

  'basketball-shoot': {
    howToPlay: [
      'A hoop slides left and right across the top of the court.',
      'The ball sits at the bottom, right in the middle.',
      'Tap anywhere to shoot the ball straight up.',
      'You score a basket if the hoop is directly above the ball at the moment your shot reaches it.',
      'Sink as many baskets as you can before the 60-second timer runs out.',
    ],
    about: `Basketball has been one of the most popular subjects for simple video games since the earliest days of the arcade, and the appeal of a quick "shoot the hoops" game has never really faded — the pop-a-shot arcade cabinet and countless phone versions all tap into the same satisfying loop of aim, release, and score. What makes a shooting game work as a pure skill test is timing: strip away the running and passing of a full basketball game and you are left with the single most rewarding moment, the swish of a made shot. This version turns that moment into a rhythm-and-timing challenge. Because the ball always rises straight up and the hoop drifts steadily from side to side, success depends entirely on reading the hoop's motion and releasing at exactly the right instant — a skill that improves noticeably with practice, which is what keeps a player coming back to beat their last total. The moving hoop speeds up as you score, gently raising the challenge so that a good run feels genuinely earned.`,
    tips: [
      'Do not shoot when the hoop is at the edges — wait for it to swing back toward the middle.',
      'Tap a fraction of a second before the hoop reaches the centre, since the ball takes time to rise.',
      'Watch the hoop for a few swings before your first shot to learn its rhythm.',
      'The hoop moves fastest as it crosses the centre, so time that crossing carefully.',
      'As your score climbs the hoop speeds up — shorten your timing to match the quicker swing.',
    ],
  },

  'lane-runner': {
    howToPlay: [
      'Your character runs forward automatically down a three-lane road.',
      'Tap the left side of the screen to move one lane left, the right side to move right.',
      'You can also use the Left and Right arrow keys on a keyboard.',
      'Dodge the orange cones by switching out of their lane before you reach them.',
      'The longer you survive, the higher your score — but the road speeds up as you go.',
    ],
    about: `The endless runner is one of the defining game genres of the smartphone era, popularised by titles like Temple Run and Subway Surfers that turned a single continuous dash into a global pastime. Its brilliance lies in compressing an entire game into one uninterrupted flow: there are no levels to load and no menus to navigate, just a character that never stops moving and a player who must react to whatever comes next. That structure is a natural fit for young players and quick sessions alike, because the rules are visible in the first two seconds of play — move out of the way of the obstacles. This version distils the genre to its cleanest form with three fixed lanes and a single type of obstacle, removing the fiddly jumps and slides of larger runners so that the whole game rests on one clear decision made over and over: which lane is safe? As the speed steadily rises, the gaps between decisions shrink, building the escalating tension that makes an endless runner so hard to put down while never becoming unfair.`,
    tips: [
      'Look ahead to the top of the road, not at your character, so you spot cones early.',
      'Move only when you need to — unnecessary lane changes can put you into the path of the next cone.',
      'The middle lane gives you the most options, so return to it when the road is clear.',
      'React to the lowest cone first; deal with one obstacle at a time rather than planning too far ahead.',
      'As the speed builds, make your lane switches earlier — hesitating even a moment gets harder to recover from.',
    ],
  },
}

export default gameContent
