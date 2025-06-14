const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const auth = require('../middleware/auth');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email endpoint
router.post('/email', auth, async (req, res) => {
  try {
    const { to, from, subject, text, html } = req.body;
    
    const msg = {
      to,
      from: {
        email: from.email,
        name: from.name,
      },
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
});

module.exports = router; 