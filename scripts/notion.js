import { Client } from "@notionhq/client";
import fs from "fs-extra";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.WORKS_DB;

// === Notion → JSON ===
async function getWorks() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
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
        tags: props.Tags?.multi_sele_
