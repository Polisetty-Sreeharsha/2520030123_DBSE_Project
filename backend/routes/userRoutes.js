const express = require("express");

const {
  registerUser,
  loginUser,
  getAllStudents,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/students", getAllStudents);

router.post("/login", loginUser);

module.exports = router;