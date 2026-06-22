const fs = require('fs');

const utilsPath = 'src/utils.ts';
let utilsContent = fs.readFileSync(utilsPath, 'utf8');

// The parsed.txt output:
const parsedText = fs.readFileSync('parsed.txt', 'utf8');
const thumbs = {};
for (const line of parsedText.split('\n')) {
  const match = line.match(/"([^"]+)": "(https:\/\/i\.ibb\.co\/[^"]+)"/);
  if (match) {
    thumbs[match[1]] = match[2];
  }
}

// Write the DIRECT_URLS combined
const matchDirectUrls = utilsContent.match(/const DIRECT_URLS: Record<string, string> = {([\s\S]+?)};\n/);
let oldDirectUrls = "";
if (matchDirectUrls) {
  oldDirectUrls = matchDirectUrls[1];
}

const newObjStr = `
  const THUMB_URLS: Record<string, string> = {
${Object.entries(thumbs).map(([k,v]) => `    "${k}": "${v}",`).join('\n')}
  };
  
  const FULL_URLS: Record<string, string> = {${oldDirectUrls}};
`;

const updatedContent = utilsContent.replace(
  /const DIRECT_URLS: Record<string, string> = {[\s\S]+?};\n/,
  newObjStr
).replace(
  /export function getImgbbCoverUrl\(artist: string, title: string\): string {/g,
  `export function getImgbbCoverUrl(artist: string, title: string, size: 'full' | 'thumb' = 'full'): string {`
).replace(
  /  if \(DIRECT_URLS\[key\]\) {\n    return DIRECT_URLS\[key\];\n  }\n  \n  return \`https:\/\/i.ibb.co\/\$\{key\}.png\`;\n}/,
  `  const urls = size === 'thumb' ? THUMB_URLS : FULL_URLS;
  if (urls[key]) {
    return urls[key];
  }
  // Fallback map resolving
  if (size === 'thumb' && FULL_URLS[key]) return FULL_URLS[key];
  if (size === 'full' && THUMB_URLS[key]) return THUMB_URLS[key];

  return \`https://i.ibb.co/\${key}.png\`;
}`
).replace(
  /export async function fetchAlbumCover\(artist: string, title: string\): Promise<string \| undefined> {/,
  `export async function fetchAlbumCover(artist: string, title: string, size: 'full' | 'thumb' = 'full'): Promise<string | undefined> {`
).replace(
  /return getImgbbCoverUrl\(artist, title\);/,
  `return getImgbbCoverUrl(artist, title, size);`
);

fs.writeFileSync('utils2.ts', updatedContent);
console.log('done');
