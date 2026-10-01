import { useEffect, useState } from "react";
import "./ManageExams.css";

function ManageExams({ onBack }) {
  const [exams, setExams] = useState([]);
  const [message, setMessage] = useState("Loading exams...");

  const fetchExams = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/exams"
      );

      const data = await response.json();

      if (response.ok) {
        setExams(data);
        setMessage("");
      } else {
        setMessage("Failed to load exams.");
      }

    } catch (error) {
      console.error("Fetch exams error:", error);
      setMessage("Cannot connect to the backend.");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="manage-exams-page">

      <div className="manage-exams-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Manage Exams</h1>

      </div>


      <div className="exam-list">

        {message && (
          <p className="exam-message">
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
              {exam.description || "No description provided."}
            </p>

            <div className="exam-details">

              <span>
                <strong>Duration:</strong>{" "}
                {exam.duration} minutes
              </span>

              <span>
                <strong>Created by:</strong>{" "}
                {exam.createdBy?.name || "Faculty"}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ManageExams;