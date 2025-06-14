const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/:userId', auth, async (req, res) => {
    try {
        // Only allow users to access their own profile or admins to access any profile
        if (!req.user.is_admin && String(req.user.id) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Not authorized to view this profile' });
        }

        const query = `
            SELECT id, email, username, full_name, phone_number, is_admin, 
                   wallet_balance, created_at
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [req.params.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/:userId', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { full_name, phone_number } = req.body;

        // Only allow users to update their own profile
        if (String(req.user.id) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

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

        const query = `
            UPDATE users 
            SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, email, username, full_name, phone_number, is_admin, wallet_balance
        `;
        
        const result = await client.query(query, [full_name, phone_number, req.params.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await client.query('COMMIT');
        res.json(user);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        const query = `
            SELECT id, email, username, full_name, phone_number, is_admin, 
                   wallet_balance, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 