const admin = require('firebase-admin');
const serviceAccount = require('../firebaseAdminCredentials.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    console.log('✅ Token verified:', decoded.email); 
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message); 
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = verifyJWT;

