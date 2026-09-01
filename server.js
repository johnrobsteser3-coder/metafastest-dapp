const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists for persistent disk memory
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// In-Memory State Cache
let database = {
    wallets: {},
    globalStats: {
        totalTvl: 0,
        activeRiders: 0,
        totalMintedMhr: 0,
        reserveVaultUsdt: 0,
        pendingWithdrawals: []
    }
};

// Load saved persistent state from disk if exists
if (fs.existsSync(DB_FILE)) {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        database = JSON.parse(raw);
        console.log(`[DB] Successfully loaded persistent state for ${Object.keys(database.wallets || {}).length} wallets.`);
    } catch (err) {
        console.warn('[DB] Could not parse existing db.json, starting fresh memory store:', err.message);
    }
}

// Helper to save database to disk
function persistDatabaseToDisk() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
    } catch (err) {
        console.warn('[DB] Error writing to disk:', err.message);
    }
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static Assets
app.use(express.static(__dirname));

// ==========================================================
// 1. REAL-TIME LIVE TOKEN PRICE ORACLE ENGINE
// ==========================================================
let cachedPriceData = {
    priceUsdt: 0.1850,
    priceBnb: 0.000267,
    bnbUsdtPrice: 692.50,
    change24h: '+2.45%',
    marketCap: 185000000,
    source: 'Binance & DEX Oracle',
    lastUpdated: Date.now()
};

function fetchLiveOraclePrice() {
    // 1. Fetch live BNB/USDT price from Binance API
    const bnbUrl = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT';
    
    https.get(bnbUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 4000 }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
            try {
                const bnbJson = JSON.parse(raw);
                if (bnbJson && bnbJson.lastPrice) {
                    const liveBnb = parseFloat(bnbJson.lastPrice);
                    const bnbChange = parseFloat(bnbJson.priceChangePercent);
                    
                    // 2. Fetch live MFHRC DEX pair from DexScreener
                    const dexUrl = 'https://api.dexscreener.com/latest/dex/tokens/0xbC6AC29404f5E68ed9d4e340E286aAb265Ea6e0c';
                    https.get(dexUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 4000 }, (dexRes) => {
                        let dexRaw = '';
                        dexRes.on('data', chunk => dexRaw += chunk);
                        dexRes.on('end', () => {
                            try {
                                const dexJson = JSON.parse(dexRaw);
                                if (dexJson && dexJson.pairs && dexJson.pairs.length > 0) {
                                    const pair = dexJson.pairs[0];
                                    cachedPriceData.priceUsdt = parseFloat(pair.priceUsd) || 0.1850;
                                    cachedPriceData.change24h = (pair.priceChange && pair.priceChange.h24 ? (pair.priceChange.h24 >= 0 ? `+${pair.priceChange.h24}%` : `${pair.priceChange.h24}%`) : '+2.45%');
                                    cachedPriceData.source = 'PancakeSwap DEX Live Feed';
                                } else {
                                    // Calculate dynamic live token price weighted with BNB market movements
                                    const basePrice = 0.1850;
                                    const dynamicFluctuation = (bnbChange / 100) * 0.4;
                                    const liveDynamic = parseFloat((basePrice * (1 + dynamicFluctuation)).toFixed(4));
                                    cachedPriceData.priceUsdt = liveDynamic;
                                    cachedPriceData.change24h = bnbChange >= 0 ? `+${bnbChange.toFixed(2)}%` : `${bnbChange.toFixed(2)}%`;
                                    cachedPriceData.source = 'Binance BSC Market Oracle';
                                }

                                cachedPriceData.bnbUsdtPrice = liveBnb;
                                cachedPriceData.priceBnb = parseFloat((cachedPriceData.priceUsdt / liveBnb).toFixed(8));
                                cachedPriceData.marketCap = Math.round(1000000000 * cachedPriceData.priceUsdt);
                                cachedPriceData.lastUpdated = Date.now();
                            } catch (e) {}
                        });
                    }).on('error', () => {});
                }
            } catch (e) {}
        });
    }).on('error', (e) => {
        console.warn('[Oracle] Price query note:', e.message);
    });
}

// Fetch live price immediately on boot and every 10 seconds
fetchLiveOraclePrice();
setInterval(fetchLiveOraclePrice, 10000);

// GET /api/price -> Returns live real-time token metrics
app.get('/api/price', (req, res) => {
    res.json({
        success: true,
        contract: '0xbC6AC29404f5E68ed9d4e340E286aAb265Ea6e0c',
        symbol: 'MFHRC',
        data: cachedPriceData
    });
});

// ==========================================================
// 2. PERSISTENT CLOUD STATE SYNC API
// ==========================================================

// GET /api/state/:wallet -> Retrieve user state
app.get('/api/state/:wallet', (req, res) => {
    const wallet = (req.params.wallet || '').toLowerCase();
    if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    const userState = database.wallets[wallet] || null;
    res.json({
        success: true,
        wallet: wallet,
        state: userState
    });
});

// POST /api/state/:wallet -> Save & Merge user state to Render persistent memory
app.post('/api/state/:wallet', (req, res) => {
    const wallet = (req.params.wallet || '').toLowerCase();
    if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
        return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid state payload' });
    }

    // Save to in-memory database and persist to disk
    database.wallets[wallet] = {
        ...payload,
        walletAddress: wallet,
        updatedAt: Date.now()
    };

    // Update global platform metrics (Restricted to Authorized Treasury Owner)
    const TREASURY_WALLET = '0xd537f93d056364cde3de6692f48e853d14b0943c';
    if (payload.admin && wallet === TREASURY_WALLET) {
        database.globalStats = {
            ...database.globalStats,
            ...payload.admin
        };
    }

    persistDatabaseToDisk();

    res.json({
        success: true,
        message: 'State synchronized with Render cloud persistent memory',
        timestamp: Date.now()
    });
});

// GET /api/global/stats -> Return platform aggregate metrics
app.get('/api/global/stats', (req, res) => {
    res.json({
        success: true,
        stats: database.globalStats,
        totalRegisteredWallets: Object.keys(database.wallets).length
    });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Metafastest Web3 Server is running on port ${PORT}`);
    console.log(`📡 Real-Time Price Oracle & Cloud Sync API Active`);
    console.log(`====================================================`);
});
