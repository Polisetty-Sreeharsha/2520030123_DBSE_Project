const Question = require("../models/Question");

// Add Question
const createQuestion = async (req, res) => {
  try {
    const {
      examId,
      question,
      correctAnswer,
    } = req.body;

    let options;

    try {
      options = JSON.parse(req.body.options);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid options format.",
      });
    }

    if (
      !examId ||
      !question ||
      !options ||
      options.length !== 4 ||
      !correctAnswer
    ) {
      return res.status(400).json({
        message:
          "Exam, question, 4 options and correct answer are required",
      });
    }

    const image = req.file
      ? `/uploads/questions/${req.file.filename}`
      : "";

    const newQuestion = await Question.create({
      examId,
      question,
      image,
      options,
      correctAnswer,
    });

    res.status(201).json({
      message: "Question added successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Create question error:", error);

    res.status(500).json({
      message: "Failed to add question",
      error: error.message,
    });
  }
};


// Get Questions for an Exam
const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const questions = await Question.find({
      examId,
    }).sort({ createdAt: 1 });

    res.status(200).json(questions);

  } catch (error) {
    console.error("Get questions error:", error);

    res.status(500).json({
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};


module.exports = {
  createQuestion,
  getQuestionsByExam,
};