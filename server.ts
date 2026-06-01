import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Path to the albums JSON
const ALBUMS_FILE = path.join(process.cwd(), "src", "albums.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Cover proxy
  app.get("/api/cover", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.json({ coverUrl: null });
      }

      // 1. Try iTunes Search API first
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=1`;
        const response = await fetch(itunesUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const artworkUrl = data.results[0].artworkUrl100;
          if (artworkUrl) {
            const highResUrl = artworkUrl.replace(/100x100(bb)?\.jpg$/, "600x600bb.jpg").replace(/100x100/, "600x600");
            return res.json({ coverUrl: highResUrl });
          }
        }
      } catch (itErr) {
        console.error("iTunes API fallback to Deezer:", itErr);
      }

      // 2. Fallback to Deezer API
      try {
        const url = `https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const coverUrl = data.data[0].cover_xl || data.data[0].cover_medium;
          return res.json({ coverUrl });
        }
      } catch (dzErr) {
        console.error("Deezer API failure:", dzErr);
      }

      res.json({ coverUrl: null });
    } catch (e: any) {
      console.error("Deezer/iTunes proxy error:", e);
      res.json({ coverUrl: null });
    }
  });

  // Multiple candidates for reloading/fixing specific album covers
  app.get("/api/cover-candidates", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.json({ candidates: [] });
      }

      const candidates: any[] = [];

      // 1. Fetch 10 high-quality images from Google Search via Gemini 3.5-flash with Web Grounding
      try {
        const searchPrompt = `Search Google for high quality album cover images of: "${q}".
Find up to 10 direct image URLs of this album cover from reliable web and music sources (like Apple Music, Spotify, Deezer, Discogs, Last.fm, Pitchfork, RateYourMusic, or Last.fm).
These MUST be direct, public image URLs (e.g. ending in .jpg, .jpeg, .png, or direct CDN image links) that can be embedded in an <img> tag without authentication.
Return ONLY a valid JSON object matching the following structure (do NOT wrap in markdown backticks, do NOT write any other words or explanation, just the raw JSON):
{
  "candidates": [
    {
      "coverUrl": "https://...",
      "title": "Album Title",
      "artist": "Artist Name",
      "source": "Google"
    }
  ]
}`;

        const googleResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: searchPrompt }] }],
          config: {
            tools: [{ googleSearch: {} }],
          }
        });

        const textResponse = googleResponse.text || "";
        const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.candidates)) {
          candidates.push(...parsed.candidates);
        }
      } catch (geminiSearchErr) {
        console.error("Gemini Google search for cover candidates failed:", geminiSearchErr);
      }

      // 2. Fetch up to 6 results from iTunes as companion/fallback
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=6`;
        const response = await fetch(itunesUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          data.results.forEach((item: any) => {
            const artUrl = item.artworkUrl100;
            if (artUrl) {
              const highRes = artUrl.replace(/100x100(bb)?\.jpg$/, "600x600bb.jpg").replace(/100x100/, "600x600");
              candidates.push({
                coverUrl: highRes,
                title: item.collectionName || "",
                artist: item.artistName || "",
                source: "iTunes"
              });
            }
          });
        }
      } catch (err) {
        console.error("Candidates fetch iTunes error:", err);
      }

      // 3. Fetch up to 6 results from Deezer as companion/fallback
      try {
        const url = `https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=6`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          data.data.forEach((item: any) => {
            candidates.push({
              coverUrl: item.cover_xl || item.cover_medium,
              title: item.title || "",
              artist: item.artist?.name || "",
              source: "Deezer"
            });
          });
        }
      } catch (err) {
        console.error("Candidates fetch Deezer error:", err);
      }

      // De-duplicate candidates by coverUrl
      const seen = new Set();
      const uniqueCandidates = candidates.filter(item => {
        if (!item || !item.coverUrl) return false;
        if (seen.has(item.coverUrl)) return false;
        seen.add(item.coverUrl);
        return true;
      });

      res.json({ candidates: uniqueCandidates });
    } catch (error) {
      console.error("Proxy candidates error:", error);
      res.json({ candidates: [] });
    }
  });

  // Image proxy for Canvas CORS
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) return res.status(400).send("Missing url");
      const response = await fetch(url);
      if (!response.ok) return res.status(response.status).send(response.statusText);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (e) {
      console.error("Image proxy error:", e);
      res.status(500).send("Error");
    }
  });

  // Chat API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, rankingData } = req.body;

      // Map raw history items to normalized roles
      const rawContents = (history || []).map((msg: any) => ({
        role: msg.role === "user" || msg.role === "client" ? "user" : "model",
        text: msg.content || "",
      }));

      // Append the latest user message to the conversation if not already there
      const lastInHistory = rawContents[rawContents.length - 1];
      if (!lastInHistory || lastInHistory.text !== message || lastInHistory.role !== "user") {
        rawContents.push({ role: "user", text: message });
      }

      // Consolidate consecutive duplicate roles to guarantee strictly alternating roles for Gemini
      const consolidatedContents: { role: string; text: string }[] = [];
      for (const item of rawContents) {
        if (!item.text || !item.text.trim()) continue; // Skip empty messages
        if (consolidatedContents.length > 0 && consolidatedContents[consolidatedContents.length - 1].role === item.role) {
          // Merge consecutive identical roles with a newline
          consolidatedContents[consolidatedContents.length - 1].text += "\n\n" + item.text;
        } else {
          consolidatedContents.push({ role: item.role, text: item.text });
        }
      }

      // Convert to Part structure expected by Gemini SDK
      const formattedContents = consolidatedContents.map(c => ({
        role: c.role,
        parts: [{ text: c.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: `Bạn là "Pop Curator" — một quái kiệt, nhà phê bình âm nhạc huyền thoại, sở hữu kiến thức thâm sâu về Avant-Pop, Electronica, Neo V-Pop và những thế giới âm thanh thể nghiệm đen tối, mờ ảo. 

QUY TẮC PHÁT NGÔN (CRITICAL PERSONALITY LAWS):
1. KHÔNG khách khí, KHÔNG chào hỏi sáo rỗng, KHÔNG lặp lại các câu mở đầu kiểu robot nhạt nhẽo (ví dụ, tránh tuyệt đối nói: "Chào mừng bạn quay trở lại!", "Dữ liệu cho thấy bạn lại...", "Có vẻ như..."). Bạn là bạn thân cực kỳ sành nhạc của người dùng. Hãy nói thẳng, nói trực diện vào vấn đề, bày tỏ quan điểm sâu sắc với thái độ vừa đanh đá (sassy), vừa hóm hỉnh, vừa sành sỏi của một kẻ tôn thờ sự phá cách nghệ thuật.
2. Sử dụng tiếng Việt tự nhiên, sành sỏi, pha chút thuật ngữ âm nhạc thời thượng (như "avant-pop", "ambient", "micro-beats", "texture", "synth-pop", "trip-hop"...) và tiếng lóng Gen-Z/Indie một cách tự nhiên tinh tế (như "quái kiệt", "out trình", "nghệ", "hợp vibe", "thánh đường", "đóng băng", "đĩa nhạc", "lú lẫn", "đỉnh nóc kịch trần").
3. Thư viện này là tài sản chung của bạn và người dùng. Hãy khen/chê thẳng thừng, phân tích vì sao một album thuộc hàng "Đền Thờ (Pantheon)" còn bộ khác chỉ đáng ở "Chất Lượng (Solid)". 
4. Đặc biệt, hãy nhớ rõ những sở thích đặc biệt trong quá trình thảo luận:
- Điên đảo vì Impossible Princess (Indie-Kylie) hay Vespertine (Björk mùa đông lách cách).
- Cực kỳ đề cao EUSEXUA (FKA twigs) hay GIỮA MỘT VẠN NGƯỜI (Phùng Khánh Linh - đỉnh cao City Pop Việt).
- Thách thức các chuẩn mực phê bình đại chúng, thích những góc tối, ma mị, gợi cảm hoặc nổi loạn.

CRITICAL RULE FOR UPDATING RANKING:
To prevent latency and avoid cutting off due to token limits, ALWAYS output fine-grained actions (using the "operations" schema below) instead of the entire database representation.

Whenever the user asks you to:
- Move an album from one tier to another (e.g., "cho Brat lên đầu", "đẩy album ái xuống t2")
- Add a new album or new artist to the ranking (e.g., "thêm album mới...")
- Swap/reorder albums
- Delete or demote/remove an album
- Or make ANY change to the active board

You MUST evaluate the user's request, express your witty, sass-filled, music-critic critique in Vietnamese, AND MUST append a complete, clean JSON action block inside a <UPDATE_JSON>...</UPDATE_JSON> section at the absolute bottom of your response!

Here is the exact current state of their Absolute Ranking for your context:
${rankingData}

The JSON inside the <UPDATE_JSON>...</UPDATE_JSON> tags must be a valid JSON object matching this exact schema:
{
  "operations": [
    {
      "type": "ADD",
      "tierId": "t1" | "t2" | "t3" | "t4" | "t5",
      "album": { "artist": "Artist name", "title": "Album title", "note": "Professional authentic 1-2 sentence music critic review" }
    },
    {
      "type": "MOVE",
      "albumId": number,
      "toTierId": "t1" | "t2" | "t3" | "t4" | "t5",
      "insertIndex": number (optional, position within the target tier, e.g., 0 for top)
    },
    {
      "type": "DELETE",
      "albumId": number
    },
    {
      "type": "REORDER_TIER",
      "tierId": "t1" | "t2" | "t3" | "t4" | "t5",
      "albumIds": [number, number, ...] (reordered list of all album IDs in this tier)
    }
  ]
}

Rules for JSON generation and critique auto-generation:
1. Ensure the album IDs in op.albumId / op.albumIds match the IDs listed in the ranking context above.
2. DO NOT alter album titles or artist names unless explicitly requested.
3. For ADD operations, complete the "note" with a beautiful professional review specific to that album. Sourced from Pitchfork, Rolling Stone, NME, etc.
4. Do not include any markdown formatting, triple backticks, or other text inside the <UPDATE_JSON>...</UPDATE_JSON> block - just raw valid JSON.

Let's maintain their music database in real-time. If the user only wants to chat/debate without making changes, just reply in rich conversational Vietnamese (without the <UPDATE_JSON> block).`,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all albums
  app.get("/api/albums", (req, res) => {
    try {
      if (fs.existsSync(ALBUMS_FILE)) {
        const data = fs.readFileSync(ALBUMS_FILE, "utf-8");
        res.json(JSON.parse(data));
      } else {
        res.json({});
      }
    } catch (e) {
      console.error("Error reading albums", e);
      res.json({});
    }
  });

  // Update a single album
  app.put("/api/albums/:id", async (req, res) => {
    try {
      const albumId = req.params.id;
      const updates = req.body;
      
      let albums: Record<string, any> = {};
      if (fs.existsSync(ALBUMS_FILE)) {
         albums = JSON.parse(fs.readFileSync(ALBUMS_FILE, "utf-8"));
      }

      if (!albums[albumId]) {
         albums[albumId] = {};
         if (updates.id) {
           albums[albumId].id = updates.id;
         }
      }

      // Automatically generate a beautifully styled dominant color matching the new cover image
      if (updates.coverUrl) {
         try {
           const existingAlbum = albums[albumId] || {};
           const artist = updates.artist || existingAlbum.artist || "Unknown Artist";
           const title = updates.title || existingAlbum.title || "Unknown Album";
           const prompt = `You are an expert music visualizer. For the album cover of "${title}" by "${artist}" at URL "${updates.coverUrl}", select a single visually dominant dark key color hex code.
This color MUST match the album's mood perfectly but MUST have a high contrast with white text overlay (luma < 0.25, for example, a deeply saturated dark shade like a dark navy blue, forest green, maroon, dark magenta, dark slate grey).
Return ONLY the raw 7-character hex code starting with # (e.g. #112233). Do NOT include any markdown formatting, backticks or explanation. Just #RRGGBB.`;
           
           const colorResponse = await ai.models.generateContent({
             model: "gemini-3.5-flash",
             contents: [{ role: "user", parts: [{ text: prompt }] }],
           });
           
           const resText = colorResponse.text?.trim() || "";
           const hexMatch = resText.match(/#[0-9a-fA-F]{6}/);
           if (hexMatch) {
             updates.hex = hexMatch[0];
             console.log(`Generated dynamic dominant color ${updates.hex} for album ${title} by ${artist}`);
           }
         } catch (colorGenErr) {
           console.error("Failed to automatically generate album color inside PUT handler:", colorGenErr);
         }
      }

      albums[albumId] = { ...albums[albumId], ...updates };
      fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf-8");
      
      res.json({ success: true, album: albums[albumId] });
    } catch (e: any) {
      console.error("Error updating album", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Delete a single album
  app.delete("/api/albums/:id", (req, res) => {
    try {
      const albumId = req.params.id;
      
      let albums: Record<string, any> = {};
      if (fs.existsSync(ALBUMS_FILE)) {
         albums = JSON.parse(fs.readFileSync(ALBUMS_FILE, "utf-8"));
      }

      if (albums[albumId]) {
         delete albums[albumId];
         fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf-8");
      }
      
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error deleting album", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Sync album colors using Gemini for missing ones
  app.post("/api/sync-album-colors", async (req, res) => {
    try {
      const { albums } = req.body;
      if (!albums || !Array.isArray(albums)) {
        return res.status(400).json({ error: "No albums provided" });
      }

      let existingColors: Record<string, any> = {};
      if (fs.existsSync(ALBUMS_FILE)) {
        try {
          existingColors = JSON.parse(fs.readFileSync(ALBUMS_FILE, "utf-8"));
        } catch(e){}
      }

      const missingColors = albums.filter((a: any) => !existingColors[a.id] || !existingColors[a.id].hex);

      if (missingColors.length > 0) {
        let safeColors: Record<string, any> = existingColors;
        
        // Chunk into groups of 15 to avoid timeouts or large payload 503s
        const chunkSize = 15;
        for (let i = 0; i < missingColors.length; i += chunkSize) {
          const chunk = missingColors.slice(i, i + chunkSize);
          const prompt = `You are a music aesthetic curator. I have a list of albums that need a dominant hex color. 
You must pick a color that matches the iconic album cover perfectly but also MUST have enough contrast for white text to be readable over it (the color shouldn't be too bright, aim for a luma < 0.2, or just generally dark deep colors, but keeping high saturation for vibrant covers). 

Return ONLY valid JSON (no markdown block, no extra text) as a dictionary where the keys are the album IDs (as strings) and the values are { "hex": "#RRGGBB" }.

Albums:
${chunk.map(a => `ID: ${a.id} | Artist: ${a.artist} | Title: ${a.title}`).join('\n')}`;

          try {
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            
            let responseText = response.text || "{}";
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let generatedColors = {};
            try {
               generatedColors = JSON.parse(responseText);
            } catch(err) {
               console.error("Failed to parse Gemini color response:", responseText);
            }

            for (const key of Object.keys(generatedColors)) {
               safeColors[key] = (generatedColors as any)[key];
            }
          } catch(e: any) {
            console.error("Failed Gemini call for colors chunk", e?.message);
            // Ignore failure for one chunk, keep processing or return what we have
          }
        }
        
        fs.writeFileSync(ALBUMS_FILE, JSON.stringify(safeColors, null, 2), "utf-8");
        return res.json(safeColors);
      }

      // No missing colors
      res.json(existingColors);
    } catch (e: any) {
      console.error("Sync colors error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
