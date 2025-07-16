const mongoose = require('mongoose');
require('dotenv').config();

console.log("🧪 Loaded ENV:", {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.ikpgejg.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


