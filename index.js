// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const participantRoutes = require('./routes/ParticipantRegistration');
const organizerRoutes = require("./routes/organizers");
const paymentRoutes = require('./routes/paymentRoutes');
const stripeRoutes = require('./routes/stripePayment');
const feedbackRoutes = require('./routes/feedbackRoutes');



const app = express();
const port = process.env.PORT || 3000;


const allowedOrigins = ['https://medicamp-1e9cc.web.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
// Route mounting

app.use('/organizers', require('./routes/organizers'));
app.use('/camps', campRoutes); 
app.use('/users', userRoutes); 
app.use('/participantRegistrations', participantRoutes);
app.use('/payment', stripeRoutes);
app.use('/payment', paymentRoutes);
app.use('/feedback', feedbackRoutes);


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