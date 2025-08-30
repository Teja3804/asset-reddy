// Configuration file for Asset Management Reddy
module.exports = {
    // Email Configuration - Using Ethereal Email for testing
    email: {
        service: 'gmail',
        user: 'test@example.com',             // This will be overridden by test config
        pass: 'test-password',                // This will be overridden by test config
        from: 'test@example.com'              // This will be overridden by test config
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        jwtSecret: 'your-secret-key-change-in-production'
    },
    
    // OTP Configuration
    otp: {
        expiryMinutes: 10,                   // OTP validity in minutes
        length: 6                             // OTP length
    },
    
    // Support Email
    support: {
        email: 'guddeti.bhargavareddy@gmail.com'
    }
};
