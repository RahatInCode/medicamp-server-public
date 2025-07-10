// Load required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const campRoutes = require('./routes/campRoutes');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173', // Allow Vite frontend
  credentials: true, // Enable if using cookies/auth
}));


app.use(express.json());

const MONGO_URI = process.env.MONGO_URI 
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


app.use('/availableCamps', campRoutes);

app.get('/debug-camps', async (req, res) => {
  try {
    const result = await mongoose.connection.db.collection('availableCamps').find().toArray();
    res.json(result);
  } catch (err) {
    console.error("🔥 Direct MongoDB read error:", err);
    res.status(500).send("DB read error");
  }
});




app.get('/', (req, res) => {
  res.send('🚀 Medicamp Server is running!');
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
