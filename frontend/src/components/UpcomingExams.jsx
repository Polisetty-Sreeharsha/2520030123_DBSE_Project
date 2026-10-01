import { useEffect, useState } from "react";
import "./UpcomingExams.css";

function UpcomingExams({ onBack }) {
  const [exams, setExams] = useState([]);
  const [message, setMessage] = useState("Loading upcoming exams...");

  useEffect(() => {
    const fetchUpcomingExams = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/exams"
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage("Failed to load exams.");
          return;
        }

        const now = new Date();

        const upcoming = data.filter(
          (exam) => new Date(exam.startTime) > now
        );

        setExams(upcoming);
        setMessage("");
      } catch (error) {
        console.error("Fetch upcoming exams error:", error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchUpcomingExams();
  }, []);

  return (
    <div className="upcoming-exams-page">

      <div className="upcoming-exams-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Upcoming Exams</h1>

      </div>

      <div className="upcoming-exams-list">

        {message && (
          <p className="upcoming-message">
            {message}
          </p>
        )}

        {exams.map((exam) => (
          <div
            className="exam-card"
            key={exam._id}
          >

            <h2>{exam.title}</h2>

            <p>
              {exam.description ||
                "No description provided."}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {exam.duration} minutes
            </p>

            <p>
              <strong>Exam Date & Time:</strong>{" "}
              {new Date(
                exam.startTime
              ).toLocaleString()}
            </p>

            <p className="upcoming-status">
              🕒 Exam not started yet
            </p>

          </div>
        ))}

        {!message && exams.length === 0 && (
          <p className="upcoming-message">
            No upcoming exams.
          </p>
        )}

      </div>

    </div>
  );
}

export default UpcomingExams;