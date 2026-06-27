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
  variant?: "dark" | "light" | "mobile";
  dominantColor?: string;
  coverUrl?: string;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  spotifyId,
  variant = "dark",
  dominantColor = "#111111",
  coverUrl = "",
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAutoplayingCue, setIsAutoplayingCue] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(30000);
  const [showNativeWidget, setShowNativeWidget] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [trackName, setTrackName] = useState("");

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
              className={`absolute w-[130px] h-[130px] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPlaying ? 'translate-x-[45px]' : 'translate-x-[22px]'} cursor-pointer z-10`}
              onClick={handlePlayPause}
            >
              <div 
                className={`w-full h-full rounded-full overflow-hidden ${diskClasses} shadow-inner`}
                style={diskStyle}
              >
                {/* Label (Cover) */}
                <div 
                  className="w-[42%] h-[42%] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cover bg-center border border-white/20"
                  style={{ backgroundImage: `url(${coverUrl})` }}
                ></div>
                <div className="w-[3px] h-[3px] bg-[#111111] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-white/10"></div>
              </div>
            </div>

            {/* The Album Cover */}
            <div 
              className={`absolute w-[140px] h-[140px] shadow-[0_15px_30px_rgba(0,0,0,0.3)] z-30 cursor-pointer overflow-hidden border border-black/10 bg-slate-900 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isPlaying ? '-translate-x-[45px]' : '-translate-x-[22px]'}`}
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
              ? "mt-4 opacity-100 h-[80px]" 
              : "absolute w-[1px] h-[1px] opacity-0 pointer-events-none -top-10 -left-10"
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
      <div className={`w-full flex flex-row items-center p-4 sm:p-5 rounded-none shadow-none relative transition-all duration-300 backdrop-blur-xl ${isDark ? 'bg-black/40 border-t border-white/10' : 'bg-white/90 border border-slate-200'}`}>
        
        {/* Left: The Vinyl Disk */}
        <div className="shrink-0 relative w-[90px] h-[90px] sm:w-[126px] sm:h-[126px]">
          {/* Platter disk wrapper (with hover/active scaling but NO glow) */}
          <div 
            className={`w-full h-full transition-all duration-500 ease-out cursor-pointer relative ${
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
              <div 
                className="w-[42%] h-[42%] rounded-full relative z-10 bg-cover bg-center border border-white/20"
                style={{ backgroundImage: `url(${coverUrl})` }}
              ></div>
              {/* Hole */}
              <div className="w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] bg-[#111111] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] border border-white/10"></div>
            </div>
          </div>

          {/* Elegant Vinyl Tonearm (Que) - static relative to disk parent (no hover/play scaling) */}
          <svg 
            className="absolute -top-1.5 -right-2 sm:-top-3 sm:-right-4 h-[95px] sm:h-[135px] overflow-visible pointer-events-none z-30 transition-transform duration-[800ms] ease-in-out"
            style={{
              width: '35px',
              transformOrigin: '24px 14px',
              transform: isPlaying ? 'rotate(8deg)' : 'rotate(-12deg)'
            }}
            viewBox="0 0 35 110"
          >
            {/* Pivot Base */}
            <circle cx="24" cy="14" r="9" fill={isDark ? "#2a2a2a" : "#d1d5db"} stroke={isDark ? "#444" : "#9ca3af"} strokeWidth="1" />
            <circle cx="24" cy="14" r="4" fill={isDark ? "#111" : "#4b5563"} />
            
            {/* S-shaped arm */}
            <path 
              d="M 24 14 Q 20 48 10 82 L 10 92" 
              fill="none" 
              stroke={isDark ? "#a1a1aa" : "#4b5563"} 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
            
            {/* Counterweight */}
            <rect x="20" y="2" width="8" height="6" rx="1" fill={isDark ? "#444" : "#6b7280"} />
            
            {/* Headshell / Cartridge */}
            <rect x="6" y="90" width="8" height="14" rx="1" fill={isPlaying ? "#ef4444" : (isDark ? "#1f1f22" : "#374151")} />
          </svg>
        </div>

        {/* Center: Track Info */}
        <div className="flex-1 min-w-0 ml-4 sm:ml-6 flex flex-col justify-center pr-10">
           {trackName && (
             <div className={`text-[11px] sm:text-xs font-bold font-sans truncate ${isDark ? 'text-white' : 'text-slate-800'}`} title={trackName}>
                {trackName}
             </div>
           )}
           
           {/* Progress bar */}
           <div className={`h-1.5 w-full mt-1.5 sm:mt-2 rounded-full overflow-hidden cursor-pointer ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} onClick={handleProgressBarClick}>
              <div 
                className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
        </div>

        {/* Top Right: LED Indicator */}
        <div className="absolute top-4 right-4 flex items-center">
           <span className={`w-3 h-3 rounded-full block transition-all duration-300 ${isPlaying ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,1)] animate-pulse' : (isReady ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]')}`}></span>
        </div>

        {/* Bottom Right: Menu */}
        <div className="absolute bottom-3 right-3" ref={menuRef}>
           <button onClick={() => setShowMenu(!showMenu)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
              <MoreVertical className="w-4 h-4" />
           </button>
           
           {showMenu && (
             <div className={`absolute right-0 bottom-full mb-2 w-44 shadow-2xl py-1 rounded-md border z-50 ${isDark ? 'bg-neutral-900 border-white/10' : 'bg-white border-slate-200'}`}>
                <button 
                  onClick={() => {
                    setShowNativeWidget(!showNativeWidget);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-[10px] font-sans font-semibold flex items-center gap-2 ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  {showNativeWidget ? "Ẩn danh sách phát" : "Mở danh sách phát"}
                </button>
                <a
                  href={`https://open.spotify.com/album/${spotifyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-left px-3 py-2.5 text-[10px] font-sans font-semibold flex items-center gap-2 ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở trên Spotify
                </a>
             </div>
           )}
        </div>
      </div>

      <div 
        className={`w-full outline-none select-none transition-all duration-300 overflow-hidden bg-transparent ${
          showNativeWidget 
            ? "mt-0 opacity-100 h-[152px]" 
            : "absolute w-[1px] h-[1px] opacity-0 pointer-events-none -top-10 -left-10"
        }`}
      >
        <div id={widgetId.current} className="w-full h-full border-0 rounded-none overflow-hidden" />
      </div>
    </div>
  );
};


