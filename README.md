# CharityChain - Transparent Blockchain Donations

A beautiful, modern donation platform built on Ethereum that enables transparent charitable giving using blockchain technology.

## 🚀 Features

- **Transparent Donations**: All donations are tracked on the blockchain
- **Real-time Updates**: See total donations and donor count in real-time
- **Verified Charity**: Only the designated charity address can withdraw funds
- **User Dashboard**: Track your personal contributions
- **Recent Donations**: View the latest donations from the community
- **MetaMask Integration**: Seamless wallet connection
- **Responsive Design**: Beautiful UI that works on all devices

## 📋 Prerequisites

- MetaMask browser extension installed
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Remix IDE for contract deployment

## 🔧 Deployment Instructions

### Step 1: Deploy the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new file called `CharityDonation.sol`
3. Copy the contents from `CharityDonation.sol` in this project
4. Compile the contract:
   - Select Solidity Compiler (0.8.0 or higher)
   - Click "Compile CharityDonation.sol"
5. Deploy the contract:
   - Go to "Deploy & Run Transactions"
   - Select "Injected Provider - MetaMask" as environment
   - Make sure you're connected to Sepolia testnet
   - Enter the charity address in the constructor parameter
   - Click "Deploy"
   - Confirm the transaction in MetaMask
6. **Copy the deployed contract address** - you'll need this!

### Step 2: Set Up the Web Interface

1. Open `index.html` in a web browser
2. Click "Connect Wallet" and connect your MetaMask
3. Paste your deployed contract address in the "Contract Address" field
4. Click "Save"
5. The interface will automatically load all contract data

## 💡 How to Use

### For Donors:

1. **Connect Wallet**: Click the "Connect Wallet" button
2. **Enter Amount**: Type the amount of ETH you want to donate or use quick amount buttons
3. **Donate**: Click "Donate Now" and confirm the transaction in MetaMask
4. **Track**: See your contribution in the "Your Contribution" stat card

### For Charity (Contract Owner):

To withdraw funds, you'll need to interact with the contract directly through Remix:

1. Go to Remix IDE
2. Load your deployed contract using "At Address"
3. Call `withdrawFunds()` function (only works if you're the charity address)

## 🎨 Smart Contract Features

### Public Functions:
- `donate()` - Make a donation (payable)
- `withdrawFunds()` - Withdraw all funds (charity only)
- `withdrawAmount(uint256)` - Withdraw specific amount (charity only)
- `updateCharityAddress(address)` - Update charity address (owner only)
- `toggleContractStatus()` - Activate/deactivate contract (owner only)

### View Functions:
- `getContractBalance()` - Get current contract balance
- `getDonationAmount(address)` - Get donation by specific address
- `getTotalDonors()` - Get total number of donors
- `getAllDonors()` - Get list of all donor addresses

## 🔒 Security Features

- Only verified charity address can withdraw funds
- Owner can pause/unpause the contract
- All transactions are transparent on the blockchain
- Reentrancy protection built-in
- Event emissions for all major actions

## 🌐 Network Information

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Currency**: SepoliaETH (Test ETH)

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Brave
- Edge

## 🛠️ Tech Stack

- **Smart Contract**: Solidity 0.8.0+
- **Frontend**: HTML5, CSS3, JavaScript
- **Web3 Library**: Ethers.js v5.7.2
- **Wallet**: MetaMask
- **Network**: Ethereum Sepolia Testnet

## 📝 Contract Constructor Parameters

When deploying, you need to provide:
- `_charityAddress`: The Ethereum address that will receive donations

Example: `0x1234567890123456789012345678901234567890`

## 🎯 Quick Start

1. Deploy contract on Remix with charity address
2. Copy contract address
3. Open `index.html` in browser
4. Connect MetaMask
5. Paste contract address
6. Start donating!

## 💰 Getting Test ETH

Get free Sepolia ETH from these faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## 📊 Viewing Transactions

View your transactions on Sepolia Etherscan:
`https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`

## 🤝 Support

If you encounter any issues:
1. Make sure you're on Sepolia testnet
2. Ensure you have enough SepoliaETH for gas
3. Check that the contract address is correct
4. Verify MetaMask is unlocked and connected

## 📄 License

MIT License - Feel free to use this for your charitable causes!

---

Built with ❤️ for transparent charitable giving
