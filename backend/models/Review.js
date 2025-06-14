const db = require('../db');

class Review {
    static async create({ note_id, user_id, rating, comment }) {
        const query = `
            INSERT INTO reviews (note_id, user_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [note_id, user_id, rating, comment];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByNoteId(note_id) {
        const query = `
            SELECT r.*, u.username, u.full_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.note_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [note_id]);
        return result.rows;
    }

    static async getNoteAverageRating(note_id) {
        const query = `
            SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE note_id = $1
        `;
        const result = await db.query(query, [note_id]);
        return result.rows[0];
    }

    static async getUserReviews(user_id) {
        const query = `
            SELECT r.*, n.title as note_title
            FROM reviews r
            JOIN notes n ON r.note_id = n.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    static async update(id, { rating, comment }) {
        const query = `
            UPDATE reviews
            SET rating = $1, comment = $2
            WHERE id = $3
            RETURNING *
        `;
        const values = [rating, comment, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async hasUserReviewedNote(user_id, note_id) {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM reviews
                WHERE user_id = $1 AND note_id = $2
            ) as has_reviewed
        `;
        const result = await db.query(query, [user_id, note_id]);
        return result.rows[0].has_reviewed;
    }
}

module.exports = Review; 