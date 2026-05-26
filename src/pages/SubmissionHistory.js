import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  "https://online-coding-assessment-platform-production.up.railway.app";

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE_URL}/api/problems/submissions/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
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
      <div style={styles.loaderContainer}>
        <h2 style={{ color: "#38bdf8" }}>Loading Submissions...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Submission History 📜</h1>

        <div style={styles.countBadge}>
          Total: {submissions.length}
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>No submissions found 😔</h2>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Submission ID</th>
                <th style={styles.th}>Problem ID</th>
                <th style={styles.th}>Language</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Submitted Time</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} style={styles.tr}>
                  <td style={styles.td}>#{sub.id}</td>

                  <td style={styles.td}>
                    {sub.problemId || "N/A"}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {sub.language}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      color:
                        sub.status?.toLowerCase() === "accepted"
                          ? "#22c55e"
                          : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    {sub.status || "Pending"}
                  </td>

                  <td style={styles.td}>
                    {formatDate(sub.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },

  loaderContainer: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },

  title: {
    margin: 0,
    color: "#38bdf8",
    fontSize: "2rem",
  },

  countBadge: {
    background: "#1e293b",
    padding: "8px 16px",
    borderRadius: "10px",
    color: "#94a3b8",
    border: "1px solid #334155",
  },

  emptyBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "60px 20px",
    textAlign: "center",
    color: "#94a3b8",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#0f172a",
    borderRadius: "16px",
    border: "1px solid #1e293b",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeadRow: {
    background: "#111827",
  },

  th: {
    padding: "16px",
    textAlign: "left",
    color: "#94a3b8",
    fontSize: "14px",
    borderBottom: "1px solid #334155",
  },

  tr: {
    borderBottom: "1px solid #1e293b",
  },

  td: {
    padding: "16px",
    color: "#f8fafc",
    fontSize: "14px",
  },
};

export default SubmissionHistory;
