const pool = require("../config/db");

// POST /api/resumes
const createResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { file_name, file_url } = req.body;

    if (!file_name) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO resumes
        (user_id, file_name, file_url)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, file_name, file_url, created_at`,
      [userId, file_name, file_url || null],
    );

    res.status(201).json({
      success: true,
      message: "Resume saved successfully",
      resume: result.rows[0],
    });
  } catch (error) {
    console.error("Create resume error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/resumes/upload
const uploadResume = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Make sure a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    const originalFileName = req.file.originalname;
    const storedFileName = req.file.filename;

    // Store the uploaded file information in PostgreSQL
    const result = await pool.query(
      `INSERT INTO resumes
        (user_id, file_name, file_url)
       VALUES ($1, $2, $3)
       RETURNING
         id,
         user_id,
         file_name,
         file_url,
         created_at`,
      [userId, originalFileName, `/uploads/${storedFileName}`],
    );

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: result.rows[0],
    });
  } catch (error) {
    console.error("Upload resume error:", error);

    // If database insertion fails, remove the uploaded file
    if (req.file) {
      const fs = require("fs");
      const path = require("path");

      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Could not upload resume",
    });
  }
};

// GET /api/resumes
const getMyResumes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        id,
        user_id,
        file_name,
        file_url,
        created_at
       FROM resumes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    res.json({
      success: true,
      resumes: result.rows,
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createResume,
  uploadResume,
  getMyResumes,
};
