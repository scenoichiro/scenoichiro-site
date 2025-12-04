import { Client } from "@notionhq/client";
import fs from "fs-extra";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 各種データベースIDを指定
const WorksPageId = process.env.WORKS_DB;
const ProfilePageId = process.env.PROFILE_DB;

// === Works データ取得 ===
async function getWorks() {
  try {
    const response = await notion.databases.query({
      database_id: WorksPageId,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const works = response.results.map((page) => {
      const props = page.properties;

      return {
        id: page.id,
        title: props.Title?.title?.[0]?.plain_text || "Untitled",
        role: props.Role?.rich_text?.[0]?.plain_text || "",
        description: props.Description?.rich_text?.[0]?.plain_text || "",
        date: props.Date?.date?.start || "",
        link: props.Link?.url || "",
        tags: props.Tags?.multi_select?.map((tag) => tag.name) || [],
      };
    });

    await fs.outputJSON("data/works.json", works, { spaces: 2 });
    console.log("✅ Works data saved to data/works.json");
  } catch (error) {
    console.error("❌ Error fetching works:", error.message);
    process.exit(1);
  }
}

// === Profile データ取得 ===
async function getProfile() {
  try {
    const response = await notion.databases.query({
      database_id: ProfilePageId,
    });
    console.log("Profile API Response:", response);  // レスポンスを表示して確認

    const profiles = response.results.map((page) => {
      const props = page.properties;
      
      return {
        title: props.Title?.title?.[0]?.plain_text || "Untitled",
        description: props.Description?.rich_text?.[0]?.plain_text || "",
        photo: props.Photo?.url || "No photo", // 画像URL（必要に応じて）
      };
    });
    
    await fs.outputJSON("data/profile.json", profiles, { spaces: 2 });
    console.log("✅ Profile data saved to data/profile.json");
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    process.exit(1);
  }
}

// === 実行 ===
async function main() {
  await getWorks();
  await getProfile();
}

main();
