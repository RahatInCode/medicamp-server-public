
const admin = require("../utils/FirebaseAdmin");

const verifyFirebaseJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Auth header received:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("❌ No token or malformed token");
    return res.status(401).json({ error: "Unauthorized - no token" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Firebase token verified:", decodedToken);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (err) {
    console.error("❌ Firebase token verification failed:", err.message);
    return res.status(401).json({ error: "Unauthorized - invalid token" });
  }
};

module.exports = verifyFirebaseJWT;