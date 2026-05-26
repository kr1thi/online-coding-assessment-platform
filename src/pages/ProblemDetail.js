import React, { useState } from 'react';

const BASE_URL =
  "https://online-coding-assessment-platform-production.up.railway.app";

function ProblemDetail({ problem }) {
  const [userCode, setUserCode] = useState("");
  const [selectedLang, setSelectedLang] = useState("java");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // default starter templates
  const templates = {
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your code here

    }
}`,

    cpp: `#include <iostream>
using namespace std;

int main() {

    // Write your code here

    return 0;
}`,

    python: `# Write your Python code here

def solve():
    pass

solve()
`
  };

  // Auto set template when language changes
  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);

    if (!userCode.trim()) {
      setUserCode(templates[lang]);
    }
  };

  // Loading state
  if (!problem) {
    return <div style={loadingStyle}>Loading problem details...</div>;
  }

  // Submit Code
  const handleSubmitCode = async () => {
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("userId");
    const uName = localStorage.getItem("userName");

    if (!userCode.trim()) {
      alert("Please write code before submitting.");
      return;
    }

    const submissionData = {
      code: userCode,
      language: selectedLang,
      problemId: problem.id,
      userId: uId ? parseInt(uId) : null,
      userName: uName
    };

    console.log("Submitting:", submissionData);

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/submissions/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(submissionData)
        }
      );

      const data = await response.json();

      console.log("Response:", data);

      if (response.ok) {
        alert(`✅ Submitted Successfully as ${uName}!`);
      } else {
        alert(data.message || "❌ Submission failed.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("❌ Backend connection error!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={mainLayout}>
      {/* LEFT SIDE - Problem Description */}
      <div style={descriptionContainer}>
        <div style={headerStyle}>
          <h2 style={{ color: "#3b82f6", margin: 0 }}>
            {problem.challengeName}
          </h2>

          <span style={difficultyBadge(problem.difficultyLevel)}>
            {problem.difficultyLevel}
          </span>
        </div>

        <div style={scrollContent}>
          <h4 style={sectionTitle}>Problem Statement</h4>
          <p style={textStyle}>
            {problem.problemStatement || "No statement available"}
          </p>

          <h4 style={sectionTitle}>Constraints</h4>
          <pre style={codeBlock}>
            {problem.constraints || "No constraints"}
          </pre>

          <h4 style={sectionTitle}>Sample Input</h4>
          <pre style={codeBlock}>
            {problem.sampleInput || "No sample input"}
          </pre>

          <h4 style={sectionTitle}>Sample Output</h4>
          <pre style={codeBlock}>
            {problem.sampleOutput || "No sample output"}
          </pre>
        </div>
      </div>

      {/* RIGHT SIDE - Code Editor */}
      <div style={editorContainer}>
        <div style={editorHeader}>
          <span style={{ color: "#94a3b8" }}>Language:</span>

          <select
            value={selectedLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={selectStyle}
          >
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
        </div>

        <textarea
          rows="20"
          style={textareaStyle}
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          placeholder={`Write your ${selectedLang} code here...`}
        />

        <button
          onClick={handleSubmitCode}
          disabled={isSubmitting}
          style={submitBtnStyle(isSubmitting)}
        >
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </button>
      </div>
    </div>
  );
}


const mainLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: "20px",
  minHeight: "100vh",
  padding: "20px",
  background: "#0f172a"
};

const descriptionContainer = {
  background: "#1e293b",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
};

const scrollContent = {
  overflowY: "auto",
  maxHeight: "75vh",
  paddingRight: "10px",
  marginTop: "15px"
};

const editorContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const textareaStyle = {
  flexGrow: 1,
  width: "100%",
  minHeight: "75vh",
  background: "#020617",
  color: "#10b981",
  padding: "15px",
  fontFamily: "monospace",
  fontSize: "14px",
  border: "1px solid #334155",
  borderRadius: "8px",
  outline: "none",
  resize: "none"
};

const codeBlock = {
  background: "#0f172a",
  padding: "12px",
  borderRadius: "6px",
  color: "#cbd5e1",
  fontSize: "13px",
  whiteSpace: "pre-wrap",
  overflowX: "auto"
};

const sectionTitle = {
  color: "#94a3b8",
  borderBottom: "1px solid #334155",
  paddingBottom: "5px",
  marginTop: "20px"
};

const textStyle = {
  color: "#f1f5f9",
  lineHeight: "1.7"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const editorHeader = {
  display: "flex",
  gap: "10px",
  alignItems: "center"
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  background: "#334155",
  color: "white",
  border: "1px solid #475569",
  outline: "none"
};

const loadingStyle = {
  color: "white",
  textAlign: "center",
  marginTop: "50px",
  fontSize: "20px"
};

const difficultyBadge = (lvl) => ({
  padding: "5px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "bold",
  background:
    lvl === "Easy"
      ? "#065f46"
      : lvl === "Medium"
      ? "#92400e"
      : "#7f1d1d",
  color: "white"
});

const submitBtnStyle = (loading) => ({
  padding: "14px",
  background: loading ? "#475569" : "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: loading ? "not-allowed" : "pointer",
  transition: "0.3s"
});

export default ProblemDetail;
