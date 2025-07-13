// middlewares/verifyFirebaseJWT.js
const admin = require("firebase-admin");

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
    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = verifyJWT;



