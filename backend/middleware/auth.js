const jwt = require('jsonwebtoken');
const { pool } = require('../db');
// require('dotenv').config();

// JWT secret key
const JWT_SECRET = 'notebazaar-secret-key-2024';

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const query = 'SELECT id, email, is_admin FROM users WHERE id = $1';
        const result = await pool.query(query, [decoded.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = auth;  // Export only the auth middleware 