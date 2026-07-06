"use client";
import { useEffect, useRef } from "react";

interface FlashPlayerProps {
  swfUrl: string;
  width: number;
  height: number;
  title: string;
}

export default function FlashPlayer({ swfUrl, width, height, title }: FlashPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRuffle = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";

      // Load Ruffle script
      const script = document.createElement("script");
      script.src = "/flash/ruffle/ruffle.js";
      script.onload = () => {
        const ruffle = (window as any).RufflePlayer.newest();
        const player = ruffle.createPlayer();
        player.style.width = `${width}px`;
        player.style.height = `${height}px`;
        player.style.maxWidth = "100%";
        containerRef.current?.appendChild(player);
        player.load(swfUrl);
      };
      document.head.appendChild(script);
    };

    loadRuffle();

    return () => {
      // Cleanup script tag on unmount
      const scripts = document.querySelectorAll('script[src="/flash/ruffle/ruffle.js"]');
      scripts.forEach(s => s.remove());
    };
  }, [swfUrl, width, height]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="bg-black rounded-lg overflow-hidden border border-purple-500/30"
        style={{ width: "100%", maxWidth: width }}
        aria-label={`Flash game: ${title}`}
      />
      <p className="text-xs text-gray-500 text-center">
        ⚡ Powered by{" "}
        <a href="https://ruffle.rs" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
          Ruffle
        </a>{" "}
        — Open source Flash emulator
      </p>
    </div>
  );
}
