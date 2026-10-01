const ProctoringLog = require("../models/ProctoringLog");

const createProctoringLog = async (req, res) => {
  try {
    const {
      examId,
      studentId,
      event,
    } = req.body;

    if (!examId || !studentId || !event) {
      return res.status(400).json({
        message: "Exam, student and event are required",
      });
    }

    const log = await ProctoringLog.create({
      examId,
      studentId,
      event,
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "Proctoring event logged",
      log,
    });

  } catch (error) {
    console.error("Proctoring log error:", error);

    res.status(500).json({
      message: "Failed to save proctoring log",
      error: error.message,
    });
  }
};


// Get all proctoring logs
const getProctoringLogs = async (req, res) => {
  try {
    const logs = await ProctoringLog.find()
      .populate("examId", "title")
      .populate("studentId", "name email")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);

  } catch (error) {
    console.error("Get proctoring logs error:", error);

    res.status(500).json({
      message: "Failed to fetch proctoring logs",
      error: error.message,
    });
  }
};


module.exports = {
  createProctoringLog,
  getProctoringLogs,
};