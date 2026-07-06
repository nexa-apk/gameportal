import { redirect } from "next/navigation";
import { flashGames } from "@/data/flashGames";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classic Flash Games — NexaGames",
  description: "Play classic Flash games in your browser. Powered by Ruffle — no plugin needed!",
};

export default function FlashPage() {
  redirect("/");
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
            ← Back
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-2">⚡ Classic Flash Games</h1>
          <p className="text-gray-400">
            Relive the golden age of browser gaming. All games run via{" "}
            <a href="https://ruffle.rs" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              Ruffle
            </a>{" "}
            — no Flash plugin needed!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {flashGames.map(game => (
            <Link
              key={game.slug}
              href={`/flash/${game.slug}`}
              className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:scale-105"
            >
              <div className="aspect-video bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  ⚡
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 text-xs bg-yellow-500/80 text-black font-bold rounded">
                    CLASSIC
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm group-hover:text-purple-400 transition-colors line-clamp-1">
                  {game.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{game.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
