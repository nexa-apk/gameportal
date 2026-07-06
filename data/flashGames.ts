export interface FlashGame {
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  swfFile: string;
  width: number;
  height: number;
  playCount: number;
}

export const flashGames: FlashGame[] = [
  {
    slug: "fancy-pants-adventures",
    title: "Fancy Pants Adventures",
    description: "Classic Flash platformer with a stick figure in fancy pants. Run, jump and explore smooth hand-drawn worlds!",
    category: "Platformer",
    thumbnail: "/flash/thumbs/fancy-pants.png",
    swfFile: "/flash/games/fancy-pants.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
  {
    slug: "learn-to-fly",
    title: "Learn to Fly",
    description: "Help a penguin learn to fly! Upgrade your glider and launcher to soar higher and farther each run.",
    category: "Arcade",
    thumbnail: "/flash/thumbs/learn-to-fly.png",
    swfFile: "/flash/games/learn-to-fly.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
  {
    slug: "super-mario-flash",
    title: "Super Mario Flash",
    description: "Fan-made Mario game built in Flash. Classic side-scrolling action with familiar enemies and power-ups.",
    category: "Platformer",
    thumbnail: "/flash/thumbs/super-mario-flash.png",
    swfFile: "/flash/games/super-mario-flash.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
  {
    slug: "age-of-war",
    title: "Age of War",
    description: "Build defenses, train troops and evolve through the ages. Destroy the enemy base before they destroy yours!",
    category: "Strategy",
    thumbnail: "/flash/thumbs/age-of-war.png",
    swfFile: "/flash/games/age-of-war.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
  {
    slug: "electricman-2",
    title: "Electricman 2",
    description: "Enter the Tournament of Voltagen as the legendary Electric Man. Unleash slow-motion combat combos!",
    category: "Fighting",
    thumbnail: "/flash/thumbs/electricman-2.png",
    swfFile: "/flash/games/electricman-2.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
  {
    slug: "strike-force-heroes",
    title: "Strike Force Heroes",
    description: "Epic side-scrolling shooter with RPG elements. Level up your soldiers and unlock powerful weapons!",
    category: "Shooter",
    thumbnail: "/flash/thumbs/strike-force-heroes.png",
    swfFile: "/flash/games/strike-force-heroes.swf",
    width: 640,
    height: 480,
    playCount: 0,
  },
];
