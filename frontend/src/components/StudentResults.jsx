import { useEffect, useState } from "react";
import "./StudentResults.css";

function StudentResults({ onBack }) {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("Loading results...");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          setMessage("Please login first.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/submissions/student/${user.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setResults(data);
          setMessage("");
        } else {
          setMessage("Failed to load results.");
        }
      } catch (error) {
        console.error("Fetch results error:", error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="student-results-page">
      <div className="student-results-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>

        <h1>My Results</h1>
      </div>

      <div className="results-container">

        {message && (
          <p className="results-message">
            {message}
          </p>
        )}

        {!message && results.length === 0 && (
          <p className="results-message">
            You have not completed any exams yet.
          </p>
        )}

        {results.map((result) => (
          <div
            className="result-card"
            key={result._id}
          >
            <h2>
              {result.examId?.title || "Unknown Exam"}
            </h2>

            <p>
              <strong>Score:</strong>{" "}
              {result.score}
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {new Date(
                result.submittedAt
              ).toLocaleString()}
            </p>

            <p className="completed-status">
              ✓ Exam Completed
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}

export default StudentResults;