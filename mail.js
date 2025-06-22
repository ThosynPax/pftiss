const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const winston = require('winston');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'regulator'], default: 'user' },
    kycVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currencyPair: { type: String, required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    amount: { type: Number, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch (err) {
        logger.error('Token verification failed:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Routes

// Register User
app.post(
    '/api/auth/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ email, password: hashedPassword });
            await user.save();

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(201).json({ token, user: { id: user._id, email, role: user.role } });
        } catch (err) {
            logger.error('Registration error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Login User
app.post(
    '/api/auth/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user._id, email, role: user.role } });
        } catch (err) {
            logger.error('Login error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Log Transaction
app.post(
    '/api/transactions',
    authMiddleware,
    [
        body('currencyPair').notEmpty().withMessage('Currency pair is required'),
        body('type').isIn(['buy', 'sell']).withMessage('Invalid transaction type'),
        body('amount').isFloat({ min: 0 }).withMessage('Invalid amount'),
        body('location').notEmpty().withMessage('Location is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { currencyPair, type, amount, location } = req.body;

        try {
            const transaction = new Transaction({
                userId: req.user._id,
                currencyPair,
                type,
                amount,
                location,
            });
            await transaction.save();
            res.status(201).json(transaction);
        } catch (err) {
            logger.error('Transaction error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get Recent Transactions
app.get('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(transactions);
    } catch (err) {
        logger.error('Fetch transactions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// KYC Verification (Mock)
app.post('/api/kyc/verify', authMiddleware, async (req, res) => {
    const { bvnOrNin } = req.body;

    try {
        // Mock KYC verification (replace with real KYC provider integration)
        if (!bvnOrNin || bvnOrNin.length < 10) {
            return res.status(400).json({ message: 'Invalid BVN or NIN' });
        }

        req.user.kycVerified = true;
        await req.user.save();
        res.json({ message: 'KYC verified successfully' });
    } catch (err) {
        logger.error('KYC verification error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch Live Exchange Rates (Mock)
app.get('/api/rates', async (req, res) => {
    try {
        // Mock exchange rates (replace with real API call)
        const rates = {
            'NGN/USD_CBN': 1590,
            'NGN/USD_Parallel': 1650,
            'eNaira/USD': 1595,
        };
        res.json(rates);
    } catch (err) {
        logger.error('Fetch rates error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate Compliance Report (Mock)
app.post('/api/compliance/report', authMiddleware, async (req, res) => {
    const { reportType } = req.body;

    try {
        if (!['CBN', 'NFIU', 'EFCC'].includes(reportType)) {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        // Mock report generation
        const report = {
            type: reportType,
            transactions: await Transaction.find({ userId: req.user._id }),
            generatedAt: new Date(),
        };
        res.json(report);
    } catch (err) {
        logger.error('Report generation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Offline Transaction Queue (Mock)
app.post('/api/offline/transactions', authMiddleware, async (req, res) => {
    const { transaction } = req.body;

    try {
        // Store in a queue (mock implementation)
        logger.info('Offline transaction queued:', transaction);
        res.json({ message: 'Transaction queued for sync' });
    } catch (err) {
        logger.error('Offline transaction error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Regulator Dashboard (Mock)
app.get('/api/regulator/dashboard', authMiddleware, async (req, res) => {
    if (req.user.role !== 'regulator') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(50);
        res.json({
            totalTransactions: transactions.length,
            totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
            transactions,
        });
    } catch (err) {
        logger.error('Regulator dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
});

// Start Server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});