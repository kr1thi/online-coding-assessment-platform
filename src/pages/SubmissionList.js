import React, { useEffect, useState } from "react";
import axios from 'axios';

const styles = {
  page: { padding: '40px', background: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
  container: { maxWidth: '1100px', margin: '0 auto', background: '#0a0f1e', borderRadius: '12px', padding: '20px', border: '1px solid #1e293b' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', borderBottom: '2px solid #1e293b', color: '#94a3b8', textAlign: 'left', fontSize: '0.9rem' },
  td: { padding: '15px', borderBottom: '1px solid #1e293b', fontSize: '0.85rem' },
  pill: (statusType) => {
    let bg = 'rgba(148, 163, 184, 0.1)'; //  gray
    let color = '#94a3b8';
    
    if (statusType === 'success') {
      bg = 'rgba(16, 185, 129, 0.2)';
      color = '#10b981';
    } else if (statusType === 'error') {
      bg = 'rgba(239, 68, 68, 0.2)';
      color = '#ef4444';
    } else if (statusType === 'warning') {
      bg = 'rgba(245, 158, 11, 0.2)';
      color = '#f59e0b';
    }

    return {
      padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
      background: bg, color: color, display: 'inline-flex', alignItems: 'center', gap: '5px'
    };
  },
  tag: { background: '#1e293b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }
};

function SubmissionList() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8082/api/submissions")
      .then(res => setSubmissions(res.data))
      .catch(err => console.error("Error fetching submissions:", err));
  }, []);

  const getLogicType = (code) => {
    if (!code) return "Basics";
    const lowerCode = code.toLowerCase();
    if (lowerCode.includes("for") || lowerCode.includes("while")) return "Loops";
    if (lowerCode.includes("if") || lowerCode.includes("else") || lowerCode.includes("switch")) return "Conditions";
    if (lowerCode.includes("scanner") || lowerCode.includes("print")) return "I/O Basics";
    return "Basics";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={{margin: 0}}>Submission History 📜</h2>
          <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>Real-time Judge0 Activity</span>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Problem</th>
              <th style={styles.th}>Logic Type</th>
              <th style={styles.th}>Language</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((sub, index) => {
                // Judge0 Status Logic
                const rawStatus = sub.status?.toLowerCase() || "";
                const isAccepted = rawStatus === 'accepted' || rawStatus === 'success';
                const isWarning = rawStatus.includes('wrong') || rawStatus.includes('limit');
                const isError = rawStatus.includes('error') || rawStatus.includes('failed');
                
                let statusType = 'success';
                if (isError) statusType = 'error';
                else if (isWarning) statusType = 'warning';
                else if (!isAccepted) statusType = 'default';

                const logic = getLogicType(sub.code);

                return (
                  <tr key={index}>
                    <td style={styles.td}>#{sub.id}</td>
                    <td style={styles.td}>Problem ID: {sub.problemId}</td>
                    <td style={styles.td}>
                      <span style={styles.tag}>{logic}</span>
                    </td>
                    <td style={styles.td}><span style={{textTransform: 'uppercase'}}>{sub.language}</span></td>
                    <td style={styles.td}>
                      <span style={styles.pill(statusType)}>
                        {isAccepted ? "✅ " : isWarning ? "⚠️ " : "❌ "}
                        {sub.status || "Unknown"}
                      </span>
                    </td>
                    <td style={styles.td}>{sub.submittedAt || "Just now"}</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" style={{...styles.td, textAlign:'center', padding: '40px'}}>No records found in database.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubmissionList;
