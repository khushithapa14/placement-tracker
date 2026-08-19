const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", authenticateToken, applyToJob);

router.get("/", authenticateToken, getMyApplications);

router.put("/:id/status", authenticateToken, updateApplicationStatus);

module.exports = router;
