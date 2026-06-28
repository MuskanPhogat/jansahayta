const express = require('express');
const router = express.Router();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  try {
    await twilio.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ success: false, error: 'Phone and code are required' });
  }

  try {
    const verificationCheck = await twilio.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // Check if user already exists, else create new user
    let user = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (user.rows.length === 0) {
      user = await pool.query(
        'INSERT INTO users (phone) VALUES ($1) RETURNING *',
        [phone]
      );
    }

    const token = jwt.sign(
      { id: user.rows[0].id, phone: user.rows[0].phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, user: user.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;