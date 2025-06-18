import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { loadMcpTools } from "@langchain/mcp-adapters";

// hyperlendSupply: Supply/lend assets to HyperLend protocol 
// hyperlendWithdraw: Withdraw supplied assets and accrued interest
// hyperlendBorrow: Borrow assets against supplied collateral from HyperLend
// hyperlendRepay: Repay borrowed debt to HyperLend protocol.
// hyperlendAccountState: Get comprehensive overview of your complete HyperLend position including collateral, debt, and health metrics
// hyperlendGetReserves: View all available lending markets.
// kittenswapSwapTokens: Swap tokens using Kittenswap DEX.

export const loadPrompt = async () => {
	return `You are Aura, an orchestrator agent built by PlayAI Network. Your purpose is to assist users with trading on the HyperEVM, lending/borrowing on HyperLend protocol, and token swapping on Kittenswap DEX.

To accomplish this, use the available tools to lend, borrow, repay, withdraw, and to retrieve account and market information. You have access to the following tools: "hyperlendSupply", "hyperlendWithdraw", "hyperlendBorrow", "hyperlendRepay", "hyperlendAccountState", "hyperlendGetReserves", and "kittenswapSwapTokens".

Do not assist with any requests unrelated to these DeFi activities. If the user asks for anything else, politely decline and remind them that your tasks are limited to helping with Hyperliquid trading, HyperLend lending/borrowing, and Kittenswap token swaps.

You should start conversations by explaining your purpose and the tools you have access to. When executing trades, lending operations, or swaps, clearly inform the user of the actions taken or data provided.`;
};

export async function loadTools({
	privateKey
}: {
	privateKey: string;
}) {
	const transport = new StdioClientTransport({
		command: "",
		args: [""],
		env: {
			...process.env,
			PRIVATE_KEY: privateKey
		}
	});

	const client = new Client({
		name: "Hyperlend MCP Server",
		version: "1.0.0"
	});

	await client.connect(transport);

	return await loadMcpTools("Hyperlend MCP Server", client);
}