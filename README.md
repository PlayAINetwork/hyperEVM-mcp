# HyperEVM MCP

A Model Context Protocol server for interacting with HyperLend protocol and Kittenswap DEX on Hyperliquid EVM network. This MCP enables AI agents to perform DeFi operations including lending, borrowing, and token swapping.

## Features

### HyperEVM Protocol
- **Supply/Lend**: Deposit assets to earn lending yield and enable borrowing capacity
- **Withdraw**: Retrieve supplied assets and accrued interest
- **Borrow**: Borrow assets against supplied collateral with variable or stable rates
- **Repay**: Repay borrowed debt to reduce debt burden and improve health factor
- **Portfolio Management**: Comprehensive account state and position tracking
- **Market Data**: View all available lending markets and their parameters

### Kittenswap DEX
- **Token Swapping**: Automated token swaps with slippage protection
- **Multi-Pool Support**: Support for different tick spacings and pool configurations
- **Native Token Support**: Seamless HYPE (native) and wrapped token handling

### Supported Tokens
- **HYPE** - Native Hyperliquid token
- **WHYPE** - Wrapped HYPE
- **wstHYPE** - Wrapped Staked HYPE  
- **UBTC** - Bitcoin on Hyperliquid
- **UETH** - Ethereum on Hyperliquid
- **USDe** - Ethena USDe stablecoin
- **USDT0** - Tether USD
- **sUSDe** - Staked USDe

## Installation & Setup

### 1. Install globally
```bash
npm install -g hyperlend-mcp
```

### 2. Set up environment variables

**Using npx (recommended)**
```json
{
  "mcpServers": {
    "hyperlend": {
      "command": "npx",
      "args": ["hyperlend-mcp"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here",
        "RPC_URL": "https://rpc.hypurrscan.io" "[optional]"
      }
    }
  }
}
```

**Option C: Create .env file**
Create a `.env` file in your working directory:
```bash
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.hypurrscan.io <optional>
```

**⚠️ Security Note:** Keep your private key secure and never share it publicly.

## Available Tools

### HyperLend Protocol Operations

#### **hyperlendSupply**
Supply/lend assets to HyperLend protocol
- **Parameters**: token, amount, onBehalfOf (optional)
- **Example**: Supply 100 USDT0 to earn lending yield

#### **hyperlendWithdraw**  
Withdraw supplied assets and accrued interest
- **Parameters**: token, amount ('max' for full withdrawal), to (optional)
- **Example**: Withdraw all supplied WHYPE

#### **hyperlendBorrow**
Borrow assets against supplied collateral
- **Parameters**: token, amount, interestRateMode (variable/stable), onBehalfOf (optional)
- **Example**: Borrow 0.5 UETH against WHYPE collateral

#### **hyperlendRepay**
Repay borrowed debt
- **Parameters**: token, amount ('max' for full repayment), interestRateMode, onBehalfOf (optional)
- **Example**: Repay all UBTC debt

#### **hyperlendAccountState**
Get comprehensive account overview
- **Parameters**: userAddress (optional), detailed (boolean)
- **Returns**: Complete position data, health factor, borrowing capacity

#### **hyperlendGetReserves**
View all available lending markets
- **Parameters**: detailed (boolean)
- **Returns**: All supported tokens and their lending parameters

### Kittenswap DEX Operations

#### **kittenswapSwapTokens**
Swap tokens on Kittenswap DEX
- **Parameters**: tokenIn, tokenOut, amountIn, amountOutMinimum (optional), tickSpacing, slippageTolerance, deadline (optional)
- **Example**: Swap 10 WHYPE for UBTC with 3% slippage tolerance

## Usage Examples

### Basic Lending Flow
```bash
# 1. Supply WHYPE as collateral
hyperlendSupply --token WHYPE --amount 100

# 2. Borrow USDT0 against collateral  
hyperlendBorrow --token USDT0 --amount 50

# 3. Check account health
hyperlendAccountState --detailed true

# 4. Repay debt
hyperlendRepay --token USDT0 --amount max

# 5. Withdraw collateral
hyperlendWithdraw --token WHYPE --amount max
```

### Token Swapping
```bash
# Swap HYPE for UBTC
kittenswapSwapTokens --tokenIn HYPE --tokenOut UBTC --amountIn 1.0 --slippageTolerance 3.0
```

## Network Information

- **Chain**: Hyperliquid EVM (Chain ID: 998)
- **RPC URL**: https://rpc.hypurrscan.io
- **Native Token**: HYPE
- **HyperLend Protocol**: Aave V3 fork optimized for Hyperliquid
- **Kittenswap**: Uniswap V3 fork for Hyperliquid

## Requirements

- Node.js 18+
- Hyperliquid EVM wallet with HYPE for gas fees
- Private key for transaction signing

## Security

- Your private key stays local and is never shared
- All transactions happen on-chain via Hyperliquid EVM network
- Open source and auditable code
- Built on battle-tested Aave V3 and Uniswap V3 protocols

## Support

For issues and questions:
- **GitHub Issues**: [https://github.com/PlayAINetwork/hyperlend-mcp/issues](https://github.com/PlayAINetwork/hyperEVM-mcp/issues)
- **Documentation**: Check the inline tool descriptions for detailed parameter information

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
