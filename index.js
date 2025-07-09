// Load required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const campRoutes = require('./routes/campRoutes');
require('dotenv').config();

const app = express();
const port = 3000;

// ✅ Enable CORS for frontend (adjust origin as needed)
app.use(cors({
  origin: 'http://localhost:5173', // Allow Vite frontend
  credentials: true, // Enable if using cookies/auth
}));

// ✅ Enable JSON parsing for request bodies
app.use(express.json());

// ✅ MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://medicampDB:tgUUgjKLR8Sxs95d@cluster0.ikpgejg.mongodb.net/medicamp?retryWrites=true&w=majority&appName=Cluster0";

// ✅ Connect to MongoDB using Mongoose
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ✅ Main API route for camps
app.use('/availableCamps', campRoutes);

// ✅ Debug route to test direct database read (useful for verifying connection)
app.get('/debug-camps', async (req, res) => {
  try {
    const result = await mongoose.connection.db.collection('availableCamps').find().toArray();
    res.json(result);
  } catch (err) {
    console.error("🔥 Direct MongoDB read error:", err);
    res.status(500).send("DB read error");
  }
});

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('🚀 Medicamp Server is running!');
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
