import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { formatRankingForPrompt, Tier, Album } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Send, RotateCcw, MessageSquare, PlusCircle, Paperclip, Calendar, ChevronRight, Award, Compass } from "lucide-react";
import Papa from "papaparse";
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, deleteDoc, doc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Markdown from "react-markdown";

export const HISTORICAL_BATTLES = [
  {
    id: "h1",
    date: "2 tháng trước",
    title: "Vòng 1: Nội chiến Discography",
    summary: "Madonna Ray of Light v.s. Confessions, Lana Born to Die v.s. Ultraviolence.",
    chat: [
      { role: "user", content: "hãy giúp tôi xác định thứ tựu yêu thích của tôi đối vơi các album này bằng các câu hỏi kiểu : này hay này? Hỏi nhiểu nhất có thể, đủ để xếp hết tất cả album có trong file, thừa luôn cũng được" },
      { role: "model", content: "Tuyệt vời! Đây là một thư viện nhạc rất chất lượng. Để giúp bạn sắp xếp thứ hạng, tôi sẽ bắt đầu đưa ra các vòng đấu so găng trực tiếp.\n\n**Madonna:**\n1. Ray of Light hay Confessions on a Dance Floor?\n2. Like a Prayer hay Erotica (PA Version)?\n3. Bedtime Stories hay Music?\n\n**Lana Del Rey:**\n4. Born To Die - The Paradise Edition hay Ultraviolence (Deluxe)?\n5. Norman Fucking Rockwell! hay Honeymoon?" },
      { role: "user", content: "Tôi chọn: Confessions, Erotica, Music, Born to die, NFR" },
      { role: "model", content: "Ghi nhận nước đi cực chất! Vậy là Confessions đang chứng tỏ sức hấp dẫn tuyệt đối trong lòng bạn, và NFR đang tạm dẫn đầu discography của Lana. Hãy chuẩn bị cho các vòng tiếp theo!" }
    ]
  },
  {
    id: "h2",
    date: "1.5 tháng trước",
    title: "Vòng 5: Đại chiến Champions",
    summary: "Nơi vương miện được quyết định giữa các album của Charli xcx, Billie Eilish và Madonna.",
    chat: [
      { role: "user", content: "mình muốn so sánh các album vô địch với nhau để xem ai lên đầu tuyệt đối" },
      { role: "model", content: "Bàn cờ của những nhà vô địch chính thức khởi động! 🥊\n\n- Charli xcx - BRAT hay Billie Eilish - HIT ME HARD AND SOFT?\n- Madonna - Confessions on a Dance Floor hay Lana Del Rey - Norman Fucking Rockwell!?" },
      { role: "user", content: "Chắc chắn là BRAT và Confessions rồi." },
      { role: "model", content: "Cơn địa chấn được xác lập! Madonna - Confessions on a Dance Floor chính thức xưng vương tối cao ở vị trí số một, theo sát ở ngôi á quân là Charli xcx - BRAT!" }
    ]
  },
  {
    id: "h3",
    date: "1 tháng trước",
    title: "Vòng 8: Tái cấu trúc (Phế truất IGOR)",
    summary: "Cú đảo lộn ngoạn mục giữa Kesha và Tyler, The Creator khi thiết lập vị trí trong Top 10.",
    chat: [
      { role: "user", content: "tôi chưa ưng: igor quá cao, gag order quá thấp" },
      { role: "model", content: "Nhiệm vụ tái định vị bắt đầu! ⚖️ Chúng ta sẽ cho Kesha - Gag Order thách đấu trực tiếp với Tyler, The Creator - IGOR để xếp lại vị trí chính xác trong Top 10." },
      { role: "user", content: "Gag Order xứng đáng hơn, IGOR không phải album tôi nghe nhiều bằng." },
      { role: "model", content: "Mệnh lệnh của bạn là tối cao! `Gag Order` có cú nhảy vọt ngoạn mục giành lấy vị trí thứ 7 trong Đền Thờ (The Pantheon). `IGOR` chính thức bị phế truất xuống hạng dưới!" }
    ]
  },
  {
    id: "h4",
    date: "2 tuần trước",
    title: "Kỷ nguyên mới: Kylie & Björk",
    summary: "Gu nhạc chuyển dịch rõ rệt sang sự tinh tế, nội tâm và electronica mờ ảo.",
    chat: [
      { role: "user", content: "helo sau 2 tháng, hiện tại mình rất nghiện nghe kylie đặc biệt từ KM94 đến body language, ngoài ra còn có vespertine của bjork, twigs" },
      { role: "model", content: "Chào mừng quay trở lại! Đúng như dự đoán, gu nhạc của bạn đã tiến hóa vượt bậc. Bạn đang bước vào kỷ nguyên của sự sâu lắng, thì thầm và electronica mờ ảo.\n\nBjörk - Vespertine và Kylie Minogue - Impossible Princess chính thức thăng tiến thẳng vào Đền Thờ (The Pantheon)!" }
    ]
  }
];

export function ChatSidebar({ tiers }: { tiers: Tier[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [archived, setArchived] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [selectedHistorical, setSelectedHistorical] = useState<typeof HISTORICAL_BATTLES[0] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);
  const messagesRef = collection(db, "chats");
  const archivedMessagesRef = collection(db, "archived_chats");

  useEffect(() => {
    const aq = query(archivedMessagesRef, orderBy("timestamp", "desc"));
    const unsubscribeA = onSnapshot(aq, (snapshot) => {
      const hist: any[] = [];
      snapshot.forEach(doc => {
        hist.push({ id: doc.id, ...doc.data() });
      });
      setArchived(hist);
    });
    return () => unsubscribeA();
  }, []);

  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp?.toMillis() || Date.now()
        });
      });
      if (msgs.length === 0) {
        // Populate system message if empty
        addDoc(messagesRef, {
          role: "model",
          content: "Chào mừng bạn! Mình là Pop Curator — người đồng hành thẩm định âm nhạc của riêng bạn. Toàn bộ cơ sở dữ liệu đã được đồng bộ hóa thành công.\n\nTừ nay, bạn có thể tự do thảo luận, chấm điểm, nâng/hạ hoặc dịch chuyển bất kỳ vị trí album nào trực tiếp thông qua cuộc thảo luận này. Hệ thống sẽ cập nhật bảng xếp hạng tức thì ở giao diện bên phải. Hãy trò chuyện để khám phá gu nhạc của bạn nhé!",
          timestamp: serverTimestamp()
        });
      } else {
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      dummyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }, [messages]);

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chats", id));
    } catch (e) {
      console.error(e);
    }
  };

  const reloadFrom = async (id: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      const messagesToDelete = messages.slice(index + 1);
      const batch = writeBatch(db);
      messagesToDelete.forEach(m => {
        batch.delete(doc(db, "chats", m.id));
      });
      await batch.commit();
    }
  };

  const clearChat = async () => {
    if (window.confirm("Bắt đầu cuộc trò chuyện mới? (Lịch sử sẽ được lưu vào Lịch sử đấu)")) {
      if (messages.length > 2) {
        // Find title logic
        const firstUserMsg = messages.find(m => m.role === "user");
        const titleText = firstUserMsg ? firstUserMsg.content.slice(0, 40) + "..." : "Cuộc trò chuyện ẩn danh";
        await addDoc(archivedMessagesRef, {
          title: titleText,
          date: "Mới đây",
          summary: "Cuộc đối thoại về tư duy thẩm định và sắp xếp album.",
          chat: messages,
          timestamp: serverTimestamp()
        });
      }

      const batch = writeBatch(db);
      messages.forEach(m => {
        batch.delete(doc(db, "chats", m.id));
      });
      await batch.commit();
      
      await addDoc(messagesRef, {
        role: "model",
        content: "Phiên làm việc mới đã sẵn sàng! Bạn muốn định vị lại nghệ sĩ nào tiếp theo?",
        timestamp: serverTimestamp()
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedAlbums: { artist: string; title: string }[] = [];

        results.data.forEach((row: any) => {
          let artist = "";
          let title = "";

          const keys = Object.keys(row);
          const artistKey = keys.find(k => (k || "").toLowerCase().includes("nghệ sĩ") || (k || "").toLowerCase().includes("artist") || (k || "").toLowerCase().includes("singer"));
          const titleKey = keys.find(k => (k || "").toLowerCase().includes("tên bài hát") || (k || "").toLowerCase().includes("bài hát") || (k || "").toLowerCase().includes("title") || (k || "").toLowerCase().includes("album"));

          if (artistKey && titleKey) {
            artist = row[artistKey];
            title = row[titleKey];
          } else if (keys[0]) {
            const val = row[keys[0]];
            if (typeof val === "string" && val.includes("-")) {
              const parts = val.split("-");
              artist = parts[0]?.trim();
              title = parts[1]?.trim();
            }
          }

          if (artist && title) {
            parsedAlbums.push({ artist, title });
          }
        });

        if (parsedAlbums.length === 0) {
          alert("Không nhận diện được hàng nào hợp lệ! Định dạng yêu cầu: Cột 'Nghệ sĩ' & 'Tên bài hát' hoặc 'Artist' & 'Title'.");
          return;
        }

        // Send as a proposal message to the chatbot instead of directly inserting to Firestore
        const listString = parsedAlbums.map((p, i) => `${i + 1}. **${p.title}** - *${p.artist}*`).join("\n");
        const proposalMessage = `Tôi vừa tải lên danh sách album đề xuất từ file CSV:\n\n${listString}\n\nHãy thẩm định qua danh sách này, nhận xét sơ lược về gu âm nhạc từ file này, rồi tư vấn/đề xuất lựa chọn xem những album nào xứng đáng được kết nạp vào bảng xếp hạng nhé! Bạn hãy chờ ý kiến của tôi chốt rồi mới lặp cập nhật nhé.`;
        
        await sendMessage(proposalMessage);
      },
      error: (err) => {
        console.error("Parse error:", err);
        alert("Lỗi đọc file CSV!");
      }
    });

    e.target.value = "";
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    try {
      setIsTyping(true);
      
      await addDoc(messagesRef, {
        role: "user",
        content: textToSend.trim(),
        timestamp: serverTimestamp()
      });

      const historyForApi = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyForApi,
          rankingData: formatRankingForPrompt(tiers)
        })
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      let serverText = data.text || "";
      let hasUpdate = false;
      let parsedUpdate: any = null;

      const regex = /<UPDATE_JSON>([\s\S]*?)<\/UPDATE_JSON>/i;
      const match = serverText.match(regex);
      if (match) {
        try {
          const jsonStr = match[1].trim();
          parsedUpdate = JSON.parse(jsonStr);
          hasUpdate = true;
          // Strip the JSON block from text so user doesn't see it
          serverText = serverText.replace(regex, "").trim();
        } catch (jsonErr) {
          console.error("JSON parse error:", jsonErr);
        }
      }
      
      await addDoc(messagesRef, {
        role: "model",
        content: serverText,
        timestamp: serverTimestamp()
      });

      if (hasUpdate && parsedUpdate) {
        if (Array.isArray(parsedUpdate)) {
          const batch = writeBatch(db);
          parsedUpdate.forEach((t: any) => {
            const tDoc = doc(db, "tiers", t.id);
            batch.set(tDoc, {
              id: t.id,
              name: t.name,
              description: t.description,
              albums: t.albums || []
            }, { merge: true });
          });
          await batch.commit();
        } else if (parsedUpdate && Array.isArray(parsedUpdate.operations)) {
          let updatedTiers = JSON.parse(JSON.stringify(tiers)) as Tier[];
          let dbChanged = false;

          parsedUpdate.operations.forEach((op: any) => {
            if (op.type === "ADD" && op.album) {
              const targetTier = updatedTiers.find(t => t.id === op.tierId);
              if (targetTier) {
                let maxId = 0;
                updatedTiers.forEach(t => t.albums?.forEach(a => { if (a.id > maxId) maxId = a.id; }));
                const newId = maxId + 1;
                
                if (!targetTier.albums) targetTier.albums = [];
                targetTier.albums.push({
                  id: newId,
                  artist: op.album.artist,
                  title: op.album.title,
                  note: op.album.note || ""
                });
                dbChanged = true;
              }
            } 
            else if (op.type === "MOVE") {
              let albumToMove: Album | null = null;
              updatedTiers.forEach(t => {
                if (t.albums) {
                  const idx = t.albums.findIndex(a => a.id === op.albumId);
                  if (idx !== -1) {
                    albumToMove = t.albums[idx];
                    t.albums.splice(idx, 1);
                  }
                }
              });
              if (albumToMove) {
                const targetTier = updatedTiers.find(t => t.id === op.toTierId);
                if (targetTier) {
                  if (!targetTier.albums) targetTier.albums = [];
                  if (typeof op.insertIndex === "number") {
                    targetTier.albums.splice(op.insertIndex, 0, albumToMove);
                  } else {
                    targetTier.albums.push(albumToMove);
                  }
                  dbChanged = true;
                }
              }
            }
            else if (op.type === "DELETE") {
              updatedTiers.forEach(t => {
                if (t.albums) {
                  const idx = t.albums.findIndex(a => a.id === op.albumId);
                  if (idx !== -1) {
                    t.albums.splice(idx, 1);
                    dbChanged = true;
                  }
                }
              });
            }
            else if (op.type === "REORDER_TIER") {
              const targetTier = updatedTiers.find(t => t.id === op.tierId);
              if (targetTier && Array.isArray(op.albumIds)) {
                if (!targetTier.albums) targetTier.albums = [];
                const albumMap = new Map<number, Album>();
                targetTier.albums.forEach(a => albumMap.set(a.id, a));
                const reordered: Album[] = [];
                op.albumIds.forEach((id: number) => {
                  const album = albumMap.get(id);
                  if (album) reordered.push(album);
                });
                targetTier.albums.forEach(a => {
                  if (!op.albumIds.includes(a.id)) {
                    reordered.push(a);
                  }
                });
                targetTier.albums = reordered;
                dbChanged = true;
              }
            }
          });

          if (dbChanged) {
            const batch = writeBatch(db);
            updatedTiers.forEach((t) => {
              const tDoc = doc(db, "tiers", t.id);
              batch.set(tDoc, { albums: t.albums || [] }, { merge: true });
            });
            await batch.commit();
          }
        }
      }

    } catch (err) {
      console.error(err);
      await addDoc(messagesRef, {
        role: "model",
        content: "Oops! Có lỗi kết nối rồi. Bạn thử lại nhé 😅",
        timestamp: serverTimestamp()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    const txt = input;
    setInput("");
    await sendMessage(txt);
  };

  const renderMessageContent = (content: string) => {
    return content.replace(/<UPDATE_JSON>[\s\S]*?<\/UPDATE_JSON>/gi, "").trim();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden relative border-0">
      
      {/* Header */}
      <div className="flex-none p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50 relative z-10">
        <button 
          onClick={() => setActiveTab(activeTab === "chat" ? "history" : "chat")} 
          className="p-1.5 px-4 text-[10px] font-mono font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-none border border-slate-955 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-800" />
          {activeTab === "chat" ? "LỊCH SỬ ĐẤU" : "HỘI THOẠI CHAT"}
        </button>
        <button 
          onClick={clearChat} 
          className="p-1.5 px-4 text-[10px] font-mono font-black uppercase tracking-widest bg-red-50 hover:bg-red-100 text-red-650 rounded-none border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer" 
          title="Bắt đầu lại"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>BẮT ĐẦU MỚI</span>
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Chat Pane */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#fcfcfb]">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  key={msg.id} 
                  className={`flex flex-col max-w-[88%] group ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                     <span className="text-[8.5px] text-slate-400 uppercase tracking-widest font-mono font-black">
                       {msg.role === "user" ? "BẠN ĐỌC" : "POP CURATOR AI"}
                     </span>
                     <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 gap-2">
                        <button onClick={() => reloadFrom(msg.id)} className="text-slate-400 hover:text-blue-600" title="Đặt lại từ đây"><RotateCcw className="w-3 h-3" /></button>
                        <button onClick={() => deleteMessage(msg.id)} className="text-slate-400 hover:text-red-500" title="Xóa dòng thoại"><Trash2 className="w-3 h-3" /></button>
                     </div>
                  </div>
                  
                  <div 
                    className={`relative p-3.5 rounded-none text-[12.5px] leading-relaxed border-2 font-sans transition-all duration-200
                      ${msg.role === "user" 
                        ? "bg-slate-900 border-slate-900 text-white shadow-[3px_3px_0px_rgba(0,0,0,0.15)]" 
                        : "bg-white border-slate-900 text-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,0.06)]"}`}
                  >
                     <div className="break-words font-sans">
                       <Markdown
                         components={{
                           p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap">{children}</p>,
                           strong: ({ children }) => <strong className={`font-black ${msg.role === "user" ? "text-white" : "text-slate-950"}`}>{children}</strong>,
                           em: ({ children }) => <em className="italic font-normal">{children}</em>,
                           ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>,
                           ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>,
                           li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                           h1: ({ children }) => <h1 className="text-sm font-black uppercase tracking-tight mt-3 mb-1.5">{children}</h1>,
                           h2: ({ children }) => <h2 className="text-xs font-black uppercase text-slate-900 mt-2.5 mb-1">{children}</h2>,
                           h3: ({ children }) => <h3 className="text-[11px] font-black uppercase text-slate-700 mt-2 mb-1">{children}</h3>,
                         }}
                       >
                         {renderMessageContent(msg.content)}
                       </Markdown>
                     </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mr-auto items-start bg-white border-2 border-slate-900 px-4 py-2 text-slate-800 rounded-none w-fit shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                 >
                   <div className="flex gap-1.5 items-center">
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-none animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-none animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-none animate-bounce"></div>
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>
            <div ref={dummyRef} />
          </div>

          {/* Form with sharp input box */}
          <div className="flex-none p-3.5 bg-slate-55 border-t-2 border-slate-900">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center bg-white border-2 border-slate-900 rounded-none overflow-hidden hover:border-blue-600 focus-within:border-blue-600 focus-within:shadow-[3px_3px_0px_rgba(0,0,0,0.1)] transition-all"
            >
              <input 
                type="file" 
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#111111] transition-colors border-r border-slate-300 rounded-none"
                title="Tải lên CSV"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                placeholder="Nâng hạ hạng, chuyển bậc album..." 
                className="w-full bg-transparent border-none py-3 px-4 text-xs text-slate-950 placeholder-slate-400 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="p-3 text-slate-800 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      ) : (
        /* History Timeline Tab */
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white/10 custom-scrollbar">
          <div className="mb-5">
            <h3 className="text-2xl font-serif italic text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              Lịch sử đấu hạng
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-sans">Vòng quay thời gian và quá trình dịch chuyển bản sắc</p>
          </div>

          <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[14px] before:w-[1px] before:bg-slate-200">
            {[...archived, ...HISTORICAL_BATTLES].map((battle) => (
              <div key={battle.id} className="relative pl-8 group">
                {/* Timeline Dot */}
                <div className="absolute left-[7px] top-2 w-[15px] h-[15px] rounded-full bg-white border-2 border-indigo-400/80 group-hover:border-indigo-600 transition-all flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 group-hover:bg-indigo-600 transition-all" />
                </div>

                <div 
                  onClick={() => setSelectedHistorical(selectedHistorical?.id === battle.id ? null : battle)}
                  className="bg-white/70 hover:bg-white border border-white/60 p-4 rounded-lg shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">{battle.date}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${setSelectedHistorical ? (selectedHistorical?.id === battle.id ? "rotate-90 text-indigo-500" : "") : ""}`} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm font-sans">{battle.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">{battle.summary}</p>

                  <AnimatePresence>
                    {selectedHistorical?.id === battle.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100 space-y-3.5 overflow-hidden text-xs"
                      >
                        {battle.chat.map((c, i) => (
                          <div key={i} className={`p-3 rounded-lg ${c.role === "user" ? "bg-indigo-50/60 border border-inner text-slate-700 ml-4" : "bg-slate-50/80 text-slate-700 mr-4 border border-slate-150"}`}>
                            <div className="font-bold uppercase text-[8px] text-slate-400 tracking-wider mb-1 font-sans">{c.role === "user" ? "Bạn" : "Pop Curator"}</div>
                            <div className="font-sans leading-relaxed break-words text-[11.5px]">
                              <Markdown
                                components={{
                                  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed whitespace-pre-wrap">{children}</p>,
                                  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                                  em: ({ children }) => <em className="italic">{children}</em>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 last:mb-0 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 last:mb-0 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                }}
                              >
                                {c.content}
                              </Markdown>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
