const db = require('../db');

class Note {
    static async create({ seller_id, course_id, title, description, price, file_url, preview_url }) {
        const query = `
            INSERT INTO notes (seller_id, course_id, title, description, price, file_url, preview_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [seller_id, course_id, title, description, price, file_url, preview_url];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name,
                   u.username as seller_username, u.full_name as seller_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            JOIN users u ON n.seller_id = u.id
            WHERE n.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByProgram(program) {
        const query = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name,
                   u.username as seller_username, u.full_name as seller_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            JOIN users u ON n.seller_id = u.id
            WHERE c.program = $1 AND n.status = 'active'
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(query, [program]);
        return result.rows;
    }

    static async findBySemester(program, semester) {
        const query = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name,
                   u.username as seller_username, u.full_name as seller_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            JOIN users u ON n.seller_id = u.id
            WHERE c.program = $1 AND c.semester = $2 AND n.status = 'active'
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(query, [program, semester]);
        return result.rows;
    }

    static async findBySubject(program, semester, subject_code) {
        const query = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name,
                   u.username as seller_username, u.full_name as seller_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            JOIN users u ON n.seller_id = u.id
            WHERE c.program = $1 AND c.semester = $2 AND c.subject_code = $3 AND n.status = 'active'
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(query, [program, semester, subject_code]);
        return result.rows;
    }

    static async updateStatus(id, status) {
        const query = `
            UPDATE notes
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }

    static async getSellerNotes(seller_id) {
        const query = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            WHERE n.seller_id = $1
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(query, [seller_id]);
        return result.rows;
    }

    static async search(query) {
        const searchQuery = `
            SELECT n.*, c.program, c.semester, c.subject_code, c.subject_name,
                   u.username as seller_username, u.full_name as seller_name
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            JOIN users u ON n.seller_id = u.id
            WHERE n.status = 'active' AND (
                n.title ILIKE $1 OR
                n.description ILIKE $1 OR
                c.subject_name ILIKE $1
            )
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(searchQuery, [`%${query}%`]);
        return result.rows;
    }
}

module.exports = Note; 