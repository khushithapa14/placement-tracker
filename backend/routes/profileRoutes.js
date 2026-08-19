const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  getProfile,
  createOrUpdateProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/", authenticateToken, getProfile);

router.put("/", authenticateToken, createOrUpdateProfile);

module.exports = router;
