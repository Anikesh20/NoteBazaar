const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all programs
router.get('/programs', async (req, res) => {
    try {
        const programs = await Course.getAllPrograms();
        res.json(programs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching programs' });
    }
});

// Get semesters for a program
router.get('/programs/:program/semesters', async (req, res) => {
    try {
        const semesters = await Course.getSemestersByProgram(req.params.program);
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching semesters' });
    }
});

// Get subjects for a program and semester
router.get('/programs/:program/semesters/:semester/subjects', async (req, res) => {
    try {
        const subjects = await Course.getSubjectsByProgramAndSemester(
            req.params.program,
            parseInt(req.params.semester)
        );
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subjects' });
    }
});

// Get all courses (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const courses = await Course.findByProgram(req.query.program);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

// Create a new course (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { program, semester, subject_code, subject_name } = req.body;
        
        if (!program || !semester || !subject_code || !subject_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const course = await Course.create({
            program,
            semester: parseInt(semester),
            subject_code,
            subject_name
        });

        res.status(201).json(course);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Course already exists' });
        } else {
            res.status(500).json({ error: 'Error creating course' });
        }
    }
});

// Bulk create courses (admin only)
router.post('/bulk', auth, async (req, res) => {
    try {
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { courses } = req.body;
        
        if (!Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ error: 'Invalid courses data' });
        }

        const createdCourses = await Course.bulkCreate(courses);
        res.status(201).json(createdCourses);
    } catch (error) {
        res.status(500).json({ error: 'Error creating courses' });
    }
});

// Update a course (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const { subject_name } = req.body;
        if (!subject_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const updatedCourse = await Course.update(req.params.id, { subject_name });
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: 'Error updating course' });
    }
});

// Delete a course (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await Course.delete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting course' });
    }
});

module.exports = router; 