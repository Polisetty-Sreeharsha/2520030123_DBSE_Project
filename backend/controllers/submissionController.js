const Submission = require("../models/Submission");
const Question = require("../models/Question");
const Exam = require("../models/Exam");

// Submit Exam
const submitExam = async (req, res) => {
  try {
    const { examId, studentId, answers } = req.body;

    if (!examId || !studentId || !answers) {
      return res.status(400).json({
        message: "Exam, student and answers are required",
      });
    }
    // Check exam schedule
const exam = await Exam.findById(examId);

if (!exam) {
  return res.status(404).json({
    message: "Exam not found",
  });
}

const startTime = new Date(exam.startTime);

const endTime = new Date(
  startTime.getTime() + exam.duration * 60 * 1000
);

const now = new Date();

if (now < startTime) {
  return res.status(400).json({
    message: "This exam has not started yet.",
  });
}

if (now > endTime) {
  return res.status(400).json({
    message: "This exam has already ended.",
  });
}

    // Check if the student has already submitted this exam
const existingSubmission = await Submission.findOne({
  examId,
  studentId,
});

if (existingSubmission) {
  return res.status(400).json({
    message: "You have already submitted this exam.",
  });
}
    let score = 0;

    for (const item of answers) {
      const question = await Question.findById(
        item.questionId
      );

      if (!question) {
        continue;
      }

      const correctIndex = ["A", "B", "C", "D"].indexOf(
        question.correctAnswer
      );

      const correctAnswerText =
        question.options[correctIndex];

      if (item.answer === correctAnswerText) {
        score++;
      }
    }

    const submission = await Submission.create({
      examId,
      studentId,
      answers,
      score,
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: "Exam submitted successfully",
      score,
      submissionId: submission._id,
    });

  } catch (error) {
    console.error("Submit exam error:", error);

    res.status(500).json({
      message: "Failed to submit exam",
      error: error.message,
    });
  }
};


// Get All Student Results
const getAllResults = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("examId", "title")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);

  } catch (error) {
    console.error("Get results error:", error);

    res.status(500).json({
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

// Get submissions of a particular student
const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await Submission.find({
      studentId: studentId,
    })
      .populate("examId", "title")
      .select("examId score submittedAt")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);

  } catch (error) {
    console.error("Get student submissions error:", error);

    res.status(500).json({
      message: "Failed to fetch student submissions",
      error: error.message,
    });
  }
};


module.exports = {
  submitExam,
  getAllResults,
  getStudentSubmissions,
};