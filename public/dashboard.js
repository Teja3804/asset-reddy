// Dashboard page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('usernameDisplay').textContent = `@${user.username}`;

    // Initialize dashboard
    loadDashboard();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addFundsBtn').addEventListener('click', () => showModal('addFundsModal'));
    document.getElementById('withdrawFundsBtn').addEventListener('click', () => showModal('withdrawFundsModal'));
    
    // Modal close events
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            hideAllModals();
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });

    // Add funds functionality
    document.getElementById('confirmAddFunds').addEventListener('click', addFunds);
    
    // Withdraw funds functionality
    document.getElementById('confirmWithdraw').addEventListener('click', withdrawFunds);

    // Investment functionality
    document.getElementById('confirmInvestment').addEventListener('click', makeInvestment);

    // Load dashboard data
    async function loadDashboard() {
        try {
            await Promise.all([
                loadUserInvestments(),
                loadAvailableFunds(),
                loadInvestmentFunds()
            ]);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            showMessage('Error loading dashboard data', 'error');
        }
    }

    // Load user investments
    async function loadUserInvestments() {
        try {
            const response = await fetch('/api/user-investments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const investments = await response.json();
                displayUserInvestments(investments);
            }
        } catch (error) {
            console.error('Error loading user investments:', error);
        }
    }

    // Display user investments
    function displayUserInvestments(investments) {
        const container = document.getElementById('userInvestmentsContainer');
        
        if (investments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No investments yet. Start investing in our funds!</p>';
            return;
        }

        container.innerHTML = investments.map(investment => `
            <div class="investment-card">
                <h3>${investment.fund_name}</h3>
                <div class="investment-info">
                    <div>
                        <span class="label">Invested Amount</span>
                        <span class="value">₹${investment.amount_invested.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="label">Current Value</span>
                        <span class="value">₹${investment.current_value.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="label">Yearly Return</span>
                        <span class="value">${investment.yearly_return}%</span>
                    </div>
                    <div>
                        <span class="label">Investment Date</span>
                        <span class="value">${new Date(investment.investment_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Load available funds
    async function loadAvailableFunds() {
        try {
            const response = await fetch('/api/available-funds', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('availableAmount').textContent = `₹${data.available_amount.toLocaleString()}`;
            }
        } catch (error) {
            console.error('Error loading available funds:', error);
        }
    }

    // Load investment funds
    async function loadInvestmentFunds() {
        try {
            const response = await fetch('/api/funds');

            if (response.ok) {
                const funds = await response.json();
                displayInvestmentFunds(funds);
            }
        } catch (error) {
            console.error('Error loading investment funds:', error);
        }
    }

    // Display investment funds
    function displayInvestmentFunds(funds) {
        const container = document.getElementById('fundsContainer');
        
        container.innerHTML = funds.map(fund => `
            <div class="fund-card" data-fund-id="${fund.id}">
                <h3>${fund.fund_name}</h3>
                <div class="fund-info">
                    <div>
                        <span class="label">Total Fund Value</span>
                        <span class="value">₹${fund.total_value.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="label">Yearly Return</span>
                        <span class="value">${fund.yearly_return}%</span>
                    </div>
                </div>
                <div class="fund-actions">
                    <button class="btn-secondary" onclick="viewFundDetails(${fund.id})">View Details</button>
                    <button class="btn-primary" onclick="investInFund(${fund.id}, '${fund.fund_name}')">Invest</button>
                </div>
            </div>
        `).join('');
    }

    // View fund details
    window.viewFundDetails = function(fundId) {
        fetch(`/api/funds`)
            .then(response => response.json())
            .then(funds => {
                const fund = funds.find(f => f.id == fundId);
                if (fund) {
                    displayFundDetails(fund);
                    showModal('fundDetailsModal');
                }
            })
            .catch(error => {
                console.error('Error loading fund details:', error);
                showMessage('Error loading fund details', 'error');
            });
    };

    // Display fund details
    function displayFundDetails(fund) {
        const content = document.getElementById('fundDetailsContent');
        
        // Parse allocation string
        const allocationItems = fund.allocation.split(', ').map(item => {
            const [category, percentage] = item.split(' ');
            return { category, percentage };
        });

        content.innerHTML = `
            <div class="fund-details-content">
                <div class="fund-details-header">
                    <h3>${fund.fund_name}</h3>
                    <p>${fund.description}</p>
                </div>
                
                <div class="fund-details-info">
                    <div>
                        <span class="label">Total Fund Value</span>
                        <span class="value">₹${fund.total_value.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="label">Yearly Return</span>
                        <span class="value">${fund.yearly_return}%</span>
                    </div>
                </div>
                
                <div class="fund-allocation">
                    <h4>Fund Allocation</h4>
                    ${allocationItems.map(item => `
                        <div class="allocation-item">
                            <span class="allocation-category">${item.category}</span>
                            <span class="allocation-percentage">${item.percentage}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="fund-actions">
                    <button class="btn-primary" onclick="investInFund(${fund.id}, '${fund.fund_name}')">Invest Now</button>
                </div>
            </div>
        `;
    }

    // Invest in fund
    window.investInFund = function(fundId, fundName) {
        document.getElementById('selectedFundName').textContent = fundName;
        document.getElementById('investmentModal').setAttribute('data-fund-id', fundId);
        showModal('investmentModal');
    };

    // Make investment
    async function makeInvestment() {
        const fundId = document.getElementById('investmentModal').getAttribute('data-fund-id');
        const amount = parseFloat(document.getElementById('investmentAmount').value);

        if (!amount || amount < 100) {
            showMessage('Please enter a valid amount (minimum ₹100)', 'error');
            return;
        }

        try {
            const response = await fetch('/api/invest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fund_id: fundId, amount: amount })
            });

            const data = await response.json();

            if (response.ok) {
                hideAllModals();
                showMessage('Investment successful!', 'success');
                
                // Reload dashboard data
                setTimeout(() => {
                    loadDashboard();
                }, 1000);
            } else {
                showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Investment error:', error);
            showMessage('Network error. Please try again.', 'error');
        }
    }

    // Add funds
    async function addFunds() {
        const amount = parseFloat(document.getElementById('addAmount').value);

        if (!amount || amount < 100) {
            showMessage('Please enter a valid amount (minimum ₹100)', 'error');
            return;
        }

        try {
            const response = await fetch('/api/add-funds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: amount })
            });

            const data = await response.json();

            if (response.ok) {
                hideAllModals();
                showMessage('Funds added successfully!', 'success');
                
                // Reload available funds
                loadAvailableFunds();
                
                // Clear input
                document.getElementById('addAmount').value = '';
            } else {
                showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Add funds error:', error);
            showMessage('Network error. Please try again.', 'error');
        }
    }

    // Withdraw funds
    async function withdrawFunds() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);

        if (!amount || amount < 100) {
            showMessage('Please enter a valid amount (minimum ₹100)', 'error');
            return;
        }

        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: amount })
            });

            const data = await response.json();

            if (response.ok) {
                hideAllModals();
                showMessage('Withdrawal successful!', 'success');
                
                // Reload available funds
                loadAvailableFunds();
                
                // Clear input
                document.getElementById('withdrawAmount').value = '';
            } else {
                showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            showMessage('Network error. Please try again.', 'error');
        }
    }

    // Show modal
    function showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    // Hide all modals
    function hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Show message
    function showMessage(message, type = 'info') {
        const modal = document.getElementById('messageModal');
        const title = document.getElementById('messageTitle');
        const text = document.getElementById('messageText');
        
        title.textContent = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info';
        title.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        text.textContent = message;
        
        modal.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }

    // Logout
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});
