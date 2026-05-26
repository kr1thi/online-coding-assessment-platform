import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  "https://online-coding-assessment-platform-production.up.railway.app";

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const token = localStorage.getItem("token");

  // Fetch Assessment
  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/assessment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssessment(res.data);

      // Convert minutes -> seconds
      setTimeLeft((res.data.duration || 30) * 60);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      alert("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (loading || !assessment) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, assessment]);

  // Auto Submit
  const handleAutoSubmit = () => {
    alert("⏳ Time is up! Assessment submitted.");
    navigate("/student/dashboard");
  };

  // Manual Submit
  const handleSubmitAssessment = () => {
    alert("✅ Assessment Submitted Successfully!");
    navigate("/student/dashboard");
  };

  // Time Format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Loading State
  if (loading) {
    return (
      <div style={styles.message}>
        Loading assessment...
      </div>
    );
  }

  // Empty State
  if (
    !assessment ||
    !assessment.questions ||
    assessment.questions.length === 0
  ) {
    return (
      <div style={styles.message}>
        No questions available.
      </div>
    );
  }

  const currentQuestion =
    assessment.questions[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.layout}>
       
        <div style={styles.mainCard}>
          
          <div style={styles.header}>
            <div>
              <h2 style={styles.assessmentTitle}>
                {assessment.title}
              </h2>

              <p style={styles.questionCount}>
                Question {currentIndex + 1} of{" "}
                {assessment.questions.length}
              </p>
            </div>

            <div style={styles.timerBox}>
              ⏳ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <div style={styles.questionSection}>
            <h3 style={styles.questionTitle}>
              {currentQuestion.title}
            </h3>

            <p style={styles.questionDescription}>
              {currentQuestion.description}
            </p>

            {/* Constraints */}
            {currentQuestion.constraints && (
              <div style={styles.constraintBox}>
                <h4 style={styles.constraintTitle}>
                  Constraints
                </h4>

                <p style={styles.constraintText}>
                  {currentQuestion.constraints}
                </p>
              </div>
            )}

          
            {currentQuestion.sampleInput && (
              <div style={styles.sampleBox}>
                <h4 style={styles.sampleTitle}>
                  Sample Input
                </h4>

                <pre style={styles.sampleCode}>
                  {currentQuestion.sampleInput}
                </pre>
              </div>
            )}

          
            {currentQuestion.sampleOutput && (
              <div style={styles.sampleBox}>
                <h4 style={styles.sampleTitle}>
                  Sample Output
                </h4>

                <pre style={styles.sampleCode}>
                  {currentQuestion.sampleOutput}
                </pre>
              </div>
            )}
          </div>

          <div style={styles.editorArea}>
            <button
              style={styles.editorButton}
              onClick={() =>
                navigate(
                  `/editor/${currentQuestion.id}`
                )
              }
            >
              💻 Open Code Editor
            </button>
          </div>

        
          <div style={styles.footer}>
            <button
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex(currentIndex - 1)
              }
              style={{
                ...styles.navButton,
                opacity:
                  currentIndex === 0 ? 0.5 : 1,
                cursor:
                  currentIndex === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ← Previous
            </button>

            {currentIndex <
            assessment.questions.length - 1 ? (
              <button
                style={styles.nextButton}
                onClick={() =>
                  setCurrentIndex(currentIndex + 1)
                }
              >
                Next →
              </button>
            ) : (
              <button
                style={styles.submitButton}
                onClick={handleSubmitAssessment}
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PALETTE */}
        <div style={styles.palette}>
          <h3 style={styles.paletteTitle}>
            Questions
          </h3>

          <div style={styles.paletteGrid}>
            {assessment.questions.map(
              (question, index) => (
                <div
                  key={question.id || index}
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  style={{
                    ...styles.paletteItem,
                    background:
                      currentIndex === index
                        ? "#6366f1"
                        : "#1e293b",
                    color:
                      currentIndex === index
                        ? "#fff"
                        : "#94a3b8",
                    border:
                      currentIndex === index
                        ? "1px solid #818cf8"
                        : "1px solid #334155",
                  }}
                >
                  {index + 1}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "#020617",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "white",
    fontFamily: "sans-serif",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 260px",
    gap: "25px",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  mainCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "30px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "20px",
  },

  assessmentTitle: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#38bdf8",
  },

  questionCount: {
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },

  timerBox: {
    background: "#1e293b",
    color: "#fbbf24",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "1rem",
  },

  questionSection: {
    marginBottom: "30px",
  },

  questionTitle: {
    fontSize: "1.4rem",
    marginBottom: "15px",
    color: "#f8fafc",
  },

  questionDescription: {
    lineHeight: "1.8",
    color: "#cbd5e1",
    fontSize: "1rem",
  },

  constraintBox: {
    marginTop: "25px",
    background: "#111827",
    padding: "18px",
    borderRadius: "12px",
    borderLeft: "4px solid #38bdf8",
  },

  constraintTitle: {
    margin: 0,
    color: "#38bdf8",
    marginBottom: "10px",
  },

  constraintText: {
    margin: 0,
    color: "#e2e8f0",
  },

  sampleBox: {
    marginTop: "20px",
    background: "#111827",
    padding: "18px",
    borderRadius: "12px",
  },

  sampleTitle: {
    marginBottom: "10px",
    color: "#a78bfa",
  },

  sampleCode: {
    margin: 0,
    color: "#f8fafc",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
  },

  editorArea: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },

  editorButton: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #1e293b",
    paddingTop: "25px",
  },

  navButton: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    padding: "12px 20px",
    borderRadius: "8px",
  },

  nextButton: {
    background: "#334155",
    border: "none",
    color: "white",
    padding: "12px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  submitButton: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "12px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  palette: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "20px",
    height: "fit-content",
    position: "sticky",
    top: "20px",
  },

  paletteTitle: {
    marginBottom: "20px",
    color: "#94a3b8",
  },

  paletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },

  paletteItem: {
    height: "45px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },

  message: {
    background: "#020617",
    color: "#38bdf8",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.2rem",
  },
};

export default TakeAssessment;
