const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Course = require('../models/Course');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/notes';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    }
});

// Upload a new note
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { course_id, title, description, price } = req.body;
        
        if (!course_id || !title || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const note = await Note.create({
            seller_id: req.user.id,
            course_id,
            title,
            description,
            price: parseFloat(price),
            file_url: `/uploads/notes/${req.file.filename}`,
            preview_url: null // TODO: Implement preview generation
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Error uploading note:', error);
        res.status(500).json({ error: 'Error uploading note' });
    }
});

// Get all notes for a program
router.get('/program/:program', async (req, res) => {
    try {
        const notes = await Note.findByProgram(req.params.program);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// Get notes for a specific semester
router.get('/program/:program/semester/:semester', async (req, res) => {
    try {
        const notes = await Note.findBySemester(
            req.params.program,
            parseInt(req.params.semester)
        );
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// Get notes for a specific subject
router.get('/program/:program/semester/:semester/subject/:subject_code', async (req, res) => {
    try {
        const notes = await Note.findBySubject(
            req.params.program,
            parseInt(req.params.semester),
            req.params.subject_code
        );
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// Get a specific note with reviews
router.get('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const reviews = await Review.findByNoteId(req.params.id);
        const rating = await Review.getNoteAverageRating(req.params.id);

        res.json({
            ...note,
            reviews,
            rating: rating.average_rating || 0,
            total_reviews: rating.total_reviews || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching note' });
    }
});

// Search notes
router.get('/search/:query', async (req, res) => {
    try {
        const notes = await Note.search(req.params.query);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error searching notes' });
    }
});

// Get seller's notes
router.get('/seller/me', auth, async (req, res) => {
    try {
        const notes = await Note.getSellerNotes(req.user.id);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching seller notes' });
    }
});

// Update note status (active/removed)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updatedNote = await Note.updateStatus(req.params.id, req.body.status);
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ error: 'Error updating note status' });
    }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete the file
        const filePath = path.join(__dirname, '..', note.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Note.updateStatus(req.params.id, 'removed');
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

module.exports = router; 