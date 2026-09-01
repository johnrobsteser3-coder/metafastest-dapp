/**
 * Metafastest Riders Club - Web3 Decentralized App Engine
 * High-performance, reactive, and persistent state architecture.
 */

const STORAGE_KEY = 'metafastest_dapp_state_v3';

// Default Clean Seed State (Brand New Member)
const DEFAULT_STATE = {
    connected: false,
    walletAddress: '',
    contractAddress: '0xbC6AC29404f5E68ed9d4e340E286aAb265Ea6e0c',
    treasuryAddress: '0xd537F93d056364CDE3De6692F48e853d14b0943c',
    chainId: 56,
    networkName: 'BNB Smart Chain Mainnet',
    mhrBalance: 0.00,
    usdtBalance: 0.00,
    mhrPriceUsdt: 0.185, // 1 MFHRC = 0.185 USDT
    unclaimedRewards: 0.00, // USDT Rewards from Staking Packages
    unclaimedMhrRewards: 0.00, // MFHRC Token Rewards from NFT Horses
    totalEarnings: 0.00,
    rank: 'New Rider',
    rankTier: 0, // 0: New Rider, 1: Knight, 2: Earl, 3: Grand Master, 4: Royal Rider, 5: Metafastest Legend
    
    // User Profile (Clean initial state)
    userProfile: {
        fullName: '',
        nickname: '',
        birthday: '',
        email: '',
        contactNo: '',
        referralCode: '',
        referralLink: '',
        kycStatus: 'Unverified', // Unverified, Pending, Verified
        twoFactor: false,
        sponsor: '0x0000...0000 (Direct Platform)'
    },

    // Package Catalog
    packageCatalog: [
        { id: 'starter', name: 'Starter Package', price: 100, dailyRate: 0.8, duration: 180, icon: '🌱', popular: false },
        { id: 'explorer', name: 'Explorer Package', price: 500, dailyRate: 0.85, duration: 180, icon: '🧭', popular: false },
        { id: 'premium', name: 'Premium Package', price: 1000, dailyRate: 0.9, duration: 180, icon: '🐎', popular: true },
        { id: 'riders', name: 'Riders Package', price: 5000, dailyRate: 1.1, duration: 180, icon: '⚡', popular: false },
        { id: 'vip', name: 'VIP Riders Package', price: 10000, dailyRate: 1.2, duration: 180, icon: '👑', popular: true },
        { id: 'legend', name: 'Legendary Founder', price: 25000, dailyRate: 1.5, duration: 180, icon: '🏆', popular: false }
    ],

    // Active Packages Subscriptions (Clean empty array)
    myPackages: [],

    // NFT Horse Catalog (5D Photoreal Masterpieces)
    nftCatalog: [
        { id: 'nft-common', name: 'Cyber Stallion', tier: 'Common', price: 100, dailyMhrYield: 10, speed: '72 km/h', stamina: '80/100', winRate: '64%', img: 'assets/nft-cyber-stallion.jpg?v=20260831_5d' },
        { id: 'nft-rare', name: 'Solar Stallion', tier: 'Rare', price: 200, dailyMhrYield: 20, speed: '85 km/h', stamina: '88/100', winRate: '76%', img: 'assets/nft-solar-stallion.jpg?v=20260831_5d' },
        { id: 'nft-epic', name: 'Valkyrie Storm', tier: 'Epic', price: 380, dailyMhrYield: 40, speed: '94 km/h', stamina: '94/100', winRate: '88%', img: 'assets/nft-valkyrie-storm.jpg?v=20260831_5d' },
        { id: 'nft-legendary', name: 'God of Speed', tier: 'Legendary', price: 600, dailyMhrYield: 100, speed: '110 km/h', stamina: '99/100', winRate: '96%', img: 'assets/nft-god-of-speed.jpg?v=20260831_5d' }
    ],

    // Owned NFT Horses (Clean empty array)
    myNFTs: [],

    // Bonuses Breakdown (Clean 0.00)
    bonuses: {
        direct: 0.00,
        unilevel: 0.00,
        ranking: 0.00,
        dailyYield: 0.00,
        nftRewards: 0.00
    },

    // Referrals Data (5-Tier Canonical 19% Total Unilevel)
    referrals: {
        directCount: 0,
        teamCount: 0,
        teamVolume: 0.00,
        unilevelTiers: [
            { level: 1, rate: '10%', count: 0, volume: 0.00, earned: 0.00 },
            { level: 2, rate: '4%', count: 0, volume: 0.00, earned: 0.00 },
            { level: 3, rate: '3%', count: 0, volume: 0.00, earned: 0.00 },
            { level: 4, rate: '1%', count: 0, volume: 0.00, earned: 0.00 },
            { level: 5, rate: '1%', count: 0, volume: 0.00, earned: 0.00 }
        ],
        directList: []
    },

    // Transaction History Ledger
    transactions: [],

    // Admin Metrics
    admin: {
        totalTvl: 0.00,
        activeRiders: 0,
        totalMintedMhr: 0,
        reserveVaultUsdt: 0.00,
        pendingWithdrawals: []
    }
};

// Global App State Instance (Loaded from localStorage or defaults)
let state = loadPersistentState();

// Save state helper
function savePersistentState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadPersistentState() {
    let s = null;
    try {
        localStorage.removeItem('metafastest_dapp_state');
        localStorage.removeItem('metafastest_dapp_state_v2');

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            s = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
    if (!s) {
        s = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    // Ensure catalog is always synchronized
    if (s.nftCatalog) {
        s.nftCatalog = DEFAULT_STATE.nftCatalog;
    }
    if (s.packageCatalog) {
        s.packageCatalog = DEFAULT_STATE.packageCatalog;
    }

    if (typeof s.unclaimedMhrRewards === 'undefined') {
        s.unclaimedMhrRewards = 0.00;
    }
    s.contractAddress = '0xbC6AC29404f5E68ed9d4e340E286aAb265Ea6e0c';
    s.treasuryAddress = '0xd537F93d056364CDE3De6692F48e853d14b0943c';

    return s;
}

// Reset data to defaults
function resetAppToDefaults() {
    if (confirm('Reset all DApp data and test balances to clean initial state?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        updateAllViews();
        showToast('App state successfully reset to clean initial state.', 'info');
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWalletEngine();
    initSubTabs();
    initYieldAccumulator();
    detectReferralParam();

    // Initial View setup based on wallet connection
    if (state.connected && state.walletAddress) {
        showAppDashboard();
    } else {
        showLandingView();
    }

    updateAllViews();
});

// ==========================================================
// 1. PUBLIC LANDING HOMEPAGE vs MEMBERS DAPP PORTAL ROUTING
// ==========================================================

function switchPortalView(view) {
    if (view === 'landing') {
        showLandingView();
    } else {
        if (!state.connected || !state.walletAddress) {
            connectWeb3Wallet();
        } else {
            showAppDashboard();
        }
    }
}

function showAppDashboard() {
    const landingView = document.getElementById('landingView') || document.getElementById('loginView');
    const dappView = document.getElementById('dapp-portal-view');
    if (landingView) landingView.style.display = 'none';
    if (dappView) dappView.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateAllViews();
}

function showLoginView() {
    showLandingView();
}

function showLandingView() {
    const landingView = document.getElementById('landingView') || document.getElementById('loginView');
    const dappView = document.getElementById('dapp-portal-view');
    if (landingView) landingView.style.display = 'flex';
    if (dappView) dappView.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateAllViews();
}

function scrollToConnectOrConnect() {
    if (state.connected && state.walletAddress) {
        showAppDashboard();
        return;
    }

    if (window.ethereum) {
        connectWeb3Wallet();
    } else {
        const card = document.getElementById('gatewayCard') || document.getElementById('manualWalletInput');
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = document.getElementById('manualWalletInput');
            if (input) setTimeout(() => input.focus(), 500);
        }
    }
}

function handleLandingConnect() {
    scrollToConnectOrConnect();
}

function toggleLandingFaq(btn) {
    if (!btn) return;
    const item = btn.closest('.faq-accordion-item');
    if (item) {
        item.classList.toggle('active');
    }
}

function saveLandingSponsor() {
    const input = document.getElementById('landing-modal-sponsor-input');
    const code = input ? input.value.trim() : '';
    if (code) {
        state.userProfile.sponsor = code;
        savePersistentState();
        showToast(`🤝 Sponsor set: ${code}`, 'success');
    }
    closeModal('modal-landing-sponsor');
    scrollToConnectOrConnect();
}

function connectManualWalletAddress() {
    const input = document.getElementById('manualWalletInput');
    const sponsorInput = document.getElementById('loginSponsorInput');
    let address = input ? input.value.trim() : '';

    if (!address) {
        showToast('⚠️ Please enter your EVM wallet address (0x...)', 'warning');
        return;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        showToast('⚠️ Please enter a valid 42-character EVM wallet address (0x...)', 'warning');
        return;
    }

    if (sponsorInput && sponsorInput.value.trim()) {
        state.userProfile.sponsor = sponsorInput.value.trim();
    }

    state.walletAddress = address;
    state.connected = true;
    syncUserProfileWalletState();
    savePersistentState();
    showAppDashboard();
    showToast(`🔑 Wallet Connected: ${shortenAddress(address)}`, 'success');
}

function syncUserProfileWalletState() {
    if (!state.walletAddress) return;
    const cleanShort = shortenAddress(state.walletAddress).replace('...', '');
    state.userProfile.referralCode = `MFHRC-${cleanShort.toUpperCase()}`;
    const origin = window.location.origin || 'https://metafastest-dapp.onrender.com';
    state.userProfile.referralLink = `${origin}/?ref=${state.walletAddress}`;
    evaluateRank();
    fetchLiveOnChainBalances();
}

async function fetchLiveOnChainBalances() {
    if (!state.walletAddress || !state.connected) return;
    try {
        if (typeof window.ethereum !== 'undefined') {
            const cleanAddr = state.walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
            const mfhrcCallData = '0x70a08231' + cleanAddr;
            
            // Query MFHRC BEP-20 Balance via connected provider
            try {
                const mfhrcHex = await window.ethereum.request({
                    method: 'eth_call',
                    params: [{ to: state.contractAddress, data: mfhrcCallData }, 'latest']
                });
                if (mfhrcHex && mfhrcHex !== '0x') {
                    const rawBig = BigInt(mfhrcHex);
                    const div = 10n ** 18n;
                    const whole = rawBig / div;
                    const rem = rawBig % div;
                    const liveBalance = Number(whole) + Number(rem) / 1e18;
                    if (!isNaN(liveBalance)) {
                        state.mhrBalance = liveBalance;
                    }
                }
            } catch (e) {
                console.warn('MFHRC live balance query note:', e.message);
            }

            // Query BNB Gas Balance
            try {
                const bnbHex = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [state.walletAddress, 'latest']
                });
                if (bnbHex && bnbHex !== '0x') {
                    state.bnbBalance = Number(BigInt(bnbHex)) / 1e18;
                }
            } catch (e) {}

            savePersistentState();
            updateAllViews();
        }
    } catch (err) {
        console.warn('Live balance sync:', err);
    }
}

function handleLogout() {
    if (confirm('Disconnect wallet session and return to Public Home Page?')) {
        state.connected = false;
        state.walletAddress = '';
        savePersistentState();
        showLandingView();
        showToast('Wallet disconnected. Returned to Public Home Page.', 'info');
    }
}

function detectReferralParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('sponsor') || urlParams.get('r');
    if (refCode) {
        state.userProfile.sponsor = refCode.trim();
        savePersistentState();
        
        const banner = document.getElementById('loginRefBanner');
        const refText = document.getElementById('loginRefText');
        const sponsorInput = document.getElementById('loginSponsorInput');
        
        if (banner && refText) {
            refText.textContent = `🌟 Sponsor Invitation: ${refCode.trim()}`;
            banner.style.display = 'flex';
        }
        if (sponsorInput) {
            sponsorInput.value = refCode.trim();
        }
        showToast(`🎁 Referral Code Detected: ${refCode.trim()}`, 'success');
    }
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-menu .nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-menu .nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-menu .nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const dashView = document.getElementById('view-dashboard');
        if (dashView) {
            dashView.style.display = 'block';
            dashView.classList.add('active');
        }
    }

    // Refresh targeted sub-views
    if (tabId === 'packages') renderPackagesView();
    if (tabId === 'nft-horses') renderNFTView();
    if (tabId === 'transactions') renderTransactionsView('all');
    if (tabId === 'referrals') renderReferralsView(1);
    if (tabId === 'admin') renderAdminView();
    if (tabId === 'wallet') renderWalletView();
    if (tabId === 'bonuses') renderBonusesView();
    if (tabId === 'rankings') updateRankingHighlight();
    if (tabId === 'profile') renderProfileView();
}

function initSubTabs() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sub-tab-btn')) {
            const parent = e.target.closest('.sub-tabs-bar');
            if (parent) {
                parent.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        }
    });
}

// ==========================================================
// 2. REAL WEB3 & METAMASK WALLET ENGINE
// ==========================================================
function initWalletEngine() {
    const btn = document.getElementById('btn-connect-wallet');
    if (btn) {
        btn.addEventListener('click', () => {
            connectWeb3Wallet();
        });
    }

    // Listen for MetaMask Provider events
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                state.walletAddress = accounts[0];
                state.connected = true;
                syncUserProfileWalletState();
                showToast(`Switched Web3 Account: ${shortenAddress(state.walletAddress)}`, 'info');
            } else {
                state.connected = false;
                showToast('Web3 Wallet Disconnected', 'warning');
            }
            savePersistentState();
            updateAllViews();
        });

        window.ethereum.on('chainChanged', (chainIdHex) => {
            const chainId = parseInt(chainIdHex, 16);
            state.chainId = chainId;
            state.networkName = chainId === 56 ? 'BNB Smart Chain Mainnet' : (chainId === 97 ? 'BSC Testnet' : `Chain ID ${chainId}`);
            showToast(`Network switched: ${state.networkName}`, 'info');
            savePersistentState();
            updateAllViews();
        });
    }
}

async function connectWeb3Wallet() {
    const sponsorInput = document.getElementById('loginSponsorInput');
    if (sponsorInput && sponsorInput.value.trim()) {
        state.userProfile.sponsor = sponsorInput.value.trim();
    }

    if (typeof window.ethereum !== 'undefined') {
        try {
            showToast('Connecting Web3 Wallet to BNB Smart Chain...', 'info');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts && accounts.length > 0) {
                state.walletAddress = accounts[0];
                state.connected = true;

                try {
                    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
                    state.chainId = parseInt(chainIdHex, 16);
                    state.networkName = state.chainId === 56 ? 'BNB Smart Chain Mainnet' : (state.chainId === 97 ? 'BSC Testnet' : `Chain ID ${state.chainId}`);
                } catch (e) {}

                syncUserProfileWalletState();
                savePersistentState();
                showAppDashboard();
                showToast(`🚀 Web3 Connected: ${shortenAddress(state.walletAddress)}`, 'success');
                return;
            }
        } catch (err) {
            console.warn('MetaMask connect error or timeout, falling back to secure active session:', err.message);
        }
    }

    // If no Web3 provider is active or user rejected, prompt clean manual login
    if (!state.walletAddress || state.walletAddress === '0x0000000000000000000000000000000000000000') {
        showToast('💡 MetaMask not detected or connection cancelled. Please enter your wallet address to login.', 'info');
        showLoginView();
        return;
    }
    state.connected = true;
    syncUserProfileWalletState();
    savePersistentState();
    showAppDashboard();
    showToast(`🚀 Connected: ${shortenAddress(state.walletAddress)}`, 'success');
}

// ==========================================================
// 3. REAL-TIME YIELD ACCUMULATOR & STAKING ENGINE
// ==========================================================
function initYieldAccumulator() {
    setInterval(() => {
        let usdtYieldTick = 0;
        let mhrYieldTick = 0;

        // 1. Accrue package daily rate in USDT
        if (state.myPackages && state.myPackages.length > 0) {
            state.myPackages.forEach(pkg => {
                if ((pkg.daysElapsed || 0) < (pkg.totalDays || 180)) {
                    const dailyUsdt = pkg.price * (pkg.dailyRate / 100);
                    const tickUsdt = dailyUsdt / 28800; // 86400 / 3 = 28800 ticks/day
                    pkg.totalEarned = (pkg.totalEarned || 0) + tickUsdt;
                    usdtYieldTick += tickUsdt;
                }
            });
        }

        // 2. Accrue NFT horse daily rate in native MFHRC tokens (only when staked!)
        if (state.myNFTs && state.myNFTs.length > 0) {
            state.myNFTs.forEach(nft => {
                if (nft.status !== 'Unstaked (Idle)') {
                    const dailyMhr = nft.dailyMhrYield || 10;
                    const tickMhr = dailyMhr / 28800;
                    nft.totalEarnedMhr = (parseFloat(nft.totalEarnedMhr) || 0) + tickMhr;
                    mhrYieldTick += tickMhr;
                }
            });
        }

        if (usdtYieldTick > 0 || mhrYieldTick > 0) {
            state.unclaimedRewards += usdtYieldTick;
            state.bonuses.dailyYield += usdtYieldTick;

            state.unclaimedMhrRewards = (state.unclaimedMhrRewards || 0) + mhrYieldTick;
            state.bonuses.nftRewards += (mhrYieldTick * state.mhrPriceUsdt);

            // Live update unclaimed DOM elements
            const unclaimedElem = document.getElementById('dash-unclaimed');
            if (unclaimedElem) {
                unclaimedElem.textContent = `$${state.unclaimedRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` +
                    (state.unclaimedMhrRewards > 0.01 ? ` + ${state.unclaimedMhrRewards.toFixed(2)} MFHRC` : '');
            }

            const walletUnclaimed = document.getElementById('wallet-page-unclaimed');
            if (walletUnclaimed) {
                walletUnclaimed.textContent = `$${state.unclaimedRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` +
                    (state.unclaimedMhrRewards > 0.01 ? ` + ${state.unclaimedMhrRewards.toFixed(2)} MFHRC` : '');
            }
        }
    }, 3000);
}

// ==========================================================
// 4. RANKING & PROGRESSION EVALUATION
// ==========================================================
function evaluateRank() {
    let totalPackageInvested = 0;
    if (state.myPackages && state.myPackages.length > 0) {
        state.myPackages.forEach(p => totalPackageInvested += p.price);
    }
    const teamVol = state.referrals.teamVolume || 0;

    let tier = 0;
    let rankName = 'New Rider';

    if (totalPackageInvested >= 25000 || teamVol >= 500000) {
        tier = 5;
        rankName = 'Metafastest Legend';
    } else if (totalPackageInvested >= 10000 || teamVol >= 150000) {
        tier = 4;
        rankName = 'Royal Rider';
    } else if (totalPackageInvested >= 5000 || teamVol >= 50000) {
        tier = 3;
        rankName = 'Grand Master';
    } else if (totalPackageInvested >= 1000 || teamVol >= 10000) {
        tier = 2;
        rankName = 'Earl';
    } else if (totalPackageInvested >= 500 || teamVol >= 2000) {
        tier = 1;
        rankName = 'Knight';
    }

    state.rankTier = tier;
    state.rank = rankName;
}

// ==========================================================
// 5. CORE ACTIONS: DEPOSIT, WITHDRAW, CLAIM, BUY, MINT, SWAP
// ==========================================================

function claimRewards() {
    const usdtToClaim = state.unclaimedRewards || 0;
    const mhrToClaim = state.unclaimedMhrRewards || 0;

    if (usdtToClaim < 0.01 && mhrToClaim < 0.01) {
        showToast('No unclaimed rewards available to claim.', 'warning');
        return;
    }

    state.usdtBalance += usdtToClaim;
    state.mhrBalance += mhrToClaim;
    state.totalEarnings += usdtToClaim + (mhrToClaim * state.mhrPriceUsdt);

    state.unclaimedRewards = 0;
    state.unclaimedMhrRewards = 0;

    const claimSummary = [];
    if (usdtToClaim >= 0.01) claimSummary.push(`+$${usdtToClaim.toFixed(2)} USDT`);
    if (mhrToClaim >= 0.01) claimSummary.push(`+${mhrToClaim.toFixed(2)} MFHRC`);

    logTransaction('Claim', 'Staking & NFT Rewards Claimed', claimSummary.join(' | '), 'Completed');
    savePersistentState();
    updateAllViews();
    showToast(`🚀 Successfully claimed ${claimSummary.join(' and ')} to wallet balances!`, 'success');
}

function openDepositModal() {
    const input = document.getElementById('input-deposit-amount');
    if (input) input.value = '500';
    const el = document.getElementById('modal-deposit');
    if (el) el.classList.add('active');
}

function confirmDeposit() {
    const input = document.getElementById('input-deposit-amount');
    const amount = parseFloat(input.value) || 0;
    if (amount < 10) {
        showToast('Please enter a valid deposit amount (Minimum 10 USDT).', 'warning');
        return;
    }

    state.usdtBalance += amount;
    logTransaction('Deposit', 'USDT Web3 Deposit (BEP-20)', `+${amount.toFixed(2)} USDT`, 'Completed');
    savePersistentState();
    updateAllViews();
    closeModal('modal-deposit');
    if (input) input.value = '';
    showToast(`✅ Web3 Deposit of $${amount.toFixed(2)} USDT confirmed on BNB Chain!`, 'success');
}

function openWithdrawModal() {
    const availElem = document.getElementById('withdraw-avail-note');
    if (availElem) availElem.textContent = `Available: $${state.usdtBalance.toFixed(2)} USDT`;
    const inputAmount = document.getElementById('input-withdraw-amount');
    const inputAddr = document.getElementById('input-withdraw-address');
    if (inputAmount) inputAmount.value = '';
    if (inputAddr) inputAddr.value = state.walletAddress || '';
    const el = document.getElementById('modal-withdraw');
    if (el) el.classList.add('active');
}

function confirmWithdrawal() {
    const inputAmount = document.getElementById('input-withdraw-amount');
    const inputAddr = document.getElementById('input-withdraw-address');
    const amount = parseFloat(inputAmount.value) || 0;
    const recipient = inputAddr ? inputAddr.value.trim() : '';

    if (amount < 10) {
        showToast('Please enter a valid withdrawal amount (Minimum 10 USDT).', 'warning');
        return;
    }
    if (amount > state.usdtBalance) {
        showToast(`Insufficient USDT balance. Maximum available: $${state.usdtBalance.toFixed(2)} USDT`, 'warning');
        return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        showToast('Please enter a valid 42-character BEP-20 wallet address.', 'warning');
        return;
    }

    state.usdtBalance -= amount;
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    logTransaction('Withdraw', `Withdrawal Request to ${shortenAddress(recipient)}`, `-${amount.toFixed(2)} USDT`, 'Pending');
    
    // Add to admin pending queue with status Pending
    state.admin.pendingWithdrawals.unshift({
        id: reqId,
        user: shortenAddress(recipient),
        rawAddress: recipient,
        amount: amount,
        token: 'USDT',
        requestedAt: 'Just now',
        status: 'Pending'
    });

    savePersistentState();
    updateAllViews();
    closeModal('modal-withdraw');
    if (inputAmount) inputAmount.value = '';
    showToast(`🚀 Withdrawal request of $${amount.toFixed(2)} USDT queued for execution!`, 'success');
}

let selectedPkg = null;
function openBuyModal(pkgName, price) {
    const pkg = state.packageCatalog.find(p => p.name === pkgName) || { name: pkgName, price: price, dailyRate: 1.0, duration: 180 };
    selectedPkg = pkg;
    
    const titleElem = document.getElementById('buy-pkg-title');
    if (titleElem) titleElem.textContent = `Join ${pkg.name}`;

    const descElem = document.getElementById('buy-pkg-desc');
    if (descElem) descElem.textContent = `Package Price: ${pkg.price.toLocaleString()} USDT | Daily Yield: ${pkg.dailyRate}% for ${pkg.duration} Days`;

    const el = document.getElementById('modal-buy-pkg');
    if (el) el.classList.add('active');
}

function confirmPackagePurchase() {
    if (!selectedPkg) return;
    if (state.usdtBalance < selectedPkg.price) {
        showToast(`Insufficient USDT balance ($${state.usdtBalance.toFixed(2)} USDT). Deposit at least ${selectedPkg.price} USDT.`, 'warning');
        closeModal('modal-buy-pkg');
        openDepositModal();
        return;
    }

    state.usdtBalance -= selectedPkg.price;
    const dailyPayout = selectedPkg.price * (selectedPkg.dailyRate / 100);
    
    state.myPackages.unshift({
        id: `pkg-${Date.now()}`,
        name: selectedPkg.name,
        price: selectedPkg.price,
        dailyRate: selectedPkg.dailyRate,
        dailyPayout: dailyPayout,
        startDate: new Date().toISOString().split('T')[0],
        startTime: Date.now(),
        daysElapsed: 0,
        totalDays: selectedPkg.duration || 180,
        totalEarned: 0,
        status: 'Active'
    });

    // Unilevel Referral Commission Execution
    if (state.userProfile.sponsor && state.userProfile.sponsor !== '0x0000...0000 (Direct Platform)') {
        const l1Bonus = selectedPkg.price * 0.10; // 10% Level 1 Direct
        state.bonuses.direct += l1Bonus;
        state.bonuses.unilevel += l1Bonus;
        state.referrals.teamVolume += selectedPkg.price;
        
        // Add to unilevel list if not already present
        const existingRef = state.referrals.directList.find(d => d.wallet.toLowerCase() === state.walletAddress.toLowerCase());
        if (!existingRef) {
            state.referrals.directCount += 1;
            state.referrals.teamCount += 1;
            state.referrals.directList.unshift({
                name: state.userProfile.fullName || `Rider ${shortenAddress(state.walletAddress)}`,
                wallet: state.walletAddress,
                package: selectedPkg.name,
                volume: selectedPkg.price,
                bonus: l1Bonus,
                status: 'Active',
                joined: new Date().toISOString().split('T')[0]
            });
        } else {
            existingRef.volume += selectedPkg.price;
            existingRef.bonus += l1Bonus;
            existingRef.package = selectedPkg.name;
        }

        // Update Tier 1 in Unilevel breakdown
        if (state.referrals.unilevelTiers && state.referrals.unilevelTiers[0]) {
            state.referrals.unilevelTiers[0].count = state.referrals.directCount;
            state.referrals.unilevelTiers[0].volume += selectedPkg.price;
            state.referrals.unilevelTiers[0].earned += l1Bonus;
        }
    }

    evaluateRank();
    logTransaction('Package', `Subscribed to ${selectedPkg.name}`, `-${selectedPkg.price.toLocaleString()} USDT`, 'Completed');
    savePersistentState();
    updateAllViews();
    closeModal('modal-buy-pkg');
    showToast(`🎉 Congratulations! Successfully joined ${selectedPkg.name}!`, 'success');
}

function mintNFTHorse(horseTier, price, dailyMhrYield) {
    const nftItem = state.nftCatalog.find(n => n.tier === horseTier || n.name.includes(horseTier)) || {
        name: `${horseTier} Horse`,
        tier: horseTier,
        price: price,
        dailyMhrYield: dailyMhrYield,
        speed: '85 km/h',
        stamina: '88/100',
        winRate: '76%',
        img: 'assets/nft-cyber-stallion.jpg'
    };

    if (state.usdtBalance < nftItem.price) {
        showToast(`Insufficient USDT balance ($${state.usdtBalance.toFixed(2)} USDT). Deposit at least ${nftItem.price} USDT to mint.`, 'warning');
        openDepositModal();
        return;
    }

    state.usdtBalance -= nftItem.price;
    const upfrontBonusMhr = nftItem.dailyMhrYield * 5;
    state.mhrBalance += upfrontBonusMhr;

    const mintedHorse = {
        id: `mhr-nft-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${nftItem.name} #${Math.floor(100 + Math.random() * 900)}`,
        tier: nftItem.tier,
        price: nftItem.price,
        dailyMhrYield: nftItem.dailyMhrYield,
        speed: nftItem.speed,
        stamina: nftItem.stamina,
        winRate: nftItem.winRate,
        status: 'Staked & Earning',
        totalEarnedMhr: upfrontBonusMhr,
        mintedAt: new Date().toISOString().split('T')[0],
        img: nftItem.img
    };

    state.myNFTs.unshift(mintedHorse);
    evaluateRank();
    logTransaction('NFT Mint', `Minted NFT Horse (${mintedHorse.name})`, `-${nftItem.price} USDT`, 'Completed');
    savePersistentState();
    updateAllViews();
    showToast(`🐎 Minted ${mintedHorse.name}! Earns +${nftItem.dailyMhrYield} MFHRC/day. Upfront +${upfrontBonusMhr} MFHRC bonus credited!`, 'success');
}

// DeFi Swap Engine: MFHRC <-> USDT
function openSwapModal() {
    const el = document.getElementById('modal-swap');
    if (el) el.classList.add('active');
    updateSwapQuote();
}

let swapDirection = 'MHR_TO_USDT'; // or 'USDT_TO_MHR'
function switchSwapDirection() {
    swapDirection = swapDirection === 'MHR_TO_USDT' ? 'USDT_TO_MHR' : 'MHR_TO_USDT';
    const fromLabel = document.getElementById('swap-from-token');
    const toLabel = document.getElementById('swap-to-token');
    if (fromLabel && toLabel) {
        if (swapDirection === 'MHR_TO_USDT') {
            fromLabel.textContent = 'MFHRC';
            toLabel.textContent = 'USDT';
        } else {
            fromLabel.textContent = 'USDT';
            toLabel.textContent = 'MFHRC';
        }
    }
    updateSwapQuote();
}

function updateSwapQuote() {
    const input = document.getElementById('swap-from-amount');
    const output = document.getElementById('swap-to-amount');
    const rateElem = document.getElementById('swap-rate-text');
    const balElem = document.getElementById('swap-from-bal');
    if (!input || !output) return;

    if (balElem) {
        balElem.textContent = swapDirection === 'MHR_TO_USDT' ? (state.mhrBalance || 0).toFixed(2) : (state.usdtBalance || 0).toFixed(2);
    }

    const amount = parseFloat(input.value) || 0;
    if (swapDirection === 'MHR_TO_USDT') {
        const received = amount * state.mhrPriceUsdt * 0.997; // 0.3% fee
        output.value = received.toFixed(2);
        if (rateElem) rateElem.textContent = `1 MFHRC = $${state.mhrPriceUsdt} USDT (0.3% LP Fee)`;
    } else {
        const received = (amount / state.mhrPriceUsdt) * 0.997;
        output.value = received.toFixed(2);
        if (rateElem) rateElem.textContent = `1 USDT = ${(1 / state.mhrPriceUsdt).toFixed(2)} MFHRC (0.3% LP Fee)`;
    }
}

function executeSwap() {
    const input = document.getElementById('swap-from-amount');
    const amount = parseFloat(input.value) || 0;
    if (amount <= 0) {
        showToast('Please enter an amount to swap.', 'warning');
        return;
    }

    if (swapDirection === 'MHR_TO_USDT') {
        if (state.mhrBalance < amount) {
            showToast(`Insufficient MFHRC balance (${state.mhrBalance.toFixed(2)} MFHRC).`, 'warning');
            return;
        }
        const receivedUsdt = amount * state.mhrPriceUsdt * 0.997;
        state.mhrBalance -= amount;
        state.usdtBalance += receivedUsdt;
        logTransaction('Swap', `Swapped ${amount.toFixed(2)} MFHRC for USDT`, `+${receivedUsdt.toFixed(2)} USDT`, 'Completed');
        showToast(`💱 Swapped ${amount.toFixed(2)} MFHRC for $${receivedUsdt.toFixed(2)} USDT!`, 'success');
    } else {
        if (state.usdtBalance < amount) {
            showToast(`Insufficient USDT balance ($${state.usdtBalance.toFixed(2)} USDT).`, 'warning');
            return;
        }
        const receivedMhr = (amount / state.mhrPriceUsdt) * 0.997;
        state.usdtBalance -= amount;
        state.mhrBalance += receivedMhr;
        logTransaction('Swap', `Swapped ${amount.toFixed(2)} USDT for MFHRC`, `+${receivedMhr.toFixed(2)} MFHRC`, 'Completed');
        showToast(`💱 Swapped $${amount.toFixed(2)} USDT for ${receivedMhr.toFixed(2)} MFHRC!`, 'success');
    }

    if (input) input.value = '';
    savePersistentState();
    updateAllViews();
    closeModal('modal-swap');
}

// User Profile Update
function saveUserProfile() {
    const fullName = document.getElementById('edit-fullname') ? document.getElementById('edit-fullname').value.trim() : '';
    const nickname = document.getElementById('edit-nickname') ? document.getElementById('edit-nickname').value.trim() : '';
    const email = document.getElementById('edit-email') ? document.getElementById('edit-email').value.trim() : '';
    const phone = document.getElementById('edit-phone') ? document.getElementById('edit-phone').value.trim() : '';
    const birthday = document.getElementById('edit-birthday') ? document.getElementById('edit-birthday').value.trim() : '';

    if (fullName) state.userProfile.fullName = fullName;
    if (nickname) state.userProfile.nickname = nickname;
    if (email) state.userProfile.email = email;
    if (phone) state.userProfile.contactNo = phone;
    if (birthday) state.userProfile.birthday = birthday;

    savePersistentState();
    updateAllViews();
    showToast('Profile updated successfully!', 'success');
}

function submitKYCVerification() {
    state.userProfile.kycStatus = 'Verified';
    savePersistentState();
    updateAllViews();
    closeModal('modal-kyc');
    showToast('✅ Identity & KYC Verification documents approved!', 'success');
}

// ==========================================================
// 6. VIEW RENDERERS FOR ALL 10 TABS
// ==========================================================

function updateAllViews() {
    const isConn = Boolean(state.connected && state.walletAddress);
    const formattedAddr = isConn ? shortenAddress(state.walletAddress) : 'Not Connected';
    const displayName = (state.userProfile && state.userProfile.fullName) ? state.userProfile.fullName : (isConn ? 'Connected Member' : 'New Rider');

    evaluateRank();

    // 1. Top Header Stats
    const headerAhr = document.getElementById('header-ahr-balance');
    if (headerAhr) headerAhr.textContent = (state.mhrBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MFHRC';

    const headerUsdt = document.getElementById('header-usdt-balance');
    if (headerUsdt) headerUsdt.textContent = '$' + (state.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';

    const walletBtnText = document.getElementById('wallet-btn-text');
    if (walletBtnText) walletBtnText.textContent = isConn ? shortenAddress(state.walletAddress) : 'Connect Wallet';

    const userNameElem = document.querySelector('.user-name');
    if (userNameElem) userNameElem.textContent = displayName;

    const rankBadgeElem = document.getElementById('header-rank-badge');
    if (rankBadgeElem) rankBadgeElem.textContent = state.rank || 'New Rider';

    // 2. Dashboard Balances
    const dashAvail = document.getElementById('dash-avail-balance');
    if (dashAvail) dashAvail.textContent = '$' + (state.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';

    const dashUnclaimed = document.getElementById('dash-unclaimed');
    if (dashUnclaimed) {
        dashUnclaimed.textContent = '$' + (state.unclaimedRewards || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT' +
            (state.unclaimedMhrRewards > 0.01 ? ` + ${state.unclaimedMhrRewards.toFixed(2)} MFHRC` : '');
    }

    const dashTotal = document.getElementById('dash-total-earnings');
    if (dashTotal) dashTotal.textContent = '$' + (state.totalEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';

    // 3. Dashboard Profile Card
    const profName = document.getElementById('dash-prof-fullname');
    if (profName) profName.textContent = (state.userProfile && state.userProfile.fullName) ? state.userProfile.fullName : 'Not Set';

    const profEmail = document.getElementById('dash-prof-email');
    if (profEmail) profEmail.textContent = (state.userProfile && state.userProfile.email) ? state.userProfile.email : 'Not Set';

    const profPhone = document.getElementById('dash-prof-phone');
    if (profPhone) profPhone.textContent = (state.userProfile && state.userProfile.contactNo) ? state.userProfile.contactNo : 'Not Set';

    const profBday = document.getElementById('dash-prof-bday');
    if (profBday) profBday.textContent = (state.userProfile && state.userProfile.birthday) ? state.userProfile.birthday : 'Not Set';

    const profAddr = document.getElementById('profile-wallet-address');
    if (profAddr) profAddr.textContent = formattedAddr;

    const dynamicRefLink = isConn ? (state.userProfile.referralLink || `https://metafastest.io/ref/${shortenAddress(state.walletAddress).replace('...','')}`) : 'Connect wallet to generate referral link';

    const dashRefLink = document.getElementById('dash-ref-link-display');
    if (dashRefLink) dashRefLink.textContent = dynamicRefLink;

    const dashRefBox = document.getElementById('dash-ref-link-box');
    if (dashRefBox) dashRefBox.textContent = dynamicRefLink;

    const dashRefQr = document.getElementById('dash-ref-qr-img');
    if (dashRefQr) {
        const qrUrl = isConn ? (state.userProfile.referralLink || 'https://metafastest.io') : 'https://metafastest.io';
        dashRefQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
    }

    // 4. Dashboard Bonus Overview Card
    const bDirect = document.getElementById('bonus-direct-val');
    if (bDirect) bDirect.textContent = '$' + (state.bonuses.direct || 0).toFixed(2) + ' USDT';

    const bUnilevel = document.getElementById('bonus-unilevel-val');
    if (bUnilevel) bUnilevel.textContent = '$' + (state.bonuses.unilevel || 0).toFixed(2) + ' USDT';

    const bRank = document.getElementById('bonus-ranking-val');
    if (bRank) bRank.textContent = '$' + (state.bonuses.ranking || 0).toFixed(2) + ' USDT';

    const bDaily = document.getElementById('bonus-daily-val');
    if (bDaily) bDaily.textContent = '$' + (state.bonuses.dailyYield || 0).toFixed(2) + ' USDT';

    const bNft = document.getElementById('bonus-nft-val');
    if (bNft) bNft.textContent = '$' + (state.bonuses.nftRewards || 0).toFixed(2) + ' USDT';

    // 5. Dashboard Breakdown by Source Card
    const sDirect = document.getElementById('src-direct-val');
    if (sDirect) sDirect.textContent = '$' + (state.bonuses.direct || 0).toFixed(2) + ' USDT';

    const sUnilevel = document.getElementById('src-unilevel-val');
    if (sUnilevel) sUnilevel.textContent = '$' + (state.bonuses.unilevel || 0).toFixed(2) + ' USDT';

    const sDaily = document.getElementById('src-daily-val');
    if (sDaily) sDaily.textContent = '$' + (state.bonuses.dailyYield || 0).toFixed(2) + ' USDT';

    const sRank = document.getElementById('src-ranking-val');
    if (sRank) sRank.textContent = '$' + (state.bonuses.ranking || 0).toFixed(2) + ' USDT';

    // 6. Dashboard Referral Stats
    const dashRefDir = document.getElementById('dash-ref-direct');
    if (dashRefDir) dashRefDir.textContent = `${state.referrals.directCount || 0} Members`;

    const dashRefTm = document.getElementById('dash-ref-team');
    if (dashRefTm) dashRefTm.textContent = `${state.referrals.teamCount || 0} Members`;

    const dashRefVol = document.getElementById('dash-ref-volume');
    if (dashRefVol) dashRefVol.textContent = '$' + (state.referrals.teamVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';

    // 7. Sync Landing Page Connected States & Buttons
    const landingConnBar = document.getElementById('landing-connected-bar');
    const landingConnAddr = document.getElementById('landing-connected-addr');
    const navLandingBtn = document.getElementById('nav-landing-connect-btn');
    const heroConnectBtn = document.getElementById('hero-connect-btn');
    
    if (isConn) {
        if (landingConnBar) landingConnBar.style.display = 'flex';
        if (landingConnAddr) landingConnAddr.textContent = shortenAddress(state.walletAddress);
        if (navLandingBtn) {
            navLandingBtn.innerHTML = `<i class="fa-solid fa-gauge-high"></i> Members Portal`;
            navLandingBtn.onclick = () => switchPortalView('dapp');
        }
        if (heroConnectBtn) {
            heroConnectBtn.innerHTML = `<i class="fa-solid fa-gauge-high"></i> Enter Members Dashboard`;
            heroConnectBtn.onclick = () => switchPortalView('dapp');
        }
    } else {
        if (landingConnBar) landingConnBar.style.display = 'none';
        if (navLandingBtn) {
            navLandingBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Connect Wallet`;
            navLandingBtn.onclick = () => handleLandingConnect();
        }
        if (heroConnectBtn) {
            heroConnectBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Connect Wallet & Enter Portal`;
            heroConnectBtn.onclick = () => handleLandingConnect();
        }
    }

    // 8. Update Rankings
    updateRankingHighlight();

    // 9. Render All Sub-Views
    renderPackagesView();
    renderNFTView();
    renderWalletView();
    renderTransactionsView('all');
    renderReferralsView(1);
    renderAdminView();
    renderProfileView();
    renderBonusesView();
}

function updateRankingHighlight() {
    evaluateRank();
    const tier = state.rankTier || 0;
    
    // Update dashboard ranking card
    for (let i = 0; i <= 5; i++) {
        const item = document.getElementById(`rank-step-${i}`);
        if (item) {
            if (i === tier) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    }

    // Update main ranking track
    for (let i = 0; i <= 5; i++) {
        const step = document.getElementById(`track-step-${i}`);
        if (step) {
            step.className = 'ranking-step';
            if (i < tier) {
                step.classList.add('completed');
            } else if (i === tier) {
                step.classList.add('current');
            }
        }
    }
}

function renderProfileView() {
    const nameInput = document.getElementById('edit-fullname');
    if (nameInput) nameInput.value = state.userProfile.fullName || '';

    const nickInput = document.getElementById('edit-nickname');
    if (nickInput) nickInput.value = state.userProfile.nickname || '';

    const emailInput = document.getElementById('edit-email');
    if (emailInput) emailInput.value = state.userProfile.email || '';

    const phoneInput = document.getElementById('edit-phone');
    if (phoneInput) phoneInput.value = state.userProfile.contactNo || '';

    const bdayInput = document.getElementById('edit-birthday');
    if (bdayInput) bdayInput.value = state.userProfile.birthday || '';

    const sponsorInput = document.getElementById('edit-sponsor');
    if (sponsorInput) sponsorInput.value = state.userProfile.sponsor || '0x0000...0000 (Direct Platform)';

    const kycBadge = document.getElementById('profile-kyc-badge');
    if (kycBadge) {
        kycBadge.className = `badge-pill badge-${state.userProfile.kycStatus === 'Verified' ? 'success' : 'warning'}`;
        kycBadge.textContent = state.userProfile.kycStatus || 'Unverified';
    }
}

function renderPackagesView() {
    const myPkgContainer = document.getElementById('my-active-packages-list');
    if (myPkgContainer) {
        if (!state.myPackages || state.myPackages.length === 0) {
            myPkgContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No active packages yet. Choose a package below to start earning daily yield.</p>`;
        } else {
            myPkgContainer.innerHTML = state.myPackages.map(pkg => {
                const totalTargetReturn = pkg.price * (pkg.dailyRate / 100) * (pkg.totalDays || 180);
                const progressPercent = Math.min(100, Math.round(((pkg.totalEarned || 0) / totalTargetReturn) * 100));
                return `
                    <div class="package-item">
                        <div class="package-icon">🐎</div>
                        <div class="package-details">
                            <div class="package-name">${pkg.name}</div>
                            <div class="package-price">${pkg.price.toLocaleString()} USDT &bull; <span style="font-size: 12px; color: var(--accent-green);">+${pkg.dailyPayout.toFixed(2)} USDT/day</span></div>
                            <div class="package-yield">Started: ${pkg.startDate} | Term: ${pkg.totalDays || 180} Days | Accrued: $${(pkg.totalEarned || 0).toFixed(2)} USDT (${progressPercent}% of target)</div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${Math.max(2, progressPercent)}%;"></div>
                            </div>
                        </div>
                        <span class="badge-pill badge-success">${pkg.status}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

function renderNFTView() {
    const stablesContainer = document.getElementById('my-stables-container');
    if (stablesContainer) {
        if (!state.myNFTs || state.myNFTs.length === 0) {
            stablesContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No NFT Horses in your stable yet. Mint below to unlock daily MFHRC tokens.</p>`;
        } else {
            stablesContainer.innerHTML = state.myNFTs.map(nft => {
                const speedVal = parseInt(nft.speed) || 80;
                const staminaVal = parseInt(nft.stamina) || 85;
                const isStaked = nft.status !== 'Unstaked (Idle)';
                return `
                <div class="stable-card">
                    <div style="position: relative;">
                        <img src="${nft.img}" alt="${nft.name}" class="stable-card-img">
                        <span class="badge-pill badge-gold" style="position: absolute; top: 12px; left: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.8);">${nft.tier} Tier</span>
                        <span class="badge-pill ${!isStaked ? 'badge-warning' : 'badge-success'}" style="position: absolute; top: 12px; right: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.8);">${isStaked ? 'Staked & Earning' : 'Unstaked (Idle)'}</span>
                    </div>
                    <div class="stable-card-body">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <h4 style="font-family: var(--font-heading); color: #fff; font-size: 16px;">${nft.name}</h4>
                            <span style="font-size: 11px; color: var(--text-muted);">${nft.mintedAt}</span>
                        </div>

                        <div style="color: ${isStaked ? 'var(--accent-green)' : 'var(--accent-orange)'}; font-weight: 700; font-size: 13px; margin-bottom: 12px;">
                            <i class="fa-solid fa-bolt"></i> ${isStaked ? `+${nft.dailyMhrYield} MFHRC Daily Staking Yield` : 'Staking Paused (Unstaked)'}
                        </div>

                        <div class="attribute-row">
                            <span><i class="fa-solid fa-gauge-high"></i> Speed Rating</span>
                            <strong style="color: #fff;">${nft.speed || '85 km/h'}</strong>
                        </div>
                        <div class="attribute-bar">
                            <div class="attribute-fill" style="width: ${Math.min(100, speedVal)}%;"></div>
                        </div>

                        <div class="attribute-row">
                            <span><i class="fa-solid fa-heart-pulse"></i> Stamina</span>
                            <strong style="color: #fff;">${nft.stamina || '88/100'}</strong>
                        </div>
                        <div class="attribute-bar">
                            <div class="attribute-fill" style="width: ${Math.min(100, staminaVal)}%;"></div>
                        </div>

                        <div class="attribute-row">
                            <span><i class="fa-solid fa-trophy"></i> Career Win Rate</span>
                            <strong style="color: var(--gold-light);">${nft.winRate || '76%'}</strong>
                        </div>

                        <div class="attribute-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
                            <span>Total Staking & Racing Earned</span>
                            <strong style="color: var(--gold-primary); font-family: var(--font-heading); font-size: 14px;">${typeof nft.totalEarnedMhr === 'number' ? nft.totalEarnedMhr.toFixed(2) : (parseFloat(nft.totalEarnedMhr) || 0).toFixed(2)} MFHRC</strong>
                        </div>

                        <div style="display: flex; gap: 8px; margin-top: 14px;">
                            <button id="race-btn-${nft.id}" class="btn-gold" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center;" onclick="enterCyberRace('${nft.id}')">
                                <i class="fa-solid fa-flag-checkered"></i> Race Derby
                            </button>
                            <button class="btn-outline-gold" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center;" onclick="toggleStakeNFT('${nft.id}')">
                                <i class="fa-solid fa-shield-halved"></i> ${!isStaked ? 'Stake' : 'Unstake'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
}

let raceInProgress = false;
function enterCyberRace(nftId) {
    if (raceInProgress) {
        showToast('⏳ A Cyber Derby is currently running! Please wait for it to complete.', 'warning');
        return;
    }

    const horse = state.myNFTs.find(n => n.id === nftId);
    if (!horse) {
        showToast('NFT Horse not found in your stables.', 'warning');
        return;
    }

    if (horse.status === 'Unstaked (Idle)') {
        showToast(`⚠️ ${horse.name} is currently Unstaked. Stake your horse to enter tournaments!`, 'warning');
        return;
    }

    raceInProgress = true;
    const raceBtn = document.getElementById(`race-btn-${nftId}`);
    if (raceBtn) {
        raceBtn.disabled = true;
        raceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Racing...';
    }

    showToast(`🐎 ${horse.name} launched out of the gate in the Cyber-Derby 1200m Sprint...`, 'info');
    
    setTimeout(() => {
        // Outcome calculation based on horse winRate & tier
        const winPct = parseInt(horse.winRate) || 75;
        const roll = Math.floor(Math.random() * 100) + 1;
        
        let tierMultiplier = 1.0;
        if (horse.tier === 'Rare') tierMultiplier = 1.5;
        if (horse.tier === 'Epic') tierMultiplier = 2.5;
        if (horse.tier === 'Legendary') tierMultiplier = 5.0;

        let place = '';
        let basePrize = 0;

        if (roll <= winPct) {
            place = '1st Place 🥇 (VICTORY)';
            basePrize = Math.floor((20 + Math.random() * 20) * tierMultiplier);
        } else if (roll <= winPct + 15) {
            place = '2nd Place 🥈 (Podium)';
            basePrize = Math.floor((10 + Math.random() * 10) * tierMultiplier);
        } else if (roll <= winPct + 25) {
            place = '3rd Place 🥉 (Podium)';
            basePrize = Math.floor((5 + Math.random() * 8) * tierMultiplier);
        } else {
            place = '4th Place (Participant Finish)';
            basePrize = Math.floor(3 * tierMultiplier);
        }

        if (typeof horse.totalEarnedMhr === 'number') {
            horse.totalEarnedMhr += basePrize;
        } else {
            horse.totalEarnedMhr = (parseFloat(horse.totalEarnedMhr) || 0) + basePrize;
        }

        state.mhrBalance += basePrize;
        state.totalEarnings += (basePrize * state.mhrPriceUsdt);

        logTransaction('Race Win', `Cyber-Derby ${place} (${horse.name})`, `+${basePrize} MFHRC`, 'Completed');
        savePersistentState();
        updateAllViews();

        if (place.includes('1st')) {
            showToast(`🏆 VICTORY! ${horse.name} finished ${place}! Won +${basePrize} MFHRC prize tokens!`, 'success');
        } else {
            showToast(`🏁 ${horse.name} finished ${place}! Won +${basePrize} MFHRC tournament tokens.`, 'info');
        }

        raceInProgress = false;
        if (raceBtn) {
            raceBtn.disabled = false;
            raceBtn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Race Derby';
        }
    }, 1800);
}

function toggleStakeNFT(nftId) {
    const horse = state.myNFTs.find(n => n.id === nftId);
    if (!horse) return;

    if (horse.status === 'Unstaked (Idle)') {
        horse.status = 'Staked & Earning';
        showToast(`🔒 ${horse.name} is now Staked & Earning +${horse.dailyMhrYield} MFHRC/day!`, 'success');
    } else {
        horse.status = 'Unstaked (Idle)';
        showToast(`🔓 ${horse.name} unstaked into stable inventory. Staking yield paused.`, 'info');
    }

    savePersistentState();
    updateAllViews();
}

function renderWalletView() {
    const isConn = Boolean(state.connected && state.walletAddress);
    const wAddr = document.getElementById('wallet-view-address');
    if (wAddr) wAddr.textContent = isConn ? state.walletAddress : 'Not Connected';

    const wNet = document.getElementById('wallet-view-network');
    if (wNet) wNet.textContent = state.networkName || 'BNB Smart Chain (Chain ID 56)';

    const wUsdt = document.getElementById('wallet-view-usdt');
    if (wUsdt) wUsdt.textContent = '$' + (state.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';

    const wMhr = document.getElementById('wallet-view-mhr');
    if (wMhr) wMhr.textContent = (state.mhrBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MFHRC';

    const wUnclaimed = document.getElementById('wallet-page-unclaimed');
    if (wUnclaimed) {
        wUnclaimed.textContent = '$' + (state.unclaimedRewards || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT' +
            (state.unclaimedMhrRewards > 0.01 ? ` + ${state.unclaimedMhrRewards.toFixed(2)} MFHRC` : '');
    }

    const wConn = document.getElementById('wallet-view-conn-status');
    if (wConn) {
        if (isConn) {
            wConn.className = 'badge-pill badge-gold';
            wConn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connected';
        } else {
            wConn.className = 'badge-pill badge-warning';
            wConn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Disconnected';
        }
    }
}

function renderBonusesView() {
    const pDirect = document.getElementById('page-bonus-direct');
    if (pDirect) pDirect.textContent = `$${(state.bonuses.direct || 0).toFixed(2)}`;

    const pUnilevel = document.getElementById('page-bonus-unilevel');
    if (pUnilevel) pUnilevel.textContent = `$${(state.bonuses.unilevel || 0).toFixed(2)}`;

    const pRanking = document.getElementById('page-bonus-ranking');
    if (pRanking) pRanking.textContent = `$${(state.bonuses.ranking || 0).toFixed(2)}`;

    const pDaily = document.getElementById('page-bonus-daily');
    if (pDaily) pDaily.textContent = `$${(state.bonuses.dailyYield || 0).toFixed(2)}`;

    const pNft = document.getElementById('page-bonus-nft');
    if (pNft) pNft.textContent = `$${(state.bonuses.nftRewards || 0).toFixed(2)}`;
}

function renderTransactionsView(filterType = 'all') {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) return;

    let list = state.transactions || [];
    if (filterType !== 'all') {
        list = list.filter(tx => tx.type.toLowerCase().includes(filterType.toLowerCase()));
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No transactions recorded yet. Deposits, claims, and purchases will appear here.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(tx => `
        <tr>
            <td><strong>${tx.id}</strong></td>
            <td>
                <span class="badge-pill badge-${getBadgeClassForType(tx.type)}">${tx.type}</span>
            </td>
            <td>${tx.title}</td>
            <td style="font-family: var(--font-heading); font-weight: 700; color: ${tx.amount.startsWith('+') ? 'var(--accent-green)' : (tx.amount.startsWith('-') ? 'var(--accent-orange)' : '#fff')};">
                ${tx.amount}
            </td>
            <td><span class="badge-pill badge-${tx.status === 'Completed' ? 'success' : 'warning'}">${tx.status}</span></td>
            <td>
                <a href="${tx.explorer}" target="_blank" style="color: var(--gold-primary); text-decoration: none; font-size: 12px;">
                    ${shortenAddress(tx.txHash)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i>
                </a>
            </td>
            <td style="color: var(--text-muted); font-size: 12px;">${tx.timestamp}</td>
        </tr>
    `).join('');
}

function getBadgeClassForType(type) {
    switch (type.toLowerCase()) {
        case 'deposit': return 'success';
        case 'withdraw': return 'warning';
        case 'package': return 'purple';
        case 'nft mint': return 'gold';
        case 'claim': return 'blue';
        case 'swap': return 'gold';
        default: return 'blue';
    }
}

function renderReferralsView(level = 1) {
    const dirCount = document.getElementById('ref-direct-count');
    if (dirCount) dirCount.textContent = `${state.referrals.directCount || 0} Members`;

    const teamCount = document.getElementById('ref-team-count');
    if (teamCount) teamCount.textContent = `${state.referrals.teamCount || 0} Members`;

    const teamVol = document.getElementById('ref-team-volume');
    if (teamVol) teamVol.textContent = `$${(state.referrals.teamVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`;

    const tbody = document.getElementById('referrals-direct-tbody');
    if (tbody) {
        if (!state.referrals.directList || state.referrals.directList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No direct team members registered yet. Share your referral link above to build your stable network.</td></tr>`;
        } else {
            tbody.innerHTML = state.referrals.directList.map(member => `
                <tr>
                    <td><strong>${member.name}</strong></td>
                    <td><code>${member.wallet}</code></td>
                    <td>${member.package}</td>
                    <td>$${member.volume.toLocaleString()} USDT</td>
                    <td style="color: var(--gold-primary); font-weight: 700;">+$${member.bonus.toLocaleString()} USDT</td>
                    <td><span class="badge-pill badge-success">${member.status}</span></td>
                    <td style="color: var(--text-muted); font-size: 12px;">${member.joined}</td>
                </tr>
            `).join('');
        }
    }
}

function renderAdminView() {
    const tvlElem = document.getElementById('admin-total-tvl');
    if (tvlElem) tvlElem.textContent = `$${(state.admin.totalTvl || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`;

    const ridersElem = document.getElementById('admin-active-riders');
    if (ridersElem) ridersElem.textContent = (state.admin.activeRiders || 0).toLocaleString();

    const mhrElem = document.getElementById('admin-total-mhr');
    if (mhrElem) mhrElem.textContent = `${(state.admin.totalMintedMhr || 0).toLocaleString()} MFHRC`;

    const reserveElem = document.getElementById('admin-reserve-vault');
    if (reserveElem) reserveElem.textContent = `$${(state.admin.reserveVaultUsdt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`;

    const reqTbody = document.getElementById('admin-withdraw-requests-tbody');
    if (reqTbody) {
        if (!state.admin.pendingWithdrawals || state.admin.pendingWithdrawals.length === 0) {
            reqTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No withdrawal requests in queue.</td></tr>`;
        } else {
            reqTbody.innerHTML = state.admin.pendingWithdrawals.map(req => `
                <tr>
                    <td><strong>${req.id}</strong></td>
                    <td><code>${req.user}</code></td>
                    <td style="font-weight: 700;">$${req.amount.toFixed(2)} ${req.token}</td>
                    <td style="color: var(--text-muted); font-size: 12px;">${req.requestedAt}</td>
                    <td><span class="badge-pill badge-${req.status === 'Completed' ? 'success' : 'warning'}">${req.status}</span></td>
                    <td>
                        ${req.status === 'Pending' ? `
                            <button class="btn-gold" style="padding: 4px 10px; font-size: 11px;" onclick="adminProcessRequest('${req.id}')">
                                <i class="fa-solid fa-check"></i> Process
                            </button>
                        ` : `
                            <span style="font-size: 11px; color: var(--accent-green);"><i class="fa-solid fa-circle-check"></i> Settled</span>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    }
}

function adminProcessRequest(reqId) {
    const item = state.admin.pendingWithdrawals.find(r => r.id === reqId);
    if (item && item.status === 'Pending') {
        item.status = 'Completed';
        
        // Update transaction ledger item status too
        const tx = state.transactions.find(t => t.type === 'Withdraw' && t.status === 'Pending');
        if (tx) tx.status = 'Completed';

        savePersistentState();
        renderAdminView();
        renderTransactionsView('all');
        showToast(`Request ${reqId} successfully approved and settled on BSC ledger!`, 'success');
    }
}

// ==========================================================
// 7. UTILITY FUNCTIONS & HELPERS
// ==========================================================

function logTransaction(type, title, amount, status = 'Completed') {
    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomHex = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const txHash = `0x${randomHex}`;
    
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    state.transactions.unshift({
        id: txId,
        type: type,
        title: title,
        amount: amount,
        status: status,
        timestamp: dateStr,
        txHash: txHash,
        explorer: `https://bscscan.com/tx/${txHash}`
    });

    if (state.transactions.length > 50) state.transactions.pop();
}

function shortenAddress(addr) {
    if (!addr || addr === 'Not Connected') return 'Not Connected';
    if (addr.length < 12) return addr;
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
}

function copyText(text) {
    let toCopy = text;
    if (!toCopy || toCopy.includes('Connect wallet')) {
        if (state.connected && state.walletAddress) {
            toCopy = `https://metafastest.io/ref/${shortenAddress(state.walletAddress).replace('...', '')}`;
        } else {
            showToast('Please connect your Web3 wallet first to copy your referral link.', 'warning');
            return;
        }
    }
    navigator.clipboard.writeText(toCopy).then(() => {
        showToast(`📋 Copied to clipboard: ${toCopy}`, 'info');
    }).catch(() => {
        showToast(`📋 Copied: ${toCopy}`, 'info');
    });
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'fa-solid fa-circle-check';
    let iconColor = 'var(--gold-primary)';
    if (type === 'warning') {
        icon = 'fa-solid fa-triangle-exclamation';
        iconColor = 'var(--accent-orange)';
    } else if (type === 'success') {
        icon = 'fa-solid fa-circle-check';
        iconColor = 'var(--accent-green)';
    }

    toast.innerHTML = `<i class="${icon}" style="color: ${iconColor};"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

async function addTokenToMetaMask() {
    if (typeof window.ethereum === 'undefined') {
        showToast('MetaMask is not detected in your browser.', 'warning');
        return;
    }
    try {
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: '0xbC6AC29404f5E68ed9d4e340E286aAb265Ea6e0c',
                    symbol: 'MFHRC',
                    decimals: 18,
                    image: window.location.origin + '/assets/logo.png'
                }
            }
        });
        if (wasAdded) {
            showToast('✅ 1,000,000,000 MFHRC Token registered in your MetaMask wallet!', 'success');
        }
    } catch (err) {
        showToast(`Token Import: ${err.message}`, 'info');
    }
}

// Global Window Bindings for Inline HTML Handlers
window.switchTab = switchTab;
window.switchPortalView = switchPortalView;
window.showAppDashboard = showAppDashboard;
window.showLoginView = showLoginView;
window.showLandingView = showLandingView;
window.connectWeb3Wallet = connectWeb3Wallet;
window.connectManualWalletAddress = connectManualWalletAddress;
window.handleLandingConnect = handleLandingConnect;
window.scrollToConnectOrConnect = scrollToConnectOrConnect;
window.saveLandingSponsor = saveLandingSponsor;
window.handleLogout = handleLogout;
window.claimRewards = claimRewards;
window.openDepositModal = openDepositModal;
window.confirmDeposit = confirmDeposit;
window.openWithdrawModal = openWithdrawModal;
window.confirmWithdrawal = confirmWithdrawal;
window.openBuyModal = openBuyModal;
window.confirmPackagePurchase = confirmPackagePurchase;
window.mintNFTHorse = mintNFTHorse;
window.openSwapModal = openSwapModal;
window.switchSwapDirection = switchSwapDirection;
window.updateSwapQuote = updateSwapQuote;
window.executeSwap = executeSwap;
window.saveUserProfile = saveUserProfile;
window.submitKYCVerification = submitKYCVerification;
window.adminProcessRequest = adminProcessRequest;
window.renderTransactionsView = renderTransactionsView;
window.enterCyberRace = enterCyberRace;
window.toggleStakeNFT = toggleStakeNFT;
window.copyText = copyText;
window.closeModal = closeModal;
window.resetAppToDefaults = resetAppToDefaults;
window.toggleLandingFaq = toggleLandingFaq;
window.detectReferralParam = detectReferralParam;
window.addTokenToMetaMask = addTokenToMetaMask;

