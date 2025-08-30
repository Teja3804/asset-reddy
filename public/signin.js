// Signin/Registration page functionality
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const emailOtpModal = document.getElementById('emailOtpModal');
    const phoneOtpModal = document.getElementById('phoneOtpModal');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeModals = document.querySelectorAll('.close');

    let currentUserData = {};
    let emailOtpVerified = false;
    let phoneOtpVerified = false;

    // Handle signin form submission
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form data
        const formData = getFormData();
        if (!validateFormData(formData)) {
            return;
        }

        // Store user data for later use
        currentUserData = formData;

        // Show email OTP modal
        emailOtpModal.style.display = 'block';
        
        // Send real email OTP
        await sendEmailOtp(formData.email);
    });

    // Send email OTP
    async function sendEmailOtp(email) {
        try {
            const response = await fetch('/api/send-email-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                // Show OTP in UI for testing purposes
                const otpMessage = `OTP sent successfully! Your OTP is: ${data.otp}`;
                showMessage(otpMessage, 'success');
                
                // Also log to console
                console.log('📧 Email OTP received:', data.otp);
                console.log('📧 Note:', data.note);
            } else {
                showError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Email OTP error:', error);
            showError('Network error. Please try again.');
        }
    }

    // Send phone OTP
    async function sendPhoneOtp(phone, countryCode) {
        try {
            const response = await fetch('/api/send-phone-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: phone, country_code: countryCode })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('OTP sent to your phone! Please check your messages.', 'success');
                // For development, show OTP in console
                if (data.otp) {
                    console.log('Phone OTP (for testing):', data.otp);
                }
            } else {
                showError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Phone OTP error:', error);
            showError('Network error. Please try again.');
        }
    }

    // Verify email OTP
    document.getElementById('verifyEmailOtp').addEventListener('click', async function() {
        const enteredOtp = document.getElementById('emailOtp').value.trim();
        
        if (!enteredOtp) {
            showError('Please enter the OTP sent to your email.');
            return;
        }

        try {
            const response = await fetch('/api/verify-email-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: currentUserData.email, 
                    otp: enteredOtp 
                })
            });

            const data = await response.json();

            if (response.ok) {
                emailOtpVerified = true;
                emailOtpModal.style.display = 'none';
                phoneOtpModal.style.display = 'block';
                
                // Send phone OTP
                await sendPhoneOtp(currentUserData.phone, currentUserData.country_code);
                
                // Clear email OTP input
                document.getElementById('emailOtp').value = '';
            } else {
                showError(data.error || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Email OTP verification error:', error);
            showError('Network error. Please try again.');
        }
    });

    // Verify phone OTP
    document.getElementById('verifyPhoneOtp').addEventListener('click', async function() {
        const enteredOtp = document.getElementById('phoneOtp').value.trim();
        
        if (!enteredOtp) {
            showError('Please enter the OTP sent to your phone.');
            return;
        }

        try {
            const response = await fetch('/api/verify-phone-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    phone: currentUserData.phone, 
                    country_code: currentUserData.country_code,
                    otp: enteredOtp 
                })
            });

            const data = await response.json();

            if (response.ok) {
                phoneOtpVerified = true;
                phoneOtpModal.style.display = 'none';
                
                // Proceed with user registration
                await registerUser();
            } else {
                showError(data.error || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Phone OTP verification error:', error);
            showError('Network error. Please try again.');
        }
    });

    // Close all modals
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            emailOtpModal.style.display = 'none';
            phoneOtpModal.style.display = 'none';
            successModal.style.display = 'none';
            errorModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === emailOtpModal) {
            emailOtpModal.style.display = 'none';
        }
        if (e.target === phoneOtpModal) {
            phoneOtpModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
        if (e.target === errorModal) {
            errorModal.style.display = 'none';
        }
    });

    // Get form data
    function getFormData() {
        return {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            pan: document.getElementById('pan').value.trim().toUpperCase(),
            aadhar: document.getElementById('aadhar').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            country_code: document.getElementById('countryCode').value
        };
    }

    // Validate form data
    function validateFormData(data) {
        // Check if passwords match
        if (data.password !== data.confirmPassword) {
            showError('Passwords do not match');
            return false;
        }

        // Check password length
        if (data.password.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }

        // Validate PAN format (ABCDE1234F)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(data.pan)) {
            showError('Please enter a valid PAN number (e.g., ABCDE1234F)');
            return false;
        }

        // Validate Aadhar (12 digits)
        const aadharRegex = /^[0-9]{12}$/;
        if (!aadharRegex.test(data.aadhar)) {
            showError('Please enter a valid 12-digit Aadhar number');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('Please enter a valid email address');
            return false;
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(data.phone)) {
            showError('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    }

    // Register user
    async function registerUser() {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentUserData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success modal
                successModal.style.display = 'block';
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                showError(data.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please try again.');
        }
    }

    // Function to show error modal
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }

    // Function to show success message
    function showMessage(message, type = 'info') {
        // Create a temporary message display
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Real-time validation
    document.getElementById('pan').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });

    document.getElementById('aadhar').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 12);
    });

    document.getElementById('phone').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
    });

    // Password confirmation validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (confirmPassword && password !== confirmPassword) {
            document.getElementById('confirmPassword').style.borderColor = '#ff4757';
        } else {
            document.getElementById('confirmPassword').style.borderColor = '#e1e5e9';
        }
    });
});
