export type Tier = {
  id: string;
  name: string;
  description: string;
  albums: Album[];
};

export type Album = {
  id: number;
  artist: string;
  title: string;
  note?: string;
  coverUrl?: string;
  globalRank?: number;
  tierName?: string;
  rank?: number;
  hex?: string;
  profDesc?: string;
  persDesc?: string;
};

export const INITIAL_TIERS: Tier[] = [
  {
    id: "t1",
    name: "BẬC 1",
    description: "Vùng cấm địa. Những album định hình bản sắc và tâm hồn.",
    albums: [
      { id: 1, artist: "Björk", title: "Vespertine" },
      { id: 2, artist: "Kylie Minogue", title: "Impossible Princess" },
      { id: 3, artist: "Madonna", title: "Confessions on a Dance Floor" },
      { id: 4, artist: "Charli xcx", title: "BRAT" },
      { id: 5, artist: "Lana Del Rey", title: "Did you know that there's a tunnel under Ocean Blvd" },
      { id: 6, artist: "Madonna", title: "Ray of Light" },
      { id: 7, artist: "Lorde", title: "Pure Heroine" },
      { id: 8, artist: "tlinh", title: "ái" },
      { id: 9, artist: "Lana Del Rey", title: "Norman Fucking Rockwell!" }
    ]
  },
  {
    id: "t2",
    name: "BẬC 2",
    description: "Nơi hội tụ của cảm xúc cực đoan, khái niệm đỉnh cao và sự táo bạo.",
    albums: [
      { id: 10, artist: "Phùng Khánh Linh", title: "GIỮA MỘT VẠN NGƯỜI" },
      { id: 11, artist: "Madonna", title: "Erotica (PA Version)" },
      { id: 12, artist: "Kesha", title: "Gag Order" },
      { id: 13, artist: "Kesha", title: "Eat The Acid" },
      { id: 14, artist: "FKA twigs", title: "EUSEXUA" },
      { id: 15, artist: "FKA twigs", title: "EUSEXUA Afterglow" },
      { id: 16, artist: "Kylie Minogue", title: "Fever" },
      { id: 17, artist: "Kylie Minogue", title: "Light Years" },
      { id: 18, artist: "Zara Larsson", title: "Midnight Sun" },
      { id: 19, artist: "Miley Cyrus", title: "Something Beautiful" },
      { id: 20, artist: "Lorde", title: "Virgin" },
      { id: 21, artist: "Obito", title: "Đánh Đổi" },
      { id: 22, artist: "Wren Evans", title: "LOI CHOI: The Neo Pop Punk" },
      { id: 23, artist: "Addison Rae", title: "Addison" },
      { id: 24, artist: "Björk", title: "Vulnicura" }
    ]
  },
  {
    id: "t3",
    name: "BẬC 3",
    description: "Sự cân bằng giữa nhịp điệu, Pop năng lượng và Nghệ thuật.",
    albums: [
      { id: 25, artist: "PinkPantheress", title: "Fancy That" },
      { id: 26, artist: "Wren Evans", title: "NỔ" },
      { id: 27, artist: "Björk", title: "Biophilia" },
      { id: 28, artist: "Björk", title: "Volta" },
      { id: 29, artist: "C418", title: "Minecraft - Volume Alpha" },
      { id: 30, artist: "C418", title: "Minecraft - Volume Beta" },
      { id: 31, artist: "tlinh", title: "FLVR" },
      { id: 32, artist: "Bích Phương", title: "tâm trạng tan hơi chậm một chút" },
      { id: 33, artist: "cupcakKe", title: "Dauntless Manifesto" },
      { id: 34, artist: "Kylie Minogue", title: "Body Language" },
      { id: 35, artist: "Kylie Minogue", title: "Kylie Minogue (1994)" },
      { id: 36, artist: "Billie Eilish", title: "HIT ME HARD AND SOFT" },
      { id: 37, artist: "Beyoncé", title: "RENAISSANCE" },
      { id: 38, artist: "Madonna", title: "Madame X" },
      { id: 39, artist: "Madonna", title: "American Life" },
      { id: 40, artist: "Phương Mỹ Chi", title: "Vũ Trụ Cò Bay" },
      { id: 41, artist: "Rose Gray", title: "Louder, Please" },
      { id: 42, artist: "Lana Del Rey", title: "Born To Die - The Paradise Edition" },
      { id: 43, artist: "Jessie Ware", title: "What's Your Pleasure?" },
      { id: 44, artist: "Madonna", title: "Bedtime Stories" },
      { id: 45, artist: "Madonna", title: "Music" },
      { id: 46, artist: "Thể Thiên", title: "Trần Thế" },
      { id: 47, artist: "Lana Del Rey", title: "Blue Banisters" },
      { id: 48, artist: "Madonna", title: "Like a Prayer" },
      { id: 49, artist: "Tate McRae", title: "So Close To What" },
      { id: 50, artist: "Lady Gaga", title: "The Fame Monster" },
      { id: 51, artist: "Taylor Swift", title: "evermore" },
      { id: 52, artist: "Björk", title: "Homogenic" },
      { id: 53, artist: "Imogen Heap", title: "Speak for Yourself" },
      { id: 54, artist: "Ms. Lauryn Hill", title: "The Miseducation of Lauryn Hill" },
      { id: 55, artist: "Billie Eilish", title: "Happier Than Ever" },
      { id: 56, artist: "Nelly Furtado", title: "Loose" }
    ]
  },
  {
    id: "t4",
    name: "BẬC 4",
    description: "Những lựa chọn chất lượng đại diện cho cá tính và các bản Pop Hits.",
    albums: [
      { id: 57, artist: "Taylor Swift", title: "1989 (Taylor's Version)" },
      { id: 58, artist: "Billie Eilish", title: "dont smile at me" },
      { id: 59, artist: "Lady Gaga", title: "MAYHEM" },
      { id: 60, artist: "Lorde", title: "Melodrama" },
      { id: 61, artist: "Chappell Roan", title: "The Rise and Fall of a Midwest Princess" },
      { id: 62, artist: "Caroline Polachek", title: "Desire, I Want To Turn Into You" },
      { id: 63, artist: "St. Vincent", title: "MASSEDUCTION" },
      { id: 64, artist: "Olivia Rodrigo", title: "GUTS (spilled)" },
      { id: 65, artist: "Olivia Rodrigo", title: "SOUR" },
      { id: 66, artist: "Orange", title: "CAM'ON" },
      { id: 70, artist: "TOWA TEI", title: "SOUND MUSEUM" },
      { id: 71, artist: "cupcakKe", title: "Cum Cake" },
      { id: 72, artist: "cupcakKe", title: "S.T.D" },
      { id: 73, artist: "cupcakKe", title: "The BakKery" },
      { id: 74, artist: "Cardi B", title: "AM I THE DRAMA?" },
      { id: 75, artist: "Low G", title: "L2K" },
      { id: 76, artist: "2pillz", title: "PILLZCASSO" },
      { id: 77, artist: "Esthero", title: "Breath From Another" },
      { id: 78, artist: "Taylor Swift", title: "reputation" },
      { id: 79, artist: "Tyler, The Creator", title: "IGOR" },
      { id: 80, artist: "The Weeknd", title: "Starboy" },
      { id: 81, artist: "Charli xcx", title: "CRASH (Deluxe)" },
      { id: 82, artist: "FKA twigs", title: "MAGDALENE" },
      { id: 83, artist: "Hoàng Thùy Linh", title: "LINK" },
      { id: 84, artist: "Madonna", title: "Rebel Heart" },
      { id: 85, artist: "Camila Cabello", title: "C,XOXO" },
      { id: 86, artist: "JADE", title: "THAT'S SHOWBIZ BABY!" },
      { id: 87, artist: "ADÉLA", title: "The Provocateur" },
      { id: 88, artist: "ROSALÍA", title: "LUX" },
      { id: 89, artist: "Lily Allen", title: "West End Girl" }
    ]
  },
  {
    id: "t5",
    name: "BẬC 5",
    description: "Những tác phẩm hoàn thiện thư viện của bạn.",
    albums: [
      { id: 90, artist: "Kylie Minogue", title: "Tension" },
      { id: 91, artist: "Kylie Minogue", title: "Aphrodite" },
      { id: 92, artist: "Ariana Grande", title: "Dangerous Woman" },
      { id: 93, artist: "Ariana Grande", title: "eternal sunshine" },
      { id: 94, artist: "Charli xcx", title: "True Romance" },
      { id: 95, artist: "Charli xcx", title: "SUCKER" },
      { id: 96, artist: "Lana Del Rey", title: "Honeymoon" },
      { id: 97, artist: "Lana Del Rey", title: "Chemtrails" },
      { id: 98, artist: "Taylor Swift", title: "folklore (deluxe version)" },
      { id: 100, artist: "SOPHIE", title: "OIL OF EVERY PEARL'S UN-INSIDES" }
    ]
  }
];

export const formatRankingForPrompt = (tiers: Tier[] = INITIAL_TIERS) => {
  return tiers.map(t => 
    `\n${t.name}\n` + t.albums.map(a => `${a.id}. ${a.artist} - ${a.title}`).join('\n')
  ).join('\n');
};
