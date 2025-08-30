# Asset Management Reddy

A comprehensive asset management system for investment plans with user authentication, fund management, and transaction tracking.

## Features

### 🔐 Authentication & Registration
- **Login System**: Secure username/password authentication
- **User Registration**: Complete signup with OTP verification (email & phone)
- **Form Validation**: Real-time validation for PAN, Aadhar, email, and phone
- **Password Security**: Bcrypt hashing for secure password storage

### 💰 Investment Management
- **Fund Display**: View various investment funds with details
- **Fund Information**: Total fund value, yearly returns, and allocation details
- **Investment Tracking**: Monitor your investments and current values
- **Investment History**: Track all investment transactions

### 💳 Fund Operations
- **Add Funds**: Deposit money into your account
- **Withdraw Funds**: Withdraw available balance
- **Investment**: Invest in various funds
- **Balance Management**: Real-time available balance tracking

### 👤 User Profile
- **Personal Details**: View and manage personal information
- **Transaction History**: Complete transaction log with expandable view
- **Account Settings**: Change password, email, and phone number
- **Support System**: Create support tickets with unique ticket numbers

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and glass-morphism effects
- **Responsive Layout**: Works perfectly on all device sizes
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Modal System**: Clean popup interfaces for various operations

## Technology Stack

### Backend
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **SQLite**: Lightweight database
- **JWT**: JSON Web Token authentication
- **Bcrypt**: Password hashing
- **Nodemailer**: Email functionality

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd asset-management-reddy
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Email (Optional)
For email functionality to work, update the email configuration in `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Your Gmail address
        pass: 'your-app-password'     // Gmail app password
    }
});
```

**Note**: You'll need to generate an app password from your Google Account settings.

### Step 4: Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will start on `http://localhost:3000`

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `first_name`, `last_name`: User's full name
- `pan`: PAN number (unique)
- `aadhar`: Aadhar number (unique)
- `address`: User's address
- `email`: Email address (unique)
- `phone`: Phone number
- `country_code`: Country calling code
- `created_at`: Registration timestamp

### Funds Table
- `id`: Primary key
- `fund_name`: Name of the investment fund
- `total_value`: Total fund value
- `yearly_return`: Annual return percentage
- `description`: Fund description
- `allocation`: Asset allocation breakdown

### User Investments Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `fund_id`: Foreign key to funds table
- `amount_invested`: Original investment amount
- `current_value`: Current investment value
- `investment_date`: Investment timestamp

### Available Funds Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `amount`: Available balance

### Transactions Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `type`: Transaction type (investment, withdrawal, deposit)
- `amount`: Transaction amount
- `description`: Transaction description
- `transaction_date`: Transaction timestamp

### Support Tickets Table
- `id`: Primary key
- `ticket_number`: Unique 13-character ticket number
- `user_id`: Foreign key to users table
- `subject`: Ticket subject
- `message`: Ticket message
- `status`: Ticket status
- `created_at`: Ticket creation timestamp

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### User Management
- `GET /api/profile` - Get user profile
- `GET /api/available-funds` - Get available balance

### Investment Management
- `GET /api/funds` - Get all investment funds
- `GET /api/user-investments` - Get user's investments
- `POST /api/invest` - Invest in a fund

### Fund Operations
- `POST /api/add-funds` - Add funds to account
- `POST /api/withdraw` - Withdraw funds from account

### Transactions
- `GET /api/transactions` - Get transaction history

### Support
- `POST /api/support` - Create support ticket

## Usage Guide

### 1. User Registration
1. Navigate to the signin page
2. Fill in all required fields (name, PAN, Aadhar, address, email, phone)
3. Verify email OTP (check console for demo OTP)
4. Verify phone OTP (check console for demo OTP)
5. Account created successfully

### 2. User Login
1. Enter username and password
2. Click login to access dashboard

### 3. Dashboard
1. **User Investments**: View your current investments at the top
2. **Available Funds**: Check your current balance and add/withdraw funds
3. **Investment Plans**: Browse available funds and invest

### 4. Investing in Funds
1. Click "View Details" to see fund information
2. Click "Invest" to open investment modal
3. Enter investment amount
4. Confirm investment

### 5. Managing Funds
1. **Add Funds**: Click "Add Funds" button and enter amount
2. **Withdraw Funds**: Click "Withdraw Funds" button and enter amount
3. **View History**: Click "Show History" to see transaction log

### 6. Profile Management
1. Click on username in header to access profile
2. View personal details and transaction history
3. Change password, email, or phone number
4. Contact support if needed

## Demo Credentials

For testing purposes, you can use these sample OTPs:
- **Email OTP**: Check browser console for generated OTP
- **Phone OTP**: Check browser console for generated OTP

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side and client-side validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Cross-origin resource sharing configuration

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: guddeti.bhargavareddy@gmail.com
- Create a support ticket through the application

## Future Enhancements

- Real email/SMS integration for OTP
- Payment gateway integration
- Advanced analytics and reporting
- Mobile app development
- Multi-currency support
- Advanced fund management features

---

**Note**: This is a demonstration application. For production use, additional security measures, error handling, and testing should be implemented.
