import { useState } from "react";
import "./FacultyDashboard.css";

import CreateExam from "./CreateExam";
import ManageExams from "./ManageExams";
import ManageQuestions from "./ManageQuestions";
import FacultyResults from "./FacultyResults";
import ProctoringLogs from "./ProctoringLogs";
import Students from "./Students";

function FacultyDashboard({ onLogout }) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Create Exam
  if (currentPage === "create-exam") {
    return (
      <CreateExam
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }
  if (currentPage === "results") {
  return (
    <FacultyResults
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
if (currentPage === "proctoring") {
  return (
    <ProctoringLogs
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
if (currentPage === "students") {
  return (
    <Students
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
  // Manage Exams
  if (currentPage === "manage-exams") {
    return (
      <ManageExams
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  // Questions
  if (currentPage === "questions") {
    return (
      <ManageQuestions
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  // Dashboard
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p>
            Manage examinations, questions, and student results.
          </p>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>


      <div className="cards">

        {/* CREATE EXAM */}
        <div className="card">
          <h2>Create Exam</h2>

          <p>
            Create and schedule a new examination.
          </p>

          <button
            onClick={() => setCurrentPage("create-exam")}
          >
            Create Exam
          </button>
        </div>


        {/* MANAGE EXAMS */}
        <div className="card">
          <h2>Manage Exams</h2>

          <p>
            View and manage your existing examinations.
          </p>

          <button
            onClick={() => setCurrentPage("manage-exams")}
          >
            Manage Exams
          </button>
        </div>


        {/* QUESTIONS */}
        <div className="card">
          <h2>Questions</h2>

          <p>
            Add, edit, and manage exam questions.
          </p>

          <button
            onClick={() => setCurrentPage("questions")}
          >
            Manage Questions
          </button>
        </div>


        {/* RESULTS */}
        <div className="card">
          <h2>Student Results</h2>

          <p>
            View examination scores and submissions.
          </p>

          <button
            onClick={() => setCurrentPage("results")}
          >
            View Results
          </button>
        </div>


        {/* PROCTORING */}
        <div className="card">
          <h2>Proctoring Logs</h2>

          <p>
            Review suspicious activities during exams.
          </p>

          <button
            onClick={() =>
              setCurrentPage("proctoring")
            }
          >
            View Logs
          </button>
        </div>


        {/* STUDENTS */}
        <div className="card">
          <h2>Students</h2>

          <p>
            View students registered for examinations.
          </p>

          <button
            onClick={() => setCurrentPage("students")}
          >
            View Students
          </button>
        </div>

      </div>
    </div>
  );
}

export default FacultyDashboard;