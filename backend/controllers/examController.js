const Exam = require("../models/Exam");

// Create Exam
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      startTime,
      createdBy,
    } = req.body;

    // Check required fields
    if (!title || !duration || !startTime || !createdBy) {
      return res.status(400).json({
        message:
          "Title, duration, startTime and createdBy are required",
      });
    }

    // Check that exam start time is in the future
    const selectedStartTime = new Date(startTime);
    const currentTime = new Date();

    if (
      isNaN(selectedStartTime.getTime()) ||
      selectedStartTime <= currentTime
    ) {
      return res.status(400).json({
        message:
          "Exam date and start time must be in the future.",
      });
    }

    const exam = await Exam.create({
      title,
      description,
      duration,
      startTime,
      createdBy,
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });

  } catch (error) {
    console.error("Create exam error:", error);

    res.status(500).json({
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

// Get All Exams
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(exams);

  } catch (error) {
    console.error("Get exams error:", error);

    res.status(500).json({
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

module.exports = {
  createExam,
  getExams,
};