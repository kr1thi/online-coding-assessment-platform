import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  "https://online-coding-assessment-platform-production.up.railway.app";

const styles = {
  page: {
    padding: "40px",
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    fontFamily: "sans-serif",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#0a0f1e",
    borderRadius: "16px",
    padding: "25px",
    border: "1px solid #1e293b",
    overflowX: "auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "10px",
  },

  title: {
    margin: 0,
    color: "#38bdf8",
    fontSize: "2rem",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "16px",
    borderBottom: "2px solid #1e293b",
    color: "#94a3b8",
    textAlign: "left",
    fontSize: "0.9rem",
    background: "#111827",
  },

  td: {
    padding: "16px",
    borderBottom: "1px solid #1e293b",
    fontSize: "0.85rem",
    color: "#f8fafc",
  },

  row: {
    transition: "0.2s",
  },

  empty: {
    textAlign: "center",
    padding: "50px",
    color: "#94a3b8",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#020617",
    color: "#38bdf8",
    fontSize: "1.2rem",
  },

  tag: {
    background: "#1e293b",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "0.7rem",
    color: "#38bdf8",
    fontWeight: "bold",
  },

  language: {
    textTransform: "uppercase",
    fontWeight: "bold",
    color: "#e2e8f0",
  },

  badge: (statusType) => {
    let bg = "rgba(148, 163, 184, 0.1)";
    let color = "#94a3b8";

    if (statusType === "success") {
      bg = "rgba(16, 185, 129, 0.2)";
      color = "#10b981";
    } else if (statusType === "error") {
      bg = "rgba(239, 68, 68, 0.2)";
      color = "#ef4444";
    } else if (statusType === "warning") {
      bg = "rgba(245, 158, 11, 0.2)";
      color = "#f59e0b";
    }

    return {
      background: bg,
      color: color,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "bold",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    };
  },
};

function SubmissionList() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE_URL}/api/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      alert("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const getLogicType = (code) => {
    if (!code) return "Basics";

    const lowerCode = code.toLowerCase();

    if (
      lowerCode.includes("for") ||
      lowerCode.includes("while")
    ) {
      return "Loops";
    }

    if (
      lowerCode.includes("if") ||
      lowerCode.includes("else") ||
      lowerCode.includes("switch")
    ) {
      return "Conditions";
    }

    if (
      lowerCode.includes("scanner") ||
      lowerCode.includes("print")
    ) {
      return "I/O Basics";
    }

    return "Basics";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading submissions...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
      
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Submission History 📜
            </h1>

            <div style={styles.subtitle}>
              Real-time coding submission activity
            </div>
          </div>

          <div style={styles.tag}>
            Total: {submissions.length}
          </div>
        </div>

        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Problem</th>
              <th style={styles.th}>Logic Type</th>
              <th style={styles.th}>Language</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Submitted Time</th>
            </tr>
          </thead>

          <tbody>
            {submissions.length > 0 ? (
              submissions.map((sub) => {
                const rawStatus =
                  sub.status?.toLowerCase() || "";

                const isAccepted =
                  rawStatus === "accepted" ||
                  rawStatus === "success";

                const isWarning =
                  rawStatus.includes("wrong") ||
                  rawStatus.includes("limit");

                const isError =
                  rawStatus.includes("error") ||
                  rawStatus.includes("failed");

                let statusType = "success";

                if (isError) {
                  statusType = "error";
                } else if (isWarning) {
                  statusType = "warning";
                }

                const logicType = getLogicType(sub.code);

                return (
                  <tr
                    key={sub.id}
                    style={styles.row}
                  >
                    <td style={styles.td}>
                      #{sub.id}
                    </td>

                    <td style={styles.td}>
                      Problem ID:{" "}
                      {sub.problemId || "N/A"}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.tag}>
                        {logicType}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.language}>
                        {sub.language || "N/A"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={styles.badge(
                          statusType
                        )}
                      >
                        {isAccepted
                          ? "✅"
                          : isWarning
                          ? "⚠️"
                          : "❌"}

                        {sub.status || "Unknown"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {formatDate(sub.submittedAt)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={styles.empty}
                >
                  No submissions found 😔
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubmissionList;
