import React, { useEffect, useState, useRef } from "react";
import { Tier, Album } from "../data";
import { getImgbbCoverUrl } from "../utils";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Gem, Sparkles, Layers, Disc, Music, Award, RotateCcw, X, Trash2, ArrowRight, Pencil } from "lucide-react";

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
  isLiveFlipped,
  hexColor
}: MetroTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mCover = album.coverUrl || getImgbbCoverUrl(album.artist, album.title);
  
  const currentPalette = hexColor ? { bg: hexColor, darkBg: hexColor, text: "text-white" } : { bg: theme.accent, darkBg: theme.accent, text: "text-white" };

  let dimensionClasses = size === "large" 
    ? "w-[240px] h-[240px] md:w-[45vh] md:h-[45vh] xl:w-[55vh] xl:h-[55vh]" 
    : "w-[115px] h-[115px] md:w-[calc(22.5vh-10px)] md:h-[calc(22.5vh-10px)] xl:w-[calc(27.5vh-10px)] xl:h-[calc(27.5vh-10px)]";

  const flipActive = isHovered || isLiveFlipped;

  return (
    <div
      onClick={(e) => onAlbumClick(e, album, cleanedName, album.globalRank, mCover)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setIsHovered(false);
      }}
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
            <>
              <img
                src={mCover}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Rank bottom-left badge */}
              <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black/85 text-white font-mono font-black text-[9px] md:text-[11px] leading-none px-1.5 py-0.5 md:px-2 md:py-1 pointer-events-none select-none z-10 border border-white/10">
                #{album.globalRank}
              </div>
            </>
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
                  "{album.profDesc || "Đánh giá chuyên môn đang được cập nhật, ghi nhận ý kiến từ hội đồng phê bình."}"
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
}

export function TierList({
  albumColors = {},
  tiers,
  selectedAlbum,
  setSelectedAlbum,
  onAlbumClick
}: TierListProps) {
  const [covers] = useState<Record<string, string>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [liveFlippedIds, setLiveFlippedIds] = useState<number[]>([]);
  const [expandedPalette, setExpandedPalette] = useState<{ bg: string; text: string; darkBg?: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (selectedAlbum && selectedAlbum.id && albumColors[selectedAlbum.id]) {
      const colorData = albumColors[selectedAlbum.id];
      const bg = colorData.darkVibrant || colorData.hex || "#1c1e1f";
      const deepBg = colorData.darkMuted || colorData.dominant || "#07080a";
      
      setExpandedPalette({
        bg: bg,
        darkBg: `linear-gradient(135deg, ${bg} 0%, ${deepBg} 100%)`,
        text: "text-white"
      });
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
    if (isMobile) return;
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

      // Trackpads sometimes emit small deltaX along with deltaY. 
      // If deltaX is significant, it means the user is intentionally scrolling horizontally.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return; // Browser naturally handles horizontal scroll
      }

      if (e.deltaY !== 0) {
        container.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isMobile]);

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

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0b0c0e] overflow-y-auto px-4 py-6 text-white text-left select-none">
        
        {/* Metro Header */}
        <div className="flex-none flex items-center justify-between border-b border-white/10 pb-4 bg-transparent mb-6">
          <h1 className="text-2xl font-sans font-black text-white tracking-tighter leading-none">
            BẢNG PHÂN HẠNG METRO
          </h1>
        </div>

        {/* Vertical Tiers Feed */}
        <div className="flex flex-col gap-8 pb-16">
          {albumsWithRank.map((tier) => {
            const theme = METRO_ACCENTS[tier.id] || METRO_ACCENTS["t5"];
            const gradientClass = TIER_GRADIENTS[tier.id] || "from-slate-50 to-slate-20";
            const cleanedName = cleanTierName(tier.name);

            return (
              <div 
                key={tier.id}
                className="flex flex-col gap-4 border-b border-white/5 pb-2 last:border-b-0"
              >
                {/* Custom Tier Header Card */}
                <div className={`p-4 bg-gradient-to-br ${gradientClass} flex flex-col gap-2 rounded-none shadow-lg relative overflow-hidden`}>
                  <div className="flex justify-between items-center z-10">
                    <h2 className="text-2xl font-sans font-black tracking-tighter uppercase leading-none text-white drop-shadow-md">
                      {cleanedName}
                    </h2>
                    <span className="text-[10px] font-mono text-white/90 font-black tracking-widest uppercase bg-black/25 px-2 py-0.5">
                      [ {tier.albums.length} RECORDINGS ]
                    </span>
                  </div>
                  <p className="text-xs leading-snug text-slate-100/90 italic font-medium mt-1 select-text border-l-2 border-white/30 pl-2.5 z-10">
                    "{tier.description}"
                  </p>
                  
                  {/* Subtle decorative background detail */}
                  <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 pointer-events-none select-none">
                    <Disc className="w-32 h-32 animate-spin-slow" />
                  </div>
                </div>

                {/* Vertical Album List */}
                <div className="flex flex-col gap-3">
                  {tier.mappedAlbums.length === 0 ? (
                    <div className="border border-dashed border-white/10 py-8 px-4 text-center bg-white/5 shrink-0 flex flex-col items-center justify-center">
                      <Music className="w-5 h-5 text-slate-500 mb-1" />
                      <p className="text-[10px] text-slate-400 font-mono">Trống bậc này</p>
                    </div>
                  ) : (
                    tier.mappedAlbums.map((album) => {
                      const mCover = album.coverUrl || getImgbbCoverUrl(album.artist, album.title);
                      const isSelected = selectedAlbum && selectedAlbum.id === album.id;
                      
                      return (
                        <div
                          key={album.id}
                          onClick={(e) => handleMetroTileClick(e, album, cleanedName, album.globalRank, mCover)}
                          className={`flex items-center gap-4 p-3 border border-white/10 hover:border-blue-500/55 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer relative ${
                            isSelected ? "ring-2 ring-blue-500 bg-white/12 border-blue-500/50" : ""
                          }`}
                        >
                          {/* Album Index Badge */}
                          <div className="text-sm font-mono font-black text-slate-400/90 shrink-0 w-6 text-center">
                            {album.globalRank}
                          </div>

                          {/* Cover Image square */}
                          <div className="w-16 h-16 bg-slate-900 flex-none overflow-hidden border border-white/10 relative shadow-inner">
                            {mCover ? (
                              <img
                                src={mCover}
                                alt={album.title}
                                className="w-full h-full object-cover animate-fade-in"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Music className="w-5 h-5 text-slate-600 absolute inset-0 m-auto" />
                            )}
                          </div>

                          {/* Info Block */}
                          <div className="flex-1 min-w-0 pr-2 pb-0.5">
                            <h3 className="font-sans font-black text-sm text-white uppercase leading-tight truncate tracking-tight">
                              {album.title}
                            </h3>
                            <p className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wider truncate mt-0.5">
                              {album.artist}
                            </p>
                            
                            {/* Short preview snippet of the profDesc if exists */}
                            {album.profDesc && (
                              <p className="text-[11px] leading-normal text-slate-350 italic line-clamp-1 mt-1.5 border-l border-white/20 pl-2">
                                "{album.profDesc}"
                              </p>
                            )}
                          </div>
                        </div>
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      
      {/* 1. Metro Dashboard Header - Fitted with responsive margins to align with top layouts */}
      <div className="flex-none flex items-end justify-between border-b border-white/10 pb-4 bg-transparent animate-fade-in mx-4 md:mx-8 mt-[18px] md:mt-[22px]">
        <div>
          <h1 className="text-2xl md:text-[32px] font-sans font-black text-white tracking-tighter leading-none">
            BẢNG PHÂN HẠNG METRO
          </h1>
        </div>
      </div>

      {/* 2. Scrolling grid body - Stretched vertically */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow flex flex-col md:flex-row items-stretch overflow-y-auto overflow-x-hidden md:overflow-x-auto md:overflow-y-hidden gap-0 py-0 pr-0 md:pr-12 no-scrollbar scroll-smooth min-h-0 w-full md:w-auto"
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
              className={`flex-none flex flex-col h-auto md:h-full w-full md:w-auto bg-gradient-to-br ${gradientClass} px-4 md:px-8 pt-0 pb-16 md:pb-12 border-b md:border-b-0 md:border-r border-white/10 relative min-w-0 md:min-w-[max-content] rounded-none`}
            >
               {/* STICKY MASTER LANE BANNER & INFO PANEL - Floating Typography directly centered vertically within distance X */}
              <div className="flex-grow flex flex-col justify-center select-none py-2 md:py-4 xl:py-6">
                <div className="sticky left-4 md:left-8 z-30 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full md:w-max max-w-full drop-shadow-xl">
                  {/* Text Group - NO BOX background, floating purely */}
                  <div className="text-left flex items-center pr-3 md:pr-12 border-b md:border-b-0 md:border-r border-white/20 pb-3 md:pb-0">
                    <h2 className="text-5xl md:text-8xl xl:text-9xl font-sans font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl" title={cleanedName}>
                      {cleanedName}
                    </h2>
                  </div>

                  {/* Exhibition Description floating right beside */}
                  <div className="flex flex-col justify-center max-w-[280px] md:max-w-[500px] xl:max-w-[640px]">
                     <div className="text-[10px] md:text-[14px] xl:text-[15px] font-mono text-white/95 font-black tracking-widest uppercase mb-1.5 md:mb-3 drop-shadow-md">
                       [ {tier.albums.length} RECORDINGS ]
                     </div>
                     <p className="text-[12.5px] md:text-[18px] xl:text-[20.5px] leading-snug text-slate-100 italic font-semibold border-l-2 md:border-l-[4px] border-white/40 pl-3 md:pl-6 drop-shadow-xl">
                       "{tier.description}"
                     </p>
                  </div>
                </div>
              </div>

              {/* Album tiles flow area - Anchored at the bottom with fixed-aligned dimensions */}
              <div className="flex-none h-[240px] md:h-[45vh] xl:h-[55vh] flex flex-row items-center gap-2.5 md:gap-5 select-none pl-1 md:pl-0 overflow-x-auto md:overflow-x-visible no-scrollbar w-full max-w-full">
                {cols.length === 0 ? (
                  <div className="w-[150px] md:w-[45vh] xl:w-[55vh] h-[240px] md:h-[45vh] xl:h-[55vh] border-[2px] border-dashed border-white/20 flex flex-col items-center justify-center p-4 text-center bg-white/5 shrink-0 ml-4 md:ml-8">
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
                              animate={{ width: window.innerWidth < 768 ? 320 : window.innerWidth < 1280 ? 800 : 900, opacity: 1, scale: 1 }}
                              exit={{ width: 0, opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              className={`h-[240px] md:h-[45vh] xl:h-[55vh] border-2 border-white/20 p-4 md:p-6 shrink-0 flex flex-row gap-3 md:gap-6 relative overflow-hidden z-25 shadow-2xl self-center mx-1 rounded-none text-white animate-fade-in custom-scrollbar`}
                              style={{ background: expandedPalette?.darkBg || expandedPalette?.bg || '#0c1015' }}
                            >
                              {/* Left Block: cover */}
                              <div className="w-[90px] md:w-[220px] shrink-0 flex flex-col justify-start h-full relative z-20 border-r border-white/10 pr-3 md:pr-5">
                                <div className="w-full aspect-square border border-white/20 bg-slate-900 flex items-center justify-center overflow-hidden shadow-md relative group">
                                  {selectedAlbum.coverUrl ? (
                                    <img
                                      src={selectedAlbum.coverUrl}
                                      alt={selectedAlbum.title}
                                      className="w-full h-full object-cover animate-fade-in transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <Music className="w-7 h-7 text-slate-600" />
                                  )}
                                </div>
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
                                        "{selectedAlbum.profDesc || "Đánh giá chuyên môn đang được cập nhật, ghi nhận ý kiến từ hội đồng phê bình."}"
                                      </p>
                                    </div>
                                    
                                    <div className="mt-3 bg-white/5 border-l-[3px] md:border-l-[4px] border-white/20 p-3 md:p-4 text-left group/pers">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[8px] md:text-[11px] font-sans font-black uppercase tracking-[0.2em] block text-white/50`}>
                                          MIÊU TẢ CÁ NHÂN
                                        </span>
                                      </div>
                                      <div className="p-1 -ml-1 transition-colors rounded-sm">
                                        <p className="text-[10.5px] md:text-[14px] leading-relaxed font-sans text-slate-300">
                                          {selectedAlbum.persDesc ? selectedAlbum.persDesc : <span className="italic text-white/30">Chưa có miêu tả cá nhân (sửa qua albums.json).</span>}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`text-[7.5px] md:text-[10px] text-white/40 border-white/10 font-mono font-black uppercase tracking-[0.3em] border-t pt-3 md:pt-4 mt-4 text-right`}>
                                    [ HỒ SƠ PHÂN TÍCH ]
                                  </div>
                                </div>
                              </div>

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
