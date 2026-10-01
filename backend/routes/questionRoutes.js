const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createQuestion,
  getQuestionsByExam,
} = require("../controllers/questionController");

const router = express.Router();

// Create upload directory
const uploadDirectory = path.join(
  __dirname,
  "../uploads/questions"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create question with optional image
router.post(
  "/create",
  upload.single("image"),
  createQuestion
);

// Get questions for an exam
router.get(
  "/exam/:examId",
  getQuestionsByExam
);

module.exports = router;