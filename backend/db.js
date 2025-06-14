const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new pool using the connection string
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_jRcdvz2u0koq@ep-solitary-union-a8pwjqoc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false // Required for Neon DB
    }
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Successfully connected to Neon PostgreSQL database');
        release();
    }
});

// Helper function to get a client from the pool
pool.getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
        console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };

    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release.apply(client);
    };

    return client;
};

// This function should only be called manually when you need to reset/initialize the database
async function resetDatabase() {
    try {
        // Read and execute the SQL file
        const sql = fs.readFileSync(path.join(__dirname, 'update_tables.sql'), 'utf8');
        await pool.query(sql);
        console.log('Database tables reset successfully');
    } catch (error) {
        console.error('Error resetting database tables:', error);
        throw error;
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.getClient(),
    pool,
    resetDatabase: resetDatabase  // Renamed from initializeDatabase to make its purpose clearer
}; 