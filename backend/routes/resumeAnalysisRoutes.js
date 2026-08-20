const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  analyzeResume,
  getMyAnalyses,
} = require("../controllers/resumeAnalysisController");

const router = express.Router();

router.post("/", authenticateToken, analyzeResume);

router.get("/", authenticateToken, getMyAnalyses);

module.exports = router;
