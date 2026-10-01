import { useEffect, useRef, useState } from "react";
import "./ManageQuestions.css";

function ManageQuestions({ onBack }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const [questionData, setQuestionData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
  });

  const [questionImage, setQuestionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const imageInputRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  // Get exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/exams"
        );

        const data = await response.json();

        if (response.ok) {
          setExams(data);
        } else {
          setMessage("Failed to load exams.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Cannot connect to the backend.");
      }
    };

    fetchExams();
  }, []);

  // Get questions when exam is selected
  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExam(examId);
    setQuestions([]);
    setMessage("");

    if (!examId) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/questions/exam/${examId}`
      );

      const data = await response.json();

      if (response.ok) {
        setQuestions(data);
      } else {
        setMessage("Failed to load questions.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the backend.");
    }
  };

  // Handle text input
  const handleChange = (e) => {
    setQuestionData({
      ...questionData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setQuestionImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setQuestionImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove selected image
  const removeImage = () => {
    setQuestionImage(null);
    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Add question
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExam) {
      setMessage("Please select an exam first.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("examId", selectedExam);
      formData.append("question", questionData.question);

      formData.append(
        "options",
        JSON.stringify([
          questionData.optionA,
          questionData.optionB,
          questionData.optionC,
          questionData.optionD,
        ])
      );

      formData.append(
        "correctAnswer",
        questionData.correctAnswer
      );

      if (questionImage) {
        formData.append("image", questionImage);
      }

      const response = await fetch(
        "http://localhost:5000/api/questions/create",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Question added successfully!");

        setQuestionData({
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
        });

        setQuestionImage(null);
        setImagePreview("");

        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }

        // Refresh questions
        const questionsResponse = await fetch(
          `http://localhost:5000/api/questions/exam/${selectedExam}`
        );

        const questionsData =
          await questionsResponse.json();

        if (questionsResponse.ok) {
          setQuestions(questionsData);
        }
      } else {
        setMessage(
          data.message || "Failed to add question."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the backend.");
    }
  };

  return (
    <div className="manage-questions-page">

      <div className="manage-questions-header">

        <button
          onClick={onBack}
          className="back-button"
        >
          ← Back
        </button>

        <h1>Manage Questions</h1>

      </div>

      <div className="manage-questions-container">

        {/* SELECT EXAM */}
        <div className="question-card">

          <h2>Select Exam</h2>

          <select
            value={selectedExam}
            onChange={handleExamChange}
          >
            <option value="">
              -- Select an Exam --
            </option>

            {exams.map((exam) => (
              <option
                key={exam._id}
                value={exam._id}
              >
                {exam.title}
              </option>
            ))}
          </select>

        </div>

        {/* ADD QUESTION */}
        {selectedExam && (
          <div className="question-card">

            <h2>Add Question</h2>

            <form onSubmit={handleSubmit}>

              {/* QUESTION */}
              <label>Question</label>

              <textarea
                name="question"
                placeholder="Enter the question"
                value={questionData.question}
                onChange={handleChange}
                required
              />

              {/* QUESTION IMAGE */}
              <label>Question Image (Optional)</label>

              <div className="image-upload-box">

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <p>
                  Optional: Upload an image related to the
                  question.
                </p>

                <small>
                  Maximum size: 5 MB
                </small>

              </div>

              {/* IMAGE PREVIEW */}
              {imagePreview && (
                <div className="image-preview-container">

                  <img
                    src={imagePreview}
                    alt="Question preview"
                    className="question-image-preview"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-button"
                  >
                    Remove Image
                  </button>

                </div>
              )}

              {/* OPTIONS */}
              <div className="options-section">

                <h3>Options</h3>

                <div className="option-field">
                  <span className="option-label">A</span>

                  <input
                    type="text"
                    name="optionA"
                    placeholder="Enter option A"
                    value={questionData.optionA}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="option-field">
                  <span className="option-label">B</span>

                  <input
                    type="text"
                    name="optionB"
                    placeholder="Enter option B"
                    value={questionData.optionB}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="option-field">
                  <span className="option-label">C</span>

                  <input
                    type="text"
                    name="optionC"
                    placeholder="Enter option C"
                    value={questionData.optionC}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="option-field">
                  <span className="option-label">D</span>

                  <input
                    type="text"
                    name="optionD"
                    placeholder="Enter option D"
                    value={questionData.optionD}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              {/* CORRECT ANSWER */}
              <label>Correct Answer</label>

              <select
                name="correctAnswer"
                value={questionData.correctAnswer}
                onChange={handleChange}
                required
              >
                <option value="">
                  -- Select Correct Answer --
                </option>

                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>

              <button
                type="submit"
                className="add-question-button"
              >
                Add Question
              </button>

            </form>

          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <p className="question-message">
            {message}
          </p>
        )}

        {/* EXISTING QUESTIONS */}
        {selectedExam && (
          <div className="question-card">

            <h2>
              Questions Added ({questions.length})
            </h2>

            {questions.length === 0 ? (
              <p>No questions added yet.</p>
            ) : (
              questions.map((item, index) => (
                <div
                  className="existing-question"
                  key={item._id}
                >

                  <h3>
                    {index + 1}. {item.question}
                  </h3>

                  {/* EXISTING QUESTION IMAGE */}
                  {item.image && (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt="Question"
                      className="existing-question-image"
                    />
                  )}

                  <div className="existing-options">

                    <p>
                      A. {item.options[0]}
                    </p>

                    <p>
                      B. {item.options[1]}
                    </p>

                    <p>
                      C. {item.options[2]}
                    </p>

                    <p>
                      D. {item.options[3]}
                    </p>

                  </div>

                  <strong>
                    Correct Answer: {item.correctAnswer}
                  </strong>

                </div>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default ManageQuestions;