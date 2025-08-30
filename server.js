const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = config.server.port;
const JWT_SECRET = config.server.jwtSecret;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./asset_management.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        pan TEXT UNIQUE NOT NULL,
        aadhar TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        country_code TEXT DEFAULT '+91',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Investment funds table
    db.run(`CREATE TABLE IF NOT EXISTS funds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fund_name TEXT NOT NULL,
        total_value REAL NOT NULL,
        yearly_return REAL NOT NULL,
        description TEXT,
        allocation TEXT
    )`);

    // User investments table
    db.run(`CREATE TABLE IF NOT EXISTS user_investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fund_id INTEGER NOT NULL,
        amount_invested REAL NOT NULL,
        current_value REAL NOT NULL,
        investment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (fund_id) REFERENCES funds (id)
    )`);

    // Available funds table (for withdrawals)
    db.run(`CREATE TABLE IF NOT EXISTS available_funds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        amount REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Transaction history table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Support tickets table
    db.run(`CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Insert sample funds
    db.run(`INSERT OR IGNORE INTO funds (fund_name, total_value, yearly_return, description, allocation) VALUES 
        ('Equity Growth Fund', 1000000, 12.5, 'High-growth equity investments', '60% Equity, 25% Bonds, 15% Cash'),
        ('Balanced Fund', 800000, 8.2, 'Balanced growth and income', '40% Equity, 40% Bonds, 20% Cash'),
        ('Fixed Income Fund', 600000, 6.8, 'Stable income generation', '20% Equity, 70% Bonds, 10% Cash'),
        ('Technology Fund', 1200000, 15.3, 'Technology sector focus', '80% Technology, 15% Cash, 5% Bonds')`);
});

// Email configuration - Using test configuration for development
const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate ticket number
function generateTicketNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 13; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Send email OTP
app.post('/api/send-email-otp', async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    
    // Store OTP with email and timestamp (valid for configured minutes)
    otpStore.set(email, {
        otp: otp,
        timestamp: Date.now(),
        type: 'email'
    });
    
    // For development/testing: Just log the OTP instead of sending email
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    console.log(`📧 This OTP is valid for ${config.otp.expiryMinutes} minutes`);
    
    // Send success response
    res.json({ 
        message: 'OTP sent successfully', 
        otp: otp,  // Include OTP in response for testing
        note: 'Check server console for OTP (development mode)'
    });
});

// Verify email OTP
app.post('/api/verify-email-otp', (req, res) => {
    const { email, otp } = req.body;
    
    const storedData = otpStore.get(email);
    if (!storedData) {
        return res.status(400).json({ error: 'OTP expired or not found' });
    }
    
    // Check if OTP is expired (configured minutes)
    if (Date.now() - storedData.timestamp > config.otp.expiryMinutes * 60 * 1000) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
    }
    
    // Check if OTP matches
    if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP is valid, remove it from store
    otpStore.delete(email);
    
    res.json({ message: 'Email OTP verified successfully' });
});

// Send phone OTP (simulated for now)
app.post('/api/send-phone-otp', async (req, res) => {
    const { phone, country_code } = req.body;
    const otp = generateOTP();
    
    // Store OTP with phone and timestamp (valid for configured minutes)
    otpStore.set(`${country_code}${phone}`, {
        otp: otp,
        timestamp: Date.now(),
        type: 'phone'
    });
    
    // For now, just log the OTP (in production, integrate with SMS service)
    console.log(`Phone OTP sent to ${country_code}${phone}: ${otp}`);
    
    res.json({ message: 'OTP sent successfully', otp: otp }); // Remove otp in production
});

// Verify phone OTP
app.post('/api/verify-phone-otp', (req, res) => {
    const { phone, country_code, otp } = req.body;
    
    const storedData = otpStore.get(`${country_code}${phone}`);
    if (!storedData) {
        return res.status(400).json({ error: 'OTP expired or not found' });
    }
    
    // Check if OTP is expired (configured minutes)
    if (Date.now() - storedData.timestamp > config.otp.expiryMinutes * 60 * 1000) {
        otpStore.delete(`${country_code}${phone}`);
        return res.status(400).json({ error: 'OTP expired' });
    }
    
    // Check if OTP matches
    if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP is valid, remove it from store
    otpStore.delete(`${country_code}${phone}`);
    
    res.json({ message: 'Phone OTP verified successfully' });
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'User does not exist' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, first_name: user.first_name } });
    });
});

// Registration route
app.post('/api/register', (req, res) => {
    const { username, password, first_name, last_name, pan, aadhar, address, email, phone, country_code } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ? OR pan = ? OR aadhar = ?', 
        [username, email, pan, aadhar], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with these credentials' });
        }

        // Hash password and create user
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Error hashing password' });
            }

            db.run(`INSERT INTO users (username, password, first_name, last_name, pan, aadhar, address, email, phone, country_code) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [username, hashedPassword, first_name, last_name, pan, aadhar, address, email, phone, country_code],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating user' });
                    }

                    // Initialize available funds
                    db.run('INSERT INTO available_funds (user_id, amount) VALUES (?, 0)', [this.lastID]);

                    res.json({ message: 'User registered successfully', userId: this.lastID });
                });
        });
    });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, first_name, last_name, pan, aadhar, address, email, phone, country_code FROM users WHERE id = ?', 
        [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(user);
    });
});

// Get available funds
app.get('/api/available-funds', authenticateToken, (req, res) => {
    db.get('SELECT amount FROM available_funds WHERE user_id = ?', [req.user.id], (err, funds) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ available_amount: funds ? funds.amount : 0 });
    });
});

// Get investment funds
app.get('/api/funds', (req, res) => {
    db.all('SELECT * FROM funds', (err, funds) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(funds);
    });
});

// Get user investments
app.get('/api/user-investments', authenticateToken, (req, res) => {
    db.all(`SELECT ui.*, f.fund_name, f.yearly_return 
            FROM user_investments ui 
            JOIN funds f ON ui.fund_id = f.id 
            WHERE ui.user_id = ?`, [req.user.id], (err, investments) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(investments);
    });
});

// Invest in fund
app.post('/api/invest', authenticateToken, (req, res) => {
    const { fund_id, amount } = req.body;

    db.get('SELECT amount FROM available_funds WHERE user_id = ?', [req.user.id], (err, funds) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!funds || funds.amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        db.get('SELECT * FROM funds WHERE id = ?', [fund_id], (err, fund) => {
            if (err || !fund) {
                return res.status(400).json({ error: 'Fund not found' });
            }

            // Calculate current value based on yearly return
            const currentValue = amount * (1 + fund.yearly_return / 100);

            db.run(`INSERT INTO user_investments (user_id, fund_id, amount_invested, current_value) 
                    VALUES (?, ?, ?, ?)`, [req.user.id, fund_id, amount, currentValue], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Investment failed' });
                }

                // Update available funds
                db.run('UPDATE available_funds SET amount = amount - ? WHERE user_id = ?', 
                    [amount, req.user.id]);

                // Add transaction record
                db.run(`INSERT INTO transactions (user_id, type, amount, description) 
                        VALUES (?, 'investment', ?, ?)`, 
                    [req.user.id, amount, `Invested in ${fund.fund_name}`]);

                res.json({ message: 'Investment successful', investmentId: this.lastID });
            });
        });
    });
});

// Withdraw funds
app.post('/api/withdraw', authenticateToken, (req, res) => {
    const { amount } = req.body;

    db.get('SELECT amount FROM available_funds WHERE user_id = ?', [req.user.id], (err, funds) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!funds || funds.amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        db.run('UPDATE available_funds SET amount = amount - ? WHERE user_id = ?', 
            [amount, req.user.id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Withdrawal failed' });
            }

            // Add transaction record
            db.run(`INSERT INTO transactions (user_id, type, amount, description) 
                    VALUES (?, 'withdrawal', ?, 'Fund withdrawal')`, 
                [req.user.id, amount]);

            res.json({ message: 'Withdrawal successful' });
        });
    });
});

// Get transaction history
app.get('/api/transactions', authenticateToken, (req, res) => {
    db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC', 
        [req.user.id], (err, transactions) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(transactions);
    });
});

// Create support ticket
app.post('/api/support', authenticateToken, (req, res) => {
    const { subject, message } = req.body;
    const ticketNumber = generateTicketNumber();

    db.run(`INSERT INTO support_tickets (ticket_number, user_id, subject, message) 
            VALUES (?, ?, ?, ?)`, [ticketNumber, req.user.id, subject, message], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create ticket' });
        }

        // Send email to support
        const mailOptions = {
            from: config.email.from,
            to: config.support.email,
            subject: `Support Ticket #${ticketNumber}`,
            text: `New support ticket from ${req.user.username}:\n\nSubject: ${subject}\nMessage: ${message}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email error:', error);
            }
        });

        res.json({ message: 'Ticket created successfully', ticketNumber });
    });
});

// Add funds to available balance
app.post('/api/add-funds', authenticateToken, (req, res) => {
    const { amount } = req.body;

    db.run('UPDATE available_funds SET amount = amount + ? WHERE user_id = ?', 
        [amount, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to add funds' });
        }

        // Add transaction record
        db.run(`INSERT INTO transactions (user_id, type, amount, description) 
                VALUES (?, 'deposit', ?, 'Fund deposit')`, 
            [req.user.id, amount]);

        res.json({ message: 'Funds added successfully' });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
