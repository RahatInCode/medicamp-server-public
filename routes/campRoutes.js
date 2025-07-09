const express = require("express");
const router = express.Router();
const { getAllCamps } = require("../controllers/campController");

// GET /available-camps/ -> get all camps
router.get("/", getAllCamps);

module.exports = router;

