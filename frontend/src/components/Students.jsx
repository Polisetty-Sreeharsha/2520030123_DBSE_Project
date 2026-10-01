import { useEffect, useState } from "react";
import "./Students.css";

function Students({ onBack }) {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("Loading students...");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/students"
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage("Failed to load students.");
          return;
        }

        setStudents(data);
        setMessage("");
      } catch (error) {
        console.error("Fetch students error:", error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="students-page">

      <div className="students-header">
        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Students</h1>
      </div>

      <div className="students-container">

        {message && (
          <p className="students-message">
            {message}
          </p>
        )}

        {!message && students.length === 0 && (
          <p className="students-message">
            No students registered yet.
          </p>
        )}

        {!message &&
          students.map((student) => (
            <div
              className="student-card"
              key={student._id}
            >
              <h2>{student.name}</h2>

              <p>
                <strong>Email:</strong>{" "}
                {student.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                Student
              </p>
            </div>
          ))}

      </div>
    </div>
  );
}

export default Students;