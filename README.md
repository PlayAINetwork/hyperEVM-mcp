# sheet MCP Server

An MCP (Model Context Protocol) server that enables AI agents to interact with the hyperlend.

## MCP Configuration

Add this configuration to your MCP settings:

```json
{
  "mcpServers": {
    "hyperlend": {
      "command": "node",
      "args": ["G:/beramcp/hyperlend-mcp/index.js"],
      "env": {
        "PRIVATE_KEY": ""
      }
    }
  }
}

```
