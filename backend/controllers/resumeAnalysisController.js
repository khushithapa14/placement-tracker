const pool = require("../config/db");
const path = require("path");
const extractTextFromPDF = require("../utils/pdfParser");
const calculateResumeMatch = require("../utils/resumeAnalyzer");

// POST /api/resume-analysis
const analyzeResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { resume_id, job_id } = req.body;

    // Validate required fields
    if (!resume_id || !job_id) {
      return res.status(400).json({
        success: false,
        message: "Resume ID and Job ID are required",
      });
    }

    // Check that the resume belongs to the logged-in user
    const resumeResult = await pool.query(
      `SELECT
        id,
        file_name,
        file_url
       FROM resumes
       WHERE id = $1 AND user_id = $2`,
      [resume_id, userId],
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Check that the job exists
    const jobResult = await pool.query(
      `SELECT
        id,
        company,
        job_title,
        description
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

    const resume = resumeResult.rows[0];
    const job = jobResult.rows[0];

    // Make sure the resume has an uploaded file
    if (!resume.file_url) {
      return res.status(400).json({
        success: false,
        message: "Resume file is not available",
      });
    }

    // Get only the filename from the stored URL
    // Example:
    // /uploads/1787221820251-255701466.pdf
    // becomes:
    // 1787221820251-255701466.pdf
    const fileName = path.basename(resume.file_url);

    // Build the absolute path to the uploaded PDF
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    console.log("Reading resume:", filePath);

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(filePath);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from resume PDF",
      });
    }

    console.log("Resume text extracted successfully");

    // Analyze resume against job description
    const analysis = calculateResumeMatch(resumeText, job.description || "");

    console.log("Analysis result:", analysis);

    // Save analysis in database
    const result = await pool.query(
      `INSERT INTO resume_analyses
        (
          resume_id,
          job_id,
          match_score,
          matched_skills,
          missing_skills,
          suggestions
        )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         resume_id,
         job_id,
         match_score,
         matched_skills,
         missing_skills,
         suggestions,
         created_at`,
      [
        resume_id,
        job_id,
        analysis.matchScore,
        analysis.matchedSkills,
        analysis.missingSkills,
        analysis.suggestions,
      ],
    );

    // Return the analysis
    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis: {
        ...result.rows[0],
        file_name: resume.file_name,
        company: job.company,
        job_title: job.job_title,
      },
    });
  } catch (error) {
    console.error("Analyze resume error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while analyzing the resume",
    });
  }
};

// GET /api/resume-analysis
const getMyAnalyses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        ra.id,
        ra.resume_id,
        ra.job_id,
        ra.match_score,
        ra.matched_skills,
        ra.missing_skills,
        ra.suggestions,
        ra.created_at,
        r.file_name,
        j.company,
        j.job_title
       FROM resume_analyses ra
       JOIN resumes r ON ra.resume_id = r.id
       JOIN jobs j ON ra.job_id = j.id
       WHERE r.user_id = $1
       ORDER BY ra.created_at DESC`,
      [userId],
    );

    res.status(200).json({
      success: true,
      analyses: result.rows,
    });
  } catch (error) {
    console.error("Get analyses error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch resume analyses",
    });
  }
};

module.exports = {
  analyzeResume,
  getMyAnalyses,
};
