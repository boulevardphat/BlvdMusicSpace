import { Album } from "./data";

const CACHE_KEY = "itunes_cover_cache";

function getCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, string>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function fetchAlbumCover(artist: string, title: string): Promise<string | undefined> {
  const query = `${artist || ""} ${title || ""}`.toLowerCase().trim();
  const cache = getCache();
  
  if (cache[query] !== undefined) {
    return cache[query] === "FAILED" ? undefined : cache[query];
  }

  // 1. Try backend server proxy /api/cover first
  try {
    const url = `/api/cover?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      const data = await res.json();
      if (data && data.coverUrl) {
        cache[query] = data.coverUrl;
        setCache(cache);
        return data.coverUrl;
      }
    }
  } catch (err) {
    console.warn("Server API /api/cover failed, trying client iTunes fallback:", err);
  }

  // 2. Direct Client-side Fallback to CORS-enabled iTunes Search API
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=album&limit=1`;
    const response = await fetch(itunesUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const artworkUrl = data.results[0].artworkUrl100;
        if (artworkUrl) {
          const highResUrl = artworkUrl
            .replace(/100x100(bb)?\.jpg$/, "600x600bb.jpg")
            .replace(/100x100/, "600x600");
          cache[query] = highResUrl;
          setCache(cache);
          return highResUrl;
        }
      }
    }
  } catch (err) {
    console.error("Direct client-side iTunes fallback failed:", err);
  }

  // Cache failure to avoid repeated requests in this session/render cycle
  cache[query] = "FAILED";
  setCache(cache);
  return undefined;
}

// Fixed Professional Critic Reviews Map for iconic albums
const CRITIC_REVIEWS: Record<string, string> = {
  "vespertine": "Một kiệt tác dịu dàng và nội tâm, nơi Björk dệt nên giấc mơ điện tử vi tế từ những âm thanh micro-beat và dàn dây lộng lẫy để tôn vinh sự thiêng liêng của tình yêu.",
  "impossible princess": "Trải nghiệm nghệ thuật mang tính cá nhân và táo bạo nhất của Kylie, thử nghiệm thành công với trip-hop, electronica và indie-pop để phơi bày những lát cắt nội tâm sâu sắc nhất.",
  "confessions on a dance floor": "Một thánh đường disco-house liền mạch tuyệt vời, đỉnh cao sáng tạo của thế kỷ XXI nơi Madonna biến sàn khiêu vũ thành không gian cứu rỗi tâm hồn.",
  "brat": "Tuyên ngôn pop thô ráp, hỗn loạn và chân thật đến tột cùng của thế kỷ mới; di sản của Charli xcx trong việc giải cấu trúc hyperpop và định hình lại văn hóa đại chúng.",
  "did you know that there's a tunnel under ocean blvd": "Một thiên tiểu thuyết âm nhạc đậm chất tự truyện đầy chất thơ của Lana Del Rey, đào sâu vào lịch sử gia đình, ký ức cô quạnh và những khát khao hiện sinh trong trẻo.",
  "ray of light": "Bước chuyển mình vĩ đại đưa Madonna chạm tới đỉnh cao tâm linh thông qua sự kết hợp xuất thần của đạo Phật, Kabbalah, nhạc electronica u tối và ambient trip-hop.",
  "pure heroine": "Tuyệt tác tối giản nắm bắt trọn vẹn sự thờ ơ, nỗi cô đơn u uất và khao khát khẳng định bản thân của tuổi vị thành niên, tái định hình cấu trúc âm nhạc pop hiện đại.",
  "ái": "Một dấu mốc vàng son của R&B/Pop Việt Nam, nơi tlinh phô diễn tư duy giai điệu gợi cảm đầy nữ tính và góc nhìn trưởng thành mãnh liệt về bản chất của tình yêu.",
  "norman fucking rockwell!": "Đỉnh cao sự nghiệp chói lịu của Lana Del Rey, một bản cáo chung tuyệt đẹp dành cho giấc mơ Mỹ được bao bọc bởi những phím đàn piano cổ điển và những câu ca dao thời thượng.",
  "giữa một vạn người": "Một kỳ quan City Pop Việt hóa chuẩn mực, khẳng định tài năng viết lách đỉnh cao và giọng ca biến ảo của Phùng Khánh Linh lồng lộng trong những nhịp đập lung linh rực rỡ.",
  "erotica (pa version)": "Tác phẩm mang tính cách mạng bộc trực nhất về tình dục và tính nữ, thách thức mọi tabu xã hội bằng những nhịp điệu đen tối, gai góc của jazz-house và trip-hop.",
  "gag order": "Sự thăng hoa tột bậc từ nỗi đau tăm tối; album art-pop giàu chiều sâu giúp Kesha rũ bỏ quá khứ để tìm lại tiếng nói chân thực thông qua những thanh âm acoustic mộc mạc.",
  "eusexua": "Một cuộc đại cách mạng về âm thanh nơi FKA twigs hòa quyện nhạc điện tử thể nghiệm với nhịp đập techno dồn dập, phác họa trạng thái thăng hoa tinh khiết nhất của thể xác và tâm hồn.",
  "fever": "Đỉnh cao tinh hoa của Dance-Pop toàn cầu, một cỗ máy tạo hit không tì vết đầy sang trọng và quyến rũ vượt thời gian.",
  "đánh đổi": "Tác phẩm Hip-hop tự sự gai góc và chân thực bậc nhất của âm nhạc Việt, kể lại hành trình trưởng thành ngột ngạt cùng những hy sinh trong cuộc chiến danh vọng.",
  "loi choi: the neo pop punk": "Cú hích ngông cuồng làm đảo lộn sân chơi Việt Pop, nơi Wren Evans tự do pha trộn disco, punk, R&B thành một dòng chảy năng lượng trẻ hóa rực lửa.",
  "hit me hard and soft": "Sự phát triển vượt bậc của chị em nhà Eilish, bẻ gãy mọi quy chuẩn cấu trúc bài hát thông thường bằng sự đối nghịch hoàn hảo giữa lời thì thầm mộng mị và những nhịp bass bùng nổ.",
  "oil of every pearl's un-insides": "Một kỳ quan hyperpop cấp tiến mở đường cho tương lai, thách thức các khái niệm giới tính và căn sắc thông qua những kết cấu âm thanh tổng hợp siêu việt."
};

/**
 * Deterministically generates an authentic, professional 1-2 sentence music critic review and perspective 
 * based on the album id, artist, and title. Follows the highest Vietnamese music editorial standard.
 */
export function getAlbumCriticReview(artist: string, title: string, id?: number): string {
  const normTitle = (title || "").toLowerCase().trim();
  const normArtist = (artist || "").toLowerCase().trim();
  
  // 1. Check if we have exact match in pre-curated map
  for (const [key, val] of Object.entries(CRITIC_REVIEWS)) {
    if (normTitle.includes(key) || key.includes(normTitle)) {
      return val;
    }
  }

  // 2. Select elegant template deterministically based on hash of title + artist
  const textSeed = `${artist} - ${title}`;
  let hash = 0;
  for (let i = 0; i < textSeed.length; i++) {
    hash = (hash << 5) - hash + textSeed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % 5;

  const templates = [
    `Một hành trình nghệ thuật đột phá, pha trộn hoàn hảo cấu trúc âm thanh hiện đại rực rỡ và những suy tư nội tâm thấu suốt của ${artist} qua ${title}.`,
    `Tác phẩm tiêu biểu cho tinh thần tiên phong đầy nhạc tính, ${title} một lần nữa khẳng định di sản bền vững và sức biểu cảm phi thường của ${artist}.`,
    `${title} mở ra một không gian âm nhạc tràn ngập cảm xúc, nơi ${artist} biểu đạt xuất sắc tầm nhìn nghệ thuật độc đáo và tư duy hòa âm thời thượng.`,
    `Pha trộn tinh tế giữa sự mộc mạc đời thường và tư duy khái niệm đẳng cấp, tác phẩm ${title} của ${artist} xứng đáng là một điểm sáng chói lọi trong dòng chảy nghệ thuật đương đại.`,
    `Sức hấp dẫn mãnh liệt từ ${title} đến từ những thử nghiệm âm thanh táo bạo và khả năng kết nối cảm xúc kỳ diệu của ${artist} với người nghe đại chúng.`
  ];

  return templates[index];
}
