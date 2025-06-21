#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { ethers } = require("ethers");

const CONTRACTS = {
  POOL: '0x00A89d7a5A02160f20150EbEA7a2b5E4879A1A8b',
  DATA_PROVIDER: '0x5481bf8d3946E6A3168640c1D7523eB59F055a29',
  UI_POOL_DATA_PROVIDER: '0x3Bb92CF81E38484183cc96a4Fb8fBd2d73535807',
  POOL_ADDRESS_PROVIDER: '0x72c98246a98bFe64022a3190e7710E157497170C',
  ORACLE: '0xC9Fb4fbE842d57EAc1dF3e641a281827493A630e'
};

// Kittenswap contracts
const KITTENSWAP_CONTRACTS = {
  SWAP_ROUTER: '0x8fFDB06039B1b8188c2C721Dc3C435B5773D7346',
  QUOTER_V2: '0xd9949cB0655E8D5167373005Bd85f814c8E0C9BF',
  FACTORY: '0xDa12F450580A4cc485C3b501BAB7b0B3cbc3B31B',
  WETH9: '0x5555555555555555555555555555555555555555' 
};

const TOKENS = {
  'WHYPE': {
    address: '0x5555555555555555555555555555555555555555',
    symbol: 'WHYPE',
    name: 'WHYPE',
    decimals: 18,
    hToken: '0x0D745EAA9E70bb8B6e2a0317f85F1d536616bD34',
    variableDebtToken: '0x747d0d4Ba0a20836513cd008deb95075683e82'
  },
  'WSTHYPE': {
    address: '0x94e8396e0869c9F2200760aF0621aFd240E1CF38',
    symbol: 'wstHYPE',
    name: 'Wrapped Staked HYPE',
    decimals: 18,
    hToken: '0x0Ab8AAE3335Ed4B373A33D9023b6A6585b14D33',
    variableDebtToken: '0x45686A849e77CCb909F5d575F51C372bf2610D6'
  },
  'UBTC': {
    address: '0x9FDBdA0A5e284c32744D2f17Fe5c74B284994634',
    symbol: 'UBTC',
    name: 'UBTC',
    decimals: 8,
    hToken: '0xd2012c6DfF7634f9513A56a1871b93e4505EA851',
    variableDebtToken: '0xE16a14972bcDE3f9Bd637502C86384533F27DA07'
  },
  'UETH': {
    address: '0xBe6727B535545CC675Ca73dEa54865B92CF7907',
    symbol: 'UETH',
    name: 'UETH',
    decimals: 18,
    hToken: '0xdBA3B25643C1be9BDF457D6b3926992A735c523',
    variableDebtToken: '0x14E10FA4E016183a024c74ACF539bb875c54e70C'
  },
  'USDE': {
    address: '0x5d3a1Ff2b6bAb83b63cd9AD0787074081a52ef34',
    symbol: 'USDe',
    name: 'USDe',
    decimals: 18,
    hToken: '0x333819c0497555542620AaC119948562a0E24C2bd6',
    variableDebtToken: '0x1EFA0f7A12cEF73e23dE30b7013a252231Ea50f9'
  },
  'USDT0': {
    address: '0xB8CE59fC37f7ada402eaDF9682A9e934F625ebb',
    symbol: 'USDT0',
    name: 'USDT0',
    decimals: 6,
    hToken: '0x10982ad645D5A112606534d8567418C64c14cB5',
    variableDebtToken: '0x1EF897622D62335e7FC88Fb0605FbBa28eC0b01d'
  },
  'SUSDE': {
    address: '0x211Cc4DD073734dA055bF442b4667d5E5fd25d2',
    symbol: 'sUSDe',
    name: 'sUSDe',
    decimals: 18,
    hToken: '0xf6ba4169e1a1B467D3BB884C2de6454B4E4fE4f',
    variableDebtToken: '0x044388Eed86eF67c126Db5A66428F30797B0ABF5'
  }
};

const SWAP_TOKENS = {
  'HYPE': {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'HYPE',
    name: 'Hyperliquid',
    decimals: 18,
    isNative: true
  },
  'WHYPE': {
    address: '0x5555555555555555555555555555555555555555',
    symbol: 'WHYPE',
    name: 'Wrapped HYPE',
    decimals: 18,
    isNative: false
  },
  'WSTHYPE': {
    address: '0x94e8396e0869c9F2200760aF0621aFd240E1CF38',
    symbol: 'wstHYPE',
    name: 'Wrapped Staked HYPE',
    decimals: 18,
    isNative: false
  },
  'UBTC': {
    address: '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463',
    symbol: 'UBTC',
    name: 'UBTC',
    decimals: 8,
    isNative: false
  },
  'UETH': {
    address: '0xBe6727B535545CC675Ca73dEa54865B92CF7907',
    symbol: 'UETH',
    name: 'UETH',
    decimals: 18,
    isNative: false
  },
  'USDE': {
    address: '0x5d3a1Ff2b6bAb83b63cd9AD0787074081a52ef34',
    symbol: 'USDe',
    name: 'USDe',
    decimals: 18,
    isNative: false
  },
  'USDT0': {
    address: '0xB8CE59fC37f7ada402eaDF9682A9e934F625ebb',
    symbol: 'USDT0',
    name: 'USDT0',
    decimals: 6,
    isNative: false
  },
  'SUSDE': {
    address: '0x211Cc4DD073734dA055bF442b4667d5E5fd25d2',
    symbol: 'sUSDe',
    name: 'sUSDe',
    decimals: 18,
    isNative: false
  }
};

const CHAIN_CONFIG = {
  chainId: 998,
  rpcUrl: process.env.RPC_URL || "https://rpc.hypurrscan.io",
  name: "Hyperliquid EVM",
  nativeToken: {
    symbol: "HYPE",
    name: "Hyperliquid",
    decimals: 18
  }
};

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const InterestRateMode = {
  NONE: 0,
  STABLE: 1,
  VARIABLE: 2
};

const POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
  "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)",
  "function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) returns (uint256)",
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
  "function getReservesList() view returns (address[])",
  "function getUserEMode(address user) view returns (uint256)",
  "function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)"
];

const DATA_PROVIDER_ABI = [
  "function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])",
  "function getAllATokens() view returns (tuple(string symbol, address tokenAddress)[])",
  "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
  "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)",
  "function getReserveConfigurationData(address asset) view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)",
  "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  "function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)"
];

const UI_POOL_DATA_PROVIDER_ABI = [
  "function getUserReservesData(address provider, address user) view returns (tuple(address underlyingAsset, uint256 scaledATokenBalance, bool usageAsCollateralEnabledOnUser, uint256 scaledVariableDebt)[] userReserves, uint8 userEmode)",
  "function getReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint256 availableLiquidity, uint256 totalScaledVariableDebt, uint256 priceInMarketReferenceCurrency, address priceOracle, uint256 variableRateSlope1, uint256 variableRateSlope2, uint256 baseVariableBorrowRate, uint256 optimalUsageRatio, bool isPaused, bool isSiloedBorrowing, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt, bool flashLoanEnabled, uint256 debtCeiling, uint256 debtCeilingDecimals, uint256 borrowCap, uint256 supplyCap, bool borrowableInIsolation, bool virtualAccActive, uint128 virtualUnderlyingBalance)[] reserves, tuple(uint256 marketReferenceCurrencyUnit, int256 marketReferenceCurrencyPriceInUsd, int256 networkBaseTokenPriceInUsd, uint8 networkBaseTokenPriceDecimals) baseCurrencyInfo)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];


const SWAP_ROUTER_ABI = [
  "function WETH9() view returns (address)",
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, int24 tickSpacing, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function exactInput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum) params) payable returns (uint256 amountOut)",
  "function exactOutputSingle(tuple(address tokenIn, address tokenOut, int24 tickSpacing, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountIn)",
  "function exactOutput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum) params) payable returns (uint256 amountIn)",
  "function multicall(bytes[] calldata data) payable returns (bytes[] memory results)",
  "function refundETH() payable",
  "function sweepToken(address token, uint256 amountMinimum, address recipient) payable",
  "function unwrapWETH9(uint256 amountMinimum, address recipient) payable"
];


const server = new McpServer({
  name: "HyperLend MCP",
  version: "1.0.0",
  description: "MCP server for AI agents to interact with HyperLend protocol and Kittenswap"
});

function getProvider() {
  try {
    const rpcUrl = CHAIN_CONFIG.rpcUrl;
    return new ethers.JsonRpcProvider(rpcUrl);
  } catch (error) {
    throw new Error(`Failed to connect to provider: ${error.message}`);
  }
}

function getWallet() {
  try {
    const provider = getProvider();
    return new ethers.Wallet(PRIVATE_KEY, provider);
  } catch (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

function formatUnits(value, decimals) {
  return ethers.formatUnits(value, decimals);
}

function parseUnits(value, decimals) {
  return ethers.parseUnits(value, decimals);
}

function resolveTokenAddress(tokenSymbolOrAddress) {
  const upperSymbol = tokenSymbolOrAddress.toUpperCase();

  if (TOKENS[upperSymbol]) {
    return {
      address: TOKENS[upperSymbol].address,
      symbol: TOKENS[upperSymbol].symbol,
      decimals: TOKENS[upperSymbol].decimals
    };
  }
  
  if (ethers.isAddress(tokenSymbolOrAddress)) {
    return {
      address: tokenSymbolOrAddress,
      symbol: 'UNKNOWN',
      decimals: 18 
    };
  }
  
  throw new Error(`Unknown token: ${tokenSymbolOrAddress}. Supported tokens: ${Object.keys(TOKENS).join(', ')}`);
}

function resolveSwapToken(tokenSymbolOrAddress) {
  const upperSymbol = tokenSymbolOrAddress.toUpperCase();

  if (SWAP_TOKENS[upperSymbol]) {
    return SWAP_TOKENS[upperSymbol];
  }
  
  if (ethers.isAddress(tokenSymbolOrAddress)) {
    return {
      address: tokenSymbolOrAddress,
      symbol: 'UNKNOWN',
      decimals: 18,
      isNative: false
    };
  }
  
  throw new Error(`Unknown swap token: ${tokenSymbolOrAddress}. Supported tokens: ${Object.keys(SWAP_TOKENS).join(', ')}`);
}

async function approveToken(wallet, tokenAddress, spenderAddress, amount) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const currentAllowance = await tokenContract.allowance(wallet.address, spenderAddress);
  
  if (currentAllowance < amount) {
    const approveTx = await tokenContract.approve(spenderAddress, amount);
    await approveTx.wait();
    return approveTx.hash;
  }
  return null;
}

server.tool(
  "getTokenDetails",
  "Fetch comprehensive token details including price, market data, and trading metrics from DexScreener API",
  {
    tokenAddress: z.string().describe("Contract address of the token to fetch details for")
  },
  async ({ tokenAddress }) => {
    try {
      if (!ethers.isAddress(tokenAddress)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Invalid token address format",
              providedAddress: tokenAddress
            }, null, 2)
          }]
        };
      }

      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
      
      if (!response.ok) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: `Failed to fetch token data from DexScreener`,
              httpStatus: response.status,
              statusText: response.statusText
            }, null, 2)
          }]
        };
      }

      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "No trading pairs found for this token address",
              tokenAddress: tokenAddress,
              suggestion: "This token might not be listed on any supported DEXes or the address might be incorrect"
            }, null, 2)
          }]
        };
      }

      const tokenInfo = {
        tokenAddress: tokenAddress,
        totalPairs: data.pairs.length,
        summary: {
          name: data.pairs[0].baseToken.name,
          symbol: data.pairs[0].baseToken.symbol,
          totalSupply: data.pairs[0].info?.totalSupply || "N/A",
          circulatingSupply: data.pairs[0].info?.circulatingSupply || "N/A",
          websites: data.pairs[0].info?.websites || [],
          socials: data.pairs[0].info?.socials || []
        },
        marketData: {
          primaryPair: data.pairs.reduce((prev, current) => 
            (parseFloat(current.liquidity?.usd || 0) > parseFloat(prev.liquidity?.usd || 0)) ? current : prev
          ),
          allPairs: data.pairs.map(pair => ({
            dexName: pair.dexId,
            pairAddress: pair.pairAddress,
            baseToken: {
              address: pair.baseToken.address,
              name: pair.baseToken.name,
              symbol: pair.baseToken.symbol
            },
            quoteToken: {
              address: pair.quoteToken.address,
              name: pair.quoteToken.name,
              symbol: pair.quoteToken.symbol
            },
            price: {
              usd: pair.priceUsd,
              native: pair.priceNative,
              change24h: pair.priceChange?.h24 || "0"
            },
            volume: {
              h24: pair.volume?.h24 || "0",
              h6: pair.volume?.h6 || "0",
              h1: pair.volume?.h1 || "0"
            },
            liquidity: {
              usd: pair.liquidity?.usd || "0",
              base: pair.liquidity?.base || "0",
              quote: pair.liquidity?.quote || "0"
            },
            marketCap: pair.marketCap || "N/A",
            fdv: pair.fdv || "N/A",
            pairCreatedAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : "N/A",
            chainId: pair.chainId,
            url: pair.url
          }))
        },
        analytics: {
          highestLiquidityPair: data.pairs.reduce((prev, current) => 
            (parseFloat(current.liquidity?.usd || 0) > parseFloat(prev.liquidity?.usd || 0)) ? current : prev
          ),
          highestVolumePair: data.pairs.reduce((prev, current) => 
            (parseFloat(current.volume?.h24 || 0) > parseFloat(prev.volume?.h24 || 0)) ? current : prev
          ),
          totalLiquidityUSD: data.pairs.reduce((sum, pair) => 
            sum + parseFloat(pair.liquidity?.usd || 0), 0
          ).toFixed(2),
          totalVolume24hUSD: data.pairs.reduce((sum, pair) => 
            sum + parseFloat(pair.volume?.h24 || 0), 0
          ).toFixed(2),
          averagePrice: data.pairs.length > 0 
            ? (data.pairs.reduce((sum, pair) => sum + parseFloat(pair.priceUsd || 0), 0) / data.pairs.length).toFixed(8)
            : "0",
          priceRange24h: {
            min: Math.min(...data.pairs.map(p => parseFloat(p.priceUsd || Infinity))).toFixed(8),
            max: Math.max(...data.pairs.map(p => parseFloat(p.priceUsd || 0))).toFixed(8)
          }
        },
        timestamp: new Date().toISOString()
      };

      const primaryPair = tokenInfo.analytics.highestLiquidityPair;
      tokenInfo.insights = {
        mostLiquidDex: primaryPair.dexId,
        primaryTradingPair: `${primaryPair.baseToken.symbol}/${primaryPair.quoteToken.symbol}`,
        priceChange24h: primaryPair.priceChange?.h24 || "0",
        isNewToken: primaryPair.pairCreatedAt 
          ? (Date.now() - new Date(primaryPair.pairCreatedAt).getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 days
          : false,
        riskFactors: []
      };

      if (parseFloat(tokenInfo.analytics.totalLiquidityUSD) < 10000) {
        tokenInfo.insights.riskFactors.push("Low liquidity (< $10,000)");
      }
      if (parseFloat(primaryPair.volume?.h24 || 0) < 1000) {
        tokenInfo.insights.riskFactors.push("Low trading volume (< $1,000/24h)");
      }
      if (tokenInfo.insights.isNewToken) {
        tokenInfo.insights.riskFactors.push("New token (< 7 days old)");
      }
      if (data.pairs.length === 1) {
        tokenInfo.insights.riskFactors.push("Single trading pair");
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            data: tokenInfo
          }, null, 2)
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to fetch token details: ${error.message}`,
            tokenAddress: tokenAddress,
            details: error.stack
          }, null, 2)
        }]
      };
    }
  }
);


server.tool(
  "kittenswapSwapTokens",
  "Swap tokens using Kittenswap DEX on Hyperliquid EVM network with automated routing and slippage protection",
  {
    tokenIn: z.string().describe("Token symbol or address to swap from (HYPE, WHYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE)"),
    tokenOut: z.string().describe("Token symbol or address to swap to (HYPE, WHYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE)"),
    amountIn: z.string().describe("Amount of input token to swap (in human readable format)"),
    amountOutMinimum: z.string().optional().describe("Minimum amount of output token expected (defaults to 0 for any amount)"),
    tickSpacing: z.number().default(1).describe("Tick spacing for the pool (common values: 1, 10, 60, 200)"),
    slippageTolerance: z.number().default(3.0).describe("Slippage tolerance percentage (default: 3.0%)"),
    deadline: z.number().optional().describe("Deadline in minutes from now (default: 20 minutes)")
  },
  async ({ tokenIn, tokenOut, amountIn, amountOutMinimum, tickSpacing, slippageTolerance, deadline }) => {
    try {
      const wallet = getWallet();
      
      const tokenInInfo = resolveSwapToken(tokenIn);
      const tokenOutInfo = resolveSwapToken(tokenOut);
      
      if (tokenInInfo.symbol === tokenOutInfo.symbol) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Cannot swap the same token"
            }, null, 2)
          }]
        };
      }
      
      const amountInWei = parseUnits(amountIn, tokenInInfo.decimals);
      
      let balance;
      if (tokenInInfo.isNative) {
        balance = await wallet.provider.getBalance(wallet.address);
        const gasReserve = parseUnits("0.01", 18);
        if (balance < amountInWei + gasReserve) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "error",
                message: "Insufficient balance (need to reserve gas)",
                required: formatUnits(amountInWei + gasReserve, tokenInInfo.decimals),
                available: formatUnits(balance, tokenInInfo.decimals),
                gasReserve: formatUnits(gasReserve, tokenInInfo.decimals),
                token: tokenInInfo.symbol
              }, null, 2)
            }]
          };
        }
      } else {
        const tokenContract = new ethers.Contract(tokenInInfo.address, ERC20_ABI, wallet.provider);
        balance = await tokenContract.balanceOf(wallet.address);
        
        if (balance < amountInWei) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "error",
                message: "Insufficient balance",
                required: formatUnits(amountInWei, tokenInInfo.decimals),
                available: formatUnits(balance, tokenInInfo.decimals),
                token: tokenInInfo.symbol
              }, null, 2)
            }]
          };
        }
      }
      
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline || 20) * 60;
      const amountOutMin = amountOutMinimum 
        ? parseUnits(amountOutMinimum, tokenOutInfo.decimals)
        : 0n;
      
      const swapRouter = new ethers.Contract(KITTENSWAP_CONTRACTS.SWAP_ROUTER, SWAP_ROUTER_ABI, wallet);

      let weth9Address;
      try {
        weth9Address = await swapRouter.WETH9();
      } catch (e) {
        weth9Address = KITTENSWAP_CONTRACTS.WETH9;
      }
      
      const tokenInAddress = tokenInInfo.isNative ? weth9Address : tokenInInfo.address;
      const tokenOutAddress = tokenOutInfo.isNative ? weth9Address : tokenOutInfo.address;
      
      let approvalTxHash = null;
      if (!tokenInInfo.isNative) {
        approvalTxHash = await approveToken(wallet, tokenInInfo.address, KITTENSWAP_CONTRACTS.SWAP_ROUTER, amountInWei);
      }
      
      const tickSpacingOptions = [tickSpacing, 1, 10, 60, 200];
      let lastError;
      
      for (const currentTickSpacing of tickSpacingOptions) {
        try {
          const swapParams = {
            tokenIn: tokenInAddress,
            tokenOut: tokenOutAddress,
            tickSpacing: currentTickSpacing,
            recipient: wallet.address,
            deadline: deadlineTimestamp,
            amountIn: amountInWei,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
          };
          
          const value = tokenInInfo.isNative ? amountInWei : 0n;
          
          try {
            await swapRouter.exactInputSingle.staticCall(swapParams, { value });
          } catch (staticError) {
            lastError = staticError;
            continue; 
          }
          
          const swapTx = await swapRouter.exactInputSingle(swapParams, { value });
          const receipt = await swapTx.wait();
          
          let amountOut = 0n;
          for (const log of receipt.logs) {
            try {
              if (log.topics && log.topics[0]) {
                const swapEventSig = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
                if (log.topics[0] === swapEventSig && log.data) {
                  const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                    ['int256', 'int256', 'uint160', 'uint128', 'int24'],
                    log.data
                  );
                  amountOut = decoded[1] < 0 ? -decoded[1] : decoded[1];
                  break;
                }
              }
            } catch (e) {
            }
          }

          let finalBalanceIn, finalBalanceOut;
          
          if (tokenInInfo.isNative) {
            finalBalanceIn = await wallet.provider.getBalance(wallet.address);
          } else {
            const tokenInContract = new ethers.Contract(tokenInInfo.address, ERC20_ABI, wallet.provider);
            finalBalanceIn = await tokenInContract.balanceOf(wallet.address);
          }
          
          if (tokenOutInfo.isNative) {
            finalBalanceOut = await wallet.provider.getBalance(wallet.address);
          } else {
            const tokenOutContract = new ethers.Contract(tokenOutInfo.address, ERC20_ABI, wallet.provider);
            finalBalanceOut = await tokenOutContract.balanceOf(wallet.address);
          }
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "success",
                action: "swap",
                wallet: wallet.address,
                swap: {
                  tokenIn: {
                    address: tokenInInfo.address,
                    symbol: tokenInInfo.symbol,
                    amount: amountIn,
                    amountWei: amountInWei.toString(),
                    isNative: tokenInInfo.isNative
                  },
                  tokenOut: {
                    address: tokenOutInfo.address,
                    symbol: tokenOutInfo.symbol,
                    amountReceived: formatUnits(amountOut, tokenOutInfo.decimals),
                    amountReceivedWei: amountOut.toString(),
                    isNative: tokenOutInfo.isNative
                  },
                  tickSpacing: currentTickSpacing,
                  slippageTolerance: slippageTolerance + '%'
                },
                transaction: {
                  hash: swapTx.hash,
                  blockNumber: receipt.blockNumber,
                  gasUsed: receipt.gasUsed.toString(),
                  approvalTxHash: approvalTxHash
                },
                balances: {
                  [tokenInInfo.symbol]: formatUnits(finalBalanceIn, tokenInInfo.decimals),
                  [tokenOutInfo.symbol]: formatUnits(finalBalanceOut, tokenOutInfo.decimals)
                },
                dex: "Kittenswap",
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
          
        } catch (error) {
          lastError = error;
          continue; 
        }
      }
      
      throw lastError;
      
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to swap tokens: ${error.message}`,
            details: error.reason || error.data?.message || error.shortMessage,
            suggestion: "Try different tokens or check if the pool exists. Common tick spacings are 1, 10, 60, 200."
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Supply/Lend assets
server.tool(
  "hyperevmSupply",
  "Supply/lend assets to HyperLend protocol lending pools on Hyperliquid EVM network to earn lending yield and enable borrowing capacity",
  {
    token: z.string().describe("Token symbol (HYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE) or contract address"),
    amount: z.string().describe("Amount to supply (in human readable format, e.g., '1.5' for 1.5 tokens)"),
    onBehalfOf: z.string().optional().describe("Optional: Address that will receive the aTokens (defaults to wallet address)")
  },
  async ({ token, amount, onBehalfOf }) => {
    try {
      const wallet = getWallet();
      const userAddress = onBehalfOf || wallet.address;
      
      const tokenInfo = resolveTokenAddress(token);
      const assetAddress = tokenInfo.address;
      
      const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, wallet.provider);
      const [decimals, symbol, balance] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.balanceOf(wallet.address)
      ]);
      
      const amountWei = parseUnits(amount, decimals);
      
      if (balance < amountWei) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Insufficient balance",
              required: formatUnits(amountWei, decimals),
              available: formatUnits(balance, decimals),
              token: symbol
            }, null, 2)
          }]
        };
      }

      const approvalTxHash = await approveToken(wallet, assetAddress, CONTRACTS.POOL, amountWei);
      
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, wallet);
      const supplyTx = await poolContract.supply(
        assetAddress,
        amountWei,
        userAddress,
        0 
      );
      
      const receipt = await supplyTx.wait();
      
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, wallet.provider);
      const userReserveData = await dataProvider.getUserReserveData(assetAddress, userAddress);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            action: "supply",
            wallet: wallet.address,
            token: {
              address: assetAddress,
              symbol: symbol,
              amount: amount,
              amountWei: amountWei.toString()
            },
            transaction: {
              hash: supplyTx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString(),
              approvalTxHash: approvalTxHash
            },
            newPosition: {
              aTokenBalance: formatUnits(userReserveData.currentATokenBalance, decimals),
              collateralEnabled: userReserveData.usageAsCollateralEnabled
            },
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to supply: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Withdraw assets 
server.tool(
  "hyperevmWithdraw",
  "Withdraw supplied assets and accrued interest from HyperLend protocol lending pools back to your wallet",
  {
    token: z.string().describe("Token symbol (HYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE) or contract address"),
    amount: z.string().describe("Amount to withdraw (in human readable format, or 'max' for maximum)"),
    to: z.string().optional().describe("Optional: Address to receive the withdrawn assets (defaults to wallet address)")
  },
  async ({ token, amount, to }) => {
    try {
      const wallet = getWallet();
      const recipient = to || wallet.address;
      
      const tokenInfo = resolveTokenAddress(token);
      const assetAddress = tokenInfo.address;
      
      const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, wallet.provider);
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, wallet.provider);
      
      const [decimals, symbol, userReserveData] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        dataProvider.getUserReserveData(assetAddress, wallet.address)
      ]);
      
      let amountWei;
      if (amount.toLowerCase() === 'max') {
        amountWei = ethers.MaxUint256;
      } else {
        amountWei = parseUnits(amount, decimals);
      }
      
      if (amount.toLowerCase() !== 'max' && userReserveData.currentATokenBalance < amountWei) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Insufficient aToken balance",
              required: formatUnits(amountWei, decimals),
              available: formatUnits(userReserveData.currentATokenBalance, decimals),
              token: symbol
            }, null, 2)
          }]
        };
      }
      
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, wallet);
      const withdrawTx = await poolContract.withdraw(
        assetAddress,
        amountWei,
        recipient
      );
      
      const receipt = await withdrawTx.wait();
      
      const withdrawnAmount = receipt.logs
        .filter(log => log.address.toLowerCase() === CONTRACTS.POOL.toLowerCase())
        .map(log => {
          try {
            const parsed = poolContract.interface.parseLog(log);
            return parsed?.args?.amount;
          } catch {
            return null;
          }
        })
        .find(amount => amount !== null) || amountWei;
      
      const newUserData = await dataProvider.getUserReserveData(assetAddress, wallet.address);
      const tokenBalance = await tokenContract.balanceOf(recipient);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            action: "withdraw",
            wallet: wallet.address,
            token: {
              address: assetAddress,
              symbol: symbol,
              withdrawnAmount: formatUnits(withdrawnAmount, decimals),
              withdrawnAmountWei: withdrawnAmount.toString()
            },
            transaction: {
              hash: withdrawTx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            },
            newBalances: {
              aTokenBalance: formatUnits(newUserData.currentATokenBalance, decimals),
              tokenBalance: formatUnits(tokenBalance, decimals)
            },
            recipient: recipient,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to withdraw: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Borrow assets
server.tool(
  "hyperevmBorrow",
  "Borrow assets against supplied collateral from HyperLend protocol with variable or stable interest rates",
  {
    token: z.string().describe("Token symbol (HYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE) or contract address"),
    amount: z.string().describe("Amount to borrow (in human readable format)"),
    interestRateMode: z.enum(['variable', 'stable']).default('variable').describe("Interest rate mode"),
    onBehalfOf: z.string().optional().describe("Optional: Address that will receive the debt (defaults to wallet address)")
  },
  async ({ token, amount, interestRateMode, onBehalfOf }) => {
    try {
      const wallet = getWallet();
      const borrower = onBehalfOf || wallet.address;
      
      const tokenInfo = resolveTokenAddress(token);
      const assetAddress = tokenInfo.address;
      
      const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, wallet.provider);
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, wallet);
      
      const [decimals, symbol, accountData] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        poolContract.getUserAccountData(borrower)
      ]);
      
      const amountWei = parseUnits(amount, decimals);
      const rateMode = interestRateMode === 'stable' ? InterestRateMode.STABLE : InterestRateMode.VARIABLE;
      
      if (accountData.availableBorrowsBase === 0n) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "No borrowing capacity. Supply collateral first.",
              accountData: {
                totalCollateral: formatUnits(accountData.totalCollateralBase, 8),
                totalDebt: formatUnits(accountData.totalDebtBase, 8),
                availableBorrows: formatUnits(accountData.availableBorrowsBase, 8),
                healthFactor: formatUnits(accountData.healthFactor, 18)
              }
            }, null, 2)
          }]
        };
      }
      
      const borrowTx = await poolContract.borrow(
        assetAddress,
        amountWei,
        rateMode,
        0,
        borrower
      );
      
      const receipt = await borrowTx.wait();
      
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, wallet.provider);
      const [newAccountData, userReserveData, tokenBalance] = await Promise.all([
        poolContract.getUserAccountData(borrower),
        dataProvider.getUserReserveData(assetAddress, borrower),
        tokenContract.balanceOf(borrower)
      ]);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            action: "borrow",
            wallet: wallet.address,
            token: {
              address: assetAddress,
              symbol: symbol,
              borrowedAmount: amount,
              borrowedAmountWei: amountWei.toString()
            },
            interestRateMode: interestRateMode,
            transaction: {
              hash: borrowTx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            },
            newPosition: {
              variableDebt: formatUnits(userReserveData.currentVariableDebt, decimals),
              stableDebt: formatUnits(userReserveData.currentStableDebt, decimals),
              tokenBalance: formatUnits(tokenBalance, decimals)
            },
            accountData: {
              totalCollateral: formatUnits(newAccountData.totalCollateralBase, 8),
              totalDebt: formatUnits(newAccountData.totalDebtBase, 8),
              availableBorrows: formatUnits(newAccountData.availableBorrowsBase, 8),
              healthFactor: formatUnits(newAccountData.healthFactor, 18)
            },
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to borrow: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Repay debt
server.tool(
  "hyperevmRepay",
  "Repay borrowed debt to HyperLend protocol to reduce debt burden and improve health factor",
  {
    token: z.string().describe("Token symbol (HYPE, UBTC, UETH, USDE, USDT0, SUSDE, WSTHYPE) or contract address"),
    amount: z.string().describe("Amount to repay (in human readable format, or 'max' for full repayment)"),
    interestRateMode: z.enum(['variable', 'stable']).default('variable').describe("Interest rate mode of the debt"),
    onBehalfOf: z.string().optional().describe("Optional: Address whose debt will be repaid (defaults to wallet address)")
  },
  async ({ token, amount, interestRateMode, onBehalfOf }) => {
    try {
      const wallet = getWallet();
      const borrower = onBehalfOf || wallet.address;
      
      const tokenInfo = resolveTokenAddress(token);
      const assetAddress = tokenInfo.address;
      
      const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, wallet.provider);
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, wallet.provider);
      
      const [decimals, symbol, userReserveData, balance] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        dataProvider.getUserReserveData(assetAddress, borrower),
        tokenContract.balanceOf(wallet.address)
      ]);
      
      const rateMode = interestRateMode === 'stable' ? InterestRateMode.STABLE : InterestRateMode.VARIABLE;
      const currentDebt = rateMode === InterestRateMode.STABLE 
        ? userReserveData.currentStableDebt 
        : userReserveData.currentVariableDebt;
      
      let amountWei;
      if (amount.toLowerCase() === 'max') {
        amountWei = ethers.MaxUint256;
      } else {
        amountWei = parseUnits(amount, decimals);
      }
      
      if (currentDebt === 0n) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: `No ${interestRateMode} debt to repay`,
              token: symbol
            }, null, 2)
          }]
        };
      }
      
      const repayAmount = amountWei === ethers.MaxUint256 ? currentDebt : amountWei;
      if (balance < repayAmount) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Insufficient balance for repayment",
              required: formatUnits(repayAmount, decimals),
              available: formatUnits(balance, decimals),
              token: symbol
            }, null, 2)
          }]
        };
      }
      
      const approvalTxHash = await approveToken(wallet, assetAddress, CONTRACTS.POOL, repayAmount);
      
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, wallet);
      const repayTx = await poolContract.repay(
        assetAddress,
        amountWei,
        rateMode,
        borrower
      );
      
      const receipt = await repayTx.wait();
      
      const repaidAmount = receipt.logs
        .filter(log => log.address.toLowerCase() === CONTRACTS.POOL.toLowerCase())
        .map(log => {
          try {
            const parsed = poolContract.interface.parseLog(log);
            return parsed?.args?.amount;
          } catch {
            return null;
          }
        })
        .find(amount => amount !== null) || repayAmount;
      
      const [newUserData, accountData] = await Promise.all([
        dataProvider.getUserReserveData(assetAddress, borrower),
        poolContract.getUserAccountData(borrower)
      ]);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            action: "repay",
            wallet: wallet.address,
            token: {
              address: assetAddress,
              symbol: symbol,
              repaidAmount: formatUnits(repaidAmount, decimals),
              repaidAmountWei: repaidAmount.toString()
            },
            interestRateMode: interestRateMode,
            transaction: {
              hash: repayTx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString(),
              approvalTxHash: approvalTxHash
            },
            newDebt: {
              variableDebt: formatUnits(newUserData.currentVariableDebt, decimals),
              stableDebt: formatUnits(newUserData.currentStableDebt, decimals)
            },
            accountData: {
              totalCollateral: formatUnits(accountData.totalCollateralBase, 8),
              totalDebt: formatUnits(accountData.totalDebtBase, 8),
              availableBorrows: formatUnits(accountData.availableBorrowsBase, 8),
              healthFactor: formatUnits(accountData.healthFactor, 18)
            },
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to repay: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Get comprehensive user data
server.tool(
  "hyperevmAccountState",
  "Get comprehensive overview of your complete HyperLend position including collateral, debt, and health metrics",
  {
    userAddress: z.string().optional().describe("Address of the user to query (defaults to wallet address)"),
    detailed: z.boolean().default(true).describe("Whether to include detailed reserve-by-reserve breakdown")
  },
  async ({ userAddress, detailed }) => {
    try {
      const wallet = getWallet();
      const queryAddress = userAddress || wallet.address;
      
      const provider = wallet.provider;
      const poolContract = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, provider);
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, provider);
      const uiDataProvider = new ethers.Contract(CONTRACTS.UI_POOL_DATA_PROVIDER, UI_POOL_DATA_PROVIDER_ABI, provider);
      
      const [accountData, userEMode] = await Promise.all([
        poolContract.getUserAccountData(queryAddress),
        poolContract.getUserEMode(queryAddress)
      ]);
      
      const result = {
        address: queryAddress,
        walletAddress: wallet.address,
        accountSummary: {
          totalCollateralUSD: formatUnits(accountData.totalCollateralBase, 8),
          totalDebtUSD: formatUnits(accountData.totalDebtBase, 8),
          availableBorrowsUSD: formatUnits(accountData.availableBorrowsBase, 8),
          currentLiquidationThreshold: (Number(accountData.currentLiquidationThreshold) / 100).toFixed(2) + '%',
          ltv: (Number(accountData.ltv) / 100).toFixed(2) + '%',
          healthFactor: formatUnits(accountData.healthFactor, 18),
          isHealthy: accountData.healthFactor > parseUnits('1', 18),
          eModeCategory: Number(userEMode)
        }
      };
      
      if (detailed) {
        const [userReservesData, allReserves] = await Promise.all([
          uiDataProvider.getUserReservesData(CONTRACTS.POOL_ADDRESS_PROVIDER, queryAddress),
          dataProvider.getAllReservesTokens()
        ]);
        
        const positions = [];
        
        for (const userReserve of userReservesData.userReserves) {
          const tokenInfo = allReserves.find(
            r => r.tokenAddress.toLowerCase() === userReserve.underlyingAsset.toLowerCase()
          );
          
          if (!tokenInfo) continue;
          
          const [reserveData, reserveConfig, tokenAddresses] = await Promise.all([
            dataProvider.getReserveData(userReserve.underlyingAsset),
            dataProvider.getReserveConfigurationData(userReserve.underlyingAsset),
            dataProvider.getReserveTokensAddresses(userReserve.underlyingAsset)
          ]);
          
          const tokenContract = new ethers.Contract(userReserve.underlyingAsset, ERC20_ABI, provider);
          const decimals = await tokenContract.decimals();
          
          const aTokenBalance = userReserve.scaledATokenBalance * reserveData.liquidityIndex / parseUnits('1', 27);
          const variableDebt = userReserve.scaledVariableDebt * reserveData.variableBorrowIndex / parseUnits('1', 27);
          
          positions.push({
            asset: {
              address: userReserve.underlyingAsset,
              symbol: tokenInfo.symbol,
              decimals: Number(decimals),
              aTokenAddress: tokenAddresses.aTokenAddress,
              variableDebtTokenAddress: tokenAddresses.variableDebtTokenAddress
            },
            supplied: {
              amount: formatUnits(aTokenBalance, decimals),
              amountUSD: "N/A", 
              collateralEnabled: userReserve.usageAsCollateralEnabledOnUser
            },
            borrowed: {
              variableDebt: formatUnits(variableDebt, decimals),
              variableDebtUSD: "N/A", 
              variableBorrowRate: (Number(reserveData.variableBorrowRate) / 1e25).toFixed(2) + '%'
            },
            rates: {
              supplyRate: (Number(reserveData.liquidityRate) / 1e25).toFixed(2) + '%',
              variableBorrowRate: (Number(reserveData.variableBorrowRate) / 1e25).toFixed(2) + '%',
              stableBorrowRate: (Number(reserveData.stableBorrowRate) / 1e25).toFixed(2) + '%'
            },
            configuration: {
              ltv: (Number(reserveConfig.ltv) / 100).toFixed(2) + '%',
              liquidationThreshold: (Number(reserveConfig.liquidationThreshold) / 100).toFixed(2) + '%',
              liquidationBonus: (Number(reserveConfig.liquidationBonus) / 100 - 100).toFixed(2) + '%',
              canBeCollateral: reserveConfig.usageAsCollateralEnabled,
              canBeBorrowed: reserveConfig.borrowingEnabled,
              isActive: reserveConfig.isActive,
              isFrozen: reserveConfig.isFrozen
            }
          });
        }
        
        result.positions = positions;
        result.positionsSummary = {
          totalPositions: positions.length,
          suppliedPositions: positions.filter(p => parseFloat(p.supplied.amount) > 0).length,
          borrowedPositions: positions.filter(p => parseFloat(p.borrowed.variableDebt) > 0).length,
          collateralPositions: positions.filter(p => p.supplied.collateralEnabled && parseFloat(p.supplied.amount) > 0).length
        };
      }
      
      result.timestamp = new Date().toISOString();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to get user data: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Tool: Get all reserves/markets
server.tool(
  "hyperevmGetReserves",
  "View all available lending markets and their current parameters in HyperLend protoco",
  {
    detailed: z.boolean().default(false).describe("Whether to include detailed information for each reserve")
  },
  async ({ detailed }) => {
    try {
      const provider = getProvider();
      const dataProvider = new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, provider);
      const uiDataProvider = new ethers.Contract(CONTRACTS.UI_POOL_DATA_PROVIDER, UI_POOL_DATA_PROVIDER_ABI, provider);
      
      const allReserves = await dataProvider.getAllReservesTokens();
      
      if (!detailed) {
        const reserves = allReserves.map(reserve => ({
          symbol: reserve.symbol,
          address: reserve.tokenAddress
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              totalReserves: reserves.length,
              reserves: reserves,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
      
      const [detailedReservesData, baseCurrencyInfo] = await uiDataProvider.getReservesData(CONTRACTS.POOL_ADDRESS_PROVIDER);
      
      const detailedReserves = [];
      
      for (const reserve of detailedReservesData.reserves) {
        const reserveInfo = allReserves.find(
          r => r.tokenAddress.toLowerCase() === reserve.underlyingAsset.toLowerCase()
        );
        
        if (!reserveInfo) continue;
        
        const [reserveCaps] = await Promise.all([
          dataProvider.getReserveCaps(reserve.underlyingAsset)
        ]);
        
        detailedReserves.push({
          asset: {
            address: reserve.underlyingAsset,
            symbol: reserveInfo.symbol,
            name: reserve.name,
            decimals: Number(reserve.decimals),
            aTokenAddress: reserve.aTokenAddress,
            variableDebtTokenAddress: reserve.variableDebtTokenAddress
          },
          configuration: {
            ltv: (Number(reserve.baseLTVasCollateral) / 100).toFixed(2) + '%',
            liquidationThreshold: (Number(reserve.reserveLiquidationThreshold) / 100).toFixed(2) + '%',
            liquidationBonus: (Number(reserve.reserveLiquidationBonus) / 100 - 100).toFixed(2) + '%',
            reserveFactor: (Number(reserve.reserveFactor) / 100).toFixed(2) + '%',
            canBeCollateral: reserve.usageAsCollateralEnabled,
            canBeBorrowed: reserve.borrowingEnabled,
            stableBorrowingEnabled: false, 
            isActive: reserve.isActive,
            isFrozen: reserve.isFrozen,
            isPaused: reserve.isPaused,
            borrowableInIsolation: reserve.borrowableInIsolation,
            isSiloedBorrowing: reserve.isSiloedBorrowing,
            flashLoanEnabled: reserve.flashLoanEnabled
          },
          caps: {
            borrowCap: reserveCaps.borrowCap === ethers.MaxUint256 
              ? 'Unlimited' 
              : formatUnits(reserveCaps.borrowCap, reserve.decimals),
            supplyCap: reserveCaps.supplyCap === ethers.MaxUint256 
              ? 'Unlimited' 
              : formatUnits(reserveCaps.supplyCap, reserve.decimals),
            debtCeiling: reserve.debtCeiling > 0 
              ? formatUnits(reserve.debtCeiling, reserve.debtCeilingDecimals) 
              : 'None'
          },
          rates: {
            currentLiquidityRate: (Number(reserve.liquidityRate) / 1e25).toFixed(2) + '%',
            currentVariableBorrowRate: (Number(reserve.variableBorrowRate) / 1e25).toFixed(2) + '%',
            baseVariableBorrowRate: (Number(reserve.baseVariableBorrowRate) / 1e25).toFixed(2) + '%',
            optimalUsageRatio: (Number(reserve.optimalUsageRatio) / 1e25).toFixed(2) + '%'
          },
          liquidity: {
            availableLiquidity: formatUnits(reserve.availableLiquidity, reserve.decimals),
            totalScaledVariableDebt: formatUnits(reserve.totalScaledVariableDebt, reserve.decimals),
            utilizationRate: reserve.availableLiquidity > 0
              ? (Number(reserve.totalScaledVariableDebt) / (Number(reserve.availableLiquidity) + Number(reserve.totalScaledVariableDebt)) * 100).toFixed(2) + '%'
              : '0%'
          },
          indices: {
            liquidityIndex: formatUnits(reserve.liquidityIndex, 27),
            variableBorrowIndex: formatUnits(reserve.variableBorrowIndex, 27),
            lastUpdateTimestamp: new Date(Number(reserve.lastUpdateTimestamp) * 1000).toISOString()
          },
          oracle: {
            priceSource: reserve.priceOracle,
            priceInMarketReferenceCurrency: formatUnits(reserve.priceInMarketReferenceCurrency, 8)
          }
        });
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            totalReserves: detailedReserves.length,
            baseCurrency: {
              unit: formatUnits(baseCurrencyInfo.marketReferenceCurrencyUnit, 0),
              priceInUsd: Number(baseCurrencyInfo.marketReferenceCurrencyPriceInUsd) / 1e8,
              networkBaseTokenPriceInUsd: Number(baseCurrencyInfo.networkBaseTokenPriceInUsd) / Math.pow(10, baseCurrencyInfo.networkBaseTokenPriceDecimals)
            },
            reserves: detailedReserves,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `Failed to get reserves: ${error.message}`,
            details: error.reason || error.data?.message
          }, null, 2)
        }]
      };
    }
  }
);

// Start the server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("HyperEVM MCP server started successfully");
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();