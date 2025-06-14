const db = require('../db');

class Transaction {
    static async create({ note_id, buyer_id, seller_id, amount, payment_id }) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // Create transaction
            const transactionQuery = `
                INSERT INTO transactions (note_id, buyer_id, seller_id, amount, status, payment_id)
                VALUES ($1, $2, $3, $4, 'pending', $5)
                RETURNING *
            `;
            const transactionValues = [note_id, buyer_id, seller_id, amount, payment_id];
            const transactionResult = await client.query(transactionQuery, transactionValues);
            const transaction = transactionResult.rows[0];

            // Update note status
            const noteQuery = `
                UPDATE notes
                SET status = 'sold'
                WHERE id = $1
                RETURNING *
            `;
            await client.query(noteQuery, [note_id]);

            await client.query('COMMIT');
            return transaction;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateStatus(id, status) {
        const query = `
            UPDATE transactions
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT t.*, 
                   n.title as note_title,
                   n.file_url,
                   u_buyer.username as buyer_username,
                   u_buyer.full_name as buyer_name,
                   u_seller.username as seller_username,
                   u_seller.full_name as seller_name
            FROM transactions t
            JOIN notes n ON t.note_id = n.id
            JOIN users u_buyer ON t.buyer_id = u_buyer.id
            JOIN users u_seller ON t.seller_id = u_seller.id
            WHERE t.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async getBuyerTransactions(buyer_id) {
        const query = `
            SELECT t.*, 
                   n.title as note_title,
                   n.file_url,
                   u_seller.username as seller_username,
                   u_seller.full_name as seller_name
            FROM transactions t
            JOIN notes n ON t.note_id = n.id
            JOIN users u_seller ON t.seller_id = u_seller.id
            WHERE t.buyer_id = $1
            ORDER BY t.created_at DESC
        `;
        const result = await db.query(query, [buyer_id]);
        return result.rows;
    }

    static async getSellerTransactions(seller_id) {
        const query = `
            SELECT t.*, 
                   n.title as note_title,
                   u_buyer.username as buyer_username,
                   u_buyer.full_name as buyer_name
            FROM transactions t
            JOIN notes n ON t.note_id = n.id
            JOIN users u_buyer ON t.buyer_id = u_buyer.id
            WHERE t.seller_id = $1
            ORDER BY t.created_at DESC
        `;
        const result = await db.query(query, [seller_id]);
        return result.rows;
    }

    static async getTransactionByPaymentId(payment_id) {
        const query = `
            SELECT * FROM transactions
            WHERE payment_id = $1
        `;
        const result = await db.query(query, [payment_id]);
        return result.rows[0];
    }
}

module.exports = Transaction; 