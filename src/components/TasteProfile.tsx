import { motion } from "motion/react";
import { Award, Compass, Music, TrendingUp, Sparkles, User, Calendar, Cpu, Activity, Heart, Disc, Layers } from "lucide-react";
import { Tier } from "../data";

export function TasteProfile({ tiers }: { tiers: Tier[] }) {
  // Compute some fun metrics based on the database
  const totalAlbums = tiers.reduce((acc, t) => acc + t.albums.length, 0);
  const artistCounts: Record<string, number> = {};
  tiers.forEach(t => {
    t.albums.forEach(a => {
      artistCounts[a.artist] = (artistCounts[a.artist] || 0) + 1;
    });
  });

  const uniqueArtists = Object.keys(artistCounts).length;
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Stark Windows Metro Color keys with solid blocks
  const DNA_METRICS = [
    { label: "Avant-Garde Pop / Club style", value: 92, desc: "Sự thống trị từ Charli xcx, Björk, Lorde & FKA twigs", bgBar: "bg-[#0078d7]" },
    { label: "Neo V-Pop / Club-Hop vibe", value: 84, desc: "Âm hưởng hiện đại kết hợp chất Việt từ tlinh, Wren Evans, Obito", bgBar: "bg-[#d13438]" },
    { label: "Classic Electronic & Synth", value: 89, desc: "Sự hồi tưởng vượt thời đại cùng Madonna & Kylie Minogue", bgBar: "bg-[#008272]" },
    { label: "Alternative & Cinematic Dream", value: 76, desc: "Bản tình ca u sầu sâu lắng từ Lana Del Rey & Kesha", bgBar: "bg-[#ca5010]" }
  ];

  const TIME_EPOCHS = [
    {
      period: "2024 - HIỆN TẠI",
      title: "KỶ NGUYÊN CLUB POP & HYPER-INDIE",
      focus: "Charli xcx (BRAT), FKA Twigs (EUSEXUA), tlinh (ái), Wren Evans",
      sentiment: "Dập dồn nhịp nhảy dồn dập, tự do tối đa, bứt phá kết cấu giai điệu truyền thống.",
      tags: ["Clubs", "Hyperpop", "High-Energy"]
    },
    {
      period: "2019 - 2023",
      title: "KỶ NGUYÊN ĐỘT PHÁ CONCEPT & TRỮ TÌNH",
      focus: "Billie Eilish, Lana Del Rey (Ocean Blvd), Kesha (Gag Order)",
      sentiment: "Chiều sâu tinh tế, triết lý nội tâm, giai đoạn chuyển dịch sang những trải nghiệm u sầu thanh cảnh.",
      tags: ["Cinematic", "Intimate", "Vulnerable"]
    },
    {
      period: "Thập niên 2000s & Cổ điển",
      title: "ĐỀN THỜ SYNTHPOP & DISCO-GLOW",
      focus: "Madonna (Ray of Light / Confessions), Kylie Minogue (Fever)",
      sentiment: "Nền tảng nhịp điệu kinh điển tạo dựng bản sắc, sự kết hợp kỳ vĩ giữa EDM thô và Pop Thượng đẳng.",
      tags: ["Synthpop", "Dancefloor", "Pioneer"]
    }
  ];

  return (
    <div className="flex-grow overflow-y-auto h-full p-6 md:p-8 space-y-8 pb-40 custom-scrollbar bg-white rounded-none border border-slate-300">
      
      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-6 relative">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#ca5010]" />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Gu thẩm định âm nhạc</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight mt-1 mb-2">
            ĐẶC TRƯNG BẢN SẮC DNA
          </h1>
          <p className="text-slate-500 font-mono text-[10.5px] tracking-wide uppercase">
            BẢN ĐỒ THỐNG KÊ CHIỀU SÂU GU NHẠC CỦA BẠN ĐỌC • METRO v8
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-900 bg-slate-100 px-3 py-1.5 border border-slate-350 font-mono text-[10px] font-bold uppercase">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Đã Xác Thực</span>
        </div>
      </div>

      {/* Bento Layout Grid with sharp box models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Curator Profile Info card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1f2022] text-white p-6 border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] rounded-none relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              
              {/* Custom Avatar container */}
              <div className="w-20 h-20 bg-slate-850 p-1 border-2 border-dashed border-white/30 rounded-none relative">
                <div className="w-full h-full bg-[#111] flex items-center justify-center relative overflow-hidden">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border border-white" />
              </div>

              <div>
                <span className="bg-[#0078d7] text-white font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-1">
                  CHUYÊN GIA THẨM ĐỊNH
                </span>
                <h3 className="text-xl font-sans font-black text-white mt-3 uppercase">nochiwano</h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">nochiwano@gmail.com</p>
              </div>

              {/* Core Aesthetic badge */}
              <div className="w-full bg-white/5 border border-white/10 rounded-none p-3.5 text-left space-y-2">
                <span className="text-[8.5px] font-mono font-bold text-blue-400 uppercase block tracking-wider">XU HƯỚNG BẢN SẮC ÂM NHẠC</span>
                <p className="text-slate-350 text-xs leading-relaxed font-light">
                  Sự kết hợp hoàn hảo giữa Avant-Garde club pop, classic synth / disco và Dreamy Alternative, bộc lộ tư duy thẩm định có chiều sâu.
                </p>
              </div>

              {/* Rapid Stats widget */}
              <div className="grid grid-cols-2 gap-3 w-full text-center">
                <div className="bg-[#111] border border-white/10 p-3 rounded-none">
                  <div className="text-2xl font-mono font-black text-amber-400">{totalAlbums}</div>
                  <div className="text-[9px] text-slate-400 font-mono font-bold uppercase mt-1">Lưu trữ</div>
                </div>
                <div className="bg-[#111] border border-white/10 p-3 rounded-none">
                  <div className="text-2xl font-mono font-black text-blue-400">{uniqueArtists}</div>
                  <div className="text-[9px] text-slate-400 font-mono font-bold uppercase mt-1">Nghệ Sĩ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Aesthetic Standings: Top Artists chart */}
          <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.06)] space-y-4">
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 leading-none">
              <Disc className="w-4 h-4 text-slate-900" />
              TỶ LỆ PHÂN BỒ THƯ PHÁP
            </h4>
            <div className="space-y-3">
              {topArtists.length === 0 ? (
                <p className="text-xs text-slate-400">Chưa thu thập đủ dữ liệu bảng xếp hạng.</p>
              ) : (
                topArtists.map(([artist, count], idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-none text-left">
                    <div className="flex items-center gap-2 pr-2">
                      <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}</span>
                      <span className="font-black text-xs text-slate-900 uppercase truncate leading-none">{artist}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white shrink-0">
                      {count} ALBUM
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side lg:col-span-2: DNA Breakdown & Waveform & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Aesthetic DNA Section */}
          <div className="bg-white border-2 border-slate-900 p-6 rounded-none shadow-[3px_3px_0px_rgba(0,0,0,0.1)] space-y-6 relative">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-base font-sans font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#008272]" />
                TỶ TRỌNG KHOA HỌC THỂ LOẠI
              </h3>
              <span className="text-[9px] font-mono font-bold bg-[#107c41] text-white px-2.5 py-0.5 uppercase tracking-wider">
                REALTIME COMPILATION
              </span>
            </div>

            {/* Flat Windows style Equalizer graphic bar */}
            <div className="bg-slate-950 h-20 rounded-none flex items-stretch justify-around p-3 pt-6 overflow-hidden relative border border-slate-900">
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:16px_8px] opacity-60" />

              {Array.from({ length: 24 }).map((_, i) => {
                const heights = [20, 50, 35, 80, 65, 30, 75, 25, 60, 40, 85, 55, 70, 30, 45, 75, 80, 25, 65, 50, 35, 70, 40, 60];
                return (
                  <motion.div
                    key={i}
                    animate={{
                      height: [heights[i] * 0.4, heights[i] * 0.95, heights[i] * 0.4],
                    }}
                    transition={{
                      duration: 1.2 + (i % 3) * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-[5px] bg-[#0078d7] rounded-none ${
                      i % 3 === 0 ? "bg-[#0078d7]" : i % 2 === 0 ? "bg-[#d13438]" : "bg-[#107c41]"
                    }`}
                  />
                )
              })}
            </div>

            {/* Progress metrics lists */}
            <div className="space-y-4">
              {DNA_METRICS.map((dt, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-950 tracking-wide uppercase text-[11px]">{dt.label}</span>
                    <span className="font-mono font-black text-slate-900">{dt.value}%</span>
                  </div>
                  {/* Metro flat box bar */}
                  <div className="h-4 w-full bg-slate-100 rounded-none border border-slate-300 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dt.value}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full ${dt.bgBar}`}
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-snug">{dt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Taste Timeline */}
          <div className="bg-white border-2 border-slate-900 p-6 rounded-none shadow-[3px_3px_0px_rgba(0,0,0,0.1)] space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Calendar className="w-5 h-5 text-slate-900" />
              <h3 className="text-base font-sans font-black text-slate-900 uppercase tracking-tight">TIỂU SỬ KỶ NGUYÊN GU NHẠC</h3>
            </div>

            <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-900">
              {TIME_EPOCHS.map((epoch, idx) => (
                <div key={idx} className="relative pl-8 group">
                  <div className="absolute left-[7px] top-1.5 w-[10px] h-[10px] rounded-none bg-slate-950 border border-white" />

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[9px] font-mono font-bold bg-[#ca5010] text-white px-2 py-0.5 rounded-none w-fit">{epoch.period}</span>
                      <span className="font-black text-sm text-slate-950 lowercase first-letter:uppercase tracking-wide">{epoch.title}</span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <div className="flex flex-wrap gap-1">
                        <span className="font-bold text-slate-805">Tiêu điểm:</span>
                        <span className="italic text-slate-700">{epoch.focus}</span>
                      </div>
                      <div className="mt-1 text-slate-500 italic">
                        "{epoch.sentiment}"
                      </div>
                      <div className="mt-2.5 flex gap-1.5">
                        {epoch.tags.map((tg, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-[8.5px] font-mono font-bold text-slate-500">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
