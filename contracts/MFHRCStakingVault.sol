// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MFHRCToken.sol";

/**
 * @title IBEP20Token
 */
interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title MFHRCStakingVault
 * @notice Automated BNB Smart Chain Staking Vault for Metafastest Riders Club
 * Handles package deposits (USDT), daily ROI distribution, and MFHRC claims.
 */
contract MFHRCStakingVault is Ownable {
    IERC20Minimal public immutable usdtToken;
    MFHRCToken public immutable mfhrcToken;

    struct PackageTier {
        string name;
        uint256 price;       // in USDT (18 decimals or 6 depending on USDT)
        uint256 dailyBps;    // basis points: 80 = 0.8%, 150 = 1.5%
        uint256 durationSec; // 180 days in seconds
        bool active;
    }

    struct UserStake {
        uint256 packageId;
        uint256 principalAmount;
        uint256 dailyYieldUsdt;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalClaimedUsdt;
        bool active;
    }

    // Tier configurations
    PackageTier[] public packageTiers;
    mapping(address => UserStake[]) public userStakes;
    mapping(address => address) public uplineSponsor;
    mapping(address => uint256) public directReferralVolume;

    // 5-Tier Unilevel Bps (1000 = 10%, 400 = 4%, 300 = 3%, 100 = 1%, 100 = 1%)
    uint256[5] public unilevelRates = [1000, 400, 300, 100, 100];

    event Staked(address indexed user, uint256 indexed packageId, uint256 amount, address sponsor);
    event YieldClaimed(address indexed user, uint256 usdtAmount, uint256 mfhrcBonus);
    address public constant OFFICIAL_TREASURY_OWNER = 0xd537F93d056364CDE3De6692F48e853d14b0943c;

    constructor(address _usdtAddress, address _mfhrcAddress) Ownable(OFFICIAL_TREASURY_OWNER) {
        require(_usdtAddress != address(0) && _mfhrcAddress != address(0), "Invalid token addresses");
        usdtToken = IERC20Minimal(_usdtAddress);
        mfhrcToken = MFHRCToken(_mfhrcAddress);

        // Initialize 6 Official Packages
        packageTiers.push(PackageTier("Starter Package", 100 * 10**18, 80, 180 days, true));
        packageTiers.push(PackageTier("Explorer Package", 500 * 10**18, 85, 180 days, true));
        packageTiers.push(PackageTier("Premium Package", 1000 * 10**18, 90, 180 days, true));
        packageTiers.push(PackageTier("Riders Package", 5000 * 10**18, 110, 180 days, true));
        packageTiers.push(PackageTier("VIP Riders Package", 10000 * 10**18, 120, 180 days, true));
        packageTiers.push(PackageTier("Legendary Founder", 25000 * 10**18, 150, 180 days, true));
    }

    function stakePackage(uint256 tierIndex, address sponsor) external {
        require(tierIndex < packageTiers.length, "Invalid tier");
        PackageTier memory tier = packageTiers[tierIndex];
        require(tier.active, "Package not active");

        // Set upline if not set
        if (uplineSponsor[msg.sender] == address(0) && sponsor != address(0) && sponsor != msg.sender) {
            uplineSponsor[msg.sender] = sponsor;
        }

        // Transfer USDT from user to vault
        require(usdtToken.transferFrom(msg.sender, address(this), tier.price), "USDT transfer failed");

        uint256 dailyPayout = (tier.price * tier.dailyBps) / 10000;

        userStakes[msg.sender].push(UserStake({
            packageId: tierIndex,
            principalAmount: tier.price,
            dailyYieldUsdt: dailyPayout,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            totalClaimedUsdt: 0,
            active: true
        }));

        directReferralVolume[uplineSponsor[msg.sender]] += tier.price;

        // Distribute 5-Level Unilevel Commissions
        _distributeUnilevel(msg.sender, tier.price);

        emit Staked(msg.sender, tierIndex, tier.price, uplineSponsor[msg.sender]);
    }

    function _distributeUnilevel(address buyer, uint256 amount) internal {
        address currentUpline = uplineSponsor[buyer];
        for (uint256 i = 0; i < 5; i++) {
            if (currentUpline == address(0)) break;
            uint256 commission = (amount * unilevelRates[i]) / 10000;
            if (commission > 0 && usdtToken.balanceOf(address(this)) >= commission) {
                usdtToken.transfer(currentUpline, commission);
                emit ReferralPaid(currentUpline, buyer, i + 1, commission);
            }
            currentUpline = uplineSponsor[currentUpline];
        }
    }

    function claimAllYield() external {
        uint256 totalClaimable = 0;
        UserStake[] storage stakes = userStakes[msg.sender];

        for (uint256 i = 0; i < stakes.length; i++) {
            if (!stakes[i].active) continue;

            uint256 elapsed = block.timestamp - stakes[i].lastClaimTime;
            if (elapsed > 0) {
                uint256 earned = (stakes[i].dailyYieldUsdt * elapsed) / 1 days;
                totalClaimable += earned;
                stakes[i].lastClaimTime = block.timestamp;
                stakes[i].totalClaimedUsdt += earned;

                // Check 180-day completion
                if (block.timestamp >= stakes[i].startTime + 180 days) {
                    stakes[i].active = false;
                }
            }
        }

        require(totalClaimable > 0, "No rewards claimable");
        require(usdtToken.transfer(msg.sender, totalClaimable), "USDT transfer failed");

        emit YieldClaimed(msg.sender, totalClaimable, 0);
    }
}
