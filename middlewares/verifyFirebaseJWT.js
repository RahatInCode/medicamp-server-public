const admin = require("firebase-admin");
const User = require('../models/User');
const Organizer = require('../models/organizer');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../firebaseAdminCredentials.json")),
  });
}

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ message: "Unauthorized: No email in token" });
    }

    // 🔍 First try User collection
    let userFromDb = await User.findOne({ email }).select('role email');

    // ❗ If not found, check Organizer
    if (!userFromDb) {
      const organizer = await Organizer.findOne({ email }).select('email');
      if (!organizer) {
        return res.status(401).json({ message: "Unauthorized: User not found in any collection" });
      }

      req.user = {
        email: organizer.email,
        role: "organizer", // You can extend this later to be dynamic
        uid: decodedToken.uid,
      };

      console.log("✅ Authenticated organizer:", req.user.email);
    } else {
      req.user = {
        email: userFromDb.email,
        role: userFromDb.role,
        uid: decodedToken.uid,
      };

      console.log("✅ Authenticated user:", req.user.email, "Role:", req.user.role);
    }

    next();

  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = verifyJWT;




