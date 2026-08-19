const pool = require("../config/db");

const applyToJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { job_id, notes } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const jobResult = await pool.query(
      `SELECT id, company, job_title
       FROM jobs
       WHERE id = $1`,
      [job_id],
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existingApplication = await pool.query(
      `SELECT id
       FROM applications
       WHERE user_id = $1
       AND job_id = $2`,
      [userId, job_id],
    );

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    const result = await pool.query(
      `INSERT INTO applications
        (user_id, job_id, status, notes)
       VALUES ($1, $2, 'Applied', $3)
       RETURNING *`,
      [userId, job_id, notes || null],
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Apply to job error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        a.id,
        a.status,
        a.applied_at,
        a.notes,
        j.id AS job_id,
        j.company,
        j.job_title,
        j.location,
        j.salary,
        j.application_deadline
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [userId],
    );

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Interview",
      "Selected",
      "Rejected",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
        allowedStatuses,
      });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2
       AND user_id = $3
       RETURNING *`,
      [status, applicationId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application status error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
};
