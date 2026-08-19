const pool = require("../config/db");

// POST /api/jobs
const createJob = async (req, res) => {
  try {
    const {
      company,
      job_title,
      description,
      location,
      salary,
      application_deadline,
    } = req.body;

    if (!company || !job_title) {
      return res.status(400).json({
        success: false,
        message: "Company and job title are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO jobs
        (
          company,
          job_title,
          description,
          location,
          salary,
          application_deadline
        )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [company, job_title, description, location, salary, application_deadline],
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { search = "", location = "", page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    // Search company or job title
    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          company ILIKE $${values.length}
          OR job_title ILIKE $${values.length}
        )
      `);
    }

    // Filter location
    if (location.trim()) {
      values.push(`%${location.trim()}%`);

      conditions.push(`location ILIKE $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count matching jobs
    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM jobs
      ${whereClause}
      `,
      values,
    );

    const totalJobs = Number(countResult.rows[0].total);

    // Get jobs
    const jobsValues = [...values];

    jobsValues.push(limitNumber);
    const limitParameter = jobsValues.length;

    jobsValues.push(offset);
    const offsetParameter = jobsValues.length;

    const result = await pool.query(
      `
      SELECT
        id,
        company,
        job_title,
        description,
        location,
        salary,
        application_deadline,
        created_at
      FROM jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitParameter}
      OFFSET $${offsetParameter}
      `,
      jobsValues,
    );

    const totalPages = Math.ceil(totalJobs / limitNumber);

    res.json({
      success: true,
      jobs: result.rows,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalJobs,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Export both functions
module.exports = {
  createJob,
  getJobs,
};
