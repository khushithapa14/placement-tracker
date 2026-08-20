const pool = require("../config/db");

// POST /api/interviews
const createInterview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { application_id, round_name, scheduled_at, result, notes } =
      req.body;

    if (!application_id || !round_name) {
      return res.status(400).json({
        success: false,
        message: "Application ID and round name are required",
      });
    }

    // Make sure this application belongs to the logged-in user
    const applicationResult = await pool.query(
      `SELECT id
       FROM applications
       WHERE id = $1
       AND user_id = $2`,
      [application_id, userId],
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const resultData = await pool.query(
      `INSERT INTO interviews
        (
          application_id,
          round_name,
          scheduled_at,
          result,
          notes
        )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        application_id,
        round_name,
        scheduled_at || null,
        result || null,
        notes || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview: resultData.rows[0],
    });
  } catch (error) {
    console.error("Create interview error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/interviews
const getMyInterviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        i.id,
        i.application_id,
        i.round_name,
        i.scheduled_at,
        i.result,
        i.notes,
        j.company,
        j.job_title
       FROM interviews i
       INNER JOIN applications a
         ON i.application_id = a.id
       INNER JOIN jobs j
         ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY i.scheduled_at ASC NULLS LAST`,
      [userId],
    );

    res.json({
      success: true,
      interviews: result.rows,
    });
  } catch (error) {
    console.error("Get interviews error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createInterview,
  getMyInterviews,
};
