const fs = require('fs');

const path = 'src/albums.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Remove The Confessions Tour (Live)
for (let i = 0; i < data.tiers.length; i++) {
  const tier = data.tiers[i];
  if (tier.albums) {
    tier.albums = tier.albums.filter(a => a.title !== "The Confessions Tour (Live)" && a.title !== "The Confessions Tour");
  }
}

// Update missing covers
const updateCover = (artist, title, url) => {
  for (const tier of data.tiers) {
    if (tier.albums) {
      for (const album of tier.albums) {
        if (album.artist === artist && album.title.startsWith(title)) {
          album.coverUrl = url;
          console.log(`Updated ${artist} - ${album.title}`);
        }
      }
    }
  }
}

updateCover("Chase Icon", "Icon Baby", "https://i.ibb.co/tMVPszXJ/chase-icon-icon-baby.png");
updateCover("cupcakKe", "Queen Elizabitch", "https://i.ibb.co/fV5MxqrX/cupcakke-queen-elizabitch.png");
updateCover("Kim Petras", "Detour", "https://i.ibb.co/QvhRN4RS/kim-petras-detour.png");
updateCover("Kylie Minogue", "DISCO", "https://i.ibb.co/MkLDt2MM/kylie-minogue-disco-deluxe.png");
updateCover("Madonna", "CONFESSIONS II", "https://i.ibb.co/0pFCv2q2/madonna-confessions-ii.webp");
updateCover("Olivia Rodrigo", "you seem pretty sad for a girl so in love", "https://i.ibb.co/vv6m41y0/olivia-rodrigo-you-seem-pretty-sad-for-a-girl-so-in-love.png");
updateCover("Salamanda", "In Parallel", "https://i.ibb.co/YTBZsm0g/salamanda-in-parallel.png");

fs.writeFileSync(path, JSON.stringify(data, null, 2));
