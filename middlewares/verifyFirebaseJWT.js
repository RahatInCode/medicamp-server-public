// middlewares/verifyFirebaseJWT.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../firebaseAdminCredentials.json")),
  });
}

const User = require('../models/User'); // Your User mongoose model

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

    // Fetch user from DB to get role
    const userFromDb = await User.findOne({ email }).select('role email');

    if (!userFromDb) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = {
      email: userFromDb.email,
      role: userFromDb.role,
      uid: decodedToken.uid,
    };

    console.log("✅ Authenticated user:", req.user.email, "Role:", req.user.role);
    next();

  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};


module.exports = verifyJWT;



