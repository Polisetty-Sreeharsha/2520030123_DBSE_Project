import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./AttendExam.css";

function AttendExam({ exam, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(
    (exam?.duration || 60) * 60
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // --------------------------------------------------
  // Camera
  // --------------------------------------------------

  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Camera availability during exam
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [cameraStatusMessage, setCameraStatusMessage] = useState("");

  // AI Proctoring
  const [modelLoading, setModelLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState(
    "AI monitoring not started"
  );

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Prevent repeated logs
  const lastPhoneLogRef = useRef(0);
  const lastNoPersonLogRef = useRef(0);
  const lastMultiplePersonLogRef = useRef(0);

  const lastTabSwitchLogRef = useRef(0);
  const lastFullscreenExitLogRef = useRef(0);

  // Camera monitoring
  const cameraRecoveryInProgressRef = useRef(false);
  const blackFrameCountRef = useRef(0);

  // --------------------------------------------------
  // Fetch Questions
  // --------------------------------------------------

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/questions/exam/${exam._id}`
        );

        const data = await response.json();

        if (response.ok) {
          setQuestions(data);
        } else {
          setMessage("Failed to load questions.");
        }
      } catch (error) {
        console.error("Fetch questions error:", error);
        setMessage("Cannot connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [exam._id]);

  // --------------------------------------------------
  // Log Proctoring Event
  // --------------------------------------------------

  const logProctoringEvent = async (event) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        return;
      }

      await fetch(
        "http://localhost:5000/api/proctoring/log",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            examId: exam._id,
            studentId: user.id,
            event,
          }),
        }
      );

      console.log("Proctoring event:", event);
    } catch (error) {
      console.error(
        "Proctoring log error:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Check Whether Camera Is Actually Usable
  // --------------------------------------------------

  const isCameraUsable = () => {
    const stream = streamRef.current;
    const video = videoRef.current;

    if (!stream || !video) {
      return false;
    }

    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length === 0) {
      return false;
    }

    const track = videoTracks[0];

    if (track.readyState !== "live") {
      return false;
    }

    if (track.muted) {
      return false;
    }

    if (video.readyState < 2) {
      return false;
    }

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Pause Exam Because Camera Is Unavailable
  // --------------------------------------------------

  const pauseExamForCamera = () => {
    if (
      submitted ||
      isSubmittingRef.current
    ) {
      return;
    }

    setCameraUnavailable(true);

    setCameraStatusMessage(
      "Camera unavailable. Your exam is paused. Please enable/open your camera to continue."
    );

    setDetectionStatus(
      "⚠ Camera unavailable - Exam paused"
    );

    console.log(
      "Camera unavailable - exam paused"
    );
  };

  // --------------------------------------------------
  // Resume Exam When Camera Returns
  // --------------------------------------------------

  const resumeExamAfterCameraRecovery = () => {
    if (
      submitted ||
      isSubmittingRef.current
    ) {
      return;
    }

    setCameraUnavailable(false);
    setCameraStatusMessage("");

    setDetectionStatus(
      "✓ Camera restored - Monitoring active"
    );

    console.log(
      "Camera restored - exam resumed"
    );
  };

  // --------------------------------------------------
  // Try To Recover Camera
  // --------------------------------------------------

  const recoverCamera = async () => {
    if (
      cameraRecoveryInProgressRef.current ||
      submitted ||
      isSubmittingRef.current
    ) {
      return;
    }

    cameraRecoveryInProgressRef.current = true;

    try {
      const oldStream = streamRef.current;

      if (oldStream) {
        oldStream
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch (error) {
              console.log(
                "Old camera track stop error:",
                error
              );
            }
          });
      }

      const newStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;

        try {
          await videoRef.current.play();
        } catch (error) {
          console.log(
            "Video play error:",
            error
          );
        }
      }

      blackFrameCountRef.current = 0;

      console.log(
        "Camera stream recovered successfully"
      );
    } catch (error) {
      console.log(
        "Camera recovery waiting for camera:",
        error
      );
    } finally {
      cameraRecoveryInProgressRef.current = false;
    }
  };

  // --------------------------------------------------
  // Start Camera
  // --------------------------------------------------

  const startCamera = async () => {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Your browser does not support camera access."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      const videoTracks = stream.getVideoTracks();

      if (videoTracks.length === 0) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        setCameraError(
          "No camera was detected. A working camera is required to start the exam."
        );

        return;
      }

      const videoTrack = videoTracks[0];

      if (videoTrack.readyState !== "live") {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        setCameraError(
          "The camera is not available. Please open or enable your camera and try again."
        );

        return;
      }

      streamRef.current = stream;

      // Start exam interface
      setCameraStarted(true);

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.log(
          "Fullscreen request failed:",
          error
        );
      }
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Camera access is required to start the exam. Please allow camera permission and try again."
      );
    }
  };

  // --------------------------------------------------
  // Attach Camera Stream To Video
  // --------------------------------------------------

  useEffect(() => {
    if (
      cameraStarted &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((error) => {
          console.log(
            "Camera video play error:",
            error
          );
        });
    }
  }, [cameraStarted]);

  // --------------------------------------------------
  // Monitor Camera Availability
  // --------------------------------------------------

  useEffect(() => {
    if (!cameraStarted || submitted) {
      return;
    }

    let healthInterval;

    const checkCamera = () => {
      if (submitted || isSubmittingRef.current) {
        return;
      }

      const stream = streamRef.current;
      const video = videoRef.current;

      if (!stream || !video) {
        pauseExamForCamera();
        return;
      }

      const videoTracks =
        stream.getVideoTracks();

      if (videoTracks.length === 0) {
        pauseExamForCamera();
        return;
      }

      const track = videoTracks[0];

      // Camera physically disconnected / camera disabled
      if (track.readyState === "ended") {
        pauseExamForCamera();

        // Try to recover automatically
        recoverCamera();

        return;
      }

      // Camera temporarily muted/unavailable
      if (track.muted) {
        pauseExamForCamera();
        return;
      }

      // Video element is not receiving usable frames
      if (
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        pauseExamForCamera();
        return;
      }

      // ------------------------------------------------
      // Detect a completely black camera frame.
      // This helps detect some physical webcam shutters/lids.
      // ------------------------------------------------

      try {
        const canvas =
          document.createElement("canvas");

        canvas.width = 20;
        canvas.height = 20;

        const context =
          canvas.getContext("2d", {
            willReadFrequently: true,
          });

        if (context) {
          context.drawImage(
            video,
            0,
            0,
            20,
            20
          );

          const frameData =
            context.getImageData(
              0,
              0,
              20,
              20
            ).data;

          let totalBrightness = 0;

          for (
            let i = 0;
            i < frameData.length;
            i += 4
          ) {
            const red = frameData[i];
            const green =
              frameData[i + 1];
            const blue =
              frameData[i + 2];

            totalBrightness +=
              (red + green + blue) / 3;
          }

          const averageBrightness =
            totalBrightness /
            (frameData.length / 4);

          if (averageBrightness < 3) {
            blackFrameCountRef.current += 1;
          } else {
            blackFrameCountRef.current = 0;
          }

          // Require several consecutive black frames
          // before pausing the exam.
          if (
            blackFrameCountRef.current >= 4
          ) {
            pauseExamForCamera();
            return;
          }
        }
      } catch (error) {
        console.log(
          "Camera frame check skipped:",
          error
        );
      }

      // Camera is working again
      if (isCameraUsable()) {
        blackFrameCountRef.current = 0;

        if (cameraUnavailable) {
          resumeExamAfterCameraRecovery();
        }
      }
    };

    // Check frequently
    healthInterval = setInterval(
      checkCamera,
      700
    );

    // Check immediately
    checkCamera();

    return () => {
      clearInterval(healthInterval);
    };
  }, [
    cameraStarted,
    submitted,
    cameraUnavailable,
  ]);

  // --------------------------------------------------
  // Camera Track Events
  // --------------------------------------------------

  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const videoTracks =
      stream.getVideoTracks();

    if (videoTracks.length === 0) {
      return;
    }

    const track = videoTracks[0];

    const handleCameraEnded = () => {
      pauseExamForCamera();
      recoverCamera();
    };

    const handleCameraMuted = () => {
      pauseExamForCamera();
    };

    const handleCameraUnmuted = () => {
      setTimeout(() => {
        if (isCameraUsable()) {
          resumeExamAfterCameraRecovery();
        }
      }, 300);
    };

    track.addEventListener(
      "ended",
      handleCameraEnded
    );

    track.addEventListener(
      "mute",
      handleCameraMuted
    );

    track.addEventListener(
      "unmute",
      handleCameraUnmuted
    );

    return () => {
      track.removeEventListener(
        "ended",
        handleCameraEnded
      );

      track.removeEventListener(
        "mute",
        handleCameraMuted
      );

      track.removeEventListener(
        "unmute",
        handleCameraUnmuted
      );
    };
  }, [cameraStarted]);

  // --------------------------------------------------
  // Load AI Model
  // --------------------------------------------------

  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    const loadModel = async () => {
      try {
        setModelLoading(true);
        setDetectionStatus(
          "Loading AI model..."
        );

        const model =
          await cocoSsd.load();

        modelRef.current = model;

        setModelLoading(false);
        setDetectionStatus(
          "AI monitoring active"
        );

        console.log(
          "COCO-SSD model loaded successfully"
        );
      } catch (error) {
        console.error(
          "AI model loading error:",
          error
        );

        setModelLoading(false);

        setDetectionStatus(
          "AI monitoring unavailable"
        );
      }
    };

    loadModel();
  }, [cameraStarted]);

  // --------------------------------------------------
  // AI Object Detection
  // --------------------------------------------------

  useEffect(() => {
    if (
      !cameraStarted ||
      submitted
    ) {
      return;
    }

    let detectionInterval;

    const startDetection = () => {
      if (!modelRef.current) {
        console.log(
          "Waiting for AI model..."
        );
        return;
      }

      detectionInterval = setInterval(
        async () => {
          if (
            !videoRef.current ||
            !modelRef.current ||
            videoRef.current.readyState < 2 ||
            cameraUnavailable
          ) {
            return;
          }

          try {
            const predictions =
              await modelRef.current.detect(
                videoRef.current,
                20,
                0.55
              );

            const persons =
              predictions.filter(
                (prediction) =>
                  prediction.class ===
                    "person" &&
                  prediction.score >= 0.55
              );

            const phones =
              predictions.filter(
                (prediction) =>
                  prediction.class ===
                    "cell phone" &&
                  prediction.score >= 0.55
              );

            if (phones.length > 0) {
              setDetectionStatus(
                "⚠ Mobile phone detected"
              );

              const now = Date.now();

              if (
                now -
                  lastPhoneLogRef.current >
                10000
              ) {
                lastPhoneLogRef.current =
                  now;

                await logProctoringEvent(
                  "Mobile phone detected"
                );
              }
            } else if (
              persons.length === 0
            ) {
              setDetectionStatus(
                "⚠ No person detected"
              );

              const now = Date.now();

              if (
                now -
                  lastNoPersonLogRef.current >
                15000
              ) {
                lastNoPersonLogRef.current =
                  now;

                await logProctoringEvent(
                  "No person detected"
                );
              }
            } else if (
              persons.length > 1
            ) {
              setDetectionStatus(
                "⚠ Multiple people detected"
              );

              const now = Date.now();

              if (
                now -
                  lastMultiplePersonLogRef.current >
                15000
              ) {
                lastMultiplePersonLogRef.current =
                  now;

                await logProctoringEvent(
                  "Multiple people detected"
                );
              }
            } else {
              setDetectionStatus(
                "✓ Student detected - Monitoring"
              );
            }

            console.log(
              "Detected:",
              predictions
            );
          } catch (error) {
            console.error(
              "Object detection error:",
              error
            );
          }
        },
        2000
      );
    };

    const modelCheck =
      setInterval(() => {
        if (modelRef.current) {
          clearInterval(modelCheck);
          startDetection();
        }
      }, 500);

    return () => {
      clearInterval(modelCheck);

      if (detectionInterval) {
        clearInterval(
          detectionInterval
        );
      }
    };
  }, [
    cameraStarted,
    submitted,
    cameraUnavailable,
  ]);

  // --------------------------------------------------
  // Detect Tab Switch
  // --------------------------------------------------

  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    const handleVisibilityChange =
      () => {
        if (document.hidden) {
          const now = Date.now();

          if (
            now -
              lastTabSwitchLogRef.current >
            5000
          ) {
            logProctoringEvent(
              "Tab switched or exam window left"
            );

            lastTabSwitchLogRef.current =
              now;
          }

          setDetectionStatus(
            "⚠ Tab switch detected"
          );
        } else {
          if (!cameraUnavailable) {
            setDetectionStatus(
              "Monitoring active"
            );
          }
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    cameraStarted,
    cameraUnavailable,
  ]);

  // --------------------------------------------------
  // Detect Fullscreen Exit
  // --------------------------------------------------

  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    const handleFullscreenChange =
      () => {
        if (
          !document.fullscreenElement &&
          !isSubmittingRef.current
        ) {
          const now = Date.now();

          if (
            now -
              lastFullscreenExitLogRef.current >
            5000
          ) {
            logProctoringEvent(
              "Exited fullscreen mode"
            );

            lastFullscreenExitLogRef.current =
              now;
          }

          if (!cameraUnavailable) {
            setDetectionStatus(
              "⚠ Fullscreen exit detected"
            );
          }
        } else {
          if (!cameraUnavailable) {
            setDetectionStatus(
              "Monitoring active"
            );
          }
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [
    cameraStarted,
    cameraUnavailable,
  ]);

  // --------------------------------------------------
  // Stop Camera
  // --------------------------------------------------

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.log(
              "Camera track stop error:",
              error
            );
          }
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch(() => {});
    }
  };

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      stopCamera();

      if (modelRef.current) {
        if (
          typeof modelRef.current.dispose ===
          "function"
        ) {
          modelRef.current.dispose();
        }

        modelRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // Timer
  // --------------------------------------------------

  useEffect(() => {
    if (
      loading ||
      questions.length === 0 ||
      submitted ||
      cameraUnavailable
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previousTime) => {
          if (previousTime <= 1) {
            clearInterval(timer);
            return 0;
          }

          return previousTime - 1;
        }
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [
    loading,
    questions.length,
    submitted,
    cameraUnavailable,
  ]);

  // --------------------------------------------------
  // Format Time
  // --------------------------------------------------

  const formatTime = () => {
    const minutes = Math.floor(
      timeLeft / 60
    );

    const seconds =
      timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // Select Answer
  // --------------------------------------------------

  const handleAnswer = (answer) => {
    if (cameraUnavailable) {
      return;
    }

    setSelectedAnswer(answer);

    setAnswers({
      ...answers,
      [questions[currentQuestion]._id]:
        answer,
    });
  };

  // --------------------------------------------------
  // Next Question
  // --------------------------------------------------

  const nextQuestion = () => {
    if (cameraUnavailable) {
      return;
    }

    if (
      currentQuestion <
      questions.length - 1
    ) {
      const nextIndex =
        currentQuestion + 1;

      setCurrentQuestion(nextIndex);

      setSelectedAnswer(
        answers[
          questions[nextIndex]._id
        ] || ""
      );
    }
  };

  // --------------------------------------------------
  // Previous Question
  // --------------------------------------------------

  const previousQuestion = () => {
    if (cameraUnavailable) {
      return;
    }

    if (currentQuestion > 0) {
      const previousIndex =
        currentQuestion - 1;

      setCurrentQuestion(
        previousIndex
      );

      setSelectedAnswer(
        answers[
          questions[previousIndex]._id
        ] || ""
      );
    }
  };

  // --------------------------------------------------
  // Submit Exam
  // --------------------------------------------------

  const submitExam = async () => {
    // Never allow submission without camera
    if (cameraUnavailable) {
      setCameraStatusMessage(
        "Camera is unavailable. Please enable your camera before submitting the exam."
      );

      return;
    }

    isSubmittingRef.current = true;

    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setMessage(
          "Please login again."
        );

        isSubmittingRef.current = false;
        return;
      }

      // Final camera check before submission
      if (!isCameraUsable()) {
        setCameraUnavailable(true);

        setCameraStatusMessage(
          "Camera became unavailable. The exam has been paused."
        );

        setDetectionStatus(
          "⚠ Camera unavailable - Exam paused"
        );

        isSubmittingRef.current = false;
        return;
      }

      const formattedAnswers =
        questions.map((question) => ({
          questionId: question._id,
          answer:
            answers[question._id] || "",
        }));

      const response = await fetch(
        "http://localhost:5000/api/submissions/submit",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            examId: exam._id,
            studentId: user.id,
            answers: formattedAnswers,
          }),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setScore(data.score);
        setSubmitted(true);

        stopCamera();
      } else {
        setMessage(
          data.message ||
            "Failed to submit exam."
        );

        isSubmittingRef.current = false;
      }
    } catch (error) {
      console.error(
        "Submit exam error:",
        error
      );

      setMessage(
        "Cannot connect to the backend."
      );

      isSubmittingRef.current = false;
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="attend-exam-page">
        <h2>Loading exam...</h2>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (message) {
    return (
      <div className="attend-exam-page">
        <h2>{message}</h2>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // No Questions
  // --------------------------------------------------

  if (questions.length === 0) {
    return (
      <div className="attend-exam-page">
        <h2>
          No questions available for this
          exam.
        </h2>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Camera Permission Screen
  // --------------------------------------------------

  if (!cameraStarted) {
    return (
      <div className="attend-exam-page">
        <div className="question-card camera-card">
          <h1>
            Camera Verification
          </h1>

          <p>
            Camera access is required to
            attend this examination.
          </p>

          <p>
            Please allow camera permission
            when your browser asks for it.
          </p>

          <div className="camera-preview-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
          </div>

          {cameraError && (
            <p className="camera-error">
              {cameraError}
            </p>
          )}

          <button
            className="submit-button"
            onClick={startCamera}
          >
            Allow Camera & Start Exam
          </button>

          <br />

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Result Screen
  // --------------------------------------------------

  if (submitted) {
    return (
      <div className="attend-exam-page">
        <div className="question-card result-card">
          <h1>
            Exam Submitted Successfully!
          </h1>

          <h2>
            Your Score: {score} /{" "}
            {questions.length}
          </h2>

          <button
            className="submit-button"
            onClick={onBack}
          >
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  const question =
    questions[currentQuestion];

  // --------------------------------------------------
  // Exam Screen
  // --------------------------------------------------

  return (
    <div className="attend-exam-page">
      <div className="exam-header">
        <div>
          <h1>{exam.title}</h1>
          <p>Online Examination</p>
        </div>

        <div className="timer">
          ⏱ {formatTime()}
        </div>
      </div>

      {/* Camera */}
      <div className="exam-camera">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />

        <span>
          ●{" "}
          {cameraUnavailable
            ? "Camera Unavailable"
            : "Camera Active"}
        </span>

        <div className="ai-status">
          {modelLoading
            ? "Loading AI..."
            : detectionStatus}
        </div>
      </div>

      <div className="exam-container">
        <div className="question-card">
          <h2>
            Question{" "}
            {currentQuestion + 1} of{" "}
            {questions.length}
          </h2>

          <h3>{question.question}</h3>

          {/* Question Image */}
          {question.image && (
            <div className="exam-question-image-container">
              <img
                src={`http://localhost:5000${question.image}`}
                alt="Question"
                className="exam-question-image"
              />
            </div>
          )}

          <div className="options">
            {question.options.map(
              (option, index) => (
                <label
                  className="option"
                  key={index}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={
                      selectedAnswer ===
                      option
                    }
                    disabled={
                      cameraUnavailable
                    }
                    onChange={() =>
                      handleAnswer(
                        option
                      )
                    }
                  />

                  {option}
                </label>
              )
            )}
          </div>

          <div className="exam-buttons">
            <button
              onClick={
                previousQuestion
              }
              disabled={
                currentQuestion === 0 ||
                cameraUnavailable
              }
            >
              ← Previous
            </button>

            {currentQuestion ===
            questions.length - 1 ? (
              <button
                className="submit-button"
                onClick={submitExam}
                disabled={
                  cameraUnavailable
                }
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={
                  cameraUnavailable
                }
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          CAMERA UNAVAILABLE OVERLAY
      -------------------------------------------------- */}

      {cameraUnavailable && (
        <div className="camera-block-overlay">
          <div className="camera-block-card">
            <div className="camera-block-icon">
              📷
            </div>

            <h2>
              Camera Unavailable
            </h2>

            <p>
              Your exam has been paused
              because the camera is
              unavailable.
            </p>

            <p>
              Please open or enable your
              camera.
            </p>

            <div className="camera-waiting">
              ⏳ Waiting for camera...
            </div>

            <small>
              The exam will automatically
              continue when the camera is
              available again.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendExam;