import { useEffect, useState } from "react";
import "./ExamHistory.css";

function ExamHistory({ onBack }) {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("Loading exam history...");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          setMessage("Please login first.");
          return;
        }

        // Get all exams
        const examResponse = await fetch(
          "http://localhost:5000/api/exams"
        );

        const exams = await examResponse.json();

        if (!examResponse.ok) {
          setMessage("Failed to load exams.");
          return;
        }

        // Get student's submissions
        const submissionResponse = await fetch(
          `http://localhost:5000/api/submissions/student/${user.id}`
        );

        const submissions = await submissionResponse.json();

        if (!submissionResponse.ok) {
          setMessage("Failed to load submissions.");
          return;
        }

        const now = new Date();

        // Only exams that have ended
        const endedExams = exams.filter((exam) => {
          const startTime = new Date(exam.startTime);

          const endTime = new Date(
            startTime.getTime() +
              exam.duration * 60 * 1000
          );

          return now > endTime;
        });

        const historyData = endedExams.map((exam) => {
          const submission = submissions.find(
            (item) =>
              item.examId?._id === exam._id ||
              item.examId === exam._id
          );

          return {
            exam,
            submission,
          };
        });

        setHistory(historyData);
        setMessage("");
      } catch (error) {
        console.error("Fetch history error:", error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="exam-history-page">

      <div className="exam-history-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>My Exam History</h1>

      </div>

      <div className="exam-history-list">

        {message && (
          <p className="history-message">
            {message}
          </p>
        )}

        {!message && history.length === 0 && (
          <p className="history-message">
            No completed or missed exams yet.
          </p>
        )}

        {!message &&
          history.map(({ exam, submission }) => (
            <div
              className="exam-card"
              key={exam._id}
            >

              <h2>{exam.title}</h2>

              <p>
                <strong>Exam Date:</strong>{" "}
                {new Date(
                  exam.startTime
                ).toLocaleString()}
              </p>

              {submission ? (
                <>
                  <p>
                    <strong>Score:</strong>{" "}
                    {submission.score}
                  </p>

                  <p className="completed-status">
                    ✓ Exam Completed
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Score:</strong> —
                  </p>

                  <p className="not-attempted-status">
                    ⚪ Not Attempted
                  </p>
                </>
              )}

            </div>
          ))}

      </div>

    </div>
  );
}

export default ExamHistory;