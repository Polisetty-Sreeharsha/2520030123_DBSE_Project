const express = require("express");

const {
  createProctoringLog,
  getProctoringLogs,
} = require("../controllers/proctoringController");

const router = express.Router();

router.post("/log", createProctoringLog);

router.get("/logs", getProctoringLogs);

module.exports = router;