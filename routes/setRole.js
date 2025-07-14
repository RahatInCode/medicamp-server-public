const admin = require("firebase-admin");
const serviceAccount = require("./firebaseAdminCredentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const setCustomClaims = async () => {
  const user = await admin.auth().getUserByEmail("organizer@medicamp.com");
  await admin.auth().setCustomUserClaims(user.uid, { role: "organizer" });
  console.log(`✅ Custom claim set for ${user.email}`);
};

setCustomClaims().catch(console.error);
