import React, { useEffect, useState, useMemo } from "react";
import albumsData from "../albums.json";

interface LoadingIntroProps {
  onComplete: () => void;
}

export default function LoadingIntro({ onComplete }: LoadingIntroProps) {
  const [startGlow, setStartGlow] = useState(false);
  const [fadeAway, setFadeAway] = useState(false);
  const [gridDims, setGridDims] = useState<{ cols: number; rows: number } | null>(null);

  // Calculate grid dimension on mount and on resize to guarantee perfect square cells
  useEffect(() => {
    function calculateGrid() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Target square size based on screen (larger for less crowd/density)
      const targetSize = width < 768 ? 100 : 150;
      
      const cols = Math.ceil(width / targetSize);
      const cellWidth = width / cols;
      const rows = Math.ceil(height / cellWidth);
      
      setGridDims({ cols, rows });
    }

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  // Gather all album dominant colors for realistic, vibrant palette
  const albumColors = useMemo(() => {
    const allAlbums = albumsData.tiers?.flatMap((t: any) => t.albums) || [];
    const hexColors = allAlbums
      .map((a: any) => a.hex)
      .filter((hex: string) => !!hex && hex !== "#111115");

    // Luxury fallback neon & warm colors if list is short or empty
    const fallbacks = [
      "#0078d7", "#d13438", "#008272", "#ca5010", "#107c41",
      "#8660a9", "#a80030", "#004b50", "#00188f", "#002050",
      "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
      "#ec4899", "#14b8a6", "#6366f1"
    ];

    return hexColors.length > 0 ? hexColors : fallbacks;
  }, []);

  // Pre-generate grid cells with stable random colors and clustered batch transition delays
  const cells = useMemo(() => {
    if (!gridDims) return [];
    const totalCells = gridDims.cols * gridDims.rows;
    const generated = [];
    const maxBatches = 16; // 16 discrete lighting moments over time
    
    // Select 2 or 3 random cells near the center of the grid to exhibit a retro flickering backlight pulse
    const cols = gridDims.cols;
    const rows = gridDims.rows;
    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);
    
    // Find all cells close to the center (within 1 row and 2 columns of center coordinates)
    const centerCandidates: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      if (Math.abs(r - centerR) <= 1 && Math.abs(c - centerC) <= 2) {
        centerCandidates.push(i);
      }
    }

    // Fallback to all cells if center candidates pool is empty for some reason
    const pool = centerCandidates.length > 0 ? centerCandidates : Array.from({ length: totalCells }, (_, i) => i);

    const flickerIndices = new Set<number>();
    const flickerCount = Math.min(3, pool.length);
    while (flickerIndices.size < flickerCount) {
      const randomIdx = pool[Math.floor(Math.random() * pool.length)];
      flickerIndices.add(randomIdx);
    }

    // Assign each cell to a random batch with a tiny organic delay jitter
    const delayMap = new Array(totalCells);
    for (let i = 0; i < totalCells; i++) {
      const batchIndex = Math.floor(Math.random() * maxBatches);
      const jitter = Math.random() * 0.25; // Organic staggered look within the same batch
      delayMap[i] = (batchIndex / (maxBatches - 1)) * 3.6 + jitter;
    }

    for (let i = 0; i < totalCells; i++) {
      const randomColor = albumColors[Math.floor(Math.random() * albumColors.length)];
      generated.push({
        id: i,
        color: randomColor,
        delay: delayMap[i],
        shouldFlicker: flickerIndices.has(i),
      });
    }

    return generated;
  }, [gridDims, albumColors]);

  useEffect(() => {
    // Initiate backlight glow transition
    const glowTimer = setTimeout(() => {
      setStartGlow(true);
    }, 100);

    // Fade out of whole intro after exactly 5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeAway(true);
    }, 5000);

    // Notify complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5600); // 5 seconds of loading + 0.6 seconds of smooth fade animation

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!gridDims) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0b0c0e]" />
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0b0c0e] select-none pointer-events-none transition-opacity duration-600 ease-out flex items-center justify-center overflow-hidden`}
      style={{ 
        transitionDuration: "600ms",
        opacity: fadeAway ? 0 : 1
      }}
    >
      <style>{`
        @keyframes introFlicker {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          40% { opacity: 0.9; transform: scale(1); }
          42% { opacity: 0.15; transform: scale(0.97); }
          44% { opacity: 0.95; transform: scale(1.01); }
          46% { opacity: 0.25; transform: scale(0.98); }
          48% { opacity: 1; transform: scale(1.02); }
          70% { opacity: 0.9; transform: scale(1); }
          72% { opacity: 0.1; transform: scale(0.96); }
          76% { opacity: 0.95; transform: scale(1); }
        }
        .intro-tile-flicker {
          animation: introFlicker 2.8s infinite ease-in-out;
        }
      `}</style>

      {/* Grid Canvas - Zero gap, flush perfect squares */}
      <div 
        className="w-full grid gap-0 p-0"
        style={{
          gridTemplateColumns: `repeat(${gridDims.cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => {
          return (
            <div
              key={cell.id}
              className="relative aspect-square overflow-hidden transition-all ease-out rounded-none border border-white/[0.03]"
              style={{
                backgroundColor: startGlow ? `${cell.color}40` : "rgba(255, 255, 255, 0.02)",
                transform: startGlow ? "scale(1)" : "scale(0.98)",
                transitionDuration: "800ms",
                transitionDelay: `${cell.delay}s`,
                // Adding authentic glassmorphism blur
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                // Subtle shadow for lit up tiles
                boxShadow: startGlow 
                  ? `inset 0 0 12px rgba(255, 255, 255, 0.12), 0 0 15px ${cell.color}40`
                  : "none"
              }}
            >
              {/* Backlight glow element */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity ease-out pointer-events-none ${
                  cell.shouldFlicker && startGlow ? "intro-tile-flicker" : ""
                }`}
                style={{
                  background: `radial-gradient(circle at center, ${cell.color}cc 0%, ${cell.color}15 70%, transparent 100%)`,
                  transitionDuration: "900ms",
                  transitionDelay: `${cell.delay}s`,
                  opacity: startGlow ? 1 : 0,
                  animationDelay: `${cell.delay}s`
                }}
              />
              
              {/* Hotspot center light flare */}
              <div
                className={`absolute w-6 h-6 rounded-full bg-white/40 blur-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity ease-out pointer-events-none ${
                  cell.shouldFlicker && startGlow ? "intro-tile-flicker" : ""
                }`}
                style={{
                  transitionDuration: "900ms",
                  transitionDelay: `${cell.delay}s`,
                  opacity: startGlow ? 0.3 : 0,
                  animationDelay: `${cell.delay}s`
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
