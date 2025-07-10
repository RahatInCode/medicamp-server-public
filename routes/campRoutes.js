const express = require("express");
const router = express.Router();
const { getAllCamps, getCampById } = require("../controllers/campController");

// GET all camps
router.get("/", getAllCamps);

// ✅ GET camp by ID (handled in controller)
router.get("/:id", getCampById);

module.exports = router;


