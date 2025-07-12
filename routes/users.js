const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🔥 This handles PUT /users to save or update a user
router.put('/', async (req, res) => {
  const { name, email, role = 'user' } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { name, role },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    console.error('User save failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

