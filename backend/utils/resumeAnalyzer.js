const calculateResumeMatch = (resumeText, jobDescription) => {
  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();

  // Basic skill list for now
  const skills = [
    "c++",
    "java",
    "python",
    "javascript",
    "react",
    "node.js",
    "node",
    "postgresql",
    "mysql",
    "mongodb",
    "docker",
    "aws",
    "git",
    "linux",
    "data structures",
    "algorithms",
    "machine learning",
    "opencv",
  ];

  const requiredSkills = skills.filter((skill) => job.includes(skill));

  const matchedSkills = requiredSkills.filter((skill) =>
    resume.includes(skill),
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !resume.includes(skill),
  );

  const matchScore =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const suggestions =
    missingSkills.length > 0
      ? `Consider improving your skills in: ${missingSkills.join(", ")}`
      : "Your resume matches the required skills well.";

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    suggestions,
  };
};

module.exports = calculateResumeMatch;
