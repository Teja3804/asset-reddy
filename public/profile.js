// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('usernameDisplay').textContent = `@${user.username}`;

    // Initialize profile
    loadProfile();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addFundsBtn').addEventListener('click', () => showModal('addFundsModal'));
    document.getElementById('withdrawFundsBtn').addEventListener('click', () => showModal('withdrawFundsModal'));
    document.getElementById('toggleHistory').addEventListener('click', toggleHistory);
    document.getElementById('changePasswordBtn').addEventListener('click', () => showModal('changePasswordModal'));
    document.getElementById('changeEmailBtn').addEventListener('click', () => showModal('changeEmailModal'));
    document.getElementById('changePhoneBtn').addEventListener('click', () => showModal('changePhoneModal'));
    document.getElementById('supportBtn').addEventListener('click', () => showModal('supportModal'));
    
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

    // Change password functionality
    document.getElementById('confirmChangePassword').addEventListener('click', changePassword);

    // Change email functionality
    document.getElementById('sendPhoneOtp').addEventListener('click', sendPhoneOtpForEmail);
    document.getElementById('confirmChangeEmail').addEventListener('click', changeEmail);

    // Change phone functionality
    document.getElementById('sendEmailOtp').addEventListener('click', sendEmailOtpForPhone);
    document.getElementById('sendPhoneOtp2').addEventListener('click', sendPhoneOtpForPhone);
    document.getElementById('confirmChangePhone').addEventListener('click', changePhone);

    // Support functionality
    document.getElementById('sendSupport').addEventListener('click', sendSupportTicket);

    // Load profile data
    async function loadProfile() {
        try {
            await Promise.all([
                loadUserProfile(),
                loadAvailableFunds(),
                loadTransactionHistory()
            ]);
        } catch (error) {
            console.error('Error loading profile:', error);
            showMessage('Error loading profile data', 'error');
        }
    }

    // Load user profile
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                displayUserProfile(profile);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    // Display user profile
    function displayUserProfile(profile) {
        document.getElementById('fullName').textContent = `${profile.first_name} ${profile.last_name}`;
        document.getElementById('username').textContent = profile.username;
        document.getElementById('panNumber').textContent = profile.pan;
        document.getElementById('aadharNumber').textContent = profile.aadhar;
        document.getElementById('email').textContent = profile.email;
        document.getElementById('phone').textContent = `${profile.country_code} ${profile.phone}`;
        document.getElementById('address').textContent = profile.address;
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

    // Load transaction history
    async function loadTransactionHistory() {
        try {
            const response = await fetch('/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const transactions = await response.json();
                displayTransactionHistory(transactions);
            }
        } catch (error) {
            console.error('Error loading transaction history:', error);
        }
    }

    // Display transaction history
    function displayTransactionHistory(transactions) {
        const container = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No transactions yet.</p>';
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-header">
                    <span class="transaction-type">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                    <span class="transaction-amount">₹${transaction.amount.toLocaleString()}</span>
                </div>
                <div class="transaction-date">${new Date(transaction.transaction_date).toLocaleString()}</div>
                <div class="transaction-description">${transaction.description}</div>
            </div>
        `).join('');
    }

    // Toggle transaction history
    function toggleHistory() {
        const container = document.getElementById('historyContainer');
        const button = document.getElementById('toggleHistory');
        const icon = button.querySelector('i');
        
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'block';
            button.querySelector('span').textContent = 'Hide History';
            icon.className = 'fas fa-chevron-up';
        } else {
            container.style.display = 'none';
            button.querySelector('span').textContent = 'Show History';
            icon.className = 'fas fa-chevron-down';
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

    // Change password
    async function changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('New password must be at least 6 characters long', 'error');
            return;
        }

        // In a real application, you would make an API call here
        // For now, we'll just show a success message
        hideAllModals();
        showMessage('Password changed successfully!', 'success');
        
        // Clear inputs
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }

    // Send phone OTP for email change
    function sendPhoneOtpForEmail() {
        // In a real application, this would send an OTP to the user's phone
        showMessage('OTP sent to your phone number', 'success');
    }

    // Change email
    async function changeEmail() {
        const newEmail = document.getElementById('newEmail').value;
        const phoneOtp = document.getElementById('phoneVerification').value;

        if (!newEmail || !phoneOtp) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (phoneOtp !== '123456') { // Simulated OTP verification
            showMessage('Invalid phone OTP', 'error');
            return;
        }

        // In a real application, you would make an API call here
        hideAllModals();
        showMessage('Email changed successfully!', 'success');
        
        // Clear inputs
        document.getElementById('newEmail').value = '';
        document.getElementById('phoneVerification').value = '';
    }

    // Send email OTP for phone change
    function sendEmailOtpForPhone() {
        // In a real application, this would send an OTP to the user's email
        showMessage('OTP sent to your email address', 'success');
    }

    // Send phone OTP for phone change
    function sendPhoneOtpForPhone() {
        // In a real application, this would send an OTP to the user's phone
        showMessage('OTP sent to your phone number', 'success');
    }

    // Change phone
    async function changePhone() {
        const newPhone = document.getElementById('newPhone').value;
        const emailOtp = document.getElementById('emailVerification').value;
        const phoneOtp = document.getElementById('phoneVerification2').value;

        if (!newPhone || !emailOtp || !phoneOtp) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (emailOtp !== '123456' || phoneOtp !== '123456') { // Simulated OTP verification
            showMessage('Invalid OTP(s)', 'error');
            return;
        }

        // In a real application, you would make an API call here
        hideAllModals();
        showMessage('Phone number changed successfully!', 'success');
        
        // Clear inputs
        document.getElementById('newPhone').value = '';
        document.getElementById('emailVerification').value = '';
        document.getElementById('phoneVerification2').value = '';
    }

    // Send support ticket
    async function sendSupportTicket() {
        const subject = document.getElementById('supportSubject').value.trim();
        const message = document.getElementById('supportMessage').value.trim();

        if (!subject || !message) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch('/api/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message })
            });

            const data = await response.json();

            if (response.ok) {
                hideAllModals();
                showMessage(`Support ticket created successfully! Ticket #: ${data.ticketNumber}`, 'success');
                
                // Clear inputs
                document.getElementById('supportSubject').value = '';
                document.getElementById('supportMessage').value = '';
            } else {
                showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Support ticket error:', error);
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
