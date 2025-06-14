const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const stripe = require('../stripe');

// Create a new transaction (purchase a note)
router.post('/', auth, async (req, res) => {
    try {
        const { note_id, payment_method_id } = req.body;

        if (!note_id || !payment_method_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get the note
        const note = await Note.findById(note_id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.status !== 'active') {
            return res.status(400).json({ error: 'Note is not available for purchase' });
        }

        if (note.seller_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot purchase your own note' });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(note.price * 100), // Convert to cents
            currency: 'npr',
            payment_method: payment_method_id,
            confirm: true,
            customer: req.user.stripe_customer_id,
            metadata: {
                note_id: note.id,
                buyer_id: req.user.id,
                seller_id: note.seller_id
            }
        });

        // Create transaction
        const transaction = await Transaction.create({
            note_id: note.id,
            buyer_id: req.user.id,
            seller_id: note.seller_id,
            amount: note.price,
            payment_id: paymentIntent.id
        });

        res.status(201).json({
            transaction,
            client_secret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error creating transaction' });
        }
    }
});

// Get transaction details
router.get('/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Check if user is either buyer or seller
        if (transaction.buyer_id !== req.user.id && transaction.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transaction' });
    }
});

// Get user's purchase history
router.get('/purchases/me', auth, async (req, res) => {
    try {
        const transactions = await Transaction.getBuyerTransactions(req.user.id);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching purchase history' });
    }
});

// Get user's sales history
router.get('/sales/me', auth, async (req, res) => {
    try {
        const transactions = await Transaction.getSellerTransactions(req.user.id);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales history' });
    }
});

// Handle Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const transaction = await Transaction.getTransactionByPaymentId(paymentIntent.id);
                
                if (transaction) {
                    await Transaction.updateStatus(transaction.id, 'completed');
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                const failedTransaction = await Transaction.getTransactionByPaymentId(failedPayment.id);
                
                if (failedTransaction) {
                    await Transaction.updateStatus(failedTransaction.id, 'failed');
                    // Reset note status to active if payment failed
                    await Note.updateStatus(failedTransaction.note_id, 'active');
                }
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Error processing webhook' });
    }
});

module.exports = router; 