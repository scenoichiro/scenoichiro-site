import { Client } from "@notionhq/client"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.WORKS_DB

async function getDatabase() {
  const response = await notion.databases.query({
    database_id: databaseId,
  })

  console.log("✅ Success! データ取得できました")
  console.log(response.results)
}

getDatabase()
