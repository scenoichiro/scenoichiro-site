import fs from 'node:fs';
import path from 'node:path';

const NOTION_TOKEN = import.meta.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

// キャッシュファイルのパス（プロジェクトルートからの相対パス）
const CACHE_DIR = path.join(process.cwd(), 'src/data');
const CACHE_FILE = path.join(CACHE_DIR, 'projects-cache.json');

// YouTubeのURLから動画IDを取り出す関数
function getYouTubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

export async function getProjects() {
  // ===== 0. 開発モードかつキャッシュがある場合はキャッシュを返す =====
  const isDev = import.meta.env.DEV;
  if (isDev && fs.existsSync(CACHE_FILE)) {
    try {
      const cacheData = fs.readFileSync(CACHE_FILE, 'utf-8');
      console.log("📦 Loading Works from local cache...");
      return JSON.parse(cacheData);
    } catch (e) {
      console.warn("⚠️ Failed to load cache, fetching from Notion API...", e);
    }
  }

  // ===== ① envチェック =====
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error("❌ Missing environment variables", {
      NOTION_TOKEN: !!NOTION_TOKEN,
      NOTION_DATABASE_ID: !!NOTION_DATABASE_ID,
    });
    return [];
  }

  console.log("🌐 Fetching latest Works from Notion API...");

  try {
    // ===== ② API呼び出し（ページネーション対応） =====
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter: {
              property: "Published",
              checkbox: { equals: true },
            },
            sorts: [
              {
                property: "初発表日",
                direction: "descending",
              },
            ],
            start_cursor: startCursor,
          }),
        }
      );

      // ===== ③ HTTPエラーチェック =====
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ HTTP Error:", response.status, text);
        return [];
      }

      const data = await response.json();

      // ===== ④ Notionエラーチェック =====
      if (data.object === "error") {
        console.error("❌ Notion API Error:", data);
        return [];
      }

      // ===== ⑤ resultsチェック =====
      if (!Array.isArray(data.results)) {
        console.error("❌ Invalid results:", data);
        return [];
      }

      allResults = allResults.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;

      console.log(`📄 Fetched ${data.results.length} items (total: ${allResults.length})`);
    }

    // ===== ⑥ 整形 =====
    const projects = allResults.map((page) => {
      const props = page.properties;
      const youtube = props["YouTube"]?.url ?? null;
      const notionCover = page.cover?.external?.url ?? page.cover?.file?.url ?? null;

      return {
        id: page.id,
        title: props["プロジェクト名"]?.title?.[0]?.plain_text ?? "Untitled",
        slug: props["slug"]?.rich_text?.[0]?.plain_text ?? page.id,
        date: props["初発表日"]?.date?.start ?? null,
        tags: props["タグ"]?.multi_select?.map((t) => t.name) ?? [],
        category: props["カテゴリ"]?.select?.name ?? null,
        description: props["説明"]?.rich_text?.map((t) => t.plain_text).join("") ?? "",
        youtube: props["YouTube"]?.url ?? null,
        niconico: props["NicoNico"]?.url ?? null,
        thumbnail: notionCover ?? getYouTubeThumbnail(youtube),
        createdAt: props["作成日"]?.created_time ?? null,
        updatedAt: props["更新日"]?.last_edited_time ?? null,
      };
    });

    // ===== ⑦ 開発モードならキャッシュを保存 =====
    if (isDev) {
      try {
        if (!fs.existsSync(CACHE_DIR)) {
          fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(projects, null, 2));
        console.log("💾 Works cache saved to:", CACHE_FILE);
      } catch (e) {
        console.warn("⚠️ Failed to save cache file:", e);
      }
    }

    return projects;
  } catch (error) {
    // ===== ⑧ 例外キャッチ =====
    console.error("❌ Unexpected error in getProjects:", error);
    return [];
  }
}