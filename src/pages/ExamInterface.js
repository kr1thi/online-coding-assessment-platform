
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
const templates = {
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Start Coding...\n    }\n}`,
  python: `# Write your Python code here\nimport sys\n# Use input() or sys.stdin.read()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`
};

const ExamInterface = () => {
   const { id } = useParams();
    const navigate = useNavigate();

    
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [userInput, setUserInput] = useState("");
    const [consoleOutput, setConsoleOutput] = useState("");
    const [isSamplesOpen, setIsSamplesOpen] = useState(false);
    const [testCaseResults, setTestCaseResults] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showThankYou, setShowThankYou] = useState(false);
    const [assessmentName, setAssessmentName] = useState("Technical Exam");
    const [languageId, setLanguageId] = useState(62);

    const [parsedOptions, setParsedOptions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const currentQ = questions[currentIndex];
    

    // 
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const [consoleHeight, setConsoleHeight] = useState(240);
    const [isResizing, setIsResizing] = useState(false);
   

    const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://online-coding-assessment-platform-production.up.railway.app/api/assessment";
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // data initialization
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                const res = await axios.get(`${API_BASE}/${id}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (res.data) {
                    const fetchedQuestions = res.data.questions || [];
                    setQuestions(fetchedQuestions);
                    setAssessmentName(res.data.title || "Assessment");
                    setTimeLeft((res.data.duration || 60) * 60);
                    
                    const savedAnswers = localStorage.getItem(`exam_cache_${id}_${userId}`);
                    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
                }
            } catch (err) { 
                console.error("Error fetching exam data:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchAssessmentData();
    }, [id, token, userId]);
    useEffect(() => {
    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "Are you sure? Your progress will be saved, but the timer will continue.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);
    useEffect(() => {
    // currentQ illana return panniduvom
    if (!currentQ) return; 

    if (currentQ.type === 'MCQ' && currentQ.options) {
        try {
            const data = typeof currentQ.options === 'string' 
                ? JSON.parse(currentQ.options) 
                : currentQ.options;
            setParsedOptions(data);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            setParsedOptions([]);
        }
    } else {
        setParsedOptions([]);
    }
}, [currentQ]); 

    // real time proctoring
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                alert("⚠️ WARNING: Tab switching is recorded!");
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    //auto save progress
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem(`exam_cache_${id}_${userId}`, JSON.stringify(answers));
        }
    }, [answers, id, userId]);

    // time logic
    useEffect(() => {
        if (loading || timeLeft <= 0) {
            if (timeLeft === 0 && !loading) handleFinishTest(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading]);

    // resizing handler
   const handleMouseMove = useCallback((e) => {
    if (isResizing) {
        setSidebarWidth(Math.max(250, Math.min(800, e.clientX))); // 250px to 800px limit
    }
}, [isResizing]);

useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', () => setIsResizing(false));
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', () => setIsResizing(false));
    };
}, [handleMouseMove]);

    const handleQuestionChange = (index) => {
        setCurrentIndex(index);
        setTestCaseResults([]);
        setConsoleOutput("");
    };


const handleFinishTest = async (isAuto = false) => {
    if (isAuto || window.confirm("Are you sure you want to end the test?")) {
        try {
            const res = await axios.post(`${API_BASE}/finish`, {
                studentId: userId,
                assessmentId: id
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            console.log("Finish Response:", res.data); //  success message vara
            localStorage.removeItem(`exam_cache_${id}_${userId}`);
            setShowThankYou(true);
            setTimeout(() => navigate('/student/dashboard'), 3000);
            
        } catch (err) {
            // Debugging-kku ithu romba useful
            console.error("Full Error Object:", err.response);
            alert(`Error: ${err.response?.status} - ${err.response?.data?.message || "Check SecurityConfig"}`);
        }
    }
};
   const handleRun = async () => {
    if (!currentQ?.id) return;
    
    // Debugging
    console.log("Sending Data:", {
        sourceCode: answers[currentQ.id] || currentQ.template,
        languageId: languageId,
        stdin: userInput
    });

    setConsoleOutput("🚀 Executing...");
    try {
        const res = await axios.post(`${API_BASE}/run`, { 
            sourceCode: answers[currentQ.id] || currentQ.template,
            languageId: languageId,
            stdin: userInput 
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        
        console.log("API Response:", res.data); // Backend responsea paakkalam
        setConsoleOutput(`[STDOUT]:\n${res.data.stdout || res.data.output}`);
    } catch (err) { 
        console.error("Run Error:", err.response || err); // error detail
        setConsoleOutput("❌ Runtime Error. Check console logs."); 
    }
};
    const handleFinalSubmit = async () => {
        if (!currentQ) return;
        setConsoleOutput("⏳ Evaluating...");
        try {
            const res = await axios.post(`${API_BASE}/final-submit`, {
                studentId: userId,
                assessmentId: id,
                questionId: currentQ.id, // currentQ id
                sourceCode: answers[currentQ.id] || currentQ.template,
                languageId: languageId
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            if (res.data?.testCases) {
                setTestCaseResults(res.data.testCases);
                setConsoleOutput(res.data.testCases.every(tc => tc.passed) ? "✅ Accepted!" : "❌ Failed.");
            }
        } catch (err) { setConsoleOutput("❌ Submit failed."); }
    };
    const handleExit = () => {
        if (window.confirm("Progress is auto-saved, but the timer will keep running. Exit?")) navigate('/student/dashboard');
    };

    const theme = {
    bg: isDarkMode ? '#0D1117' : '#F6F8FA',
    side: isDarkMode ? '#161B22' : '#FFFFFF',
    text: isDarkMode ? '#C9D1D9' : '#1F2328',
    border: isDarkMode ? '#30363D' : '#D0D7DE',
    accent: '#2F81F7',
    console: isDarkMode ? '#010409' : '#F3F4F6',
};

    if (showThankYou) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#0D1117', color:'white'}}><h1>🎯 Test Submitted Successfully!</h1></div>;
    if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#0D1117', color:'white'}}><h3>Loading Assessment...</h3></div>;

    const options = Array.isArray(parsedOptions) ? parsedOptions : [];
    


    return (
       <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: theme.bg, color: theme.text }}>
    {/*header */}
    <header style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.side }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: theme.accent }}>FAMEHUB</h2>
            <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: '20px' }}>
                <span style={{ fontWeight: '600' }}>{assessmentName}</span>
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#8B949E' }}>Hi, {localStorage.getItem('userName') || 'Student'}</span>
            <select value={languageId} onChange={(e) => setLanguageId(Number(e.target.value))} style={{ padding: '6px' }}>
                <option value={62}>C++</option><option value={71}>Python</option><option value={91}>Java</option>
            </select>
            
            <div style={{ position: 'relative' }}>
                <button onClick={() => setIsSamplesOpen(!isSamplesOpen)} style={{ padding: '8px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isSamplesOpen ? '▲ Hide Questions' : '▼ Question List'}
                </button>
                
                {isSamplesOpen && (
                    <div style={{ position: 'absolute', top: '50px', right: '0', width: '300px', background: theme.side, border: `1px solid ${theme.border}`, zIndex: 10, padding: '10px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {questions.map((q, index) => (
                            <button key={q.id} onClick={() => { handleQuestionChange(index); setIsSamplesOpen(false); }} 
                                style={{ display: 'block', width: '100%', padding: '10px', background: currentIndex === index ? '#1F2937' : 'transparent', border: 'none', textAlign: 'left', color: theme.text, cursor: 'pointer' }}>
                                Q{index + 1}: {q.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '6px 12px' }}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</button>
            <button onClick={() => handleFinishTest(false)} style={{ background: '#DA3633', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px' }}>Finish Test</button>
            <button onClick={handleExit} style={{ background: '#30363D', color: '#C9D1D9', padding: '6px 12px', border: 'none', borderRadius: '4px' }}>Exit</button>
            
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>Previous</button>
                <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>Next</button>
            </div>
        </div>
    </header>

    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>   
       {/* sidebar */}
<aside style={{ 
    width: `${sidebarWidth}px`, 
    flexShrink: 0, 
    padding: '20px', 
    backgroundColor: theme.side, 
    borderRight: `1px solid ${theme.border}`, 
    overflowY: 'auto',
    position: 'relative'
}}>
    {/* resizer handle logic remains same... */}
    <div onMouseDown={() => setIsResizing(true)} style={{ /* style*/ }} />

    <h3>Q{currentIndex + 1}: {currentQ?.title}</h3>
    
    <div style={{ 
        marginTop: '15px', 
        fontSize: '0.95rem', 
        lineHeight: '1.6', 
        color: theme.text 
    }}>
        {currentQ?.description}
    </div>

    {/* only show this for coding question */}
    {currentQ?.type === 'CODING' && (
        <div style={{ marginTop: '30px', background: theme.bg, padding: '15px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
            <h4 style={{ color: theme.accent, marginTop: 0, marginBottom: '10px' }}>Sample I/O:</h4>
            <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.8rem', color: '#8B949E', margin: '0 0 5px 0' }}>Input:</p>
                <pre style={{ fontSize: '0.85rem', margin: 0, padding: '8px', background: theme.side, borderRadius: '4px', overflowX: 'auto' }}>
                    {currentQ?.exampleInput || "No input sample"}
                </pre>
            </div>
            <div>
                <p style={{ fontSize: '0.8rem', color: '#8B949E', margin: '0 0 5px 0' }}>Output:</p>
                <pre style={{ fontSize: '0.85rem', margin: 0, padding: '8px', background: theme.side, borderRadius: '4px', overflowX: 'auto' }}>
                    {currentQ?.exampleOutput || "No output sample"}
                </pre>
            </div>
        </div>
    )}
</aside>

  {/* editor area */}
<main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
   {currentQ?.type === 'MCQ' ? (
        // mcq view
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>{currentQ.title}</h3>
            <p>{currentQ.description}</p>
         
{options.map((opt, i) => (
    <button 
        key={i} 
        onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
        style={{ 
            display: 'block', 
            width: '100%', 
            margin: '10px 0', 
            padding: '15px',
            // Ippo correctah active stateai highlight pannum
            background: answers[currentQ.id] === opt ? theme.accent : theme.side,
            border: answers[currentQ.id] === opt ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
            color: theme.text,
            borderRadius: '8px', 
            cursor: 'pointer', 
            textAlign: 'left'
        }}>
        {opt}
    </button>
))}
        </div>
    ) : (
        // coding view part
        <>
            <Editor 
                height="70%"
                theme={isDarkMode ? "vs-dark" : "light"}
                language={languageId === 91 ? "java" : languageId === 71 ? "python" : "cpp"} 
                value={answers[currentQ?.id] || currentQ?.template} 
                onChange={(v) => setAnswers({ ...answers, [currentQ.id]: v })} 
            />
            
            {/* bottom console area is inside the fragment */}
            <div style={{ height: '30%', display: 'flex', flexDirection: 'column', borderTop: `1px solid ${theme.border}`, backgroundColor: theme.panel }}>
                <div style={{ padding: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderBottom: `1px solid ${theme.border}` }}>
                    <button disabled={isSubmitted} onClick={handleRun} style={{ background: '#238636', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Run Code</button>
                    <button disabled={isSubmitted} onClick={handleFinalSubmit} style={{ background: theme.accent, color: 'white', padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
                </div>
                
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <textarea style={{ width: '40%', padding: '10px', background: theme.bg, color: theme.text, border: 'none', borderRight: `1px solid ${theme.border}`, resize: 'none' }} value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Custom Input (stdin)..." />
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {testCaseResults.length > 0 && (
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: testCaseResults.every(tc => tc.passed) ? '#3FB950' : '#F85149' }}>
                                {testCaseResults.every(tc => tc.passed) ? "STATUS: ACCEPTED" : "STATUS: WRONG ANSWER"}
                            </div>
                        )}
                        {testCaseResults.length > 0 ? testCaseResults.map((tc, i) => (
                            <div key={i} style={{ color: tc.passed ? '#3FB950' : '#F85149', marginBottom: '5px' }}>
                                {tc.passed ? '✅' : '❌'} Test Case {i + 1}
                            </div>
                        )) : <pre style={{ margin: 0 }}>{consoleOutput}</pre>}
                    </div>
                </div>
            </div>
        </>
    )}
</main>
    </div>
</div>
    );
};

export default ExamInterface;
