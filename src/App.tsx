import React, { useEffect, useState } from "react";
import { INITIAL_TIERS, Tier, Album } from "./data";
import { TierList } from "./components/TierList";
import { ChatSidebar } from "./components/ChatSidebar";
import { TasteProfile } from "./components/TasteProfile";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Music, Activity, Disc, BarChart2, MessageSquare, Plus, X, Menu, Settings, Users, Laptop } from "lucide-react";

export default function App() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  // TasteProfile and DNA tabs are removed to keep the interface pristine and single-purpose
  const activeTab = "ranking";
  
  // Mobile layout state
  const [mobileSubView, setMobileSubView] = useState<"chat" | "ranking">("ranking");
  
  // Selected Album detailing state (held globally for synchronization)
  const [selectedAlbum, setSelectedAlbum] = useState<(Album & { tierName: string; rankNumber: number; coverUrl?: string; isEditingPersDesc?: boolean }) | null>(null);

  // States for album cover candidates search and edit
  const [coverSearchQuery, setCoverSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [coverPanelOpen, setCoverPanelOpen] = useState(false);
  const [coverSuccessMsg, setCoverSuccessMsg] = useState("");

  // Stateful minimized Sidebar on desktop
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [isChatFloatingOpen, setIsChatFloatingOpen] = useState(false);
  const [chatSidebarWidth, setChatSidebarWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const [albumColors, setAlbumColors] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Boundaries for chat
      if (e.clientX >= 250 && e.clientX <= 800) {
        setChatSidebarWidth(e.clientX);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (selectedAlbum) {
      setCoverSearchQuery(`${selectedAlbum.artist} ${selectedAlbum.title}`);
      setCandidates([]);
      setCoverPanelOpen(false);
      setCoverSuccessMsg("");
    }
  }, [selectedAlbum]);

  const handleAutoSaveCover = async (albumId: number, coverUrl: string) => {
    try {
      await fetch(`/api/albums/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverUrl })
      });
      fetchAlbumsData();
    } catch(err) {
      console.error(err);
    }
  };

  const handleSaveAlbumCover = async (albumId: number, coverUrl: string) => {
    try {
      await fetch(`/api/albums/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverUrl })
      });
      fetchAlbumsData();
    } catch(err) {
      console.error(err);
    }
  };

  const fetchCoverCandidates = async () => {
    if (!coverSearchQuery.trim()) return;
    try {
      setLoadingCandidates(true);
      setCoverSuccessMsg("");
      const res = await fetch(`/api/cover-candidates?q=${encodeURIComponent(coverSearchQuery.trim())}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e) {
      console.error("Error fetching cover candidates:", e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSelectBgCover = async (coverUrl: string) => {
    if (!selectedAlbum) return;
    try {
      await handleSaveAlbumCover(selectedAlbum.id, coverUrl);
      setCoverSuccessMsg("CỐ ĐỊNH ẢNH BÌA THÀNH CÔNG! ⚡");
      setSelectedAlbum(prev => prev ? { ...prev, coverUrl } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlbumRow = async (albumId: number, tierId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa album này khỏi bảng xếp hạng không?")) {
      try {
        await fetch(`/api/albums/${albumId}`, { method: 'DELETE' });
        fetchAlbumsData();
        setSelectedAlbum(null);
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleResetTiers = async () => {
    if (window.confirm("Vì dữ liệu được lưu trong albums.json, bạn hãy mở file JSON để khôi phục thủ công nhé.")) {
      // noop
    }
  };

  const fetchAlbumsData = () => {
    fetch("/api/albums")
      .then(res => res.json())
      .then((data: Record<string, any>) => {
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

        // Bậc 1: <= 9
        // Bậc 2: <= 24
        // Bậc 3: <= 56
        // Bậc 4: <= 89
        // Bậc 5: > 89
        
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
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch albums", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlbumsData();
    const handleUpdate = () => fetchAlbumsData();
    window.addEventListener('albumUpdated', handleUpdate);
    return () => window.removeEventListener('albumUpdated', handleUpdate);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#fbfbfa] text-[#111111] overflow-hidden font-sans relative rounded-none border-0">
      
      {/* 1. Global Navigation Bar - Metro sharp styling */}
      <header className="flex-none bg-white border-b-2 border-slate-950 px-6 h-16 flex items-center justify-between relative z-30 rounded-none">
        
        {/* Flat Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-950 flex items-center justify-center rounded-none">
            <Disc className="w-4 h-4 text-white animate-spin [animation-duration:5s]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-black text-xl tracking-tighter leading-none text-slate-950">BLVD METRO</span>
            <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest pl-1.5 border-l border-slate-300">
              Pop Critic
            </span>
          </div>
        </div>



        {/* Right Info Details */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-sans font-black text-slate-900 leading-none">NOCHIWANO</div>
            <div className="text-[8px] font-mono text-blue-600 uppercase tracking-widest leading-none font-bold mt-1">
              Avant Curator
            </div>
          </div>
          <div className="w-8 h-8 bg-slate-100 border border-slate-350 flex items-center justify-center rounded-none">
            <Laptop className="w-4 h-4 text-slate-800" />
          </div>
        </div>
      </header>

      {/* 2. Main Content Split Panel with Restored Chat Sidebar and Seamless Grid Viewport */}
      <div className="flex-1 flex flex-row h-[calc(100vh-64px)] overflow-hidden relative rounded-none">
        
        {/* DESKTOP SIDEBAR LOGIC WITH SHARP ANIMATED WIDTH & CENTERED SEAM DIVIDER */}
        {activeTab === "ranking" && (
          <>
            <motion.div 
              animate={{ 
                width: isChatMinimized ? 0 : chatSidebarWidth,
                minWidth: isChatMinimized ? 0 : chatSidebarWidth,
                opacity: isChatMinimized ? 0 : 1
              }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="hidden md:flex flex-col h-full overflow-hidden bg-white relative border-r border-slate-900/10"
            >
              <ChatSidebar tiers={tiers} />
            </motion.div>

            {/* SEAM TOGGLE CONTROLLER RIGHT BETWEEN BOTH PANELS */}
            <div 
              className="hidden md:flex flex-none w-[4px] cursor-col-resize hover:bg-blue-500 active:bg-blue-600 bg-slate-900/15 transition-colors relative z-40 items-center justify-center"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatMinimized(!isChatMinimized);
                }}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-10 bg-slate-950 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-900 shadow-md transition-all cursor-pointer z-50 rounded-full transform active:scale-95"
                title={isChatMinimized ? "Mở thảo luận" : "Thu gọn thảo luận"}
              >
                <span className="font-mono text-[9px] font-bold select-none leading-none">
                  {isChatMinimized ? "»" : "«"}
                </span>
              </button>
            </div>
          </>
        )}

        {/* 3. ROBUST METRO TILES VIEWPORTS CONTENT - Set edge-to-edge bg covering top-to-bottom of available space */}
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
                {/* Mobile segmented toggle view switchers */}
                <div className="md:hidden flex flex-none p-1 bg-slate-200 border-b border-slate-350 gap-1 z-30">
                  <button
                    type="button"
                    onClick={() => setMobileSubView("chat")}
                    className={`flex-1 py-1.5 text-xs font-sans font-black uppercase transition-all rounded-none ${
                      mobileSubView === "chat" ? "bg-slate-950 text-white" : "text-slate-600 bg-white/40"
                    }`}
                  >
                    Trò chuyện
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSubView("ranking")}
                    className={`flex-1 py-1.5 text-xs font-sans font-black uppercase transition-all rounded-none ${
                      mobileSubView === "ranking" ? "bg-slate-950 text-white" : "text-slate-650 bg-white/40"
                    }`}
                  >
                    Bảng xếp hạng
                  </button>
                </div>

                <div className="flex-grow h-full overflow-hidden">
                  {/* Desktop view */}
                  <div className="hidden md:block h-full">
                    <TierList 
                      albumColors={albumColors}
                      tiers={tiers}
                      selectedAlbum={selectedAlbum}
                      setSelectedAlbum={setSelectedAlbum}
                      onAlbumClick={(album, tierName, rankNumber, coverUrl) => setSelectedAlbum({ ...album, tierName, rankNumber, coverUrl })} 
                      onResetTiers={handleResetTiers}
                      onAutoSaveCover={handleAutoSaveCover}
                      handleDeleteAlbum={handleDeleteAlbumRow}
                      coverSearchQuery={coverSearchQuery}
                      setCoverSearchQuery={setCoverSearchQuery}
                      candidates={candidates}
                      loadingCandidates={loadingCandidates}
                      coverPanelOpen={coverPanelOpen}
                      setCoverPanelOpen={setCoverPanelOpen}
                      coverSuccessMsg={coverSuccessMsg}
                      fetchCoverCandidates={fetchCoverCandidates}
                      handleSelectBgCover={handleSelectBgCover}
                    />
                  </div>

                  {/* Mobile view toggled */}
                  <div className="block md:hidden h-full">
                    {mobileSubView === "chat" ? (
                      <ChatSidebar tiers={tiers} />
                    ) : (
                      <TierList 
                        albumColors={albumColors}
                        tiers={tiers}
                        selectedAlbum={selectedAlbum}
                        setSelectedAlbum={setSelectedAlbum}
                        onAlbumClick={(album, tierName, rankNumber, coverUrl) => setSelectedAlbum({ ...album, tierName, rankNumber, coverUrl })} 
                        onResetTiers={handleResetTiers}
                        onAutoSaveCover={handleAutoSaveCover}
                        handleDeleteAlbum={handleDeleteAlbumRow}
                        coverSearchQuery={coverSearchQuery}
                        setCoverSearchQuery={setCoverSearchQuery}
                        candidates={candidates}
                        loadingCandidates={loadingCandidates}
                        coverPanelOpen={coverPanelOpen}
                        setCoverPanelOpen={setCoverPanelOpen}
                        coverSuccessMsg={coverSuccessMsg}
                        fetchCoverCandidates={fetchCoverCandidates}
                        handleSelectBgCover={handleSelectBgCover}
                      />
                    )}
                  </div>
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

        {/* FLOATING POP OUT OVERLAY DRAWER - When chat is minimized but trồi ra (tab nổi đè lên, đóng x ẩn tiếp) */}
        <AnimatePresence>
          {isChatFloatingOpen && (
            <>
              {/* Back backdrop shade click to close overlay */}
              <div 
                onClick={() => setIsChatFloatingOpen(false)}
                className="absolute inset-0 z-40 bg-black/25 backdrop-blur-xs cursor-default" 
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="absolute top-0 bottom-0 left-14 w-[380px] bg-white border-r-2 border-slate-950 z-50 flex flex-col shadow-2xl rounded-none"
              >
                <div className="p-3 bg-slate-950 text-white flex justify-between items-center px-4 shrink-0 rounded-none">
                  <span className="text-[10px] font-mono font-black tracking-widest">DISCUSSION FLYOUT</span>
                  <button 
                    onClick={() => setIsChatFloatingOpen(false)}
                    className="p-1 px-2.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-sans font-black uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    ✖ ẨN CHAT
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatSidebar tiers={tiers} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-between">
                <button
                  onClick={() => {
                    const foundTier = tiers.find(t => t.albums.some(a => a.id === selectedAlbum.id));
                    if (foundTier) {
                      handleDeleteAlbumRow(selectedAlbum.id, foundTier.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-100 border border-red-300 text-red-600 font-bold font-sans text-[10px] uppercase cursor-pointer"
                >
                  Xóa Album
                </button>
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

    </div>
  );
}
