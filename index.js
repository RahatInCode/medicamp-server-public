// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OpenAI } = require('openai');   // 👈 import OpenAI

// Routes
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const participantRoutes = require('./routes/ParticipantRegistration');
const organizerRoutes = require("./routes/organizers");
const paymentRoutes = require('./routes/paymentRoutes');
const stripeRoutes = require('./routes/stripePayment');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://medicamp-1e9cc.web.app',
  'http://localhost:5173'
];

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

// Mount existing routes
app.use('/organizers', organizerRoutes);
app.use('/camps', campRoutes); 
app.use('/users', userRoutes); 
app.use('/participantRegistrations', participantRoutes);
app.use('/payment', stripeRoutes);
app.use('/payment', paymentRoutes);
app.use('/feedback', feedbackRoutes);

// ✅ NEW: OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ NEW: Chatbot API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // fast & cost-efficient
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a medical camp management system. Answer politely and guide users, but do not provide medical diagnoses.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

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
