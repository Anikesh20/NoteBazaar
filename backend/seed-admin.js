const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const adminUser = {
    email: 'admin@notebazaar.com',
    username: 'admin',
    full_name: 'NoteBazaar Admin',
    phone_number: '9800000000',
    password: 'admin123', // This will be hashed
    is_admin: true
};

async function seedAdmin() {
    const client = await pool.connect();
    
    try {
        console.log('Starting to seed admin user...');
        await client.query('BEGIN');

        // Check if admin already exists
        const checkQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
        const existingAdmin = await client.query(checkQuery, [adminUser.email, adminUser.username]);

        if (existingAdmin.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        // Insert admin user
        const query = `
            INSERT INTO users (
                email, username, full_name, phone_number, 
                password, is_admin, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, email, username, full_name, is_admin
        `;
        
        const values = [
            adminUser.email,
            adminUser.username,
            adminUser.full_name,
            adminUser.phone_number,
            hashedPassword,
            adminUser.is_admin
        ];

        const result = await client.query(query, values);
        console.log('Successfully created admin user:', result.rows[0]);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding admin user:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
    seedAdmin()
        .then(() => {
            console.log('Admin user seeding complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Admin user seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedAdmin; 