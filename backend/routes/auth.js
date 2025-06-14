const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const auth = require('../middleware/auth');

// JWT secret key
const JWT_SECRET = 'notebazaar-secret-key-2024';

// User signup
router.post('/signup', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { email, username, full_name, phone_number, password } = req.body;

        // Validate input
        if (!email || !username || !full_name || !phone_number || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone number format (Nepali format)
        const phoneRegex = /^[9][6-8]\d{8}$/;
        if (!phoneRegex.test(phone_number)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        await client.query('BEGIN');

        // Check if email or username already exists
        const checkQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
        const existingUser = await client.query(checkQuery, [email, username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const insertQuery = `
            INSERT INTO users (
                email, username, full_name, phone_number, 
                password, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, email, username, full_name, phone_number, is_admin
        `;

        const values = [email, username, full_name, phone_number, hashedPassword];
        const result = await client.query(insertQuery, values);
        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        await client.query('COMMIT');

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                phone_number: user.phone_number,
                is_admin: user.is_admin
            },
            token
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'Error creating user' });
    } finally {
        client.release();
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                phone_number: user.phone_number,
                is_admin: user.is_admin
            },
            token
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const query = `
            SELECT id, email, username, full_name, phone_number, is_admin, 
                   wallet_balance, created_at
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [req.user.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { full_name, phone_number } = req.body;

        // Validate input
        if (!full_name || !phone_number) {
            return res.status(400).json({ error: 'Full name and phone number are required' });
        }

        // Validate phone number format
        const phoneRegex = /^[9][6-8]\d{8}$/;
        if (!phoneRegex.test(phone_number)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        await client.query('BEGIN');

        // Update user
        const query = `
            UPDATE users 
            SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, email, username, full_name, phone_number, is_admin, wallet_balance
        `;
        
        const result = await client.query(query, [full_name, phone_number, req.user.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await client.query('COMMIT');
        res.json(user);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    } finally {
        client.release();
    }
});

// Get user by ID (admin only)
router.get('/users/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const query = `
            SELECT id, email, username, full_name, phone_number, is_admin, 
                   wallet_balance, created_at
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [req.params.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

module.exports = router; 