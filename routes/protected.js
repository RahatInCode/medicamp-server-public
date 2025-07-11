// backend/routes/protected.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');

router.get('/organizer-only', verifyJWT, async (req, res) => {
  const userEmail = req.user.email;

  const User = require('../models/user');
  const user = await User.findOne({ email: userEmail });

  if (user?.role !== 'organizer') {
    return res.status(403).json({ error: 'Access Denied: Organizer only' });
  }

  res.json({ message: 'Welcome Organizer!' });
});

module.exports = router;
