import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const templates = {
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Start Coding...\n    }\n}`,
  python: `# Write your Python code here\nimport sys\n# Use input() or sys.stdin.read()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`
};

function CodeEditor() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [userCode, setUserCode] = useState(templates.java);
  const [language, setLanguage] = useState("java");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [status, setStatus] = useState(""); 
  const [submitResult, setSubmitResult] = useState(null); 
  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [testResults, setTestResults] = useState([]); 

  // helper function to get auth Header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  // history fetch panna '/all' endpoint with jwt
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8082/api/submissions/all`, getAuthHeader());
      const filtered = res.data.filter(sub => sub.problemId === parseInt(id));
      setHistory(filtered.reverse());
    } catch (err) { 
      console.error("Error fetching history", err); 
      if(err.response?.status === 403) setStatus("SESSION EXPIRED. LOGIN AGAIN.");
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // header sethu dhaan anuppanum (unless backend permits anonymous access)
    axios.get(`http://localhost:8082/api/problems/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        console.log("Data fetched:", res.data); //  data varudhanu paka
        setQuestion(res.data);
    })
    .catch(err => {
        console.error("Fetch error:", err);
       
    });
      
    fetchHistory();
  }, [id, fetchHistory]);

  const handleAction = async (isSubmit) => {
    setStatus("RUNNING...");
    setSubmitResult(null);
    setTestResults([]); 
    setConsoleOutput("");
    
    const uId = localStorage.getItem('userId');
    const uName = localStorage.getItem('userName');

    try {
      if (isSubmit) {
        // Backend submit call with JWT header
        const res = await axios.post(`http://localhost:8082/api/submissions/submit`, {
          code: userCode, 
          language: language,
          problemId: parseInt(id),
          userId: uId ? parseInt(uId) : null,
          userName: uName
        }, getAuthHeader());
        
        const total = res.data.totalCount || 6; 
        const passed = res.data.passedCount || 0;
        const isOverallSuccess = res.data.success;

        const cases = [];
        for(let i = 1; i <= total; i++) {
          cases.push({
            id: i,
            passed: i <= passed, 
            name: i <= 2 ? `Sample Test case ${i-1}` : `Hidden Test case ${i-1}`
          });
        }
        
        setTestResults(cases);
        setSubmitResult({ 
            success: isOverallSuccess, 
            message: isOverallSuccess ? "🏆 All Test Cases Passed!" : "❌ Wrong Answer: Check your logic" 
        });

        setStatus(isOverallSuccess ? "ACCEPTED" : "WRONG ANSWER");
        fetchHistory();
      } else {
        // run logic with JWT header
        const langIdMap = { java: 62, python: 71, cpp: 54 };
        const res = await axios.post(
          `http://localhost:8082/api/submissions/run?langId=${langIdMap[language]}`, 
          { code: userCode, stdin: userInput },
          getAuthHeader()
        );

        const finalOutput = res.data.stdout || res.data.stderr || res.data.compile_output || "No Output";
        setConsoleOutput(finalOutput);
        setStatus("COMPLETED");
      }
    } catch (err) { 
    console.log("Error status:", err.response?.status);
    setStatus("ERROR"); 
    setConsoleOutput("Server connection error. Check if backend is running.");
}
  };

  if (!question) return <div style={{background: '#0a0a0a', height:'100vh', color: 'white', padding: '20px'}}>Loading Problem...</div>;

  return (
    <div style={{background: '#0a0a0a', color: '#e2e8f0', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif'}}>
      <header style={{height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', background: '#111', borderBottom: '1px solid #333'}}>
        <div style={{fontWeight: '900', fontSize: '1.5rem', color: '#fff'}}>Fame<span style={{color: '#3b82f6'}}>Hub</span></div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <select value={language} onChange={(e) => {setLanguage(e.target.value); setUserCode(templates[e.target.value]);}} 
                  style={{background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', padding: '5px 10px', outline: 'none'}}>
            <option value="java">Java 17</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 17</option>
          </select>
          <button onClick={() => handleAction(false)} style={{padding: '7px 20px', borderRadius: '5px', background: '#1a1a1a', color: '#10b981', border: '1px solid #10b981', fontWeight: 'bold', cursor: 'pointer'}}>Run Code</button>
          <button onClick={() => handleAction(true)} style={{padding: '7px 20px', borderRadius: '5px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}>Submit</button>
        </div>
      </header>

      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
     
        <div style={{flex: '0 0 42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #333', background: '#0a0a0a'}}>
          <div style={{display: 'flex', borderBottom: '1px solid #333', background: '#111'}}>
            <button onClick={() => setActiveTab("description")} style={{padding: '15px 30px', color: activeTab === 'description' ? '#fff' : '#777', background: 'none', border: 'none', borderBottom: activeTab === 'description' ? '3px solid #2563eb' : 'none', cursor: 'pointer', fontWeight: 'bold'}}>Description</button>
            <button onClick={() => setActiveTab("submissions")} style={{padding: '15px 30px', color: activeTab === 'submissions' ? '#fff' : '#777', background: 'none', border: 'none', borderBottom: activeTab === 'submissions' ? '3px solid #2563eb' : 'none', cursor: 'pointer', fontWeight: 'bold'}}>Submissions</button>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '35px'}}>
            {activeTab === 'description' ? (
              <div>
                <h1 style={{fontSize: '1.8rem', color: '#fff', marginBottom: '15px'}}>{question.challengeName}</h1>
                <div style={{lineHeight: '1.8', color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '1rem', marginBottom: '25px'}}>{question.problemStatement}</div>
                {[1, 2].map(num => question[`input${num}`] && (
                  <div key={num} style={{marginTop: '25px'}}>
                    <h3 style={{fontSize: '0.85rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px'}}>Example {num-1}</h3>
                    <div style={{background: '#161616', padding: '15px', borderRadius: '8px', border: '1px solid #222', marginTop: '10px'}}>
                      <div style={{color: '#444', fontSize: '0.7rem', fontWeight: 'bold'}}>INPUT</div>
                      <pre style={{color: '#10b981', margin: '5px 0', fontSize: '0.9rem'}}>{question[`input${num}`]}</pre>
                      <div style={{color: '#444', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '10px'}}>OUTPUT</div>
                      <pre style={{color: '#3b82f6', margin: '5px 0', fontSize: '0.9rem'}}>{question[`output${num}`]}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{padding: '10px'}}>
                {history.length > 0 ? history.map(sub => (
                  <div key={sub.id} style={{padding: '15px', background: '#161616', marginBottom: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #222'}}>
                    <span style={{fontWeight: 'bold', color: '#ccc'}}>Submission #{sub.id}</span>
                    <span style={{color: sub.status === 'Accepted' ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>{sub.status}</span>
                  </div>
                )) : <div style={{color: '#555', textAlign: 'center', marginTop: '20px'}}>No submissions yet.</div>}
              </div>
            )}
          </div>
        </div>

      
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <textarea 
            value={userCode} onChange={(e) => setUserCode(e.target.value)} spellCheck="false"
            style={{flex: 1, background: '#050505', color: '#d1d5db', padding: '30px', fontFamily: '"Fira Code", monospace', fontSize: '16px', border: 'none', outline: 'none', resize: 'none', lineHeight: '1.6'}} 
          />
          
          <div style={{height: '320px', borderTop: '1px solid #333', background: '#0a0a0a', display: 'flex', flexDirection: 'column'}}>
            <div style={{padding: '12px 25px', background: '#111', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222'}}>
              <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#666'}}>{testResults.length > 0 ? "TEST RESULTS" : "CONSOLE"}</span>
              <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: status === 'ACCEPTED' ? '#10b981' : '#f59e0b'}}>{status}</span>
            </div>
            
            <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
              {submitResult && (
                <div style={{
                  padding: '15px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold',
                  background: submitResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: submitResult.success ? '#10b981' : '#ef4444',
                  border: `1px solid ${submitResult.success ? '#10b981' : '#ef4444'}`,
                }}>
                  {submitResult.message}
                </div>
              )}

              {testResults.length > 0 ? (
                testResults.map(res => (
                  <div key={res.id} style={{display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: '#111', borderRadius: '8px', marginBottom: '10px', border: res.passed ? '1px solid #1a1a1a' : '1px solid #450a0a'}}>
                    <div style={{color: res.passed ? '#10b981' : '#ef4444', fontSize: '1.1rem', fontWeight: 'bold'}}>{res.passed ? '✓' : '✕'}</div>
                    <div style={{fontSize: '0.9rem', color: res.passed ? '#fff' : '#ef4444', fontWeight: '600'}}>{res.name}</div>
                    <div style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#444'}}>{res.passed ? 'Passed' : 'Failed'}</div>
                  </div>
                ))
              ) : (
                <div style={{display: 'flex', height: '100%'}}>
                  <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Custom Input (Stdin)..." 
                            style={{flex: 1, background: 'transparent', color: '#888', padding: '10px', border: 'none', outline: 'none', borderRight: '1px solid #222', fontSize: '14px', resize: 'none'}} />
                  <div style={{flex: 1, padding: '15px', color: '#999', fontSize: '14px', whiteSpace: 'pre-wrap'}}>{consoleOutput || "Run code to see results..."}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
