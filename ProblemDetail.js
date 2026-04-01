import React, { useState } from 'react';

function ProblemDetail({ problem }) {
    const [userCode, setUserCode] = useState(""); 
    const [selectedLang, setSelectedLang] = useState("java");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!problem) return <div style={loadingStyle}>Loading problem details...</div>;

    const handleSubmitCode = async () => {
        const uId = localStorage.getItem('userId');
        const uName = localStorage.getItem('userName');

        const submissionData = {
            code: userCode,
            language: selectedLang,
            problemId: problem.id, 
            userId: uId ? parseInt(uId) : null,
            userName: uName
        };

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8082/api/submissions/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                alert(`Submitted as ${uName}! Check Dashboard.`);
            } else {
                alert("Submission failed. Check Console.");
            }
        } catch (err) {
            alert("Backend error thala!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={mainLayout}>
            {/* left side Problem description (scrollbar) */}
            <div style={descriptionContainer}>
                <div style={headerStyle}>
                    <h2 style={{ color: '#3b82f6' }}>{problem.challengeName}</h2>
                    <span style={difficultyBadge(problem.difficultyLevel)}>{problem.difficultyLevel}</span>
                </div>

                <div style={scrollContent}>
                    <h4 style={sectionTitle}>Problem Statement</h4>
                    <p style={textStyle}>{problem.problemStatement}</p>

                    <h4 style={sectionTitle}>Constraints</h4>
                    <pre style={codeBlock}>{problem.constraints || "None"}</pre>

                    <h4 style={sectionTitle}>Sample Input</h4>
                    <pre style={codeBlock}>{problem.sampleInput}</pre>

                    <h4 style={sectionTitle}>Sample Output</h4>
                    <pre style={codeBlock}>{problem.sampleOutput}</pre>
                </div>
            </div>

            {/* right: Code Editor */}
            <div style={editorContainer}>
                <div style={editorHeader}>
                    <span style={{ color: '#94a3b8' }}>Language:</span>
                    <select 
                        value={selectedLang} 
                        onChange={(e) => setSelectedLang(e.target.value)}
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
                    className="glow-btn" 
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
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '20px',
    minHeight: '100vh', 
    padding: '20px',
    background: '#0f172a'
};

const descriptionContainer = {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' 
};

const scrollContent = {
    overflowY: 'auto', //scroll
    maxHeight: '70vh',
    paddingRight: '10px',
    marginTop: '15px'
};

const editorContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const textareaStyle = {
    flexGrow: 1,
    width: '100%',
    background: '#020617',
    color: '#10b981',
    padding: '15px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: '1px solid #334155',
    borderRadius: '8px',
    outline: 'none',
    resize: 'none'
};

const codeBlock = {
    background: '#0f172a',
    padding: '10px',
    borderRadius: '6px',
    color: '#cbd5e1',
    fontSize: '13px',
    whiteSpace: 'pre-wrap'
};

const sectionTitle = { color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '5px', marginTop: '20px' };
const textStyle = { color: '#f1f5f9', lineHeight: '1.6' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const editorHeader = { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' };
const selectStyle = { padding: '5px 12px', borderRadius: '6px', background: '#334155', color: 'white', border: 'none' };
const loadingStyle = { color: 'white', textAlign: 'center', marginTop: '50px' };

const difficultyBadge = (lvl) => ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    background: lvl === 'Easy' ? '#065f46' : lvl === 'Medium' ? '#92400e' : '#7f1d1d',
    color: 'white'
});

const submitBtnStyle = (loading) => ({
    padding: '12px',
    background: loading ? '#475569' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer'
});

export default ProblemDetail;