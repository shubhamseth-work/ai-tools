import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { createSmitheryUrl } from "@smithery/sdk"
const smitheryUrl = "https://server.smithery.ai/@devlimelabs/firestore-mcp"
const smitheryApiKey = "e38f48e1-646a-4b14-8299-55ac394f0b9e"
const serverUrl = createSmitheryUrl(
    smitheryUrl,{
    apiKey: smitheryApiKey
   })
const transport = new StreamableHTTPClientTransport(serverUrl)
import { Client } from "@modelcontextprotocol/sdk/client/index.js"


async function queryApi(prompt) {
  const client = new Client({
    name: "My App",
    version: "1.0.0"
  })
  await client.connect(transport)

  // List available tools
  const tools = await client.listTools()
  console.log(`Available tools: ${tools.map(t => t.name).join(", ")}`)
}

export {queryApi};
