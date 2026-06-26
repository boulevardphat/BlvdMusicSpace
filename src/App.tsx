import React, { useEffect, useState } from "react";
import { INITIAL_TIERS, Tier, Album } from "./data";
import { TierList, getAlbumBgColor } from "./components/TierList";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { motion, AnimatePresence } from "motion/react";
import { Music, X, Laptop } from "lucide-react";
import albumsData from "./albums.json";
import { getImgbbCoverUrl, getColorThiefDominant } from "./utils";

export default function App() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  // TasteProfile and DNA tabs are removed to keep the interface pristine and single-purpose
  const activeTab = "ranking";
  
  // Selected Album detailing state (held globally for synchronization)
  const [selectedAlbum, setSelectedAlbum] = useState<(Album & { tierName: string; rankNumber: number; coverUrl?: string; isEditingPersDesc?: boolean }) | null>(null);

  const [albumColors, setAlbumColors] = useState<Record<string, any>>({});
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    // Check if user is on mobile (<768px) and hasn't dismissed it in the current session
    const isMobileDevice = window.innerWidth < 768;
    const dismissed = sessionStorage.getItem("dismissedMobileWarning");
    if (isMobileDevice && !dismissed) {
      setShowMobileWarning(true);
    }
  }, []);

  useEffect(() => {
    const loadedTiers = albumsData.tiers || [];
    setTiers(loadedTiers);

    const initialColors: Record<string, any> = {};
    const albumsBackgroundQueue: Array<{ id: number; coverUrl: string; staticHex?: string }> = [];

    loadedTiers.forEach(tier => {
      tier.albums.forEach(album => {
        const coverUrl = album.coverUrl || getImgbbCoverUrl(album.artist, album.title, 'thumb');
        const cacheKey = `blvd-metro-color-v8-${album.id}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.staticHex = album.hex; // dynamically keep staticHex up to date
            initialColors[String(album.id)] = parsed;
          } catch (e) {
            initialColors[String(album.id)] = { hex: album.hex || "#111115", staticHex: album.hex };
            albumsBackgroundQueue.push({ id: album.id, coverUrl, staticHex: album.hex });
          }
        } else {
          // Fallback to static hex inside albums.json
          initialColors[String(album.id)] = { hex: album.hex || "#111115", staticHex: album.hex };
          // Add to extraction queue
          albumsBackgroundQueue.push({ id: album.id, coverUrl, staticHex: album.hex });
        }
      });
    });

    setAlbumColors(initialColors);
    setLoading(false);

    let isSubscribed = true;

    // Process extraction queue asynchronously in background to protect UI fluidity
    if (albumsBackgroundQueue.length > 0) {
      const processQueue = async () => {
        const executing = new Set<Promise<void>>();

        for (const item of albumsBackgroundQueue) {
          if (!isSubscribed) break;

          const promise = getColorThiefDominant(item.coverUrl)
            .then((data) => {
              if (!isSubscribed) return;
              const colorObj = {
                hex: data.dominant,
                dominant: data.dominant,
                palette: data.palette,
                staticHex: item.staticHex
              };

              // Cache computed color configuration safely
              const cacheKey = `blvd-metro-color-v8-${item.id}`;
              localStorage.setItem(cacheKey, JSON.stringify(colorObj));

              setAlbumColors((prev) => ({
                ...prev,
                [String(item.id)]: colorObj
              }));
              executing.delete(promise);
            })
            .catch((error) => {
              console.error(`Failed executing dynamic color extraction for album ${item.id}`, error);
              executing.delete(promise);
            });

          executing.add(promise);

          // Concurrency limit of 4 to avoid UI stutter and browser freeze
          if (executing.size >= 4) {
            await Promise.race(executing);
          }
        }

        await Promise.all(executing);
      };

      setTimeout(processQueue, 150);
    }

    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#fbfbfa] text-[#111111] overflow-hidden">

      {/* 2. Main content area with pristine TierList viewport */}
      <div className="flex-1 flex flex-row h-full overflow-hidden relative rounded-none">
        <div className="flex-grow overflow-hidden flex flex-col bg-[#0b0c0e] w-full">
          <TierList 
            albumColors={albumColors}
            tiers={tiers}
            selectedAlbum={selectedAlbum}
            setSelectedAlbum={setSelectedAlbum}
            onAlbumClick={(album, tierName, rankNumber) => setSelectedAlbum({ ...album, tierName, rankNumber, coverUrl: album.coverUrl || getImgbbCoverUrl(album.artist, album.title, 'full') })} 
          />
        </div>
      </div>

      {/* Responsive unified detail overlay solely active on Mobile portrait layout */}
      <AnimatePresence>
        {selectedAlbum && (
          <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <div 
              onClick={() => setSelectedAlbum(null)} 
              className="absolute inset-0 cursor-default bg-transparent" 
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white border-4 border-slate-950 pt-6 pb-6 px-5 rounded-none shadow-2xl w-full max-w-sm relative z-10 text-slate-950"
            >
              <div className="flex flex-col gap-2.5 mt-0">
                {selectedAlbum.spotifyId ? (
                  <div className="w-full flex justify-center mb-0">
                    <SpotifyPlayer 
                      key={selectedAlbum.spotifyId}
                      spotifyId={selectedAlbum.spotifyId} 
                      variant="mobile" 
                      dominantColor={albumColors[selectedAlbum.id] ? getAlbumBgColor(albumColors[selectedAlbum.id]) : '#0c1015'}
                      coverUrl={selectedAlbum.coverUrl || getImgbbCoverUrl(selectedAlbum.artist, selectedAlbum.title, 'thumb')}
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 border border-slate-300 self-center bg-slate-50 flex-none overflow-hidden relative mb-2">
                    {selectedAlbum.coverUrl ? (
                      <img
                        src={selectedAlbum.coverUrl}
                        alt={selectedAlbum.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-slate-300 absolute inset-0 m-auto" />
                    )}
                  </div>
                )}

                <div className="text-center mt-1 px-1 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="bg-[#0078d7] text-white px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider leading-none shrink-0">
                      #{selectedAlbum.rankNumber}
                    </span>
                    <h3 className="text-base sm:text-lg font-sans font-black text-slate-950 uppercase leading-tight tracking-tight">{selectedAlbum.title}</h3>
                  </div>
                  <p className="text-xs text-blue-600 font-mono tracking-widest uppercase font-black mt-1">{selectedAlbum.artist}</p>

                  {/* Mobile AOTY Scores Section */}
                  {(selectedAlbum.aotyCriticScore !== undefined || selectedAlbum.aotyUserScore !== undefined) && (
                    <div className="flex justify-center items-center gap-3 mt-1.5">
                      <div className="flex items-center justify-center opacity-80">
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlY11yUpdRoW-co_5wbhURqCyvyxJX7GTh8w&s" 
                          alt="AOTY Logo" 
                          className="h-3 w-auto object-contain drop-shadow-sm filter grayscale contrast-125"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="w-px h-3 bg-slate-300"></div>
                      <div className="flex gap-3">
                        {selectedAlbum.aotyCriticScore !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">Critic</span>
                            <span className={`text-[12px] font-sans font-black text-slate-950`}>
                              {selectedAlbum.aotyCriticScore}
                            </span>
                          </div>
                        )}
                        {selectedAlbum.aotyUserScore !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">User</span>
                            <span className={`text-[12px] font-sans font-black text-slate-950`}>
                              {selectedAlbum.aotyUserScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <div className="bg-slate-50 p-3 pb-2 border-l-[3px] border-slate-900 text-left">
                    <span className="text-[9px] font-sans font-black uppercase tracking-wider text-slate-400 block mb-1">Người đời hay nói</span>
                    <p className="text-[12px] leading-relaxed font-sans text-slate-700 italic select-text">
                      "{selectedAlbum.profDesc || `Đánh giá chuyên môn đang được cập nhật, ghi nhận ý kiến từ hội đồng phê bình.`}"
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 pb-2 border-l-[3px] border-blue-500 text-left">
                    <span className="text-[9px] font-sans font-black uppercase tracking-wider text-slate-400 block mb-1">Phát nói</span>
                    <p className="text-[12px] leading-relaxed font-sans text-slate-700 select-text">
                      {selectedAlbum.persDesc || `Chưa có chia sẻ từ Phát.`}
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold font-sans text-[10px] uppercase cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Mobile view warning popup */}
      <AnimatePresence>
        {showMobileWarning && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-[3px] border-slate-950 p-6 rounded-none shadow-2xl w-full max-w-sm relative text-slate-950"
            >
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Laptop className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-mono font-black uppercase tracking-widest leading-none">RECOMMENDATION</h3>
              </div>
              
              <p className="text-zinc-650 text-xs font-sans leading-relaxed mb-6">
                Bảng xếp hạng <strong className="text-slate-950 font-black">Album của BLVD</strong> được thiết kế tối ưu nhất cho màn hình lớn của <strong className="text-slate-950 font-black">máy tính</strong> để thao tác kéo thả và trải nghiệm thị giác hoạt động mượt mà hoàn mỹ. Bạn vẫn có thể tiếp tục xem trên di động với giao diện cuộn dọc thích ứng.
              </p>

              <button
                onClick={() => {
                  sessionStorage.setItem("dismissedMobileWarning", "true");
                  setShowMobileWarning(false);
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-blue-600 text-white font-sans font-black text-xs uppercase tracking-wider rounded-none cursor-pointer transition-colors active:scale-[0.98]"
              >
                Tiếp tục trên điện thoại
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
