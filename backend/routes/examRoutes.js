const express = require("express");

const {
  createExam,
  getExams,
} = require("../controllers/examController");

const router = express.Router();

router.post("/create", createExam);

router.get("/", getExams);

module.exports = router;
