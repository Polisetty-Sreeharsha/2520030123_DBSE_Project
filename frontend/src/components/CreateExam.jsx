import { useEffect, useState } from "react";
import "./CreateExam.css";

function CreateExam({ onBack }) {
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: "",
    startTime: "",
  });

  const [minDateTime, setMinDateTime] = useState("");
  const [message, setMessage] = useState("");

  // Set the minimum allowed date/time to the current time
  useEffect(() => {
    const updateMinDateTime = () => {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      setMinDateTime(
        `${year}-${month}-${day}T${hours}:${minutes}`
      );
    };

    updateMinDateTime();

    // Keep the minimum time updated while the page is open
    const interval = setInterval(
      updateMinDateTime,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setExam({
      ...exam,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Check exam start time
    if (!exam.startTime) {
      setMessage("Please select the exam date and start time.");
      return;
    }

    const selectedStartTime = new Date(
      exam.startTime
    );

    const currentTime = new Date();

    // Exam must be in the future
    if (selectedStartTime <= currentTime) {
      setMessage(
        "Exam date and start time must be in the future."
      );
      return;
    }

    try {
      // Get logged-in faculty from localStorage
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/exams/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: exam.title,
            description: exam.description,
            duration: Number(exam.duration),
            startTime: exam.startTime,
            createdBy: user.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Exam created successfully!");

        setExam({
          title: "",
          description: "",
          duration: "",
          startTime: "",
        });
      } else {
        setMessage(
          data.message || "Failed to create exam."
        );
      }
    } catch (error) {
      console.error("Create exam error:", error);

      setMessage(
        "Cannot connect to the backend."
      );
    }
  };

  return (
    <div className="create-exam-page">

      <div className="create-exam-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Create New Exam</h1>

      </div>

      <div className="create-exam-card">

        <form onSubmit={handleSubmit}>

          <label>Exam Title</label>

          <input
            type="text"
            name="title"
            placeholder="Enter exam title"
            value={exam.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            placeholder="Enter exam description"
            value={exam.description}
            onChange={handleChange}
            rows="4"
          />

          <label>Duration (minutes)</label>

          <input
            type="number"
            name="duration"
            placeholder="Example: 60"
            value={exam.duration}
            onChange={handleChange}
            min="1"
            required
          />

          <label>Exam Date & Start Time</label>

          <input
            type="datetime-local"
            name="startTime"
            value={exam.startTime}
            onChange={handleChange}
            min={minDateTime}
            required
          />

          <button
            type="submit"
            className="create-button"
          >
            Create Exam
          </button>

        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default CreateExam;