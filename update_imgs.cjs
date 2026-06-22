const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Change TierList MetroTile images to use thumbnail
  if (file.includes('TierList.tsx')) {
    content = content.replace(/album\.coverUrl \|\| getImgbbCoverUrl\(album\.artist, album\.title\)/g, "album.coverUrl || getImgbbCoverUrl(album.artist, album.title, 'thumb')");
  }

  if (file.includes('App.tsx')) {
    // In App.tsx the mCover/coverUrl should be full for the detail view overlay!
    // But for color thief, it might be faster to use thumb.
    content = content.replace(/album\.coverUrl \|\| getImgbbCoverUrl\(album\.artist, album\.title\)/g, "album.coverUrl || getImgbbCoverUrl(album.artist, album.title, 'thumb')");
    
    // In App.tsx onAlbumClick we want the coverUrl to be the full!
    // Let's explicitly change the property to ensure full is passed.
    content = content.replace(/coverUrl: album\.coverUrl \|\| getImgbbCoverUrl\(album\.artist, album\.title, 'thumb'\)/g, "coverUrl: album.coverUrl || getImgbbCoverUrl(album.artist, album.title, 'full')");
  }

  fs.writeFileSync(file, content, 'utf8');
}

updateFile('src/components/TierList.tsx');
updateFile('src/App.tsx');
console.log('done');
