const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Faculty = require("../models/Faculty");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (role === "faculty") {
      const authorizedFaculty = await Faculty.findOne({
        email: email,
        isAuthorized: true,
      });

      if (!authorizedFaculty) {
        return res.status(403).json({
          message: "You are not an authorized faculty member.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not registered",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    if (user.role === "faculty") {
      const authorizedFaculty = await Faculty.findOne({
        email: user.email,
        isAuthorized: true,
      });

      if (!authorizedFaculty) {
        return res.status(403).json({
          message: "Faculty account is not authorized.",
        });
      }
    }

    // Check role
    if (user.role !== role) {
  return res.status(401).json({
    message: "Invalid email, password, or role.",
  });
}

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "secretkey",
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// GET ALL STUDENTS
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select("name email")
      .sort({ name: 1 });

    res.status(200).json(students);

  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllStudents,
};