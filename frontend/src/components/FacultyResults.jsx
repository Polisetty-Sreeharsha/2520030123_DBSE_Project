import { useEffect, useState } from "react";
import "./FacultyResults.css";

function FacultyResults({ onBack }) {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(
    "Loading student results..."
  );

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get all registered students
        const studentsResponse = await fetch(
          "http://localhost:5000/api/users/students"
        );

        const students = await studentsResponse.json();

        if (!studentsResponse.ok) {
          setMessage("Failed to load students.");
          return;
        }

        // Get all exams
        const examsResponse = await fetch(
          "http://localhost:5000/api/exams"
        );

        const exams = await examsResponse.json();

        if (!examsResponse.ok) {
          setMessage("Failed to load exams.");
          return;
        }

        // Get all submitted results
        const resultsResponse = await fetch(
          "http://localhost:5000/api/submissions/results"
        );

        const submissions = await resultsResponse.json();

        if (!resultsResponse.ok) {
          setMessage("Failed to load results.");
          return;
        }

        const now = new Date();

        // Only consider exams that have ended
        const endedExams = exams.filter((exam) => {
          const startTime = new Date(exam.startTime);

          const endTime = new Date(
            startTime.getTime() +
              exam.duration * 60 * 1000
          );

          return now > endTime;
        });

        const finalResults = [];

        // Compare every student with every ended exam
        students.forEach((student) => {
          endedExams.forEach((exam) => {
            const submission = submissions.find(
              (result) =>
                result.studentId?._id === student._id &&
                result.examId?._id === exam._id
            );

            finalResults.push({
              student,
              exam,
              submission,
            });
          });
        });

        // Newest exams first
        finalResults.sort(
          (a, b) =>
            new Date(b.exam.startTime) -
            new Date(a.exam.startTime)
        );

        setResults(finalResults);
        setMessage("");
      } catch (error) {
        console.error(
          "Fetch faculty results error:",
          error
        );

        setMessage(
          "Cannot connect to the backend."
        );
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="faculty-results-page">

      <div className="faculty-results-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Student Results</h1>

      </div>

      <div className="faculty-results-container">

        {message && (
          <p className="faculty-results-message">
            {message}
          </p>
        )}

        {!message && results.length === 0 && (
          <p className="faculty-results-message">
            No completed exams found.
          </p>
        )}

        {!message &&
          results.map(
            ({ student, exam, submission }) => (
              <div
                className="faculty-result-card"
                key={`${student._id}-${exam._id}`}
              >

                <h2>{exam.title}</h2>

                <p>
                  <strong>Student:</strong>{" "}
                  {student.name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {student.email}
                </p>

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

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(
                        submission.submittedAt
                      ).toLocaleString()}
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
            )
          )}

      </div>

    </div>
  );
}

export default FacultyResults;