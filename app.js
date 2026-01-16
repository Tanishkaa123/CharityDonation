// Contract ABI - Update this after deploying your contract
const CONTRACT_ABI = [
    "function donate() public payable",
    "function charityAddress() public view returns (address)",
    "function totalDonations() public view returns (uint256)",
    "function totalDonors() public view returns (uint256)",
    "function isActive() public view returns (bool)",
    "function getContractBalance() public view returns (uint256)",
    "function getDonationAmount(address donor) public view returns (uint256)",
    "function getAllDonors() public view returns (address[])",
    "event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp)"
];

// Global variables
let provider;
let signer;
let contract;
let userAddress;
// Hardcoded contract address - deployed on Sepolia testnet
const contractAddress = '0x8bEe2e7C327320dDcB5882917C488e80A2513bf7';

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();

    // Display the hardcoded contract address
    document.getElementById('contractAddressText').textContent = formatAddress(contractAddress);
});

function initializeApp() {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask to use this app', 'error');
        return;
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
}

function setupEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Donation
    document.getElementById('donateBtn').addEventListener('click', makeDonation);

    // Quick amount buttons
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById('donationAmount').value = e.target.dataset.amount;
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshData);

    // Copy button for contract address
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(contractAddress);
        });
    }
}

async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            showToast('Please install MetaMask browser extension!', 'error');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        // Check if ethers library loaded
        if (typeof ethers === 'undefined') {
            showToast('Loading Web3 library... Please try again in a moment.', 'error');
            setTimeout(() => location.reload(), 2000);
            return;
        }

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        await handleAccountsChanged(accounts);

        // Check if on Sepolia network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') { // Sepolia chain ID
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }],
                });
            } catch (error) {
                showToast('Please switch to Sepolia testnet', 'error');
                return;
            }
        }

        showToast('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast('Failed to connect wallet', 'error');
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        userAddress = null;
        document.getElementById('connectWallet').innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 6.25H2.5V15H17.5V6.25Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M15 10.625C15 11.2463 14.4963 11.75 13.875 11.75C13.2537 11.75 12.75 11.2463 12.75 10.625C12.75 10.0037 13.2537 9.5 13.875 9.5C14.4963 9.5 15 10.0037 15 10.625Z" fill="currentColor"/>
            </svg>
            Connect Wallet
        `;
        return;
    }

    userAddress = accounts[0];
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // Update UI
    document.getElementById('connectWallet').innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" fill="#48bb78"/>
        </svg>
        ${formatAddress(userAddress)}
    `;

    // Initialize contract with hardcoded address
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    await refreshData();
    listenToEvents();
}

async function makeDonation() {
    if (!signer) {
        showToast('Please connect your wallet first', 'error');
        return;
    }

    const amount = document.getElementById('donationAmount').value;

    if (!amount || parseFloat(amount) <= 0) {
        showToast('Please enter a valid donation amount', 'error');
        return;
    }

    try {
        const btn = document.getElementById('donateBtn');
        btn.disabled = true;
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spinning">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50" stroke-dashoffset="25"/>
            </svg>
            Processing...
        `;

        const tx = await contract.donate({
            value: ethers.utils.parseEther(amount)
        });

        showToast('Transaction submitted! Waiting for confirmation...', 'info');

        await tx.wait();

        showToast(`Successfully donated ${amount} ETH!`, 'success');
        document.getElementById('donationAmount').value = '';

        await refreshData();

    } catch (error) {
        console.error('Donation error:', error);
        if (error.code === 4001) {
            showToast('Transaction rejected by user', 'error');
        } else {
            showToast('Donation failed: ' + (error.reason || error.message), 'error');
        }
    } finally {
        const btn = document.getElementById('donateBtn');
        btn.disabled = false;
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.3667 8.925C18.0708 9.32083 18.0708 10.3458 17.3667 10.7417L4.61667 17.8583C3.9125 18.2542 3.04167 17.7417 3.04167 16.95V3.71667C3.04167 2.925 3.9125 2.4125 4.61667 2.80833L17.3667 8.925Z" fill="currentColor"/>
            </svg>
            Donate Now
        `;
    }
}

async function refreshData() {
    if (!contract) {
        showToast('Please connect your wallet first', 'error');
        return;
    }

    try {
        // Get contract data
        const [totalDonations, totalDonors, charityAddr, contractBalance, isActive] = await Promise.all([
            contract.totalDonations(),
            contract.totalDonors(),
            contract.charityAddress(),
            contract.getContractBalance(),
            contract.isActive()
        ]);

        // Update stats
        document.getElementById('totalDonations').textContent =
            parseFloat(ethers.utils.formatEther(totalDonations)).toFixed(4) + ' ETH';
        document.getElementById('totalDonors').textContent = totalDonors.toString();
        document.getElementById('contractBalance').innerHTML =
            `<span>${parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)} ETH</span>`;

        // Update charity address
        document.getElementById('charityAddress').innerHTML =
            `<span>${formatAddress(charityAddr)}</span>`;

        // Update contract status
        const statusBadge = document.getElementById('contractStatus');
        if (isActive) {
            statusBadge.className = 'status-badge active';
            statusBadge.innerHTML = '<span class="status-dot"></span><span>Active</span>';
        } else {
            statusBadge.className = 'status-badge inactive';
            statusBadge.innerHTML = '<span class="status-dot"></span><span>Inactive</span>';
        }

        // Get user's donation if connected
        if (userAddress) {
            const userDonation = await contract.getDonationAmount(userAddress);
            document.getElementById('yourDonation').textContent =
                parseFloat(ethers.utils.formatEther(userDonation)).toFixed(4) + ' ETH';
        }

        // Get recent donations
        await loadRecentDonations();

    } catch (error) {
        console.error('Error refreshing data:', error);
        showToast('Failed to load contract data', 'error');
    }
}

async function loadRecentDonations() {
    try {
        const donors = await contract.getAllDonors();
        const donationsList = document.getElementById('donationsList');

        if (donors.length === 0) {
            donationsList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="rgba(102, 126, 234, 0.1)"/>
                        <path d="M32 20V44M20 32H44" stroke="#667eea" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <p>No donations yet. Be the first to contribute!</p>
                </div>
            `;
            return;
        }

        // Get donation amounts for all donors
        const donationsData = await Promise.all(
            donors.slice(-10).reverse().map(async (donor) => ({
                address: donor,
                amount: await contract.getDonationAmount(donor)
            }))
        );

        donationsList.innerHTML = donationsData.map(({ address, amount }) => `
            <div class="donation-item">
                <div class="donor-info">
                    <div class="donor-avatar">${address.slice(2, 4).toUpperCase()}</div>
                    <div class="donor-details">
                        <div class="donor-address">${formatAddress(address)}</div>
                        <div class="donation-time">Recent donor</div>
                    </div>
                </div>
                <div class="donation-amount">${parseFloat(ethers.utils.formatEther(amount)).toFixed(4)} ETH</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

function listenToEvents() {
    if (!contract) return;

    contract.on('DonationReceived', (donor, amount, timestamp) => {
        console.log('New donation:', { donor, amount: ethers.utils.formatEther(amount), timestamp });
        refreshData();
    });
}

function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add spinning animation for loading state
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spinning {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
