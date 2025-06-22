const mockData = {
    user: {
        name: "John Doe",
        email: "john.doe@example.com",
        country: "Nigeria",
        verified: true,
        language: "en"
    },
    wallet: {
        balances: [
            { currency: "PFTISS Stablecoin", amount: 1000, symbol: "PFT" },
            { currency: "eNaira", amount: 50000, symbol: "₦" },
            { currency: "Gold Token", amount: 0.5, symbol: "oz" },
            { currency: "Cocoa Token", amount: 100, symbol: "kg" },
            { currency: "Tokenized USD", amount: 500, symbol: "$" },
            { currency: "Carbon Credits", amount: 10, symbol: "tCO2e" }
        ]
    },
    transactions: [
        { id: 1, type: "sent", amount: "500 PFT", to: "Supplier (Nigeria)", date: "10/05/2025", status: "completed" },
        { id: 2, type: "paid", amount: "₦10,000", to: "VAT (FIRS)", date: "09/05/2025", status: "completed" },
        { id: 3, type: "received", amount: "$1,000", from: "Diaspora (USA)", date: "08/05/2025", status: "completed" },
        { id: 4, type: "settled", amount: "50 kg Cocoa", with: "Kenya", date: "07/05/2025", status: "completed" },
        { id: 5, type: "received", amount: "0.1 oz Gold", from: "Miner (Ghana)", date: "06/05/2025", status: "completed" }
    ],
    reserves: {
        composition: [
            { commodity: "Gold", percentage: 30 },
            { commodity: "Oil", percentage: 20 },
            { commodity: "Copper", percentage: 15 },
            { commodity: "Lithium", percentage: 10 },
            { commodity: "Cocoa", percentage: 10 },
            { commodity: "Other", percentage: 15 }
        ],
        storage: [
            { commodity: "Gold", location: "Brinks Vaults", country: "Multiple" },
            { commodity: "Oil", location: "Licensed Depots", country: "Nigeria, Angola" },
            { commodity: "Cocoa", location: "AFEX Warehouses", country: "Nigeria, Ghana" },
            { commodity: "Copper", location: "DRC Depots", country: "DR Congo" }
        ]
    },
    exchangeRates: {
        "PFT": { "USD": 1.0, "NGN": 1500, "GOLD": 0.0005 },
        "USD": { "PFT": 1.0, "NGN": 1500, "GOLD": 0.0005 },
        "NGN": { "PFT": 0.00067, "USD": 0.00067, "GOLD": 0.00000034 },
        "GOLD": { "PFT": 2000, "USD": 2000, "NGN": 3000000 }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('pftiss-loggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadWalletBalances();
    loadRecentTransactions();
    loadReserveData();
    setupEventListeners();
    loadLanguagePreference();
});

function logout() {
    localStorage.removeItem('pftiss-loggedIn');
    window.location.href = 'index.html';
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('show');
}

// Load wallet balances
function loadWalletBalances() {
    const walletBalances = document.getElementById('wallet-balances');
    walletBalances.innerHTML = '';
    
    mockData.wallet.balances.forEach(balance => {
        const li = document.createElement('li');
        li.className = 'py-1';
        li.textContent = `${balance.currency}: ${balance.amount} ${balance.symbol}`;
        walletBalances.appendChild(li);
    });
}

// Load recent transactions
function loadRecentTransactions() {
    const transactionsContainer = document.getElementById('recent-transactions');
    transactionsContainer.innerHTML = '';
    
    // Show only the last 4 transactions
    const recentTransactions = mockData.transactions.slice(0, 4);
    
    recentTransactions.forEach(tx => {
        const div = document.createElement('div');
        div.className = 'mb-2 text-sm';
        
        let text = '';
        if (tx.type === 'sent') {
            text = `Sent ${tx.amount} to ${tx.to} - ${tx.date}`;
        } else if (tx.type === 'received') {
            text = `Received ${tx.amount} from ${tx.from} - ${tx.date}`;
        } else if (tx.type === 'paid') {
            text = `Paid ${tx.amount} to ${tx.to} - ${tx.date}`;
        } else if (tx.type === 'settled') {
            text = `Settled ${tx.amount} with ${tx.with} - ${tx.date}`;
        }
        
        div.textContent = text;
        transactionsContainer.appendChild(div);
    });
}

// Load reserve data
function loadReserveData() {
    // Load storage locations
    const storageLocations = document.getElementById('storageLocations');
    storageLocations.innerHTML = '<ul class="mt-2">';
    
    mockData.reserves.storage.forEach(item => {
        storageLocations.innerHTML += `<li class="py-1">${item.commodity}: ${item.location} (${item.country})</li>`;
    });
    
    storageLocations.innerHTML += '</ul>';
    
    // Create reserve composition chart
    const ctx = document.getElementById('reserveChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: mockData.reserves.composition.map(item => item.commodity),
            datasets: [{
                data: mockData.reserves.composition.map(item => item.percentage),
                backgroundColor: [
                    '#FFD700', '#000000', '#B87333', 
                    '#CCCCCC', '#8B4513', '#3B82F6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // File upload for KYC
    document.getElementById('kycFile')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            alert(`File "${file.name}" selected for KYC verification.`);
        }
    });
}

// Modal functions
function showModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalMenu = document.getElementById('modalMenu');
    const modalForm = document.getElementById('modalForm');
    const modalResults = document.getElementById('modalResults');
    
    // Clear previous content
    modalMenu.innerHTML = '';
    modalForm.innerHTML = '';
    modalResults.innerHTML = '';
    
    // Set title and description based on type
    const modalContent = getModalContent(type);
    modalTitle.textContent = modalContent.title;
    modalDescription.textContent = modalContent.description;
    
    // Add menu buttons if they exist
    if (modalContent.menu) {
        modalMenu.innerHTML = modalContent.menu;
    }
    
    // Add form if it exists
    if (modalContent.form) {
        modalForm.innerHTML = modalContent.form;
    }
    
    // Show the modal
    modal.classList.add('show');
    
    // Initialize any charts or special content
    if (type === 'transactions') {
        renderTransactionTable();
    } else if (type === 'reserves') {
        initReserveModalChart();
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Get modal content based on type
function getModalContent(type) {
    const content = {
        login: {
            title: 'Login to PFTISS',
            description: 'Access your global account with portable digital identity in multiple languages.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Email</label>
                        <input type="email" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Password</label>
                        <input type="password" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockLogin()">Login</button>
                </div>
            `
        },
        wallet: {
            title: 'Manage Wallet',
            description: 'View and manage your multi-currency wallet, including tokenized assets, commodities, and carbon credits.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Send Money</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('exchange')">Exchange</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('addFunds')">Add Funds</button>
                </div>
            `,
            form: `
                <div class="overflow-x-auto">
                    <table class="transaction-table">
                        <thead>
                            <tr>
                                <th>Currency</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="walletTableBody">
                            ${mockData.wallet.balances.map(balance => `
                                <tr>
                                    <td>${balance.currency}</td>
                                    <td>${balance.amount} ${balance.symbol}</td>
                                    <td class="flex space-x-2">
                                        <button class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm" 
                                            onclick="showModal('sendMoney')">Send</button>
                                        <button class="bg-green-100 text-green-600 px-2 py-1 rounded text-sm" 
                                            onclick="showModal('exchange')">Exchange</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `
        },
        sendMoney: {
            title: 'Send Money',
            description: 'Send funds to another PFTISS user or external wallet.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">From Currency</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            ${mockData.wallet.balances.map(balance => `
                                <option value="${balance.currency}">${balance.currency} (${balance.amount} ${balance.symbol})</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Amount</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Recipient Address</label>
                        <input type="text" placeholder="PFTISS address or external wallet" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Memo (Optional)</label>
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockSendTransaction()">Send</button>
                </div>
            `
        },
        exchange: {
            title: 'Exchange Currencies',
            description: 'Convert between different currencies and commodities.',
            form: `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700">From</label>
                            <select id="fromCurrency" class="w-full border border-gray-300 rounded px-3 py-2" onchange="updateExchangeRate()">
                                ${mockData.wallet.balances.map(balance => `
                                    <option value="${balance.currency}">${balance.currency}</option>
                                `).join('')}
                            </select>
                            <input type="number" id="fromAmount" class="w-full border border-gray-300 rounded px-3 py-2 mt-2" 
                                placeholder="Amount" oninput="updateExchangeRate()">
                        </div>
                        <div>
                            <label class="block text-gray-700">To</label>
                            <select id="toCurrency" class="w-full border border-gray-300 rounded px-3 py-2" onchange="updateExchangeRate()">
                                ${mockData.wallet.balances.map(balance => `
                                    <option value="${balance.currency}" ${balance.currency === 'Tokenized USD' ? 'selected' : ''}>
                                        ${balance.currency}
                                    </option>
                                `).join('')}
                            </select>
                            <input type="number" id="toAmount" class="w-full border border-gray-300 rounded px-3 py-2 mt-2" 
                                placeholder="Amount" readonly>
                        </div>
                    </div>
                    <div id="exchangeRateInfo" class="text-sm text-gray-600"></div>

                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockExchange()">Exchange</button>
                </div>
            `
        },
        addFunds: {
            title: 'Add Funds',
            description: 'Deposit funds into your PFTISS wallet from external sources.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Currency</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            ${mockData.wallet.balances.map(balance => `
                                <option value="${balance.currency}">${balance.currency}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Amount</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Deposit Method</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Bank Transfer</option>
                            <option>Credit/Debit Card</option>
                            <option>Crypto Deposit</option>
                            <option>Mobile Money</option>
                        </select>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockAddFunds()">Deposit</button>
                </div>
            `
        },
        payment: {
            title: 'Multi-Payment Rail',
            description: 'Make payments using fiat, CBDC, stablecoin, crypto, tokenized assets, or commodities, interoperable with central bank money.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Fiat</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">CBDC</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Stablecoin</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Crypto</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Tokenized Assets</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('sendMoney')">Commodities</button>
                </div>
            `
        },
        govservices: {
            title: 'Government Services Payment',
            description: 'Pay taxes, licenses, permits, and utilities in Nigeria and AfCFTA countries using fiat, eNaira, or commodities. Offline access via USSD/SMS.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGovPayment('FIRS Taxes')">FIRS Taxes (Nigeria)</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGovPayment('Driver’s License')">Driver’s License</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGovPayment('Passport Fees')">Passport Fees</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGovPayment('PHCN Electricity')">PHCN Electricity</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGovPayment('AfCFTA Services')">AfCFTA Services</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="showModal('offline')">Offline USSD</button>
                </div>
            `
        },
        transactions: {
            title: 'Transaction History',
            description: 'View all global transactions, including government payments, commodity-based settlements, and carbon credit trades.',
            form: `
                <div class="mb-4">
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="filterTransactions('all')">All</button>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="filterTransactions('sent')">Sent</button>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="filterTransactions('received')">Received</button>
                    </div>
                    <div id="transactionsTableContainer"></div>
                </div>
            `
        },
        defi: {
            title: 'DeFi Hub for Financial Inclusion',
            description: 'Join micro-lending, women/youth programs, gamified savings, and financial literacy hub.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockDeFiAction('Micro-Lending')">Micro-Lending</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockDeFiAction('Women/Youth Programs')">Women/Youth Programs</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockDeFiAction('Gamified Savings')">Gamified Savings</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockDeFiAction('Financial Literacy')">Financial Literacy</button>
                </div>
            `
        },
        msme: {
            title: 'MSME Trade & Enablement',
            description: 'Access financing, digital trade tools, market linkages, and capacity building for global MSME growth.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMSMEAction('MSME Financing')">MSME Financing</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMSMEAction('Trade Platforms')">Trade Platforms</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMSMEAction('Capacity Building')">Capacity Building</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMSMEAction('Informal Trade')">Informal Trade</button>
                </div>
            `
        },
        logistics: {
            title: 'Smart Logistics',
            description: 'Track global shipments with IoT sensors and optimize routes with AI.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Tracking Number</label>
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter your tracking number">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockTrackShipment()">Track Shipment</button>
                    <div id="shipmentStatus" class="hidden mt-4 p-4 bg-gray-100 rounded">
                        <h3 class="font-semibold">Shipment #TRK123456789</h3>
                        <div class="mt-2 space-y-2">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <div>
                                    <p class="font-medium">In Transit</p>
                                    <p class="text-sm text-gray-600">Lagos, Nigeria → Nairobi, Kenya</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <div>
                                    <p class="font-medium">Processed at Facility</p>
                                    <p class="text-sm text-gray-600">Lagos Distribution Center - May 15, 2025 10:30 AM</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <div>
                                    <p class="font-medium">Shipment Created</p>
                                    <p class="text-sm text-gray-600">Lagos, Nigeria - May 14, 2025 3:15 PM</p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <p class="font-semibold">Estimated Delivery: May 18, 2025</p>
                        </div>
                    </div>
                </div>
            `
        },
        monetary: {
            title: 'Programmable Monetary Policy',
            description: 'Configure central bank monetary policies including inflation controls and MPR.',
            menu: `
                <div class="flex flex-wrap gap-2 mb-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMonetaryPolicy('Inflation Controls')">Inflation Controls</button>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockMonetaryPolicy('MPR Settings')">MPR Settings</button>
                </div>
            `
        },
        pension: {
            title: 'Pension Module',
            description: 'Enroll in micro-pensions or DeFi-integrated retirement plans globally.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Pension Plan</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Micro-Pension Plan (5% return)</option>
                            <option>DeFi Retirement Plan (8-12% return)</option>
                            <option>Commodity-Backed Pension (Gold, Oil)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Contribution Amount</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Frequency</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Monthly</option>
                            <option>Quarterly</option>
                            <option>Annually</option>
                        </select>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockEnrollPension()">Enroll Now</button>
                </div>
            `
        },
        supply: {
            title: 'Supply Chain Finance',
            description: 'Access funding against global purchase orders and bills of lading.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Business Type</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Manufacturer</option>
                            <option>Exporter</option>
                            <option>Importer</option>
                            <option>Distributor</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Requested Amount</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Purpose</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Purchase Order Financing</option>
                            <option>Inventory Financing</option>
                            <option>Receivables Financing</option>
                            <option>Working Capital</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Upload Supporting Documents</label>
                        <input type="file" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockSupplyChainFinance()">Apply Now</button>
                </div>
            `
        },
        customs: {
            title: 'AI Customs Management',
            description: 'Automate customs clearance and verify Rules of Origin for AfCFTA.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Shipment Type</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Import</option>
                            <option>Export</option>
                            <option>Transit</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Commodity</label>
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Origin Country</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>Kenya</option>
                            <option>Other AfCFTA Member</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Destination Country</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>Kenya</option>
                            <option>Other AfCFTA Member</option>
                        </select>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockCustomsClearance()">Check Requirements</button>
                    <div id="customsResult" class="hidden mt-4 p-4 bg-gray-100 rounded">
                        <h3 class="font-semibold">Customs Clearance Result</h3>
                        <p class="mt-2">Your shipment qualifies for AfCFTA preferential treatment with 0% duty.</p>
                        <p class="mt-2">Required documents: Certificate of Origin, Commercial Invoice, Bill of Lading.</p>
                        <p class="mt-2">Estimated clearance time: 2-4 hours.</p>
                    </div>
                </div>
            `
        },
        contracts: {
            title: 'Smart Trade Contracts',
            description: 'Create automated procurement and escrow contracts for global trade.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Contract Type</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Procurement Contract</option>
                            <option>Escrow Agreement</option>
                            <option>Commodity Forward Contract</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Parties Involved</label>
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Buyer">
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2 mt-2" placeholder="Seller">
                    </div>
                    <div>
                        <label class="block text-gray-700">Contract Value</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                        <select class="w-full border border-gray-300 rounded px-3 py-2 mt-2">
                            ${mockData.wallet.balances.map(balance => `
                                <option value="${balance.currency}">${balance.currency}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Delivery Terms</label>
                        <textarea class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockCreateContract()">Create Contract</button>
                </div>
            `
        },
        tax: {
            title: 'Cross-Border Tax',
            description: 'Automatically calculate and manage intra-African transaction taxes.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Transaction Type</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Goods Purchase</option>
                            <option>Service Payment</option>
                            <option>Investment</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Amount</label>
                        <input type="number" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">From Country</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>Kenya</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">To Country</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>Kenya</option>
                        </select>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockCalculateTax()">Calculate Tax</button>
                    <div id="taxResult" class="hidden mt-4 p-4 bg-gray-100 rounded">
                        <h3 class="font-semibold">Tax Calculation Result</h3>
                        <p class="mt-2">AfCFTA preferential rate: 0%</p>
                        <p class="mt-2">VAT: 7.5%</p>
                        <p class="mt-2">Withholding Tax: 5%</p>
                        <p class="mt-2 font-semibold">Total Tax Due: $75.00</p>
                    </div>
                </div>
            `
        },
        kyc: {
            title: 'KYC/AML Verification',
            description: 'Verify your identity with portable KYC for global and AfCFTA compliance.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Full Name</label>
                        <input type="text" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Date of Birth</label>
                        <input type="date" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Country of Residence</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>Kenya</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">ID Document</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Passport</option>
                            <option>National ID</option>
                            <option>Driver's License</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Upload ID Document</label>
                        <input type="file" id="kycFile" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Proof of Address</label>
                        <input type="file" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockKYCSubmission()">Submit Verification</button>
                </div>
            `
        },
        reporting: {
            title: 'Real-Time Reporting',
            description: 'Access dashboards for global regulatory and compliance reporting.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Report Type</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>Transaction Report</option>
                            <option>KYC/AML Report</option>
                            <option>Tax Report</option>
                            <option>Reserve Audit</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Date Range</label>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="date" class="w-full border border-gray-300 rounded px-3 py-2">
                            <input type="date" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-700">Format</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>PDF</option>
                            <option>Excel</option>
                            <option>CSV</option>
                        </select>
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockGenerateReport()">Generate Report</button>
                </div>
            `
        },
        dao: {
            title: 'DAO Governance',
            description: 'Vote on protocol upgrades and reserve allocations globally.',
            form: `
                <div class="space-y-4">
                    <div class="border-b pb-4">
                        <h3 class="font-semibold">Active Proposals</h3>
                        <div class="mt-2 space-y-2">
                            <div class="p-3 border rounded">
                                <h4 class="font-medium">PFT-001: Increase Gold Reserve Allocation</h4>
                                <p class="text-sm text-gray-600 mt-1">Proposal to increase gold allocation in reserves from 30% to 35%.</p>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-sm">Voting Ends: May 30, 2025</span>
                                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" onclick="mockVote('PFT-001')">Vote</button>
                                </div>
                            </div>
                            <div class="p-3 border rounded">
                                <h4 class="font-medium">PFT-002: Add Lithium to Reserve Basket</h4>
                                <p class="text-sm text-gray-600 mt-1">Proposal to add lithium to the commodity reserve basket at 10%.</p>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-sm">Voting Ends: May 28, 2025</span>
                                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" onclick="mockVote('PFT-002')">Vote</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold">Create New Proposal</h3>
                        <div class="mt-2 space-y-2">
                            <div>
                                <label class="block text-gray-700">Proposal Title</label>
                                <input type="text" class="w-full border border-gray-300 rounded px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-gray-700">Description</label>
                                <textarea class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockCreateProposal()">Submit Proposal</button>
                        </div>
                    </div>
                </div>
            `
        },
        reserves: {
            title: 'Reserve Composition',
            description: 'View the dynamic African commodity basket backing PFTISS payments.',
            form: `
                <div class="space-y-4">
                    <div>
                        <canvas id="reserveModalChart" width="400" height="400"></canvas>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="transaction-table">
                            <thead>
                                <tr>
                                    <th>Commodity</th>
                                    <th>Percentage</th>
                                    <th>Value (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.reserves.composition.map(item => `
                                    <tr>
                                        <td>${item.commodity}</td>
                                        <td>${item.percentage}%</td>
                                        <td>$${(item.percentage * 1000000).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `
        },
        storage: {
            title: 'Reserve Storage',
            description: 'Details on secure global custodial frameworks for commodities.',
            form: `
                <div class="space-y-4">
                    <div class="overflow-x-auto">
                        <table class="transaction-table">
                            <thead>
                                <tr>
                                    <th>Commodity</th>
                                    <th>Storage Location</th>
                                    <th>Country</th>
                                    <th>Audit Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.reserves.storage.map(item => `
                                    <tr>
                                        <td>${item.commodity}</td>
                                        <td>${item.location}</td>
                                        <td>${item.country}</td>
                                        <td><span class="text-green-600">Audited</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="p-4 bg-gray-100 rounded">
                        <h3 class="font-semibold">Audit Information</h3>
                        <p class="mt-2">All reserves are audited quarterly by independent auditors.</p>
                        <p class="mt-2">Last audit date: April 30, 2025</p>
                        <p class="mt-2">Next audit date: July 31, 2025</p>
                    </div>
                </div>
            `
        },
        offline: {
            title: 'Offline Transactions',
            description: 'Setup USSD, SMS, or NFC-based transactions in multiple languages for low-connectivity areas.',
            form: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Offline Method</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>USSD</option>
                            <option>SMS</option>
                            <option>NFC</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Language</label>
                        <select class="w-full border border-gray-300 rounded px-3 py-2">
                            <option>English</option>
                            <option>French</option>
                            <option>Arabic</option>
                            <option>Swahili</option>
                            <option>Portuguese</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700">Phone Number</label>
                        <input type="tel" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">PIN Code</label>
                        <input type="password" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="mockSetupOffline()">Setup Offline Access</button>
                </div>
            `
        }
    };
    
    return content[type] || {
        title: 'Modal',
        description: 'This is a modal window.'
    };
}

// Render transaction table
function renderTransactionTable(filter = 'all') {
    const container = document.getElementById('transactionsTableContainer');
    let transactions = mockData.transactions;
    
    if (filter !== 'all') {
        transactions = transactions.filter(tx => tx.type === filter);
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Counterparty</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(tx => `
                        <tr>
                            <td>${tx.id}</td>
                            <td>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
                            <td>${tx.amount}</td>
                            <td>${tx.to || tx.from || tx.with || 'N/A'}</td>
                            <td>${tx.date}</td>
                            <td><span class="text-green-600">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

const translations = {
    en: {
        home: "Home",
        dashboard: "Dashboard",
        trade: "Trade",
        compliance: "Compliance",
        login: "Login",
        logout: "Logout",
        wallet: "Wallet",
        payments: "Payments",
        govServices: "Government Services",
        msmeEnablement: "MSME Enablement",
        defiHub: "DeFi Hub",
        logistics: "Logistics",
        reserves: "Reserves",
        pension: "Pension",
        walletTitle: "Multi-Currency Wallet",
        walletDesc: "Balances (Global Access):",
        paymentsTitle: "Multi-Payment Rail",
        paymentsDesc: "Pay with fiat, CBDC, stablecoin, crypto, tokenized assets, or commodities.",
        govServicesTitle: "Government Services",
        govServicesDesc: "Pay taxes, licenses, permits, and utilities in Nigeria and AfCFTA countries.",
        recentTransactions: "Recent Transactions",
        viewAll: "View All",
        defiTitle: "DeFi Hub for Inclusion",
        defiDesc: "Micro-lending, women/youth programs, and gamified savings.",
        msmeTitle: "MSME Trade & Enablement",
        msmeDesc: "Access financing, trade tools, and capacity building.",
        logisticsTitle: "Smart Logistics",
        logisticsDesc: "Track global shipments with IoT and AI.",
        monetaryTitle: "Programmable Monetary Policy",
        monetaryDesc: "Manage inflation controls and MPR via smart contracts.",
        pensionTitle: "Pension Module",
        pensionDesc: "Micro-pensions and DeFi retirement plans.",
        tradeTitle: "Global Trade & Supply Chain Facilitation",
        reservesTitle: "Commodity Reserve Structure",
        reservesDesc: "Dynamic basket of African commodities backing payments.",
        storageTitle: "Reserve Storage Framework",
        storageDesc: "Secure global custodial framework for commodities.",
        manageWallet: "Manage Wallet",
        makePayment: "Make Payment",
        payNow: "Pay Now",
        getStarted: "Get Started",
        joinDeFi: "Join DeFi",
        trackNow: "Track Now",
        configurePolicy: "Configure Policy",
        enrollNow: "Enroll Now",
        viewDetails: "View Details",
        reserveComposition: "Reserve Composition"
    },
    fr: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        trade: "Commerce",
        compliance: "Conformité",
        login: "Connexion",
        logout: "Déconnexion",
        wallet: "Portefeuille",
        payments: "Paiements",
        govServices: "Services gouvernementaux",
        msmeEnablement: "Activation PME",
        defiHub: "Hub DeFi",
        logistics: "Logistique",
        reserves: "Réserves",
        pension: "Pension",
        walletTitle: "Portefeuille multi-devises",
        walletDesc: "Soldes (accès global) :",
        paymentsTitle: "Système de paiement multiple",
        paymentsDesc: "Payez avec fiat, CBDC, stablecoin, crypto, actifs tokenisés ou matières premières.",
        govServicesTitle: "Services gouvernementaux",
        govServicesDesc: "Payez les taxes, licences, permis et services publics au Nigeria et dans les pays de la ZLECAf.",
        recentTransactions: "Transactions récentes",
        viewAll: "Voir tout",
        defiTitle: "Hub DeFi pour l'inclusion",
        defiDesc: "Microcrédit, programmes pour femmes/jeunes et épargne ludique.",
        msmeTitle: "Commerce et autonomisation des PME",
        msmeDesc: "Accès au financement, outils commerciaux et renforcement des capacités.",
        logisticsTitle: "Logistique intelligente",
        logisticsDesc: "Suivez les expéditions mondiales avec IoT et IA.",
        monetaryTitle: "Politique monétaire programmable",
        monetaryDesc: "Gérez les contrôles de l'inflation et le TMP via des contrats intelligents.",
        pensionTitle: "Module de retraite",
        pensionDesc: "Micro-retraites et plans de retraite DeFi.",
        tradeTitle: "Facilitation du commerce mondial et de la chaîne d'approvisionnement",
        reservesTitle: "Structure des réserves de matières premières",
        reservesDesc: "Panier dynamique de matières premières africaines soutenant les paiements.",
        storageTitle: "Cadre de stockage des réserves",
        storageDesc: "Cadre de garde sécurisé à l'échelle mondiale pour les matières premières.",
        manageWallet: "Gérer le portefeuille",
        makePayment: "Effectuer un paiement",
        payNow: "Payer maintenant",
        getStarted: "Commencer",
        joinDeFi: "Rejoindre DeFi",
        trackNow: "Suivre maintenant",
        configurePolicy: "Configurer la politique",
        enrollNow: "S'inscrire maintenant",
        viewDetails: "Voir les détails",
        reserveComposition: "Composition des réserves"
    },
    ar: {
        home: "الصفحة الرئيسية",
        dashboard: "لوحة التحكم",
        trade: "تجارة",
        compliance: "الامتثال",
        login: "تسجيل الدخول",
        logout: "تسجيل خروج",
        wallet: "محفظة",
        payments: "المدفوعات",
        govServices: "الخدمات الحكومية",
        msmeEnablement: "تمكين المشاريع الصغيرة والمتوسطة",
        defiHub: "مركز التمويل اللامركزي",
        logistics: "الخدمات اللوجستية",
        reserves: "احتياطيات",
        pension: "معاش",
        reserveComposition: "تكوين الاحتياطي"
    },
    sw: {
        home: "Nyumbani",
        dashboard: "Dashibodi",
        trade: "Biashara",
        compliance: "Uzingatifu",
        login: "Ingia",
        logout: "Ondoka",
        wallet: "Mkoba",
        payments: "Malipo",
        govServices: "Huduma za Serikali",
        msmeEnablement: "Uwezeshaji wa MSME",
        defiHub: "Kituo cha DeFi",
        logistics: "Usafirishaji",
        reserves: "Akiba",
        pension: "Pensheni",
        reserveComposition: "Muundo wa Akiba"
    }
};

// Filter transactions
function filterTransactions(type) {
    renderTransactionTable(type);
}

// Update exchange rate
function updateExchangeRate() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
    
    if (fromCurrency && toCurrency) {
        const rate = mockData.exchangeRates[fromCurrency][toCurrency];
        const toAmount = fromAmount * rate;
        
        document.getElementById('toAmount').value = toAmount.toFixed(4);
        document.getElementById('exchangeRateInfo').innerHTML = `
            <p>1 ${fromCurrency} = ${rate} ${toCurrency}</p>
            <p>${fromAmount} ${fromCurrency} = ${toAmount.toFixed(4)} ${toCurrency}</p>
        `;
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        // On mobile, toggle between collapsed and expanded states
        if (sidebar.classList.contains('collapsed')) {
            sidebar.style.height = 'auto';
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.style.height = '60px';
            sidebar.classList.add('collapsed');
        }
    } else {
        // On desktop, just toggle collapsed class
        sidebar.classList.toggle('collapsed');
    }
}

function changeLanguage() {
    const selector = document.getElementById('language-selector');
    const lang = selector.value;
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update all buttons with data-translate-button attribute
    document.querySelectorAll('[data-translate-button]').forEach(button => {
        const key = button.getAttribute('data-translate-button');
        if (translations[lang] && translations[lang][key]) {
            button.textContent = translations[lang][key];
        }
    });
    
    // Update titles and descriptions in cards
    document.querySelectorAll('.card h3').forEach(title => {
        const key = title.textContent.trim().replace(/\s+/g, '') + 'Title';
        if (translations[lang] && translations[lang][key]) {
            title.textContent = translations[lang][key];
        }
    });
    
    document.querySelectorAll('.card p.text-gray-600').forEach(desc => {
        const parentTitle = desc.previousElementSibling?.textContent.trim().replace(/\s+/g, '') || '';
        const key = parentTitle + 'Desc';
        if (translations[lang] && translations[lang][key]) {
            desc.textContent = translations[lang][key];
        }
    });
    
    // Update section titles
    document.querySelectorAll('section h2').forEach(sectionTitle => {
        const key = sectionTitle.textContent.trim().replace(/\s+/g, '') + 'Title';
        if (translations[lang] && translations[lang][key]) {
            sectionTitle.textContent = translations[lang][key];
        }
    });
    
    // Store language preference
    localStorage.setItem('pftiss-language', lang);
    
    // Show language notification
    const langName = selector.options[selector.selectedIndex].text;
    showLanguageNotification(`${langName} activated`);
}

function showLanguageNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.replace('fade-in', 'fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 1700);
}

// Mock functions for various actions
function mockLogin() {
    alert('Login successful! Redirecting to dashboard...');
    closeModal();
}

function mockSendTransaction() {
    alert('Transaction submitted successfully!');
    closeModal();
}

function mockExchange() {
    alert('Currency exchange completed!');
    closeModal();
}

function mockAddFunds() {
    alert('Deposit request submitted!');
    closeModal();
}

function mockGovPayment(service) {
    alert(`Payment for ${service} initiated successfully!`);
    closeModal();
}

function mockDeFiAction(action) {
    alert(`${action} feature accessed successfully!`);
    closeModal();
}

function mockMSMEAction(action) {
    alert(`${action} feature accessed successfully!`);
    closeModal();
}

function mockTrackShipment() {
    document.getElementById('shipmentStatus').classList.remove('hidden');
}

function mockMonetaryPolicy(action) {
    alert(`${action} configured successfully!`);
    closeModal();
}

function mockEnrollPension() {
    alert('Pension enrollment submitted successfully!');
    closeModal();
}

function mockSupplyChainFinance() {
    alert('Supply chain finance application submitted successfully!');
    closeModal();
}

function mockCustomsClearance() {
    document.getElementById('customsResult').classList.remove('hidden');
}

function mockCreateContract() {
    alert('Smart contract created successfully!');
    closeModal();
}

function mockCalculateTax() {
    document.getElementById('taxResult').classList.remove('hidden');
}

function mockKYCSubmission() {
    alert('KYC documents submitted for verification!');
    closeModal();
}

function mockGenerateReport() {
    alert('Report generated successfully!');
    closeModal();
}

function mockVote(proposal) {
    alert(`Vote submitted for ${proposal} successfully!`);
    closeModal();
}

function mockCreateProposal() {
    alert('New proposal submitted successfully!');
    closeModal();
}

function mockSetupOffline() {
    alert('Offline access configured successfully!');
    closeModal();
}

// Initialize reserve chart in modal
function initReserveModalChart() {
    const ctx = document.getElementById('reserveModalChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: mockData.reserves.composition.map(item => item.commodity),
            datasets: [{
                data: mockData.reserves.composition.map(item => item.percentage),
                backgroundColor: [
                    '#FFD700', '#000000', '#B87333', 
                    '#CCCCCC', '#8B4513', '#3B82F6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

// Handle modal clicks
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Initialize specific modal content when shown
document.getElementById('modal').addEventListener('shown', function() {
    const modalTitle = document.getElementById('modalTitle').textContent;
    
    if (modalTitle.includes('Reserve Composition')) {
        initReserveModalChart();
    }
});

// Helper function to trigger custom 'shown' event
const modal = document.getElementById('modal');
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
            if (modal.classList.contains('show')) {
                const event = new Event('shown');
                modal.dispatchEvent(event);
            }
        }
    });
});

observer.observe(modal, {
    attributes: true
});

// File upload handling
function handleFileUpload(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = e.target.result;
        callback(data);
    };
    
    reader.readAsDataURL(file);
}

// Export transaction history
function exportTransactions(format) {
    let content, mimeType, fileName;
    
    switch (format) {
        case 'csv':
            content = 'ID,Type,Amount,Counterparty,Date,Status\n';
            mockData.transactions.forEach(tx => {
                content += `${tx.id},${tx.type},${tx.amount},"${tx.to || tx.from || tx.with || 'N/A'}",${tx.date},${tx.status}\n`;
            });
            mimeType = 'text/csv';
            fileName = 'transactions.csv';
            break;
            
        case 'json':
            content = JSON.stringify(mockData.transactions, null, 2);
            mimeType = 'application/json';
            fileName = 'transactions.json';
            break;
            
        case 'pdf':
            alert('PDF export would be generated here');
            return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Sample data export function
function exportSampleData() {
    const data = {
        platform: "PFTISS",
        description: "Pan-African Financial & Trade Infrastructure Settlement System",
        features: [
            "Multi-currency wallet",
            "Commodity-backed stablecoin",
            "Cross-border payments",
            "Smart contracts",
            "DeFi integration"
        ],
        sampleTransactions: mockData.transactions,
        sampleReserves: mockData.reserves
    };
    
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pftiss_sample_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        const tooltipText = el.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'hidden absolute z-50 bg-gray-800 text-white text-xs rounded py-1 px-2';
        tooltip.textContent = tooltipText;
        el.appendChild(tooltip);
        
        el.addEventListener('mouseenter', function() {
            tooltip.classList.remove('hidden');
        });
        
        el.addEventListener('mouseleave', function() {
            tooltip.classList.add('hidden');
        });
    });
}

// Format currency
function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    });
    
    return formatter.format(amount);
}

// Sample API call simulation
async function simulateAPICall(endpoint, data) {
    return new Promise(resolve => {
        setTimeout(() => {
            let response;
            
            switch (endpoint) {
                case '/auth/login':
                    response = { success: true, token: 'mock-token', user: mockData.user };
                    break;
                    
                case '/wallet/balance':
                    response = { success: true, balances: mockData.wallet.balances };
                    break;
                    
                case '/transactions':
                    response = { success: true, transactions: mockData.transactions };
                    break;
                    
                default:
                    response = { success: true, data: { endpoint, ...data } };
            }
            
            resolve(response);
        }, 500); // Simulate network delay
    });
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('pftiss-language') || 'en';
    document.getElementById('language-selector').value = savedLang;
    changeLanguage();
}

// Initialize the app
window.addEventListener('load', function() {
    loadLanguagePreference();
    // Load initial data
    loadWalletBalances();
    loadRecentTransactions();
    loadReserveData();
    
    // Initialize components
    initTooltips();
    setupEventListeners();
    
    // Simulate API initialization
    simulateAPICall('/auth/init', {})
        .then(response => {
            console.log('API initialized:', response);
        });
    
    // Add sample export button for demonstration
    const footer = document.querySelector('footer .container');
    if (footer) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4';
        exportBtn.textContent = 'Export Sample Data';
        exportBtn.onclick = exportSampleData;
        footer.appendChild(exportBtn);
    }
});

// Expose some functions to the global scope for demonstration
window.PFTISS = {
    showModal,
    closeModal,
    exportTransactions,
    simulateAPICall,
    formatCurrency
};