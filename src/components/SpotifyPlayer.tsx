import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, ExternalLink, SkipBack, SkipForward, MoreVertical, LayoutTemplate, Disc3, Music } from "lucide-react";

// Global loader function for Spotify Embed IFrame API
let spotifyIframeApiPromise: Promise<any> | null = null;

const loadSpotifyIframeApi = (): Promise<any> => {
  if (typeof window === "undefined") return Promise.reject();
  
  if ((window as any).SpotifyIframeApiRef) {
    return Promise.resolve((window as any).SpotifyIframeApiRef);
  }
  
  if (!spotifyIframeApiPromise) {
    spotifyIframeApiPromise = new Promise((resolve) => {
      if ((window as any).SpotifyIframeApiRef) {
        resolve((window as any).SpotifyIframeApiRef);
        return;
      }
      
      const prevCallback = (window as any).onSpotifyIframeApiReady;
      (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
        (window as any).SpotifyIframeApiRef = IFrameAPI;
        resolve(IFrameAPI);
        if (prevCallback) prevCallback(IFrameAPI);
      };
      
      if (!document.getElementById("spotify-iframe-api-script")) {
        const script = document.createElement("script");
        script.id = "spotify-iframe-api-script";
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }
  
  return spotifyIframeApiPromise;
};

const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return { r: 16, g: 185, b: 129 };
};

interface SpotifyPlayerProps {
  spotifyId: string;
  variant?: "dark" | "light" | "mobile" | "cover-integrated";
  dominantColor?: string;
  coverUrl?: string;
  showNativeWidget?: boolean;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  spotifyId,
  variant = "dark",
  dominantColor = "#111111",
  coverUrl = "",
  showNativeWidget: showNativeWidgetProp,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAutoplayingCue, setIsAutoplayingCue] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(30000);
  const [showNativeWidgetState, setShowNativeWidgetState] = useState(false);
  const showNativeWidget = showNativeWidgetProp !== undefined ? showNativeWidgetProp : showNativeWidgetState;
  const setShowNativeWidget = showNativeWidgetProp !== undefined ? () => {} : setShowNativeWidgetState;
  const [errorCount, setErrorCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [glyphLevels, setGlyphLevels] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentLevels = [0, 0, 0];
    if (isPlaying) {
      interval = setInterval(() => {
        currentLevels = currentLevels.map((prev, index) => {
          let next = prev;
          const rand = Math.random();
          
          if (index === 0) {
            // Treble (Row 0): rapid spikes, decays fast
            if (rand < 0.45) {
              next = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
            } else {
              next = Math.max(0, next - 2);
            }
          } else if (index === 1) {
            // Mid (Row 1): balanced, up to 5
            if (rand < 0.35) {
              next = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
            } else {
              next = Math.max(0, next - 1);
            }
          } else {
            // Bass (Row 2): heavy, slower decay, up to 5
            if (rand < 0.25) {
              next = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
            } else {
              if (Math.random() < 0.6) {
                next = Math.max(0, next - 1);
              }
            }
          }
          return next;
        });
        setGlyphLevels([...currentLevels]);
      }, 70);
    } else {
      setGlyphLevels([0, 0, 0]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, variant]);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const widgetId = useRef<string>(`spotify-widget-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isPlaying) setHasStarted(true);
  }, [isPlaying]);

  useEffect(() => {
    if (isReady && !hasStarted && controllerRef.current) {
      const timer = setTimeout(() => {
        try {
          if (!isPlaying) {
            controllerRef.current.togglePlay();
            setIsAutoplayingCue(true);
            setTimeout(() => {
              setIsAutoplayingCue(false);
            }, 2500);
          }
        } catch (e) {}
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, hasStarted, isPlaying]);

  useEffect(() => {
    setIsPlaying(false);
    setPosition(0);
    setDuration(30000);
    setTrackName("");
    setHasStarted(false);
    setIsReady(false);
    setIsAutoplayingCue(false);
  }, [spotifyId]);

  useEffect(() => {
    let active = true;

    const initPlayer = async () => {
      try {
        const IFrameAPI = await loadSpotifyIframeApi();
        if (!active) return;

        const element = document.getElementById(widgetId.current);
        if (!element) return;

        // Native widget height configured to 152 to natively show basic track lists if expanded
        const options = {
          uri: `spotify:album:${spotifyId}`,
          width: "100%",
          height: "152",
        };

        if (controllerRef.current) {
          try {
            controllerRef.current.loadUri(`spotify:album:${spotifyId}`);
            setIsReady(true);
            return;
          } catch (err) {
            console.warn("Fast load failed, recreating player...", err);
          }
        }

        IFrameAPI.createController(element, options, (EmbedController: any) => {
          if (!active) return;
          controllerRef.current = EmbedController;

          EmbedController.on("ready", () => {
            if (!active) return;
            setIsReady(true);
          });
          
          setTimeout(() => {
            if (active) setIsReady(true);
          }, 1500);

          EmbedController.on("playback_update", (e: any) => {
            if (!active) return;
            if (e && e.data) {
              const { position: pos, duration: dur, isPaused } = e.data;
              setPosition(pos);
              if (dur > 0) setDuration(dur);
              setIsPlaying(!isPaused);
              
              if (e.data.track && e.data.track.name) {
                setTrackName(e.data.track.name);
              }
            }
          });
        });
      } catch (err) {
        console.error("Spotify Iframe API load failed:", err);
        if (errorCount < 3) {
          setTimeout(() => {
            if (active) {
              setErrorCount((prev) => prev + 1);
            }
          }, 3000);
        }
      }
    };

    initPlayer();

    return () => {
      active = false;
      if (controllerRef.current && typeof controllerRef.current.destroy === 'function') {
        try {
          controllerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [spotifyId, errorCount]);

  const handlePlayPause = () => {
    if (!controllerRef.current || !isReady) return;
    controllerRef.current.togglePlay();
  };

  const handleNext = () => {
    if (!controllerRef.current || !isReady) return;
    if (typeof controllerRef.current.next === 'function') {
      controllerRef.current.next();
    }
  };

  const handlePrev = () => {
    if (!controllerRef.current || !isReady) return;
    if (typeof controllerRef.current.previous === 'function') {
      controllerRef.current.previous();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!controllerRef.current || !isReady || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.max(0, Math.min(1, clickX / width));
    const newPositionMs = percent * duration;
    setPosition(newPositionMs);
    controllerRef.current.seek(Math.round(newPositionMs / 1000));
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const isDark = variant === "dark";

  if (variant === "cover-integrated") {
    const isRedActive = !isPlaying && !isReady;
    const isYellowActive = !isPlaying && isReady;
    const isGreenActive = isPlaying;

    return (
      <div className="w-full h-full flex flex-col justify-between relative" ref={containerRef}>
        {/* The Album Cover */}
        <div 
          className="w-full relative aspect-square border border-white/20 bg-slate-900 flex items-center justify-center shadow-md overflow-hidden shrink-0 mt-1 md:mt-0 cursor-pointer cursor-target group"
          onClick={handlePlayPause}
        >
           {coverUrl ? (
             <img src={coverUrl} className="w-full h-full object-cover transition-transform duration-500" referrerPolicy="no-referrer" />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/50">
               <Music className="w-8 h-8" />
             </div>
           )}
           
           {/* Dark overlay and Play/Pause icon */}
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
              <div className="flex items-center justify-center text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-110 active:scale-90">
                {isPlaying ? (
                  <Pause className="w-12 h-12" fill="currentColor" stroke="none" />
                ) : (
                  <Play className="w-12 h-12 ml-1" fill="currentColor" stroke="none" />
                )}
              </div>
           </div>
        </div>

        {/* 6 LED strips stacked vertically in a high-density 6x10 grid */}
        <div className="grid grid-cols-10 w-full mt-auto border border-white/20 bg-black/25 overflow-hidden select-none shrink-0 aspect-[10/6]">
          {Array.from({ length: 6 }).map((_, r) => {
            return Array.from({ length: 10 }).map((_, c) => {
              const isColorLed = c < 2;
              
              if (isColorLed) {
                // Color LEDs (Columns 0 & 1): 2x2 grid per color
                // Row 0, 1: Red
                // Row 2, 3: Yellow
                // Row 4, 5: Green
                let colorType: "red" | "yellow" | "green" = "red";
                if (r === 2 || r === 3) colorType = "yellow";
                if (r >= 4) colorType = "green";

                const isThisActive = 
                  (colorType === "red" && isRedActive) ||
                  (colorType === "yellow" && isYellowActive) ||
                  (colorType === "green" && isGreenActive);

                // If active, it is fully ON.
                // If inactive, it stays completely OFF (no custom patterns)
                const active = isThisActive;

                // Determine CSS colors and shadows
                let bgColor = "#12141c";
                let shadow = "inset 0 0 4px rgba(0,0,0,0.6)";
                
                if (colorType === "red") {
                  bgColor = active ? "#ef4444" : "#4c0505";
                  shadow = active 
                    ? "inset 0 0 2px rgba(255,255,255,0.4), 0 0 10px rgba(239,68,68,0.85)" 
                    : "inset 0 0 4px rgba(0,0,0,0.6)";
                } else if (colorType === "yellow") {
                  bgColor = active ? "#eab308" : "#423c06";
                  shadow = active 
                    ? "inset 0 0 2px rgba(255,255,255,0.4), 0 0 10px rgba(234,179,8,0.85)" 
                    : "inset 0 0 4px rgba(0,0,0,0.6)";
                } else if (colorType === "green") {
                  bgColor = active ? "#22c55e" : "#062e14";
                  shadow = active 
                    ? "inset 0 0 2px rgba(255,255,255,0.4), 0 0 10px rgba(34,197,94,0.85)" 
                    : "inset 0 0 4px rgba(0,0,0,0.6)";
                }

                return (
                  <div 
                    key={`color-led-${r}-${c}`}
                    className="w-full h-full border-r border-b border-black/30 transition-all duration-[200ms]"
                    style={{
                      backgroundColor: bgColor,
                      boxShadow: shadow
                    }}
                  />
                );
              } else {
                // White LEDs (Columns 2 to 9): 8 columns of white squares
                const whiteColIndex = c - 2; // 0 to 7
                const bandIndex = Math.floor(r / 2); // 0 (Treble), 1 (Mid), 2 (Bass)
                const level = glyphLevels[bandIndex];

                // Scale the level (0-5) to 0-8 white LEDs
                let maxActive = level * 1.6;
                
                // Add tiny organic variations between row pairs so they are dynamic
                if (r % 2 === 1) {
                  // Odd row has a slightly offset trigger to feel extremely fluid and dynamic
                  maxActive = Math.max(0, level - 0.4 + (Math.sin(Date.now() / 150 + r) * 0.2)) * 1.6;
                }

                const active = whiteColIndex < maxActive;

                return (
                  <div 
                    key={`white-led-${r}-${c}`}
                    className="w-full h-full bg-white border-r border-b border-black/30 last:border-r-0 transition-all duration-[80ms]"
                    style={{
                      opacity: active ? 1 : 0.08,
                      boxShadow: active 
                        ? "inset 0 0 2px rgba(0,0,0,0.2), 0 0 10px rgba(255,255,255,0.8)" 
                        : "inset 0 0 3px rgba(0,0,0,0.5)"
                    }}
                  />
                );
              }
            });
          })}
        </div>

        {/* Hidden native widget container */}
        <div 
          className={`w-full outline-none select-none transition-all duration-300 overflow-hidden bg-transparent ${
            showNativeWidget 
              ? "mt-4 opacity-100 h-[152px] relative" 
              : "absolute w-full h-[152px] opacity-[0.001] pointer-events-none top-0 left-0 -z-10"
          }`}
        >
          <div id={widgetId.current} className="w-full h-full border-0 rounded-none overflow-hidden" />
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    const rgb = hexToRgb(dominantColor || '#10b981');
    const cy = 3;
    const cx = 7;

    const gridCells = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 15; c++) {
        if (r >= 1 && r <= 5 && c >= 5 && c <= 9) {
          continue;
        }
        gridCells.push({ r, c });
      }
    }

    const darkBg = `rgb(${Math.round(rgb.r * 0.35)}, ${Math.round(rgb.g * 0.35)}, ${Math.round(rgb.b * 0.35)})`;

    // Pre-calculate CSS variables once per dominantColor change to avoid redundant rendering computations
    const ledLitBg = `rgba(${Math.round(rgb.r + (255 - rgb.r) * 0.85)}, ${Math.round(rgb.g + (255 - rgb.g) * 0.85)}, ${Math.round(rgb.b + (255 - rgb.b) * 0.85)}, 1)`;
    const ledLitShadow = `inset 0 0 2px rgba(255,255,255,1), inset 0 0 4px rgba(0,0,0,0.15), 0 0 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), 0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
    const ledBreatheBg = `rgba(${Math.round(rgb.r + (255 - rgb.r) * 0.3)}, ${Math.round(rgb.g + (255 - rgb.g) * 0.3)}, ${Math.round(rgb.b + (255 - rgb.b) * 0.3)}, 0.45)`;
    const ledBreatheShadow = `inset 0 0 2px rgba(255,255,255,0.4), inset 0 0 4px rgba(0,0,0,0.15), 0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;

    return (
      <div className="w-full relative flex flex-col items-center mt-0 mb-0" ref={containerRef}>
        <style>{`
          @keyframes led-pulse-${spotifyId} {
            0% {
              background-color: rgba(255, 255, 255, 0.08);
              box-shadow: inset 0 0 2px rgba(255,255,255,0.05), inset 0 0 5px rgba(0,0,0,0.6);
            }
            30% {
              background-color: ${ledLitBg};
              box-shadow: ${ledLitShadow};
            }
            100% {
              background-color: rgba(255, 255, 255, 0.08);
              box-shadow: inset 0 0 2px rgba(255,255,255,0.05), inset 0 0 5px rgba(0,0,0,0.6);
            }
          }

          @keyframes led-breathe-${spotifyId} {
            0%, 100% {
              background-color: rgba(255, 255, 255, 0.06);
              box-shadow: inset 0 0 2px rgba(255,255,255,0.03), inset 0 0 5px rgba(0,0,0,0.6);
            }
            50% {
              background-color: ${ledBreatheBg};
              box-shadow: ${ledBreatheShadow};
            }
          }
        `}</style>
        {/* Frame acting as the 'table' */}
        <div 
           className="w-[100%] max-w-[340px] aspect-[15/7] rounded-none relative transition-all duration-300 flex items-center justify-center overflow-hidden border border-white/10"
           style={{ backgroundColor: darkBg }}
        >
          {/* LED grid */}
          <div 
            className="absolute inset-0 grid gap-0 select-none"
            style={{ 
              gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', 
              gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
              width: '100%',
              height: '100%'
            }}
          >
            {/* The Album Cover inside the grid */}
            <div 
              className="relative shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-30 cursor-pointer overflow-hidden bg-slate-900 cursor-target group/cover"
              style={{ gridRow: "2 / 7", gridColumn: "6 / 11" }}
              onClick={handlePlayPause}
            >
               {coverUrl ? (
                 <img src={coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Album Cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/50">
                   <Music className="w-8 h-8" />
                 </div>
               )}
               
               {/* Dark overlay and Play/Pause icon */}
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/cover:opacity-100">
                  <div className="flex items-center justify-center text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-110 active:scale-90">
                    {isPlaying ? (
                      <Pause className="w-10 h-10" fill="currentColor" stroke="none" />
                    ) : (
                      <Play className="w-10 h-10 ml-1" fill="currentColor" stroke="none" />
                    )}
                  </div>
               </div>
            </div>

            {/* LED cells */}
            {gridCells.map(({ r, c }) => {
              const isStatusLed = r === 0 && c === 14;
              
              if (isStatusLed) {
                // Status LED in the top-right corner
                let statusColor = '#ef4444';
                let glowColor = 'rgba(239, 68, 68, 0.95)';
                if (isPlaying) {
                  statusColor = '#22c55e';
                  glowColor = 'rgba(34, 197, 94, 0.95)';
                } else if (isReady) {
                  statusColor = '#eab308';
                  glowColor = 'rgba(234, 179, 8, 0.95)';
                }
                return (
                  <div 
                    key={`led-${r}-${c}`}
                    className="w-full h-full transition-all duration-[200ms]"
                    style={{
                      backgroundColor: statusColor,
                      boxShadow: `inset 0 0 4px rgba(0,0,0,0.3), 0 0 12px ${glowColor}`,
                      gridRow: `${r + 1} / ${r + 2}`,
                      gridColumn: `${c + 1} / ${c + 2}`,
                    }}
                  />
                );
              }

              // Normal LED cell
              const dist = Math.max(Math.abs(r - cy), Math.abs(c - cx));

              let finalBg = "";
              let finalShadow = "";
              let customStyle: React.CSSProperties = {};

              if (isPlaying) {
                const treble = glyphLevels[0];
                const mid = glyphLevels[1];
                const bass = glyphLevels[2];
                const activeRadius = (bass * 1.3) + (mid * 0.4); // Ranges from 0 to ~8.5

                const diff = activeRadius - dist;
                let intensity = 0.08;
                if (diff >= 0) {
                  // Inside the pulse wave
                  intensity = 0.2 + (diff * 0.15) + (treble * 0.08);
                  intensity = Math.min(1.0, Math.max(0.08, intensity));
                } else {
                  // Outside the pulse wave (fading trailing edges)
                  intensity = 0.08 + Math.max(0, 0.12 - Math.abs(diff) * 0.05);
                }
                
                const isLit = intensity > 0.25;
                finalBg = isLit
                  ? `rgba(${Math.round(rgb.r + (255 - rgb.r) * 0.8)}, ${Math.round(rgb.g + (255 - rgb.g) * 0.8)}, ${Math.round(rgb.b + (255 - rgb.b) * 0.8)}, ${intensity})`
                  : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.35})`;
                  
                finalShadow = isLit
                  ? `inset 0 0 2px rgba(255,255,255,1), inset 0 0 4px rgba(0,0,0,0.15), 0 0 ${Math.round(6 + intensity * 12)}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity}), 0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
                  : `inset 0 0 2px rgba(255,255,255,0.05), inset 0 0 5px rgba(0,0,0,0.6)`;

                customStyle = {
                  backgroundColor: finalBg,
                  boxShadow: finalShadow,
                  gridRow: `${r + 1} / ${r + 2}`,
                  gridColumn: `${c + 1} / ${c + 2}`,
                };
              } else {
                // Not playing: use beautiful slow breathing animation (pre-calculated with CSS Keyframes for zero overhead)
                customStyle = {
                  animationName: `led-breathe-${spotifyId}`,
                  animationDuration: "2.4s",
                  animationIterationCount: "infinite",
                  animationTimingFunction: "ease-in-out",
                  animationDelay: `${dist * 0.15}s`,
                  gridRow: `${r + 1} / ${r + 2}`,
                  gridColumn: `${c + 1} / ${c + 2}`,
                };
              }

              return (
                <div 
                  key={`led-${r}-${c}`}
                  className="w-full h-full will-change-[background-color,box-shadow]"
                  style={customStyle}
                />
              );
            })}
          </div>
        </div>

        {/* Native widget with unified single ID container */}
        <div 
          className={`w-full outline-none select-none transition-all duration-300 overflow-hidden bg-transparent ${
            showNativeWidget 
              ? "mt-4 opacity-100 h-[80px] relative" 
              : "absolute w-full h-[80px] opacity-[0.001] pointer-events-none top-0 left-0 -z-10"
          }`}
        >
          <div id={widgetId.current} className="w-full h-full border-0 rounded-none overflow-hidden bg-black/10 border border-slate-200/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative group" ref={containerRef}>
      
      {/* Mobile Player Frame */}
      <div className={`w-full flex flex-row items-center pl-4 sm:pl-5 pr-[44px] sm:pr-[60px] py-4 sm:py-5 rounded-none shadow-none relative transition-all duration-300 backdrop-blur-xl overflow-hidden ${isDark ? 'bg-black/40 border-t border-white/10' : 'bg-white/90 border border-slate-200'}`}>
        
        {/* Left: The Album Cover */}
        <div className="shrink-0 relative w-[80px] h-[80px] sm:w-[116px] sm:h-[116px] border border-white/20 bg-slate-900 flex items-center justify-center shadow-md overflow-hidden cursor-pointer cursor-target group/cover" onClick={handlePlayPause}>
           {coverUrl ? (
             <img 
               src={coverUrl}
               className="w-full h-full object-cover"
               decoding="sync"
               referrerPolicy="no-referrer"
               alt="Album Cover"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-white/30 bg-slate-900">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>
             </div>
           )}
           
           {/* Dark overlay and Play/Pause icon */}
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/cover:opacity-100">
              <div className="flex items-center justify-center text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-110 active:scale-90">
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" stroke="none" />
                ) : (
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 ml-1" fill="currentColor" stroke="none" />
                )}
              </div>
           </div>
        </div>

        {/* Center: Track Info */}
        <div className="flex-1 min-w-0 ml-4 sm:ml-6 flex flex-col justify-center pr-2">
           {trackName && (
             <div className={`text-[11px] sm:text-xs font-bold font-sans truncate ${isDark ? 'text-white' : 'text-slate-800'}`} title={trackName}>
                {trackName}
             </div>
           )}
           
           {/* Progress bar */}
           <div className={`h-1.5 w-full mt-1.5 sm:mt-2 rounded-full overflow-hidden cursor-pointer cursor-target ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} onClick={handleProgressBarClick}>
              <div 
                className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
        </div>

        {/* Right Edge: Glyph Interface */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col gap-0 items-center z-40 w-7 sm:w-10 bg-black/20 border-l border-white/5">
          {[5, 4, 3, 2].map((levelThreshold) => (
             <div 
               key={levelThreshold} 
               className="w-full flex-1 bg-white transition-all duration-[80ms] rounded-none" 
               style={{ 
                 opacity: glyphLevels[1] >= levelThreshold ? 1 : 0.5,
                 boxShadow: glyphLevels[1] >= levelThreshold ? 'inset 0 0 4px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.8)' : 'inset 0 0 4px rgba(0,0,0,0.3)'
               }} 
             />
          ))}
          <div className={`w-full flex-1 rounded-none transition-all duration-[200ms] ${isPlaying ? 'bg-green-500' : (isReady ? 'bg-yellow-500' : 'bg-red-500')}`} 
               style={{ 
                 opacity: 1,
                 boxShadow: isPlaying 
                   ? 'inset 0 0 4px rgba(0,0,0,0.1), 0 0 15px rgba(34,197,94,0.95)' 
                   : isReady 
                     ? 'inset 0 0 4px rgba(0,0,0,0.15), 0 0 10px rgba(234,179,8,0.85)' 
                     : 'inset 0 0 4px rgba(0,0,0,0.15), 0 0 10px rgba(239,68,68,0.85)'
               }}
          />
        </div>
      </div>

      <div 
        className={`w-full outline-none select-none transition-all duration-300 overflow-hidden bg-transparent ${
          showNativeWidget 
            ? "mt-0 opacity-100 h-[152px] relative" 
            : "absolute w-full h-[152px] opacity-[0.001] pointer-events-none top-0 left-0 -z-10"
        }`}
      >
        <div id={widgetId.current} className="w-full h-full border-0 rounded-none overflow-hidden" />
      </div>
    </div>
  );
};
