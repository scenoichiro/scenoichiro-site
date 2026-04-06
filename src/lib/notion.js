const NOTION_TOKEN = import.meta.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

// YouTubeのURLから動画IDを取り出す関数
function getYouTubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

export async function getProjects() {
  // ===== ① envチェック =====
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error("❌ Missing environment variables", {
      NOTION_TOKEN: !!NOTION_TOKEN,
      NOTION_DATABASE_ID: !!NOTION_DATABASE_ID,
    });
    return [];
  }

  try {
    // ===== ② API呼び出し =====
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

    // ===== ⑥ 整形 =====

    return data.results.map((page) => {
      const props = page.properties;
      const youtube = props["YouTube"]?.url ?? null;
      const notionCover = page.cover?.external?.url ?? page.cover?.file?.url ?? null;

      return {
        id: page.id,

        // タイトル（必須）
        title:
          props["プロジェクト名"]?.title?.[0]?.plain_text ??
          "Untitled",

        // slug（最重要：URL用）
        slug:
          props["slug"]?.rich_text?.[0]?.plain_text ??
          page.id,

        // 公開日
        date:
          props["初発表日"]?.date?.start ?? null,

        // タグ
        tags:
          props["タグ"]?.multi_select?.map((t) => t.name) ?? [],

        // カテゴリ
        category:
          props["カテゴリ"]?.select?.name ?? null,

        // 説明（複数テキスト対応）
        description:
          props["説明"]?.rich_text
            ?.map((t) => t.plain_text)
            .join("") ?? "",

        // メディア
        youtube:
          props["YouTube"]?.url ?? null,

        niconico:
          props["NicoNico"]?.url ?? null,

        // YouTubeサムネイルを優先、なければNotionカバー画像
        thumbnail: getYouTubeThumbnail(youtube) ?? notionCover,

        // 管理系（将来用）
        createdAt:
          props["作成日"]?.created_time ?? null,

        updatedAt:
          props["更新日"]?.last_edited_time ?? null,
      };
    });
  } catch (error) {
    // ===== ⑦ 例外キャッチ =====
    console.error("❌ Unexpected error in getProjects:", error);
    return [];
  }
}