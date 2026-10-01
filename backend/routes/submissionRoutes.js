const express = require("express");

const {
  submitExam,
  getAllResults,
  getStudentSubmissions,
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/submit", submitExam);

router.get("/results", getAllResults);

router.get(
  "/student/:studentId",
  getStudentSubmissions
);

module.exports = router;