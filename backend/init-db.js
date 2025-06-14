const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Initializing database...');
        await client.query('BEGIN');

        // Execute the entire schema as one statement
        // This is safer for functions with dollar-quoted strings
        try {
            await client.query(schemaSQL);
            console.log('Schema executed successfully');
        } catch (error) {
            console.error('Error executing schema:', error.message);
            throw error;
        }

        await client.query('COMMIT');
        console.log('Database initialization completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database setup complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase; 