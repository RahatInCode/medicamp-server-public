// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/save-user', async (req, res) => {
  const { name, email, role = 'user' } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    await User.create({ name, email, role });
    res.send({ message: 'User saved to DB' });
  } else {
    res.send({ message: 'User already exists' });
  }
});

module.exports = router;
