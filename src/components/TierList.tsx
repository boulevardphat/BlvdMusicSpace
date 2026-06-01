import React, { useEffect, useState, useRef } from "react";
import { Tier, Album } from "../data";
import { fetchAlbumCover, getAlbumCriticReview } from "../utils";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Gem, Sparkles, Layers, Disc, Music, Award, RotateCcw, X, Trash2, ArrowRight } from "lucide-react";

const TIER_ICONS: Record<string, any> = {
  "t1": Crown,
  "t2": Gem,
  "t3": Sparkles,
  "t4": Layers,
  "t5": Disc
};

// Start high-contrast, beautiful Windows 8 Metro color accents (Sáng - Light supportive)
const METRO_ACCENTS: Record<string, {
  accent: string;       // background color block
  text: string;         // text text style
  bgBlock: string;      // block background color
  borderTheme: string;  // border theme color
  barColor: string;     // color bar style
  titleTextColor: string;
}> = {
  "t1": {
    accent: "bg-[#0078d7]",
    text: "text-[#0078d7]",
    bgBlock: "bg-[#0078d7]",
    borderTheme: "border-[#0078d7]",
    barColor: "bg-[#0078d7]",
    titleTextColor: "text-blue-700"
  },
  "t2": {
    accent: "bg-[#d13438]",
    text: "text-[#d13438]",
    bgBlock: "bg-[#d13438]",
    borderTheme: "border-[#d13438]",
    barColor: "bg-[#d13438]",
    titleTextColor: "text-red-700"
  },
  "t3": {
    accent: "bg-[#008272]",
    text: "text-[#008272]",
    bgBlock: "bg-[#008272]",
    borderTheme: "border-[#008272]",
    barColor: "bg-[#008272]",
    titleTextColor: "text-teal-700"
  },
  "t4": {
    accent: "bg-[#ca5010]",
    text: "text-[#ca5010]",
    bgBlock: "bg-[#ca5010]",
    borderTheme: "border-[#ca5010]",
    barColor: "bg-[#ca5010]",
    titleTextColor: "text-amber-800"
  },
  "t5": {
    accent: "bg-[#107c41]",
    text: "text-[#107c41]",
    bgBlock: "bg-[#107c41]",
    borderTheme: "border-[#107c41]",
    barColor: "bg-[#107c41]",
    titleTextColor: "text-emerald-700"
  }
};

// Gorgeous Windows/Metro high-contrast, beautiful vibrant gradients for sweeping dramatic exhibition lanes
const TIER_GRADIENTS: Record<string, string> = {
  "t1": "from-[#0d47a1] via-[#1565c0] to-[#01579b] text-white", // Royal Electric Cobalt Blue
  "t2": "from-[#c2185b] via-[#ad1457] to-[#880e4f] text-white", // Vivid Magenta and Scarlet Rose
  "t3": "from-[#00796b] via-[#00695c] to-[#004d40] text-white", // Dynamic Luminous Teal
  "t4": "from-[#e65100] via-[#d84315] to-[#bf360c] text-white", // Vibrant Orange and Blazing Copper
  "t5": "from-[#2e7d32] via-[#1b5e20] to-[#0a3d13] text-white"  // Intense Energetic Forest Green
};

// Gradient overlays matching the start color of the lanes for visual fade-out portal
const TIER_MOCK_SOLID: Record<string, string> = {
  "t1": "from-[#0d47a1] to-transparent",
  "t2": "from-[#c2185b] to-transparent",
  "t3": "from-[#00796b] to-transparent",
  "t4": "from-[#e65100] to-transparent",
  "t5": "from-[#2e7d32] to-transparent"
};

// Metro dynamic backface custom palettes for generic generation
const METRO_PALETTES = [
  { bg: "bg-[#0078d7]", text: "text-white" }, // Blue
  { bg: "bg-[#d13438]", text: "text-white" }, // Red
  { bg: "bg-[#008272]", text: "text-white" }, // Teal
  { bg: "bg-[#ca5010]", text: "text-white" }, // Orange
  { bg: "bg-[#107c41]", text: "text-white" }, // Green
  { bg: "bg-[#5c2d91]", text: "text-white" }, // Purple
  { bg: "bg-[#881798]", text: "text-white" }, // Magenta
  { bg: "bg-[#00a4ef]", text: "text-white" }, // Light Blue
  { bg: "bg-[#ffb900]", text: "text-[#111]" }, // Yellow
  { bg: "bg-[#e81123]", text: "text-white" }, // Vivid Red
];

function getAlbumPalette(albumId: number, tierId: string): { bg: string; text: string } {
  // Stable pseudo-random choice for other albums
  const index = Math.abs(albumId * 13 + 7) % METRO_PALETTES.length;
  return METRO_PALETTES[index];
}

// Metro Dynamic packing grids models

function packTierAlbums(albums: any[], tierId: string) {
  const cols: any[] = [];
  let i = 0;
  
  if (tierId === "t1") {
    let step = 0;
    while (i < albums.length) {
      const remaining = albums.length - i;
      if (step % 3 === 0) {
        cols.push({ type: "large", albums: [albums[i]] });
        i += 1;
      } else {
        if (remaining >= 2) {
          cols.push({ type: "medium-stack", albums: [albums[i], albums[i+1]] });
          i += 2;
        } else {
          cols.push({ type: "large", albums: [albums[i]] });
          i += 1;
        }
      }
      step++;
    }
  } else {
    let step = 0;
    while (i < albums.length) {
      const remaining = albums.length - i;
      if (step % 5 === 2) { // Every 5th column will showcase a beautiful Large Tile to break user monotony
        cols.push({ type: "large", albums: [albums[i]] });
        i += 1;
      } else {
        if (remaining >= 2) {
          cols.push({ type: "medium-stack", albums: [albums[i], albums[i+1]] });
          i += 2;
        } else {
          cols.push({ type: "large", albums: [albums[i]] });
          i += 1;
        }
      }
      step++;
    }
  }
  return cols;
}

interface MetroTileProps {
  album: any;
  size: "large" | "medium";
  theme: any;
  cleanedName: string;
  isAlbumSelected: boolean;
  covers: Record<string, string>;
  onAlbumClick: any;
  getAlbumCriticReview: any;
  isLiveFlipped?: boolean;
  hexColor?: string;
}

function MetroTile({
  album,
  size,
  theme,
  cleanedName,
  isAlbumSelected,
  covers,
  onAlbumClick,
  getAlbumCriticReview,
  isLiveFlipped,
  hexColor
}: MetroTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mCover = album.coverUrl || covers[album.id];
  
  const currentPalette = hexColor ? { bg: hexColor, darkBg: hexColor, text: "text-white" } : { bg: theme.accent, darkBg: theme.accent, text: "text-white" };

  let dimensionClasses = size === "large" 
    ? "w-[240px] h-[240px] md:w-[420px] md:h-[420px] xl:w-[460px] xl:h-[460px]" 
    : "w-[115px] h-[115px] md:w-[200px] md:h-[200px] xl:w-[220px] xl:h-[220px]";

  const flipActive = isHovered || isLiveFlipped;

  return (
    <div
      onClick={(e) => onAlbumClick(e, album, cleanedName, album.globalRank, mCover)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${dimensionClasses} relative cursor-pointer perspective-1200 select-none shrink-0`}
    >
      <motion.div
        animate={{
          rotateY: flipActive ? 180 : 0,
          scale: isHovered ? 1.05 : 1,
          z: isHovered ? 15 : 0,
          boxShadow: isHovered 
            ? "8px 16px 32px rgba(0, 0, 0, 0.35)" 
            : "0px 3px 6px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className={`w-full h-full relative transform-style-3d border-2 transition-colors duration-150 ${
          isAlbumSelected ? "border-slate-950 ring-4 ring-slate-900/10 z-30" : "border-slate-900/15"
        }`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 relative overflow-hidden flex items-center justify-center">
          {mCover ? (
            <img
              src={mCover}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-450 uppercase font-mono font-bold">
              <DiscoverPulse />
              <span className="mt-1 text-[7px] md:text-[9.5px] text-slate-400">Quét mạng...</span>
            </div>
          )}
        </div>

        {/* BACK FACE */}
        <div 
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-3 md:p-5 text-left flex flex-col justify-between overflow-hidden text-white`}
          style={{ backgroundColor: currentPalette.darkBg || currentPalette.bg }}
        >
          <div className="space-y-1 overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="font-mono text-[7px] md:text-[9.5px] uppercase opacity-75 flex justify-between font-bold tracking-wider mb-1">
                <span>NK #{album.globalRank}</span>
                <span className="truncate max-w-[60px] md:max-w-[120px]">{cleanedName}</span>
              </div>
              
              {size === "large" ? (
                <div className="flex flex-col justify-start">
                  <h3 className="font-sans font-black text-[11px] md:text-xl tracking-tight uppercase leading-snug line-clamp-2 md:line-clamp-3">
                    {album.title}
                  </h3>
                  <p className="font-sans font-black text-[8px] md:text-xs uppercase opacity-95 tracking-wide text-blue-100 mt-0.5">
                    {album.artist}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-start">
                  <h3 className="font-sans font-black text-[8.5px] md:text-xs tracking-tight uppercase leading-[1.15] line-clamp-2">
                    {album.title}
                  </h3>
                  <p className="font-sans font-bold text-[7px] md:text-[9px] uppercase opacity-85 truncate text-slate-200 mt-0.5">
                    {album.artist}
                  </p>
                </div>
              )}
            </div>

            {size === "large" && (
              <div className="hidden md:block flex-grow overflow-y-auto mt-2 pt-2 border-t border-white/20 select-text custom-scrollbar">
                <p className="text-[12px] md:text-[13px] leading-relaxed italic text-white/95 font-medium font-sans">
                  "{album.note || getAlbumCriticReview(album.artist, album.title, album.id)}"
                </p>
              </div>
            )}
            
            {size === "large" && (
              <div className="text-[7px] md:text-[8px] font-mono font-bold uppercase tracking-widest pt-1 border-t border-white/10 text-right flex items-center justify-end gap-1 opacity-80 mt-auto">
                <span>Khai phá</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export interface TierListProps {
  albumColors?: Record<string, any>;
  tiers: Tier[];
  selectedAlbum: (Album & { tierName: string; rankNumber: number; coverUrl?: string; isEditingPersDesc?: boolean }) | null;
  setSelectedAlbum: React.Dispatch<React.SetStateAction<(Album & { tierName: string; rankNumber: number; coverUrl?: string; isEditingPersDesc?: boolean }) | null>>;
  onAlbumClick: (album: Album, tierName: string, rankNumber: number, coverUrl?: string) => void;
  onResetTiers?: () => void;
  onAutoSaveCover?: (albumId: number, coverUrl: string) => void;
  handleDeleteAlbum: (albumId: number, tierId: string) => Promise<void>;

  coverSearchQuery: string;
  setCoverSearchQuery: (q: string) => void;
  candidates: any[];
  loadingCandidates: boolean;
  coverPanelOpen: boolean;
  setCoverPanelOpen: (open: boolean) => void;
  coverSuccessMsg: string;
  fetchCoverCandidates: () => Promise<void>;
  handleSelectBgCover: (coverUrl: string) => Promise<void>;
}

export function TierList({
  albumColors = {},
  tiers,
  selectedAlbum,
  setSelectedAlbum,
  onAlbumClick,
  onResetTiers,
  onAutoSaveCover,
  handleDeleteAlbum,
  coverSearchQuery,
  setCoverSearchQuery,
  candidates,
  loadingCandidates,
  coverPanelOpen,
  setCoverPanelOpen,
  coverSuccessMsg,
  fetchCoverCandidates,
  handleSelectBgCover
}: TierListProps) {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [liveFlippedIds, setLiveFlippedIds] = useState<number[]>([]);
  const [expandedPalette, setExpandedPalette] = useState<{ bg: string; text: string; darkBg?: string } | null>(null);

  useEffect(() => {
    if (selectedAlbum && selectedAlbum.id && albumColors[selectedAlbum.id]?.hex) {
      const hex = albumColors[selectedAlbum.id].hex;
      setExpandedPalette({ bg: hex, darkBg: hex, text: "text-white" });
    } else {
      setExpandedPalette(null);
    }
  }, [selectedAlbum, albumColors]);

  // Live flipping loop to emulate active Live Windows 8 Tiles
  useEffect(() => {
    const allAlbumIds: number[] = [];
    tiers.forEach(t => {
      t.albums.forEach(a => allAlbumIds.push(a.id));
    });

    if (allAlbumIds.length === 0) return;

    const interval = setInterval(() => {
      // Pick 3 to 4 tiles for every 10 albums to flip concurrently
      const allAlbumsWithRanks = albumsWithRank.flatMap((t: any) => t.mappedAlbums).sort((a: any, b: any) => a.globalRank - b.globalRank);
      const totalGroupsOfTen = Math.ceil(allAlbumsWithRanks.length / 10);
      const chosenIds: number[] = [];
      const chosenRanks: number[] = [];
      
      for (let g = 0; g < totalGroupsOfTen; g++) {
        const groupElements = allAlbumsWithRanks.slice(g * 10, (g + 1) * 10);
        const flipCount = Math.floor(Math.random() * 2) + 3; // 3 or 4
        
        // Shuffle current group
        const shuffled = [...groupElements].sort(() => 0.5 - Math.random());
        let groupChosenCount = 0;
        
        for (const album of shuffled) {
          // Ensure no 2 consecutively ranked albums flip at the same time
          const isConsecutive = chosenRanks.some(rank => Math.abs(rank - album.globalRank) === 1);
          if (!isConsecutive) {
             chosenIds.push(album.id);
             chosenRanks.push(album.globalRank);
             groupChosenCount++;
          }
          if (groupChosenCount >= flipCount) break;
        }
      }
      
      setLiveFlippedIds(prev => [...prev, ...chosenIds]);

      // Flip back to normal state after 2.8 seconds
      setTimeout(() => {
        setLiveFlippedIds(prev => prev.filter(id => !chosenIds.includes(id)));
      }, 2800);

    }, 2800); // Waves trigger every 2.8s

    return () => clearInterval(interval);
  }, [tiers]);

  // Smooth Horizontal Trackpad Scrolling with Vertical Exclusions
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If we are scrolling inside a vertical scroll container (e.g., detail text, candidate picker), allow normal vertical scroll
      const isWithinScrollableY = (el: HTMLElement | null): boolean => {
        if (!el || el === container) return false;
        
        const style = window.getComputedStyle(el);
        const hasScrollStyle = style.overflowY === "auto" || style.overflowY === "scroll" || el.classList.contains("custom-scrollbar");
        const hasRealScrollHeight = el.scrollHeight > el.clientHeight;
        
        if (hasScrollStyle && hasRealScrollHeight) {
          return true;
        }
        return isWithinScrollableY(el.parentElement);
      };

      if (isWithinScrollableY(e.target as HTMLElement)) {
        return; // do not hijack wheel
      }

      if (e.deltaY !== 0 && e.deltaX === 0) {
        container.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const coversRef = useRef(covers);
  useEffect(() => {
    coversRef.current = covers;
  }, [covers]);

  // Fetch albums covers gracefully and in parallel
  useEffect(() => {
    let active = true;

    const loadCovers = async () => {
      const albumsToFetch: Array<{ id: number; artist: string; title: string }> = [];
      
      tiers.forEach(tier => {
        tier.albums.forEach(album => {
          const key = `${album.id}`;
          if (album.coverUrl) {
            if (coversRef.current[key] !== album.coverUrl) {
              setCovers(prev => ({ ...prev, [key]: album.coverUrl! }));
            }
          } else if (!coversRef.current[key]) {
            albumsToFetch.push({ id: album.id, artist: album.artist, title: album.title });
          }
        });
      });

      if (albumsToFetch.length === 0) return;

      // Parallelized background fetching
      albumsToFetch.forEach(async (album) => {
        try {
          const url = await fetchAlbumCover(album.artist, album.title);
          if (url && active) {
            setCovers(prev => {
              if (prev[`${album.id}`] === url) return prev;
              return {
                ...prev,
                [`${album.id}`]: url
              };
            });
            if (onAutoSaveCover) {
              onAutoSaveCover(album.id, url);
            }
          }
        } catch (e) {
          console.error("Failed to load cover in background for:", album.title, e);
        }
      });
    };

    if (tiers.length > 0) {
      loadCovers();
    }

    return () => {
      active = false;
    };
  }, [tiers]);

  const cleanTierName = (name: string) => {
    return name.replace(/^[\s\p{Emoji}\p{Extended_Pictographic}]+/gu, "").trim();
  };

  const handleMetroTileClick = (
    e: React.MouseEvent,
    album: any,
    tierName: string,
    globalRank: number,
    mCover: string
  ) => {
    // Open detailing info card panel
    onAlbumClick(album, tierName, globalRank, mCover);

    // Auto-centering active element elegantly
    setTimeout(() => {
      const el = document.getElementById("expanded-album-panel");
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }
    }, 450); // slight delay ensures animation resolves
  };

  // Pre-calculate continuous global ranks
  let currentRank = 1;
  const albumsWithRank = tiers.map(tier => {
    const mappedAlbums = tier.albums.map(album => {
      const rank = currentRank++;
      return {
        ...album,
        globalRank: rank,
        tierName: cleanTierName(tier.name)
      };
    });
    return {
      ...tier,
      mappedAlbums
    };
  });

  const totalAlbumsCount = currentRank - 1;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      
      {/* 1. Metro Dashboard Header - Fitted with responsive margins to align with top layouts */}
      <div className="flex-none flex items-end justify-between border-b border-white/10 pb-4 bg-transparent animate-fade-in mx-4 md:mx-8 mt-[18px] md:mt-[22px]">
        <div>
          <h1 className="text-2xl md:text-[32px] font-sans font-black text-white tracking-tighter leading-none">
            BẢNG PHÂN HẠNG METRO
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {onResetTiers && (
            <button
              onClick={onResetTiers}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-red-600 hover:text-white border border-white/15 text-white font-mono text-[9.5px] font-black uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer rounded-none"
              title="Khôi phục lại dữ liệu mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5 animate-pulse" />
              <span>Reset Khâu</span>
            </button>
          )}
          <div className="bg-white/10 text-white border border-white/15 px-3 py-1.5 font-mono text-[9.5px] uppercase font-black tracking-widest">
            V8.5 PRO
          </div>
        </div>
      </div>

      {/* 2. Scrolling grid body - Stretched vertically */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow flex flex-row items-stretch overflow-x-auto overflow-y-hidden gap-0 py-0 pr-4 md:pr-12 no-scrollbar scroll-smooth"
      >
        {albumsWithRank.map((tier) => {
          const theme = METRO_ACCENTS[tier.id] || METRO_ACCENTS["t5"];
          const IconComponent = TIER_ICONS[tier.id] || Disc;
          const cleanedName = cleanTierName(tier.name);
          const gradientClass = TIER_GRADIENTS[tier.id] || "from-slate-50 to-slate-20; border-l-4 border-l-slate-400";

          // Packed columns for this tier
          const cols = packTierAlbums(tier.mappedAlbums, tier.id);

          return (
            <div 
              key={tier.id}
              className={`flex-none flex flex-col h-full bg-gradient-to-br ${gradientClass} px-4 md:px-8 pt-4 md:pt-6 pb-6 border-r border-white/10 relative min-w-[max-content] rounded-none gap-3 md:gap-5 justify-start`}
            >
              {/* STICKY MASTER LANE BANNER & INFO PANEL - Floating Typography directly above lane */}
              <div className="sticky left-4 md:left-8 z-30 flex flex-col md:flex-row items-start md:items-end gap-1.5 md:gap-8 mb-1 md:mb-3 w-max drop-shadow-xl select-none pt-1">
                {/* Text Group - NO BOX background, floating purely */}
                <div className="text-left mt-0.5 md:mt-0">
                  <h2 className="text-[36px] md:text-6xl font-sans font-black tracking-tighter uppercase leading-[0.9] text-white drop-shadow-2xl" title={cleanedName}>
                    {cleanedName}
                  </h2>
                </div>

                {/* Exhibition Description floating right beside/below */}
                <div className="flex flex-col mb-1 md:mb-1.5 max-w-[280px] md:max-w-[450px] mt-1 md:mt-0">
                   <div className="text-[8.5px] md:text-[11.5px] font-mono text-white font-black tracking-widest uppercase mb-1 md:mb-1.5 drop-shadow-md">
                     [ {tier.albums.length} RECORDINGS ]
                   </div>
                   <p className="text-[11px] md:text-[14px] leading-snug text-slate-100 italic font-semibold border-l-2 md:border-l-[3px] border-white/40 pl-2.5 md:pl-4 drop-shadow-xl">
                     "{tier.description}"
                   </p>
                </div>
              </div>

              {/* Album tiles flow area */}
              <div className="flex-grow flex flex-row items-center gap-2.5 md:gap-5 pb-2 md:pb-5 select-none pl-1 md:pl-0">
                {cols.length === 0 ? (
                  <div className="w-[150px] md:w-[420px] h-[240px] md:h-[400px] border-[2px] border-dashed border-white/20 flex flex-col items-center justify-center p-4 text-center bg-white/5 shrink-0 ml-4 md:ml-8 mt-4">
                    <Music className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[9px] text-slate-300 font-mono">Trống bậc</p>
                  </div>
                ) : (
                  cols.map((col, colIdx) => {
                    const hasSelectedAlbumInCol = selectedAlbum && col.albums.some((a: any) => a.id === selectedAlbum.id);

                    return (
                      <React.Fragment key={`${tier.id}-col-${colIdx}`}>
                        {/* COLUMN CONTAINER */}
                        <div className="flex flex-col justify-center gap-2.5 md:gap-5 shrink-0">
                          {col.type === "large" && (
                            col.albums[0] && (
                              <MetroTile
                                album={col.albums[0]}
                                size="large"
                                theme={theme}
                                cleanedName={cleanedName}
                                isAlbumSelected={selectedAlbum && selectedAlbum.id === col.albums[0].id}
                                covers={covers}
                                onAlbumClick={handleMetroTileClick}
                                getAlbumCriticReview={getAlbumCriticReview}
                                isLiveFlipped={liveFlippedIds.includes(col.albums[0].id)}
                                hexColor={albumColors[col.albums[0].id]?.hex}
                              />
                            )
                          )}

                          {col.type === "medium-stack" && (
                            <div className="flex flex-col gap-2.5 md:gap-5">
                              {col.albums.map((album: any) => (
                                <MetroTile
                                  key={album.id}
                                  album={album}
                                  size="medium"
                                  theme={theme}
                                  cleanedName={cleanedName}
                                  isAlbumSelected={selectedAlbum && selectedAlbum.id === album.id}
                                  covers={covers}
                                  onAlbumClick={handleMetroTileClick}
                                  getAlbumCriticReview={getAlbumCriticReview}
                                  isLiveFlipped={liveFlippedIds.includes(album.id)}
                                  hexColor={albumColors[album.id]?.hex}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* HIGH-FIDELITY SELECTIVE INLINE DETAIL EXPANSION CLOSURE RIGHT NEXT TO IT */}
                        <AnimatePresence mode="popLayout">
                          {hasSelectedAlbumInCol && selectedAlbum && (
                            <motion.div
                              id="expanded-album-panel"
                              initial={{ width: 0, opacity: 0, scale: 0.95 }}
                              animate={{ width: window.innerWidth < 768 ? 320 : window.innerWidth < 1280 ? 700 : 780, opacity: 1, scale: 1 }}
                              exit={{ width: 0, opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              className={`h-[240px] md:h-[420px] xl:h-[460px] border-2 border-white/20 p-4 md:p-6 shrink-0 flex flex-row gap-3 md:gap-6 relative overflow-hidden z-25 shadow-2xl self-center mx-1 rounded-none text-white animate-fade-in custom-scrollbar`}
                              style={{ backgroundColor: expandedPalette?.darkBg || expandedPalette?.bg || '#0c1015' }}
                            >
                              {/* Left Block: cover & changer trigger & actions */}
                              <div className="w-[90px] md:w-[220px] shrink-0 flex flex-col justify-between h-full relative z-20 border-r border-white/10 pr-3 md:pr-5">
                                <div className="flex flex-col">
                                  <div className="w-full aspect-square border border-white/20 bg-slate-900 flex items-center justify-center overflow-hidden shadow-md relative group">
                                    {selectedAlbum.coverUrl ? (
                                      <img
                                        src={selectedAlbum.coverUrl}
                                        alt={selectedAlbum.title}
                                        className="w-full h-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <Music className="w-7 h-7 text-slate-600" />
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setCoverPanelOpen(!coverPanelOpen)}
                                    className="w-full py-1.5 md:py-2.5 bg-white text-slate-950 hover:bg-sky-400 transition-colors font-mono font-black text-[7.5px] md:text-[10px] uppercase tracking-wider md:tracking-widest flex items-center justify-center gap-1.5 cursor-pointer rounded-none active:scale-95 mt-2 md:mt-4 shadow-md"
                                  >
                                    <RotateCcw className="w-3 md:w-3.5 h-3 md:h-3.5 animate-spin-slow" />
                                    <span>ĐỔI BÌA CHUẨN</span>
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleDeleteAlbum(selectedAlbum.id, tier.id)}
                                  className="w-full py-2 border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white transition-all font-mono font-bold text-[8px] md:text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 rounded-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Xóa khỏi làn</span>
                                  <span className="inline md:hidden">Bỏ xóa</span>
                                </button>
                              </div>

                              {/* Right Block: Content Details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between h-full relative z-20">
                                <div className="overflow-y-auto pr-1 md:pr-2 select-text h-full no-scrollbar text-left flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-center pb-2 border-b border-white/20">
                                      <span className={`text-[#0c1015] px-2.5 py-1 md:py-1.5 font-mono text-[8px] md:text-[11px] font-black uppercase tracking-[0.25em] leading-none bg-white`}>
                                        RANK #{selectedAlbum.rankNumber}
                                      </span>
                                      <button
                                        onClick={() => setSelectedAlbum(null)}
                                        className="p-1 md:p-1.5 text-white/50 hover:text-white transition-colors rounded-none bg-white/5 hover:bg-white/20"
                                      >
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                      </button>
                                    </div>

                                    <h3 className="font-sans font-black text-sm md:text-[26px] mt-3 md:mt-4 uppercase tracking-tighter leading-[1.1] drop-shadow-md">
                                      {selectedAlbum.title}
                                    </h3>
                                    <p className={`text-[10px] md:text-base font-mono tracking-widest uppercase font-black mt-1.5 text-white/90`}>
                                      {selectedAlbum.artist}
                                    </p>

                                    <div className={`mt-3 md:mt-5 bg-white/5 border-white/30 text-white p-3 md:p-4 border-l-[3px] md:border-l-[4px] text-left`}>
                                      <span className={`text-[8px] md:text-[11px] font-sans font-black uppercase tracking-[0.2em] block mb-1.5 text-white/50`}>
                                        THẨM ĐỊNH CHUYÊN MÔN
                                      </span>
                                      <p className="text-[10.5px] md:text-[14px] leading-relaxed italic font-semibold font-sans drop-shadow-sm text-white">
                                        "{selectedAlbum.profDesc || selectedAlbum.note || getAlbumCriticReview(selectedAlbum.artist, selectedAlbum.title, selectedAlbum.id)}"
                                      </p>
                                    </div>
                                    
                                    <div className="mt-3 bg-white/5 border-l-[3px] md:border-l-[4px] border-white/20 p-3 md:p-4 text-left group/pers">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[8px] md:text-[11px] font-sans font-black uppercase tracking-[0.2em] block text-white/50`}>
                                          MIÊU TẢ CÁ NHÂN
                                        </span>
                                      </div>
                                      {selectedAlbum.isEditingPersDesc ? (
                                        <div className="flex flex-col gap-2">
                                          <textarea 
                                            autoFocus
                                            className="w-full bg-black/40 border border-white/20 text-white p-2 text-[10.5px] md:text-[13px] font-sans rounded-none focus:outline-none focus:border-white/50 resize-y min-h-[60px]"
                                            defaultValue={selectedAlbum.persDesc || ''}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val !== selectedAlbum.persDesc) {
                                                  fetch(`/api/albums/${selectedAlbum.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ persDesc: val })
                                                  }).then(() => {
                                                    window.dispatchEvent(new CustomEvent('albumUpdated'));
                                                  });
                                                }
                                                setSelectedAlbum({ ...selectedAlbum, persDesc: val, isEditingPersDesc: false } as any);
                                              }
                                            }}
                                            onBlur={(e) => {
                                              const val = e.target.value.trim();
                                              if (val !== selectedAlbum.persDesc) {
                                                fetch(`/api/albums/${selectedAlbum.id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ persDesc: val })
                                                }).then(() => {
                                                  window.dispatchEvent(new CustomEvent('albumUpdated'));
                                                });
                                              }
                                              setSelectedAlbum({ ...selectedAlbum, persDesc: val, isEditingPersDesc: false } as any);
                                            }}
                                            placeholder="Ghi chú đánh giá của bạn về album..."
                                          />
                                          <span className="text-[8px] text-white/30 font-mono text-right">Nhấn Enter để lưu</span>
                                        </div>
                                      ) : (
                                        <div 
                                          className="cursor-pointer group-hover/pers:bg-white/5 p-1 -ml-1 transition-colors rounded-sm"
                                          onClick={() => {
                                            setSelectedAlbum({ ...selectedAlbum, isEditingPersDesc: true } as any);
                                          }}
                                        >
                                          <p className="text-[10.5px] md:text-[14px] leading-relaxed font-sans text-slate-300">
                                            {selectedAlbum.persDesc ? selectedAlbum.persDesc : <span className="italic text-white/30">Chưa có miêu tả cá nhân. Nhấn để thêm...</span>}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`text-[7.5px] md:text-[10px] text-white/40 border-white/10 font-mono font-black uppercase tracking-[0.3em] border-t pt-3 md:pt-4 mt-4 text-right`}>
                                    [ HỒ SƠ PHÂN TÍCH ]
                                  </div>
                                </div>
                              </div>

                              {/* Searching Overlay widget */}
                              <AnimatePresence>
                                {coverPanelOpen && (
                                  <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "tween", duration: 0.2 }}
                                    className="absolute inset-0 bg-white p-2.5 md:p-4 flex flex-col z-35 border-t border-slate-300 animate-fade-in"
                                  >
                                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-150">
                                      <span className="text-[7.5px] md:text-[9px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
                                        <Sparkles className="w-2.5 h-2.5 text-yellow-600 animate-spin" />
                                        <span>QUÉT ẢNH CHUẨN MẠNG</span>
                                      </span>
                                      <button onClick={() => setCoverPanelOpen(false)} className="text-[8px] md:text-[9.5px] font-bold text-rose-500 uppercase">Hủy</button>
                                    </div>

                                    <div className="flex gap-1 mb-1.5">
                                      <input
                                        type="text"
                                        value={coverSearchQuery}
                                        onChange={(e) => setCoverSearchQuery(e.target.value)}
                                        className="flex-1 px-2 py-1 text-[9px] md:text-xs bg-slate-100 border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-800 font-mono"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') fetchCoverCandidates();
                                        }}
                                      />
                                      <button
                                        onClick={fetchCoverCandidates}
                                        disabled={loadingCandidates}
                                        className="px-3 bg-blue-600 hover:bg-blue-700 text-white text-[8px] md:text-[9.5px] font-bold uppercase disabled:opacity-50"
                                      >
                                        Tìm
                                      </button>
                                    </div>

                                    {coverSuccessMsg && (
                                      <p className="text-[7.5px] md:text-[9px] font-bold text-center text-emerald-600 mb-1">{coverSuccessMsg}</p>
                                    )}

                                    <div className="flex-grow overflow-y-auto space-y-1.5 custom-scrollbar p-0.5 select-none">
                                      {loadingCandidates ? (
                                        <p className="text-[8px] md:text-[9.5px] text-slate-400 italic text-center py-2">Dò tìm dữ liệu từ Deezer/iTunes...</p>
                                      ) : candidates.length > 0 ? (
                                        candidates.map((cand, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => handleSelectBgCover(cand.coverUrl)}
                                            className="flex items-center gap-2 p-1 md:p-1.5 border border-slate-200 hover:border-blue-500 cursor-pointer bg-slate-50 text-left transition-colors"
                                          >
                                            <img src={cand.coverUrl} className="w-8 h-8 md:w-10 md:h-10 object-cover border border-slate-200" referrerPolicy="no-referrer" />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[8.5px] md:text-[10px] font-bold text-slate-800 truncate leading-tight">{cand.title}</p>
                                              <p className="text-[7.5px] md:text-[8px] text-slate-500 truncate leading-none mt-0.5 font-mono uppercase">{cand.artist}</p>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-[7.5px] md:text-[9px] text-slate-400 italic text-center py-2">Nhập tên album + nhấn Tìm hàng chính chủ...</p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </motion.div>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiscoverPulse() {
  return (
    <div className="flex space-x-1 items-center justify-center py-1">
      <div className="w-1 h-1 bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1 h-1 bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1 h-1 bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
