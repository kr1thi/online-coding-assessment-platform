import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const API_BASE = "https://online-coding-assessment-platform-production.up.railway.app/api";
const styles = {
  cardStyle: {
    background: "#ffffff", // White background
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0", // Light grey border
    maxWidth: "900px",
    margin: "40px auto",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" // Light shadow
  },
  cardTitle: {
    color: "#1e293b", // Dark text
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  label: {
    color: "#475569", // Darker label text
    fontSize: "0.85rem",
    marginBottom: "6px",
    display: "block"
  },
  input: {
    background: "#f8fafc", // Very light grey input
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px",
    color: "#1e293b", // Black text
    width: "100%"
  },
  primaryBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "15px"
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

const AddProblem = () => {

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [file, setFile] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [problem, setProblem] = useState({
    assessmentId: "",
    challengeName: "",
    type: "CODING",
    difficultyLevel: "Easy",
    problemStatement: "",
    topic: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    language: "java"
  });

  const token = localStorage.getItem("token");

  /* fetch assessments for dropdown */
  useEffect(() => {
    const loadAssessments = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/assessment/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAssessments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadAssessments();
  }, [token]);

  const onChange = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const updateOption = (index, value) => {
    const copy = [...problem.options];
    copy[index] = value;

    setProblem({ ...problem, options: copy });
  };

  /* read excel file */
  const readExcel = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;

      const wb = XLSX.read(data, { type: "binary" });

      const json = XLSX.utils.sheet_to_json(
        wb.Sheets[wb.SheetNames[0]]
      );

      setPreviewData(json);
    };

    reader.readAsBinaryString(f);
  };

  /* upload excel to backend */
  const uploadBulk = async () => {

    if (!file) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    if (problem.assessmentId) {
      form.append("assessmentId", problem.assessmentId);
    }

    try {

      const res = await axios.post(
        `${API_BASE}/admin/bulk-upload`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert(res.data);

      setFile(null);
      setPreviewData([]);

    } catch (err) {
      alert("Bulk upload failed");
    }

    setLoading(false);
  };

  /* submit manual problem */
  const addProblem = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const url = problem.assessmentId
        ? `${API_BASE}/assessment/${problem.assessmentId}/add-manual`
        : `${API_BASE}/problems/add`;

      const payload = {
        ...problem,
        assessmentId: problem.assessmentId
          ? Number(problem.assessmentId)
          : null,

        options:
          problem.type === "MCQ"
            ? JSON.stringify(problem.options)
            : null,

        testCases:
          problem.type === "CODING"
            ? JSON.stringify([
                {
                  input: problem.sampleInput,
                  output: problem.sampleOutput,
                  hidden: false
                }
              ])
            : null
      };

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Problem added successfully");

      setProblem({
        ...problem,
        challengeName: "",
        problemStatement: "",
        sampleInput: "",
        sampleOutput: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      });

    } catch (err) {
      alert("Error adding problem");
    }

    setLoading(false);
  };

  /* load practice bank */
  const loadBank = async () => {

    setLoading(true);

    try {

      const res = await axios.get(`${API_BASE}/problems/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBankQuestions(res.data || []);
      setShowModal(true);

    } catch (err) {
      alert("Error loading bank");
    }

    setLoading(false);
  };

  /* link selected questions */
  const linkQuestions = async () => {

    if (!problem.assessmentId) {
      alert("Select assessment first");
      return;
    }

    if (selectedIds.length === 0) {
      alert("Select questions");
      return;
    }

    setLoading(true);

    try {

      await axios.post(
        `${API_BASE}/assessment/${problem.assessmentId}/add-questions`,
        {
          questionIds: selectedIds,
          manualOptionsMap: {}
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${selectedIds.length} questions linked`);

      setShowModal(false);
      setSelectedIds([]);

    } catch (err) {
      alert("Linking failed");
    }

    setLoading(false);
  };

  /* simple search filter */
  const filteredQuestions = bankQuestions.filter((q) =>
    (q.challengeName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (q.topic || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.cardStyle}>
      

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={styles.cardTitle}>
          {showBulk ? "Bulk Upload" : "Manual Problem"}
        </h3>
        <button
          onClick={() => setShowBulk(!showBulk)}
          style={styles.secondaryBtn}
        >
          {showBulk ? "Switch Manual" : "Switch Bulk"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label style={styles.label}>Assessment</label>

        <select
          name="assessmentId"
          value={problem.assessmentId}
          onChange={onChange}
          style={styles.input}
        >
          <option value="">Practice Pool</option>

          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {showBulk ? (
        <div style={{ marginTop: "20px" }}>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={readExcel}
          />

          {file && (
            <>
              <p>{previewData.length} rows detected</p>

              <button
                style={styles.primaryBtn}
                onClick={uploadBulk}
              >
                Upload File
              </button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={addProblem}>

          <div style={{ marginTop: "20px" }}>
            <label style={styles.label}>Title</label>

            <input
              name="challengeName"
              value={problem.challengeName}
              onChange={onChange}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginTop: "15px" }}>
            <label style={styles.label}>Topic</label>

            <input
              name="topic"
              value={problem.topic}
              onChange={onChange}
              style={styles.input}
              required
            />
          </div>
      
          <div style={{ marginTop: "15px" }}>
            <label style={styles.label}>Problem</label>

            <textarea
              name="problemStatement"
              value={problem.problemStatement}
              onChange={onChange}
              style={styles.input}
              rows="4"
            />
          </div>
              {/* Sample Input Field */}
<div style={{ marginTop: "15px" }}>
  <label style={styles.label}>Sample Input</label>
  <textarea
    name="sampleInput"
    value={problem.sampleInput}
    onChange={onChange}
    style={styles.input}
    rows="2"
  />
</div>

{/* Sample Output Field */}
<div style={{ marginTop: "15px" }}>
  <label style={styles.label}>Sample Output</label>
  <textarea
    name="sampleOutput"
    value={problem.sampleOutput}
    onChange={onChange}
    style={styles.input}
    rows="2"
  />
</div>


          <button
            type="submit"
            style={styles.primaryBtn}
            disabled={loading}
          >
            Save Problem
          </button>

        </form>
      )}
    </div>
  );
};

export default AddProblem;
