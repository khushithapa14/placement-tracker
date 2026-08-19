const pool = require("../config/db");

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        u.name,
        u.email,
        p.college,
        p.degree,
        p.branch,
        p.graduation_year,
        p.github_url,
        p.linkedin_url
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      college,
      degree,
      branch,
      graduation_year,
      github_url,
      linkedin_url,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO profiles
        (
          user_id,
          college,
          degree,
          branch,
          graduation_year,
          github_url,
          linkedin_url
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7)

       ON CONFLICT (user_id)
       DO UPDATE SET
         college = EXCLUDED.college,
         degree = EXCLUDED.degree,
         branch = EXCLUDED.branch,
         graduation_year = EXCLUDED.graduation_year,
         github_url = EXCLUDED.github_url,
         linkedin_url = EXCLUDED.linkedin_url

       RETURNING *`,
      [
        userId,
        college,
        degree,
        branch,
        graduation_year,
        github_url,
        linkedin_url,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Save profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile,
};
