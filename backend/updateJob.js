const pool = require("./config/db");

const updateJob = async () => {
  try {
    await pool.query(
      `UPDATE jobs
       SET description = $1
       WHERE id = 1`,
      [
        "Entry-level Software Engineer position. Required skills: C++, Python, Data Structures, PostgreSQL, Git. Knowledge of AWS and Docker is preferred.",
      ],
    );

    console.log("Job updated successfully");
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await pool.end();
  }
};

updateJob();