// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
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




module.exports = router;  