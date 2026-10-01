import { useEffect, useState } from "react";
import "./ProctoringLogs.css";

function ProctoringLogs({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("Loading logs...");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/proctoring/logs"
        );

        const data = await response.json();

        if (response.ok) {
          setLogs(data);
          setMessage("");
        } else {
          setMessage("Failed to load proctoring logs.");
        }
      } catch (error) {
        console.error(
          "Fetch proctoring logs error:",
          error
        );

        setMessage(
          "Cannot connect to the backend."
        );
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="proctoring-page">
      <div className="proctoring-header">
        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Proctoring Logs</h1>
      </div>

      <div className="proctoring-container">
        {message && (
          <p className="proctoring-message">
            {message}
          </p>
        )}

        {!message && logs.length === 0 && (
          <p className="proctoring-message">
            No suspicious activities recorded yet.
          </p>
        )}

        {logs.map((log) => (
          <div
            className="proctoring-card"
            key={log._id}
          >
            <h2>
              ⚠ {log.event}
            </h2>

            <p>
              <strong>Exam:</strong>{" "}
              {log.examId?.title ||
                "Unknown Exam"}
            </p>

            <p>
              <strong>Student:</strong>{" "}
              {log.studentId?.name ||
                "Unknown Student"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {log.studentId?.email ||
                "Not available"}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {new Date(
                log.timestamp
              ).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProctoringLogs;