const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require("firebase-admin");

// 🔥 Save user + set Firebase Custom Claims for organizer
router.put('/', async (req, res) => {
  const { name, email } = req.body;
  const role = email === "organizer@medicamp.com" ? "organizer" : "participant";

  try {
    // Step 1: Save/update user in DB
    const user = await User.findOneAndUpdate(
      { email },
      { name, role },
      { upsert: true, new: true }
    );

    // Step 2: Set custom claims only if email is organizer
    if (role === "organizer") {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      const existingClaims = firebaseUser.customClaims || {};

      if (existingClaims.role !== "organizer") {
        await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: "organizer" });
        console.log(`✅ Firebase custom claim 'organizer' set for: ${email}`);
      } else {
        console.log(`ℹ️ Firebase claim already set for: ${email}`);
      }
    }

    res.json({ message: 'User saved and claims synced', user });
  } catch (err) {
    console.error('🔥 Error saving user or setting claims:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


