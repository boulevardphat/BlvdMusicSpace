import albumsData from './albums.json';

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
  note?: string; // deprecated, use profDesc Instead
  coverUrl?: string;
  globalRank?: number;
  tierName?: string;
  rank?: number;
  hex?: string;
  profDesc?: string;
  persDesc?: string;
};

// Build INITIAL_TIERS directly from the single albums.json file containing everything
export const INITIAL_TIERS: Tier[] = albumsData.tiers;

export const formatRankingForPrompt = (tiers: Tier[] = INITIAL_TIERS) => {
  return tiers
    .map(
      (t) =>
        `\n${t.name}\n` +
        t.albums.map((a) => `${a.id}. ${a.artist} - ${a.title}`).join("\n"),
    )
    .join("\n");
};
