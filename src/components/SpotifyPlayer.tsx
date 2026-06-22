import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, ExternalLink, SkipBack, SkipForward, MoreVertical, LayoutTemplate, Disc3 } from "lucide-react";

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
  variant?: "dark" | "light";
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  spotifyId,
  variant = "dark",
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
    setIsPlaying(false);
    setPosition(0);
    setDuration(30000);
    setTrackName("");
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
  
  const styles = {
    container: "bg-transparent p-0 relative transition-all duration-300 group w-full",
    playerWrapper: isDark 
      ? "px-4 py-4 bg-black/40 border border-white/10 shadow-lg"
      : "px-4 py-4 bg-white border border-slate-200 shadow-md",
    playControls: "flex flex-col items-center shrink-0 w-20",
    controlBtn: isDark
      ? "text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5"
      : "text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5",
    playBtn: isDark
      ? `${isReady ? "text-[#1db954] hover:scale-105 hover:brightness-110" : "text-neutral-600 cursor-not-allowed"} transition-all focus:outline-none shrink-0 active:scale-95 bg-transparent p-0 flex items-center justify-center rounded-full`
      : `${isReady ? "text-[#1db954] hover:scale-105 hover:brightness-110" : "text-slate-300 cursor-not-allowed"} transition-all focus:outline-none shrink-0 active:scale-95 bg-transparent p-0 flex items-center justify-center rounded-full`,
    progressContainer: "flex-1 min-w-0 flex flex-col justify-end pb-1",
    trackMetaPanel: "flex flex-col mb-3 relative min-h-[36px]",
    trackTitle: isDark ? "text-[12px] font-sans font-bold text-white truncate pr-6" : "text-[12px] font-sans font-bold text-slate-800 truncate pr-6",
    trackStatus: isDark ? "text-[9px] font-mono font-bold tracking-widest uppercase text-[#1db954]" : "text-[9px] font-mono font-bold tracking-widest uppercase text-[#1db954]",
    timer: isDark ? "text-white/60 font-mono text-[9px] font-bold" : "text-slate-500 font-mono text-[9px] font-bold",
    progressBarBg: isDark
      ? "h-2 w-full bg-white/10 cursor-pointer overflow-hidden relative group-hover:h-3 transition-all rounded-sm"
      : "h-2 w-full bg-slate-200 cursor-pointer overflow-hidden relative group-hover:h-3 transition-all rounded-sm",
    progressBarFill: "h-full bg-[#1db954] transition-all duration-300 relative rounded-sm shadow-[0_0_8px_rgba(29,185,84,0.4)]",
    menuBtn: isDark 
      ? "text-white/50 hover:text-white transition-colors absolute right-0 top-0 p-1"
      : "text-slate-400 hover:text-slate-900 transition-colors absolute right-0 top-0 p-1",
    dropdown: isDark
      ? "absolute right-0 top-6 mt-1 w-44 bg-neutral-900 border border-white/10 shadow-xl z-50 py-1 rounded-sm"
      : "absolute right-0 top-6 mt-1 w-44 bg-white border border-slate-200 shadow-xl z-50 py-1 rounded-sm",
    dropdownItem: isDark
      ? "w-full text-left px-3 py-2.5 text-[10px] font-sans font-semibold text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-2"
      : "w-full text-left px-3 py-2.5 text-[10px] font-sans font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.playerWrapper}>
        <div className="flex flex-row items-center gap-4">
          
          <div className={styles.playControls}>
            <button onClick={handlePlayPause} disabled={!isReady} className={styles.playBtn}>
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1" />
              )}
            </button>
            <div className="flex items-center gap-1 mt-1">
              <button onClick={handlePrev} disabled={!isReady} className={styles.controlBtn}>
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button onClick={handleNext} disabled={!isReady} className={styles.controlBtn}>
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0 h-full relative" ref={menuRef}>
            
            <button onClick={() => setShowMenu(!showMenu)} className={styles.menuBtn}>
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className={styles.dropdown}>
                <button 
                  onClick={() => {
                    setShowNativeWidget(!showNativeWidget);
                    setShowMenu(false);
                  }}
                  className={styles.dropdownItem}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  {showNativeWidget ? "Ẩn danh sách phát" : "Mở danh sách phát"}
                </button>
                <a
                  href={`https://open.spotify.com/album/${spotifyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.dropdownItem}
                  onClick={() => setShowMenu(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở trên Spotify
                </a>
              </div>
            )}

            <div className={styles.trackMetaPanel}>
              <div className="flex items-center gap-1.5 mb-1">
                {isPlaying ? (
                  <Disc3 className="w-3 h-3 text-[#1db954] animate-spin" />
                ) : (
                  <span className={isReady ? "w-1.5 h-1.5 rounded-full bg-[#1db954] opacity-50 block" : "w-1.5 h-1.5 rounded-full bg-gray-500 block"} />
                )}
                <span className={styles.trackStatus}>
                  {isPlaying ? "ĐANG PHÁT" : !isReady ? "KẾT NỐI API..." : "SẴN SÀNG"}
                </span>
              </div>
              <div className={styles.trackTitle} title={trackName || "SPOTIFY MUSIC PLAYER"}>
                {trackName || "SPOTIFY MUSIC PLAYER"}
              </div>
            </div>

            <div className={styles.progressContainer}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={styles.timer}>{formatTime(position)}</span>
                <span className={styles.timer}>{formatTime(duration)}</span>
              </div>
              <div className={styles.progressBarBg} onClick={handleProgressBarClick}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={isDark ? "text-[8px] font-sans text-white/30 truncate mt-1.5 block opacity-0 group-hover:opacity-100 transition-opacity" : "text-[8px] font-sans text-slate-400 truncate mt-1.5 block opacity-0 group-hover:opacity-100 transition-opacity"}>
                * Web API chỉ hỗ trợ bản xem trước (preview) 30s.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`w-full outline-none select-none transition-all duration-300 overflow-hidden bg-transparent ${
          showNativeWidget 
            ? "mt-0 opacity-100 h-[152px]" 
            : "absolute w-[1px] h-[1px] opacity-0 pointer-events-none -top-10 -left-10"
        }`}
      >
        <div id={widgetId.current} className="w-full h-full border-0" />
      </div>
    </div>
  );
};


