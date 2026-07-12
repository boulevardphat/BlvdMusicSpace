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
    if (isPlaying && variant !== "mobile") {
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
        setErrorCount((prev) => prev + 1);
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
  
  const diskStyle = {
    backgroundColor: '#111111',
    backgroundImage: `
         conic-gradient(
             from 0deg,
             transparent 0deg,
             rgba(255, 255, 255, 0.05) 20deg,
             rgba(255, 255, 255, 0.35) 45deg, 
             rgba(255, 255, 255, 0.05) 70deg,
             transparent 90deg,
             transparent 180deg,
             rgba(255, 255, 255, 0.05) 200deg,
             rgba(255, 255, 255, 0.35) 225deg, 
             rgba(255, 255, 255, 0.05) 250deg,
             transparent 270deg
         ),
         repeating-radial-gradient(
             rgba(0, 0, 0, 0.85) 0, 
             rgba(0, 0, 0, 0.85) 2px, 
             transparent 3px, 
             transparent 4px
         )`
  };

  const diskClasses = hasStarted 
    ? (isPlaying ? "spinning-disk" : "spinning-disk paused-disk") 
    : "";

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

        {/* 3 LED strips stacked vertically with no gap */}
        <div className="flex flex-col w-full mt-auto border border-white/20 bg-black/25 overflow-hidden select-none shrink-0">
          {/* Row 0: Top strip (Status Red + 4 White LEDs) */}
          <div className="grid grid-cols-5 w-full shrink-0">
            <div 
              className="w-full h-auto aspect-square shrink-0 border-r border-black/30 transition-all duration-[200ms]"
              style={{
                backgroundColor: isRedActive ? '#ef4444' : '#4c0505',
                boxShadow: isRedActive 
                  ? 'inset 0 0 4px rgba(0,0,0,0.1), 0 0 15px rgba(239,68,68,0.95)' 
                  : 'inset 0 0 6px rgba(0,0,0,0.6)'
              }}
            />
            {[2, 3, 4, 5].map((levelThreshold) => {
              const active = glyphLevels[0] >= levelThreshold;
              return (
                <div 
                  key={levelThreshold} 
                  className="w-full h-auto aspect-square shrink-0 bg-white transition-all duration-[80ms] rounded-none border-r border-black/30 last:border-r-0" 
                  style={{ 
                    opacity: active ? 1 : 0.08,
                    boxShadow: active ? 'inset 0 0 4px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.8)' : 'inset 0 0 4px rgba(0,0,0,0.5)'
                  }} 
                />
              );
            })}
          </div>

          {/* Row 1: Middle strip (Status Yellow + 4 White LEDs) */}
          <div className="grid grid-cols-5 w-full border-t border-black/20 shrink-0">
            <div 
              className="w-full h-auto aspect-square shrink-0 border-r border-black/30 transition-all duration-[200ms]"
              style={{
                backgroundColor: isYellowActive ? '#eab308' : '#423c06',
                boxShadow: isYellowActive 
                  ? 'inset 0 0 4px rgba(0,0,0,0.1), 0 0 15px rgba(234,179,8,0.95)' 
                  : 'inset 0 0 6px rgba(0,0,0,0.6)'
              }}
            />
            {[2, 3, 4, 5].map((levelThreshold) => {
              const active = glyphLevels[1] >= levelThreshold;
              return (
                <div 
                  key={levelThreshold} 
                  className="w-full h-auto aspect-square shrink-0 bg-white transition-all duration-[80ms] rounded-none border-r border-black/30 last:border-r-0" 
                  style={{ 
                    opacity: active ? 1 : 0.08,
                    boxShadow: active ? 'inset 0 0 4px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.8)' : 'inset 0 0 4px rgba(0,0,0,0.5)'
                  }} 
                />
              );
            })}
          </div>

          {/* Row 2: Bottom strip (Status Green + 4 White LEDs) */}
          <div className="grid grid-cols-5 w-full border-t border-black/20 shrink-0">
            <div 
              className="w-full h-auto aspect-square shrink-0 border-r border-black/30 transition-all duration-[200ms]"
              style={{
                backgroundColor: isGreenActive ? '#22c55e' : '#062e14',
                boxShadow: isGreenActive 
                  ? 'inset 0 0 4px rgba(0,0,0,0.1), 0 0 15px rgba(34,197,94,0.95)' 
                  : 'inset 0 0 6px rgba(0,0,0,0.6)'
              }}
            />
            {[2, 3, 4, 5].map((levelThreshold) => {
              const active = glyphLevels[2] >= levelThreshold;
              return (
                <div 
                  key={levelThreshold} 
                  className="w-full h-auto aspect-square shrink-0 bg-white transition-all duration-[80ms] rounded-none border-r border-black/30 last:border-r-0" 
                  style={{ 
                    opacity: active ? 1 : 0.08,
                    boxShadow: active ? 'inset 0 0 4px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.8)' : 'inset 0 0 4px rgba(0,0,0,0.5)'
                  }} 
                />
              );
            })}
          </div>
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
    return (
      <div className="w-full relative flex flex-col items-center mt-0 mb-0" ref={containerRef}>
        <style>{`
          @keyframes spinRecord {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinning-disk {
            animation: spinRecord 6s linear infinite;
          }
          .paused-disk {
            animation-play-state: paused;
          }
        `}</style>
        {/* Frame acting as the 'table' */}
        <div 
           className="w-[100%] max-w-[340px] h-[160px] rounded-none relative transition-all duration-300 border border-black/5 flex items-center justify-center overflow-hidden"
           style={{ backgroundColor: dominantColor || '#f8fafc' }}
        >
          {/* Container for Cover and Disk to keep them centered together */}
          <div className="relative w-[140px] h-[140px] flex items-center justify-center">
            
            {/* Vinyl disk that slides out */}
            <div 
              className={`absolute w-[130px] h-[130px] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPlaying ? 'translate-x-[45px]' : 'translate-x-[22px]'} cursor-pointer z-10 cursor-target`}
              onClick={handlePlayPause}
            >
              <div 
                className={`w-full h-full rounded-full overflow-hidden ${diskClasses} shadow-inner`}
                style={diskStyle}
              >
                {/* Label (Cover) */}
                <img 
                  src={coverUrl}
                  className="w-[42%] h-[42%] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 object-cover border border-white/20"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  alt="Label Cover"
                />
                <div className="w-[3px] h-[3px] bg-[#111111] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-white/10"></div>
              </div>
            </div>

            {/* The Album Cover */}
            <div 
              className={`absolute w-[140px] h-[140px] shadow-[0_15px_30px_rgba(0,0,0,0.3)] z-30 cursor-pointer overflow-hidden border border-black/10 bg-slate-900 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPlaying ? '-translate-x-[45px]' : '-translate-x-[22px]'} cursor-target`}
              onClick={handlePlayPause}
            >
               {coverUrl ? (
                 <img src={coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/50">
                   <Music className="w-8 h-8" />
                 </div>
               )}
            </div>
          </div>
          
          {/* LED Indicator (top right) */}
          <div className="absolute top-4 right-4 flex items-center z-40">
             <span className={`w-3 h-3 rounded-full block transition-all duration-300 ${isPlaying ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,1)] animate-pulse' : (isReady ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]')}`}></span>
          </div>

          {/* Menu 3-dots (bottom right) */}
          <div className="absolute bottom-3 right-3 z-40" ref={menuRef}>
             <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors bg-black/10 backdrop-blur-md">
                <MoreVertical className="w-4 h-4" />
             </button>
             
             {showMenu && (
               <div className="absolute right-0 bottom-full mb-2 w-44 shadow-2xl py-1 rounded-md border z-50 bg-neutral-900 border-white/10">
                  <button 
                    onClick={() => {
                      setShowNativeWidget(!showNativeWidget);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-[10px] font-sans font-semibold flex items-center gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    {showNativeWidget ? "Hide Native Widget" : "Show Native Widget"}
                  </button>
               </div>
             )}
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
      <style>{`
        @keyframes spinRecord {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning-disk {
          animation: spinRecord 6s linear infinite;
        }
        .paused-disk {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Vinyl Player Frame */}
      <div className={`w-full flex flex-row items-center pl-4 sm:pl-5 pr-[44px] sm:pr-[60px] py-4 sm:py-5 rounded-none shadow-none relative transition-all duration-300 backdrop-blur-xl overflow-hidden ${isDark ? 'bg-black/40 border-t border-white/10' : 'bg-white/90 border border-slate-200'}`}>
        
        {/* Left: The Vinyl Disk */}
        <div className="shrink-0 relative w-[80px] h-[80px] sm:w-[116px] sm:h-[116px]">
          {/* Platter disk wrapper (with hover/active scaling but NO glow) */}
          <div 
            className={`w-full h-full transition-all duration-500 ease-out cursor-pointer relative cursor-target ${
              isAutoplayingCue 
                ? 'scale-[1.08]' 
                : isPlaying 
                  ? 'scale-[1.06] hover:scale-[1.10]' 
                  : 'hover:scale-[1.07]'
            }`} 
            onClick={handlePlayPause}
          >
            <div 
              className={`absolute inset-0 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden ${diskClasses} group/disk`}
              style={diskStyle}
            >
              {/* Label (Cover) */}
              <img 
                src={coverUrl}
                className="w-[42%] h-[42%] rounded-full relative z-10 object-cover border border-white/20"
                decoding="sync"
                referrerPolicy="no-referrer"
                alt="Label Cover"
              />
              {/* Hole */}
              <div className="w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] bg-[#111111] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-white/10"></div>
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

