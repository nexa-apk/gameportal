import { redirect } from "next/navigation";
import { flashGames } from "@/data/flashGames";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = flashGames.find(g => g.slug === slug);
  if (!game) return { title: "Game Not Found" };
  return {
    title: `${game.title} — Play Free | NexaGames`,
    description: game.description,
  };
}

export async function generateStaticParams() {
  return flashGames.map(g => ({ slug: g.slug }));
}

export default async function FlashGamePage() {
  redirect("/");
}
