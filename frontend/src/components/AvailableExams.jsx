import { useEffect, useState } from "react";
import AttendExam from "./AttendExam";
import "./AvailableExams.css";

function AvailableExams({ onBack }) {
  const [exams, setExams] = useState([]);
  const [submittedExams, setSubmittedExams] = useState([]);
  const [startExam, setStartExam] = useState(null);
  const [message, setMessage] = useState("Loading exams...");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          setMessage("Please login first.");
          return;
        }

        const examResponse = await fetch(
          "http://localhost:5000/api/exams"
        );

        const examData = await examResponse.json();

        if (!examResponse.ok) {
          setMessage("Failed to load exams.");
          return;
        }

        setExams(examData);

        const submissionResponse = await fetch(
          `http://localhost:5000/api/submissions/student/${user.id}`
        );

        const submissionData = await submissionResponse.json();

        if (submissionResponse.ok) {
          setSubmittedExams(submissionData);
        }

        setMessage("");
      } catch (error) {
        console.error("Fetch exams error:", error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchExams();
  }, []);

  // Check whether student already submitted this exam
  const isExamSubmitted = (examId) => {
    return submittedExams.some(
      (submission) =>
        submission.examId?._id === examId ||
        submission.examId === examId
    );
  };

  // Check whether exam is currently running
  const isExamActive = (exam) => {
    const startTime = new Date(exam.startTime);

    const endTime = new Date(
      startTime.getTime() + exam.duration * 60 * 1000
    );

    const now = new Date();

    return now >= startTime && now <= endTime;
  };

  if (startExam) {
    return (
      <AttendExam
        exam={startExam}
        onBack={() => setStartExam(null)}
      />
    );
  }

  // Only show exams that are currently running
  const availableExams = exams.filter((exam) =>
    isExamActive(exam)
  );

  return (
    <div className="available-exams-page">

      <div className="available-exams-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Available Exams</h1>

      </div>

      <div className="available-exams-list">

        {message && (
          <p>{message}</p>
        )}

        {!message && availableExams.length === 0 && (
          <p>
            No exams are currently available.
          </p>
        )}

        {!message &&
          availableExams.map((exam) => {

            const alreadySubmitted =
              isExamSubmitted(exam._id);

            return (
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
                  <strong>Start Time:</strong>{" "}
                  {new Date(
                    exam.startTime
                  ).toLocaleString()}
                </p>

                {alreadySubmitted ? (
                  <button
                    disabled
                    className="completed-button"
                  >
                    ✓ Exam Completed
                  </button>
                ) : (
                  <button
                    onClick={() => setStartExam(exam)}
                  >
                    Start Exam
                  </button>
                )}

              </div>
            );
          })}

      </div>

    </div>
  );
}

export default AvailableExams;