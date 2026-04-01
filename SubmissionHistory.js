import React, { useEffect, useState } from "react";
import axios from 'axios';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // MySQLla irundhu submissionsah edukka call
    axios.get("http://localhost:8082/api/problems/submissions/all")
      .then(res => setSubmissions(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div style={{padding: '40px', background: '#020617', minHeight: '100vh', color: 'white'}}>
      <h2>Recent Submissions 📜</h2>
      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
        <thead>
          <tr style={{borderBottom: '2px solid #1e293b', color: '#94a3b8'}}>
            <th style={{padding: '12px', textAlign: 'left'}}>ID</th>
            <th style={{padding: '12px', textAlign: 'left'}}>Problem ID</th>
            <th style={{padding: '12px', textAlign: 'left'}}>Language</th>
            <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
            <th style={{padding: '12px', textAlign: 'left'}}>Date</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, index) => (
            <tr key={index} style={{borderBottom: '1px solid #1e293b'}}>
              <td style={{padding: '12px'}}>#{sub.id}</td>
              <td style={{padding: '12px'}}>{sub.problemId}</td>
              <td style={{padding: '12px', textTransform: 'uppercase'}}>{sub.language}</td>
              <td style={{padding: '12px', color: sub.status === 'Accepted' ? '#10b981' : '#ef4444'}}>
                {sub.status}
              </td>
              <td style={{padding: '12px'}}>{sub.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubmissionHistory;