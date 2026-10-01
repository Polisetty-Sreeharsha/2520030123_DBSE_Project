import { useState } from "react";
import AvailableExams from "./AvailableExams";
import StudentResults from "./StudentResults";
import UpcomingExams from "./UpcomingExams";
import ExamHistory from "./ExamHistory";
import "./StudentDashboard.css";

function StudentDashboard({ onLogout }) {
  const [showExams, setShowExams] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (showExams) {
    return (
      <AvailableExams
        onBack={() => setShowExams(false)}
      />
    );
  }

  if (showResults) {
    return (
      <StudentResults
        onBack={() => setShowResults(false)}
      />
    );
  }
  if (showUpcoming) {
  return (
    <UpcomingExams
      onBack={() => setShowUpcoming(false)}
    />
  );
}
if (showHistory) {
  return (
    <ExamHistory
      onBack={() => setShowHistory(false)}
    />
  );
}

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome to your examination portal.</p>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <div className="cards">

        {/* Available Exams */}
        <div className="card">
          <h2>Available Exams</h2>
          <p>View and attend exams.</p>

          <button onClick={() => setShowExams(true)}>
            View Exams
          </button>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <h2>Upcoming Exams</h2>
          <p>Check future exams.</p>

          <button onClick={() => setShowUpcoming(true)}>
  View Upcoming
</button>
        </div>

        {/* Results */}
        <div className="card">
          <h2>Results</h2>
          <p>View your scores.</p>

          <button onClick={() => setShowResults(true)}>
            View Results
          </button>
        </div>

        {/* Exam History */}
        <div className="card">
          <h2>Exam History</h2>
          <p>View your completed exams.</p>

          <button onClick={() => setShowHistory(true)}>
  View History
</button>
        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;