// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const participantRoutes = require('./routes/ParticipantRegistration');




const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
// Route mounting

app.use('/camps', campRoutes); 
app.use('/users', userRoutes); 
app.use('/participantRegistrations', participantRoutes);
// DB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Medicamp Server is running!');
});



app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
}); 