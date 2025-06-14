const db = require('../db');

class Course {
    static async create({ program, semester, subject_code, subject_name }) {
        const query = `
            INSERT INTO courses (program, semester, subject_code, subject_name)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [program, semester, subject_code, subject_name];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM courses WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByProgram(program) {
        const query = `
            SELECT * FROM courses 
            WHERE program = $1 
            ORDER BY semester, subject_code
        `;
        const result = await db.query(query, [program]);
        return result.rows;
    }

    static async findBySemester(program, semester) {
        const query = `
            SELECT * FROM courses 
            WHERE program = $1 AND semester = $2 
            ORDER BY subject_code
        `;
        const result = await db.query(query, [program, semester]);
        return result.rows;
    }

    static async getAllPrograms() {
        const query = 'SELECT DISTINCT program FROM courses ORDER BY program';
        const result = await db.query(query);
        return result.rows.map(row => row.program);
    }

    static async getSemestersByProgram(program) {
        const query = `
            SELECT DISTINCT semester 
            FROM courses 
            WHERE program = $1 
            ORDER BY semester
        `;
        const result = await db.query(query, [program]);
        return result.rows.map(row => row.semester);
    }

    static async getSubjectsByProgramAndSemester(program, semester) {
        const query = `
            SELECT * FROM courses 
            WHERE program = $1 AND semester = $2 
            ORDER BY subject_code
        `;
        const result = await db.query(query, [program, semester]);
        return result.rows;
    }

    static async bulkCreate(courses) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            const query = `
                INSERT INTO courses (program, semester, subject_code, subject_name)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (program, semester, subject_code) 
                DO UPDATE SET subject_name = EXCLUDED.subject_name
                RETURNING *
            `;
            
            const results = [];
            for (const course of courses) {
                const values = [course.program, course.semester, course.subject_code, course.subject_name];
                const result = await client.query(query, values);
                results.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Course; 