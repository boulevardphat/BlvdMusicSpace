import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import albumsData from "../albums.json";

interface LoadingIntroProps {
  onComplete: () => void;
}

export default function LoadingIntro({ onComplete }: LoadingIntroProps) {
  const [startGlow, setStartGlow] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [gridDims, setGridDims] = useState<{ cols: number; rows: number } | null>(null);
  
  // For drag to dismiss
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [bounceActive, setBounceActive] = useState(false);

  // Calculate grid dimension on mount and on resize to guarantee perfect square cells
  useEffect(() => {
    function calculateGrid() {
      const width = Math.max(10, window.innerWidth);
      const height = Math.max(10, window.innerHeight);
      
      const targetSize = width < 768 ? 100 : 150;
      
      const cols = Math.max(1, Math.ceil(width / targetSize));
      const cellWidth = width / cols;
      const rows = Math.max(1, Math.ceil(height / cellWidth));
      
      setGridDims({ cols, rows });
    }

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  const albumColors = useMemo(() => {
    const allAlbums = albumsData.tiers?.flatMap((t: any) => t.albums) || [];
    const hexColors = allAlbums
      .map((a: any) => a.hex)
      .filter((hex: string) => !!hex && hex !== "#111115");

    const fallbacks = [
      "#0078d7", "#d13438", "#008272", "#ca5010", "#107c41",
      "#8660a9", "#a80030", "#004b50", "#00188f", "#002050",
      "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
      "#ec4899", "#14b8a6", "#6366f1"
    ];

    return hexColors.length > 0 ? hexColors : fallbacks;
  }, []);

  const cells = useMemo(() => {
    if (!gridDims) return [];
    const totalCells = gridDims.cols * gridDims.rows;
    const generated = [];
    const maxBatches = 16; 
    
    const cols = gridDims.cols;
    const rows = gridDims.rows;
    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);
    
    const centerCandidates: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      if (Math.abs(r - centerR) <= 1 && Math.abs(c - centerC) <= 2) {
        centerCandidates.push(i);
      }
    }

    const pool = centerCandidates.length > 0 ? centerCandidates : Array.from({ length: totalCells }, (_, i) => i);
    const flickerIndices = new Set<number>();
    const flickerCount = Math.min(3, pool.length);
    while (flickerIndices.size < flickerCount) {
      const randomIdx = pool[Math.floor(Math.random() * pool.length)];
      flickerIndices.add(randomIdx);
    }

    const delayMap = new Array(totalCells);
    for (let i = 0; i < totalCells; i++) {
      const batchIndex = Math.floor(Math.random() * maxBatches);
      const jitter = Math.random() * 0.25; 
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
    const glowTimer = setTimeout(() => {
      setStartGlow(true);
    }, 100);

    const promptTimer = setTimeout(() => {
      setShowPrompt(true);
      // Trigger a subtle bounce to hint interactivity
      const bounceInterval = setInterval(() => {
        setBounceActive(true);
        setTimeout(() => setBounceActive(false), 300);
      }, 3000);
      return () => clearInterval(bounceInterval);
    }, 4500);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(promptTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
    }, 500); // Wait for exit animation
  };

  const handleDragEnd = (event: any, info: any) => {
    const isMobile = window.innerWidth < 768;
    const threshold = isMobile ? 100 : 150;
    
    if (isMobile && info.offset.y > threshold) {
      handleDismiss();
    } else if (!isMobile && info.offset.x < -threshold) {
      handleDismiss();
    }
  };

  if (!gridDims) {
    return <div className="fixed inset-0 z-[99999] bg-[#0b0c0e]" />;
  }

  const isMobile = window.innerWidth < 768;

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="intro-container"
          initial={{ opacity: 1 }}
          exit={isMobile ? { y: "100%", opacity: 0 } : { x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-[99999] bg-[#0b0c0e] select-none flex items-center justify-center overflow-hidden`}
          ref={constraintsRef}
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
          
          <motion.div
             drag={isMobile ? "y" : "x"}
             dragConstraints={constraintsRef}
             onDragEnd={handleDragEnd}
             dragElastic={0.2}
             animate={
               bounceActive 
                 ? (isMobile ? { y: [0, -15, 0] } : { x: [0, 20, 0] }) 
                 : { x: 0, y: 0 }
             }
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            {/* Grid Canvas */}
            <div 
              className="w-full h-full grid gap-0 p-0 pointer-events-none"
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
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      boxShadow: startGlow 
                        ? `inset 0 0 12px rgba(255, 255, 255, 0.12), 0 0 15px ${cell.color}40`
                        : "none"
                    }}
                  >
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
            
            {/* The Title overlay that will appear after loading */}
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                   <div className="bg-slate-950/80 px-8 py-6 border-4 border-slate-900/50 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center">
                      <h1 className="text-3xl md:text-5xl font-sans font-black text-white tracking-tighter leading-none uppercase text-center drop-shadow-lg">
                        Bảng Xếp Hạng<br/>Album của BLVD
                      </h1>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Interactive Start Prompt Overlay */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`absolute pointer-events-auto cursor-pointer ${
                  isMobile 
                    ? "bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center justify-end pb-8" 
                    : "right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/90 to-transparent flex items-center justify-center pr-6"
                }`}
                onClick={handleDismiss}
              >
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-2 md:gap-3 opacity-90 hover:opacity-100 transition-opacity`}>
                   {isMobile ? (
                     <>
                        <span className="font-mono text-white text-[11px] font-black tracking-widest uppercase">Bắt Đầu</span>
                        <motion.div
                          animate={{ y: [0, 8, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                           <ArrowDown className="w-5 h-5 text-white" />
                        </motion.div>
                     </>
                   ) : (
                     <>
                        <motion.div
                          animate={{ x: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                           <ArrowRight className="w-5 h-5 text-white" />
                        </motion.div>
                        <span className="font-mono text-white text-[12px] font-black tracking-[0.2em] uppercase writing-vertical-rl rotate-180">
                           Bắt Đầu
                        </span>
                     </>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
