// Reads the public playlists of the channel from the YouTube Data API
// and saves them in playlists.json (title, link id, number of videos, cover image).
const fs = require("fs");

const KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCPoknHe8aZ7GRbvmyLTj3DQ";

if (!KEY) {
  console.error("Missing YOUTUBE_API_KEY (add it in Settings > Secrets and variables > Actions).");
  process.exit(1);
}

async function main() {
  const out = [];
  let token = "";
  do {
    const url =
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails" +
      "&channelId=" + CHANNEL_ID + "&maxResults=50&key=" + KEY +
      (token ? "&pageToken=" + token : "");
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error("YouTube API error:", JSON.stringify(data));
      process.exit(1);
    }
    for (const p of data.items || []) {
      const t = p.snippet.thumbnails || {};
      const thumb = (t.medium || t.high || t.default || {}).url || null;
      out.push({ id: p.id, title: p.snippet.title, count: p.contentDetails.itemCount, thumb });
    }
    token = data.nextPageToken || "";
  } while (token);

  if (out.length === 0) {
    console.error("No playlists returned: keeping the old playlists.json.");
    process.exit(1);
  }
  out.sort((a, b) => a.title.localeCompare(b.title, "en"));
  fs.writeFileSync("playlists.json", JSON.stringify(out, null, 1));
  console.log("Saved " + out.length + " playlists.");
}

main();
