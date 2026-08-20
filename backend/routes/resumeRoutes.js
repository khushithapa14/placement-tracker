const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createResume,
  getMyResumes,
  uploadResume,
} = require("../controllers/resumeController");

const router = express.Router();

// Existing resume endpoints
router.post("/", authenticateToken, createResume);
router.get("/", authenticateToken, getMyResumes);

// Upload a PDF resume
router.post(
  "/upload",
  authenticateToken,
  upload.single("resume"),
  uploadResume,
);

module.exports = router;
