# 📧 Email OTP Setup Guide for Asset Management Reddy

This guide will help you set up real email OTPs for user registration and verification.

## 🚀 **What's Been Implemented**

✅ **Real Email OTP System**: OTPs are now sent via actual emails  
✅ **Beautiful Email Templates**: Professional-looking HTML emails  
✅ **OTP Expiry Management**: Configurable OTP validity periods  
✅ **Error Handling**: Proper error messages and user feedback  
✅ **Configuration File**: Easy-to-modify settings  

## ⚙️ **Step 1: Configure Your Gmail Account**

### 1.1 Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the steps to enable 2FA

### 1.2 Generate App Password
1. In the same Security section, click "App passwords"
2. Select "Mail" as the app and "Other" as the device
3. Click "Generate"
4. **Copy the 16-character password** (you'll need this)

## ⚙️ **Step 2: Update Configuration File**

Edit the `config.js` file and replace the placeholder values:

```javascript
// Configuration file for Asset Management Reddy
module.exports = {
    // Email Configuration
    email: {
        service: 'gmail',
        user: 'your-actual-email@gmail.com',        // Your real Gmail address
        pass: 'abcd efgh ijkl mnop',               // Your 16-character app password
        from: 'your-actual-email@gmail.com'        // Your real Gmail address
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        jwtSecret: 'your-secret-key-change-in-production'
    },
    
    // OTP Configuration
    otp: {
        expiryMinutes: 10,                         // OTP validity in minutes
        length: 6                                   // OTP length
    },
    
    // Support Email
    support: {
        email: 'guddeti.bhargavareddy@gmail.com'
    }
};
```

**Important**: Replace `your-actual-email@gmail.com` with your real Gmail address and `abcd efgh ijkl mnop` with your actual app password.

## ⚙️ **Step 3: Test the System**

### 3.1 Start the Server
```bash
npm start
```

### 3.2 Test Registration
1. Open `http://localhost:3000` in your browser
2. Click "Sign In" to go to registration page
3. Fill in the registration form with a real email address
4. Submit the form
5. Check your email inbox for the OTP

### 3.3 Check Server Logs
The server console will show:
```
Email OTP sent to user@example.com: 123456
```

## 🔍 **Troubleshooting Common Issues**

### Issue 1: "Failed to send OTP" Error
**Cause**: Incorrect email configuration
**Solution**: 
- Double-check your Gmail address in `config.js`
- Verify your app password is correct
- Ensure 2FA is enabled on your Google account

### Issue 2: "Authentication failed" Error
**Cause**: Wrong app password
**Solution**:
- Generate a new app password
- Make sure you're using the 16-character app password, not your regular Gmail password

### Issue 3: Emails going to Spam
**Solution**:
- Check your spam folder
- Add the sender email to your contacts
- Mark the email as "Not Spam"

## 📱 **Phone OTP Setup (Optional)**

Currently, phone OTPs are simulated (logged to console). To enable real SMS:

### Option 1: Twilio Integration
1. Sign up for [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Install: `npm install twilio`
4. Update the phone OTP function in `server.js`

### Option 2: Local SMS Gateway
- Contact your local telecom provider
- Get API credentials for SMS sending
- Integrate with their API

## 🔒 **Security Considerations**

### Production Deployment
- Change `jwtSecret` to a strong, random string
- Use environment variables for sensitive data
- Consider using Redis for OTP storage instead of in-memory Map
- Implement rate limiting for OTP requests

### Email Security
- Use dedicated email accounts for OTPs
- Monitor email delivery rates
- Implement email verification for new accounts

## 📊 **Testing the Complete Flow**

1. **Registration Form**: Fill in all fields with valid data
2. **Email OTP**: Check your email for the 6-digit OTP
3. **Email Verification**: Enter the OTP in the modal
4. **Phone OTP**: Check server console for phone OTP (for now)
5. **Phone Verification**: Enter the phone OTP
6. **Account Creation**: User account is created
7. **Login**: Use the new credentials to log in

## 🎯 **What Happens Now**

✅ **Real emails are sent** to users during registration  
✅ **OTPs are stored securely** with expiry timestamps  
✅ **Beautiful email templates** with your branding  
✅ **Proper error handling** for failed email sends  
✅ **Configurable settings** for easy customization  

## 🚨 **Important Notes**

- **Never commit** your real email credentials to version control
- **Test thoroughly** before deploying to production
- **Monitor email delivery** rates and user feedback
- **Keep app passwords secure** and rotate them regularly

## 📞 **Need Help?**

If you encounter any issues:
1. Check the server console for error messages
2. Verify your Gmail configuration
3. Test with a different email address
4. Check your spam folder

---

**🎉 Congratulations!** Your Asset Management Reddy system now sends real email OTPs for secure user verification.
