import { Client } from "@notionhq/client"
import fs from "fs"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function getDatabase(databaseId, outputFile) {
  const response = await notion.databases.query({
    database_id: databaseId,
  })

  fs.writeFileSync(outputFile, JSON.stringify(response.results, null, 2))
  console.log(`${outputFile} generated`)
}

(async () => {
  await getDatabase(process.env.WORKS_DB, "./data/works.json")
  await getDatabase(process.env.DISCOGRAPHY_DB, "./data/discography.json")
})()
