// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signinLink = document.getElementById('signinLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeModal = document.querySelector('.close');

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please try again.');
        }
    });

    // Navigate to signin page
    signinLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'signin.html';
    });

    // Navigate to forgot password page (placeholder)
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showError('Forgot password functionality will be implemented soon.');
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            errorModal.style.display = 'none';
        }
    });

    // Function to show error modal
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }
});
