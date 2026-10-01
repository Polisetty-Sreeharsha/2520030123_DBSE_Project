import { useState } from "react";
import "./App.css";
import StudentDashboard from "./components/StudentDashboard";
import FacultyDashboard from "./components/FacultyDashboard";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [role, setRole] = useState("student");

  // Login data
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register data
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
            role: role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setRole(data.user.role);
        setShowDashboard(true);

        setLoginEmail("");
        setLoginPassword("");
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to the backend.");
    }
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Registration successful! You can now login."
        );

        setRegisterData({
          name: "",
          email: "",
          password: "",
          role: "student",
        });
      } else {
        setMessage(
          data.message || "Registration failed."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Cannot connect to the backend.");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowDashboard(false);
    setShowRegister(false);
    setMessage("");
  };

  // =========================
  // DASHBOARDS
  // =========================
  if (showDashboard) {
    if (role === "student") {
      return (
        <StudentDashboard
          onLogout={handleLogout}
        />
      );
    }

    if (role === "faculty") {
      return (
        <FacultyDashboard
          onLogout={handleLogout}
        />
      );
    }
  }

  // =========================
  // LOGIN / REGISTER PAGE
  // =========================
  return (
    <main
      className={`login-page ${
        showRegister ? "register-mode" : "login-mode"
      }`}
    >
      {/* =========================================
          CINEMATIC FULL SCREEN BACKGROUND
      ========================================== */}
      <div className="cinematic-background">
        <div className="cinematic-photo"></div>

        <div className="sunlight-glow"></div>

        <div className="atmospheric-haze haze-one"></div>
        <div className="atmospheric-haze haze-two"></div>

        <div className="cinematic-overlay"></div>

        <div className="film-grain"></div>
      </div>

      {/* =========================================
          MAIN CONTENT
      ========================================== */}
      <div className="login-container">

        {/* =====================================
            LEFT INFORMATION PANEL
        ====================================== */}
        <section className="login-left">
          <div className="brand-content">

            <div className="brand-accent"></div>

            <p className="brand-label">
              SECURE • SMART • ONLINE
            </p>

            <h1>
              Online Examination
            </h1>

            <h2>
              &amp; Proctoring Platform
            </h2>

            <p className="brand-description">
              A simple and secure platform for conducting
              online examinations, managing exams, and
              monitoring student activities.
            </p>

            <div className="brand-features">
              <span>Secure Exams</span>
              <span>Smart Monitoring</span>
              <span>Easy Management</span>
            </div>

          </div>
        </section>

        {/* =====================================
            RIGHT LOGIN / REGISTER CARD
        ====================================== */}
        <section className="login-card">

          {!showRegister ? (

            /* ================================
               LOGIN
            ================================= */
            <>
              <div className="form-heading">

                <span className="form-label">
                  WELCOME BACK
                </span>

                <h2>
                  Welcome Back
                </h2>

                <p className="login-subtitle">
                  Login to continue to your account
                </p>

              </div>

              <form onSubmit={handleLogin}>

                <label htmlFor="login-email">
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) =>
                    setLoginEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />

                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <label htmlFor="login-role">
                  Login as
                </label>

                <select
                  id="login-role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="faculty">
                    Faculty
                  </option>
                </select>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <span>
                    Login
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </button>

              </form>

              {message && (
                <p className="register-message">
                  {message}
                </p>
              )}

              <p className="register-text">
                Don't have an account?{" "}

                <span
                  onClick={() => {
                    setShowRegister(true);
                    setMessage("");
                  }}
                >
                  Register
                </span>
              </p>
            </>

          ) : (

            /* ================================
               REGISTER
            ================================= */
            <>
              <div className="form-heading">

                <span className="form-label">
                  GET STARTED
                </span>

                <h2>
                  Create Account
                </h2>

                <p className="login-subtitle">
                  Register to continue
                </p>

              </div>

              <form onSubmit={handleRegister}>

                <label htmlFor="register-name">
                  Name
                </label>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      name: e.target.value,
                    })
                  }
                  autoComplete="name"
                  required
                />

                <label htmlFor="register-email">
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  autoComplete="email"
                  required
                />

                <label htmlFor="register-password">
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                  required
                />

                <label htmlFor="register-role">
                  Register as
                </label>

                <select
                  id="register-role"
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="faculty">
                    Faculty
                  </option>
                </select>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <span>
                    Register
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </button>

              </form>

              {message && (
                <p className="register-message">
                  {message}
                </p>
              )}

              <p className="register-text">
                Already have an account?{" "}

                <span
                  onClick={() => {
                    setShowRegister(false);
                    setMessage("");
                  }}
                >
                  Login
                </span>
              </p>
            </>
          )}

        </section>
      </div>
    </main>
  );
}

export default App;