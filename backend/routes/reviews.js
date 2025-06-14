const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Create a review
router.post('/', auth, async (req, res) => {
    try {
        const { note_id, rating, comment } = req.body;

        if (!note_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid review data' });
        }

        // Check if user has purchased the note
        const hasPurchased = await Transaction.hasUserPurchasedNote(req.user.id, note_id);
        if (!hasPurchased) {
            return res.status(403).json({ error: 'You must purchase the note before reviewing it' });
        }

        // Check if user has already reviewed the note
        const hasReviewed = await Review.hasUserReviewedNote(req.user.id, note_id);
        if (hasReviewed) {
            return res.status(400).json({ error: 'You have already reviewed this note' });
        }

        const review = await Review.create({
            note_id,
            user_id: req.user.id,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Error creating review' });
    }
});

// Get reviews for a note
router.get('/note/:note_id', async (req, res) => {
    try {
        const reviews = await Review.findByNoteId(req.params.note_id);
        const rating = await Review.getNoteAverageRating(req.params.note_id);

        res.json({
            reviews,
            average_rating: rating.average_rating || 0,
            total_reviews: rating.total_reviews || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Get user's reviews
router.get('/user/me', auth, async (req, res) => {
    try {
        const reviews = await Review.getUserReviews(req.user.id);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user reviews' });
    }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid rating' });
        }

        const updatedReview = await Review.update(req.params.id, { rating, comment });
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ error: 'Error updating review' });
    }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Review.delete(req.params.id);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting review' });
    }
});

module.exports = router; 