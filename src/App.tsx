import React, { useEffect, useState } from "react";
import { INITIAL_TIERS, Tier, Album } from "./data";
import { TierList } from "./components/TierList";
import { TasteProfile } from "./components/TasteProfile";
import { motion, AnimatePresence } from "motion/react";
import { Music, X, Laptop } from "lucide-react";
import albumsData from "./albums.json";
import { getImgbbCoverUrl } from "./utils";

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

  const applyAlbumsState = (data: Record<string, any>) => {
    let allInitialAlbums = INITIAL_TIERS.flatMap(t => t.albums);
    
    const mergedAlbumsMap = new Map<number, Album>();
    
    allInitialAlbums.forEach(initial => {
       mergedAlbumsMap.set(initial.id, {
         ...initial,
         ...(data[String(initial.id)] || {})
       });
    });
    
    Object.keys(data).forEach(key => {
       const id = parseInt(key, 10);
       if (!mergedAlbumsMap.has(id)) {
          if (data[key].title && data[key].artist) {
             mergedAlbumsMap.set(id, {
               ...data[key],
               id
             });
          }
       }
    });
    
    const albumList = Array.from(mergedAlbumsMap.values());
    albumList.sort((a,b) => (a.rank || 100) - (b.rank || 100));

    const updatedTiers = INITIAL_TIERS.map(tier => ({
      ...tier,
      albums: [] as Album[]
    }));
    
    albumList.forEach(album => {
      const rank = album.rank || 100;
      if (rank <= 9) updatedTiers[0].albums.push(album);
      else if (rank <= 24) updatedTiers[1].albums.push(album);
      else if (rank <= 56) updatedTiers[2].albums.push(album);
      else if (rank <= 89) updatedTiers[3].albums.push(album);
      else updatedTiers[4].albums.push(album);
    });

    setTiers(updatedTiers);
    setAlbumColors(data);
  };

  useEffect(() => {
    applyAlbumsState(albumsData);
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#fbfbfa] text-[#111111] overflow-hidden">

      {/* 2. Main content area with pristine TierList viewport */}
      <div className="flex-1 flex flex-row h-full overflow-hidden relative rounded-none">
        <div className="flex-grow overflow-hidden flex flex-col bg-[#0b0c0e] w-full">
          <AnimatePresence mode="wait">
            {activeTab === "ranking" ? (
              <motion.div
                key="ranking-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col overflow-hidden"
              >
                <div className="flex-grow min-h-0 overflow-hidden">
                  <TierList 
                    albumColors={albumColors}
                    tiers={tiers}
                    selectedAlbum={selectedAlbum}
                    setSelectedAlbum={setSelectedAlbum}
                    onAlbumClick={(album, tierName, rankNumber) => setSelectedAlbum({ ...album, tierName, rankNumber, coverUrl: album.coverUrl || getImgbbCoverUrl(album.artist, album.title) })} 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dna-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col p-4 md:p-6"
              >
                <TasteProfile tiers={tiers} />
              </motion.div>
            )}
          </AnimatePresence>
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
              className="bg-white border-4 border-slate-950 p-5 rounded-none shadow-2xl w-full max-w-sm relative z-10 text-slate-950"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <span className="bg-[#0078d7] text-white px-2 py-0.5 text-[8.5px] font-mono font-extrabold uppercase">
                  RANK #{selectedAlbum.rankNumber}
                </span>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="p-1 text-slate-550 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="w-28 h-28 border border-slate-300 self-center bg-slate-50 flex-none overflow-hidden relative">
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

                <div className="text-center mt-2 px-1">
                  <h3 className="text-lg font-sans font-black text-slate-950 uppercase leading-tight tracking-tight">{selectedAlbum.title}</h3>
                  <p className="text-xs text-blue-600 font-mono tracking-widest uppercase font-black mt-1">{selectedAlbum.artist}</p>
                </div>

                <div className="bg-slate-50 p-4 border-l-[3px] border-slate-900 text-left text-sm leading-relaxed font-sans text-slate-700 italic select-text">
                  "{selectedAlbum.note || `Đánh giá đang cập nhật...`}"
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
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
                Bảng phân hạng <strong className="text-slate-950 font-black">BLVD Metro</strong> được thiết kế tối ưu nhất cho màn hình lớn của <strong className="text-slate-950 font-black">máy tính</strong> để thao tác kéo thả và trải nghiệm thị giác hoạt động mượt mà hoàn mỹ. Bạn vẫn có thể tiếp tục xem trên di động với giao diện cuộn dọc thích ứng.
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
