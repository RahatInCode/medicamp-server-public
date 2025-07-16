// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
// 🔓 PUBLIC USER CREATE ROUTE
router.post('/public', async (req, res) => {
  const { name, email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json(existing);

    const role = email === "organizer@medicamp.com" ? "organizer" : "participant";

    const newUser = await User.create({ email, name, role });
    console.log(`✅ New user saved: ${email} as ${role}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error saving public user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
});


router.put('/', verifyJWT, async (req, res) => {
  const { email, name } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  // 🧠 Smart condition: if this email, force role to "organizer"
  const role = email === "organizer@medicamp.com" ? "organizer" : "participant";

  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: { email, name, role } },
    { upsert: true, new: true }
  );

  console.log(`👤 Role set for user: ${role}`);
  res.json(updatedUser);
});

router.get('/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('User fetch failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;  