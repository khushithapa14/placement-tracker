const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  createInterview,
  getMyInterviews,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/", authenticateToken, createInterview);

router.get("/", authenticateToken, getMyInterviews);

module.exports = router;
