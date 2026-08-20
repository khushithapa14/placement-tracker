const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

// Apply to a job
router.post("/", authenticateToken, applyToJob);

// Get logged-in user's applications
router.get("/", authenticateToken, getMyApplications);

// Update application status
router.put("/:id/status", authenticateToken, updateApplicationStatus);

module.exports = router;
