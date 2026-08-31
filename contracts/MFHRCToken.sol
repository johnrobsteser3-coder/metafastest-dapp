// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBEP20
 * @dev Binance Smart Chain BEP-20 standard token interface.
 */
interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev Provides information about the current execution context.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Ownable: initial owner is zero address");
        _transferOwnership(initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title Metafastest Horse Riders Club (MFHRC) BEP-20 Official Token
 * @notice Official utility and governance token on BNB Smart Chain.
 * Total Fixed Supply: 1,000,000,000 MFHRC (One Billion)
 * Official Owner & 1 Billion Token Treasury Wallet: 0xd537F93d056364CDE3De6692F48e853d14b0943c
 * Decimals: 18
 */
contract MFHRCToken is Context, IBEP20, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private constant _TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1,000,000,000 Tokens
    string private constant _NAME = "MetaFastest Horse Riders Club";
    string private constant _SYMBOL = "MFHRC";
    uint8 private constant _DECIMALS = 18;

    // Official Owner & Treasury Wallet Address
    address public constant OFFICIAL_TREASURY_OWNER = 0xd537F93d056364CDE3De6692F48e853d14b0943c;

    // Staking Vault Authorized Operators
    mapping(address => bool) public isAuthorizedOperator;

    event OperatorUpdated(address indexed operator, bool authorized);
    event TokensBurned(address indexed burner, uint256 amount);

    /**
     * @notice Mints entire 1 Billion supply directly to official treasury owner: 0xd537F93d056364CDE3De6692F48e853d14b0943c
     */
    constructor() Ownable(OFFICIAL_TREASURY_OWNER) {
        _balances[OFFICIAL_TREASURY_OWNER] = _TOTAL_SUPPLY;
        emit Transfer(address(0), OFFICIAL_TREASURY_OWNER, _TOTAL_SUPPLY);
    }

    function name() public pure override returns (string memory) {
        return _NAME;
    }

    function symbol() public pure override returns (string memory) {
        return _SYMBOL;
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    function totalSupply() public pure override returns (uint256) {
        return _TOTAL_SUPPLY;
    }

    function getOwner() external view override returns (address) {
        return owner();
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address ownerAccount, address spender) public view override returns (uint256) {
        return _allowances[ownerAccount][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _spendAllowance(sender, _msgSender(), amount);
        _transfer(sender, recipient, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address currentOwner = _msgSender();
        _approve(currentOwner, spender, allowance(currentOwner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address currentOwner = _msgSender();
        uint256 currentAllowance = allowance(currentOwner, spender);
        require(currentAllowance >= subtractedValue, "BEP20: decreased allowance below zero");
        unchecked {
            _approve(currentOwner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    /**
     * @notice Burns tokens from caller balance, reducing circulating supply.
     */
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @notice Burns tokens from another account using allowance.
     */
    function burnFrom(address account, uint256 amount) public virtual {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    /**
     * @notice Authorize ecosystem staking vaults or liquidity managers.
     */
    function setOperator(address operator, bool authorized) external onlyOwner {
        require(operator != address(0), "BEP20: invalid operator address");
        isAuthorizedOperator[operator] = authorized;
        emit OperatorUpdated(operator, authorized);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "BEP20: transfer from the zero address");
        require(recipient != address(0), "BEP20: transfer to the zero address");
        require(_balances[sender] >= amount, "BEP20: transfer amount exceeds balance");

        unchecked {
            _balances[sender] -= amount;
            _balances[recipient] += amount;
        }

        emit Transfer(sender, recipient, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "BEP20: burn from zero address");
        require(_balances[account] >= amount, "BEP20: burn amount exceeds balance");

        unchecked {
            _balances[account] -= amount;
        }

        emit Transfer(account, address(0), amount);
        emit TokensBurned(account, amount);
    }

    function _approve(address ownerAccount, address spender, uint256 amount) internal virtual {
        require(ownerAccount != address(0), "BEP20: approve from zero address");
        require(spender != address(0), "BEP20: approve to zero address");

        _allowances[ownerAccount][spender] = amount;
        emit Approval(ownerAccount, spender, amount);
    }

    function _spendAllowance(address ownerAccount, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(ownerAccount, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "BEP20: insufficient allowance");
            unchecked {
                _approve(ownerAccount, spender, currentAllowance - amount);
            }
        }
    }
}
