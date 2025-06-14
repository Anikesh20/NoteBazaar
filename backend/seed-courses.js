const { pool } = require('./db');

const courses = [
    // BBA Program
    { program: 'BBA', semester: 1, subject_code: 'MGT 101', subject_name: 'Principles of Management', credits: 3 },
    { program: 'BBA', semester: 1, subject_code: 'ENG 101', subject_name: 'Business Communication', credits: 3 },
    { program: 'BBA', semester: 1, subject_code: 'MTH 101', subject_name: 'Business Mathematics', credits: 3 },
    { program: 'BBA', semester: 1, subject_code: 'ECO 101', subject_name: 'Microeconomics', credits: 3 },
    { program: 'BBA', semester: 1, subject_code: 'ACC 101', subject_name: 'Financial Accounting', credits: 3 },

    { program: 'BBA', semester: 2, subject_code: 'MGT 102', subject_name: 'Organizational Behavior', credits: 3 },
    { program: 'BBA', semester: 2, subject_code: 'ECO 102', subject_name: 'Macroeconomics', credits: 3 },
    { program: 'BBA', semester: 2, subject_code: 'ACC 102', subject_name: 'Cost and Management Accounting', credits: 3 },
    { program: 'BBA', semester: 2, subject_code: 'MKT 101', subject_name: 'Principles of Marketing', credits: 3 },
    { program: 'BBA', semester: 2, subject_code: 'FIN 101', subject_name: 'Business Finance', credits: 3 },

    // BBA-TT Program
    { program: 'BBA-TT', semester: 1, subject_code: 'MGT 101', subject_name: 'Principles of Management', credits: 3 },
    { program: 'BBA-TT', semester: 1, subject_code: 'ENG 101', subject_name: 'Business Communication', credits: 3 },
    { program: 'BBA-TT', semester: 1, subject_code: 'MTH 101', subject_name: 'Business Mathematics', credits: 3 },
    { program: 'BBA-TT', semester: 1, subject_code: 'ECO 101', subject_name: 'Microeconomics', credits: 3 },
    { program: 'BBA-TT', semester: 1, subject_code: 'ACC 101', subject_name: 'Financial Accounting', credits: 3 },
    { program: 'BBA-TT', semester: 1, subject_code: 'TT 101', subject_name: 'Introduction to Tourism', credits: 3 },

    { program: 'BBA-TT', semester: 2, subject_code: 'MGT 102', subject_name: 'Organizational Behavior', credits: 3 },
    { program: 'BBA-TT', semester: 2, subject_code: 'ECO 102', subject_name: 'Macroeconomics', credits: 3 },
    { program: 'BBA-TT', semester: 2, subject_code: 'ACC 102', subject_name: 'Cost and Management Accounting', credits: 3 },
    { program: 'BBA-TT', semester: 2, subject_code: 'MKT 101', subject_name: 'Principles of Marketing', credits: 3 },
    { program: 'BBA-TT', semester: 2, subject_code: 'TT 102', subject_name: 'Tourism Geography', credits: 3 },

    // BCA Program
    { program: 'BCA', semester: 1, subject_code: 'CSC 101', subject_name: 'Introduction to Information Technology', credits: 3 },
    { program: 'BCA', semester: 1, subject_code: 'CSC 102', subject_name: 'C Programming', credits: 3 },
    { program: 'BCA', semester: 1, subject_code: 'MTH 101', subject_name: 'Mathematics I', credits: 3 },
    { program: 'BCA', semester: 1, subject_code: 'ENG 101', subject_name: 'English I', credits: 3 },
    { program: 'BCA', semester: 1, subject_code: 'PHY 101', subject_name: 'Physics', credits: 3 },

    { program: 'BCA', semester: 2, subject_code: 'CSC 103', subject_name: 'Digital Logic', credits: 3 },
    { program: 'BCA', semester: 2, subject_code: 'CSC 104', subject_name: 'Data Structure and Algorithms', credits: 3 },
    { program: 'BCA', semester: 2, subject_code: 'MTH 102', subject_name: 'Mathematics II', credits: 3 },
    { program: 'BCA', semester: 2, subject_code: 'ENG 102', subject_name: 'English II', credits: 3 },
    { program: 'BCA', semester: 2, subject_code: 'STA 101', subject_name: 'Statistics', credits: 3 }
];

async function seedCourses() {
    const client = await pool.connect();
    
    try {
        console.log('Starting to seed courses...');
        await client.query('BEGIN');

        // Insert courses
        for (const course of courses) {
            const query = `
                INSERT INTO courses (program, semester, subject_code, subject_name, credits)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (program, semester, subject_code) 
                DO UPDATE SET 
                    subject_name = EXCLUDED.subject_name,
                    credits = EXCLUDED.credits
                RETURNING *
            `;
            const values = [course.program, course.semester, course.subject_code, course.subject_name, course.credits];
            
            const result = await client.query(query, values);
            console.log(`Added/Updated course: ${course.program} - ${course.subject_code}`);
        }

        await client.query('COMMIT');
        console.log('Successfully seeded courses!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding courses:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
    seedCourses()
        .then(() => {
            console.log('Course seeding complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Course seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedCourses; 