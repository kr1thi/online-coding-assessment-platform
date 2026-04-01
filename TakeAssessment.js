import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TakeAssessment = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0); // Timerstate  in seconds
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8082/api/assessment/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssessment(res.data);
                // timer sec (eg 30 mins * 60)
                setTimeLeft(res.data.duration * 60);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching assessment details", err);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, token]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0 && !loading && assessment) {
            handleAutoSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading]);

    const handleAutoSubmit = () => {
        alert("Time's up! Your assessment is being submitted.");
        navigate('/student/dashboard');
    };

    // format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div style={msgStyle}>Loading Questions...</div>;
    if (!assessment || !assessment.questions || assessment.questions.length === 0) 
        return <div style={msgStyle}>No questions found in this assessment.</div>;

    const currentQuestion = assessment.questions[currentIndex];

    return (
        <div style={containerStyle}>
            <div style={layoutStyle}>
                
                {/* left side question area */}
                <div style={mainCardStyle}>
                    <div style={headerStyle}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{assessment.title}</h2>
                        <div style={timerStyle}>
                            ⏳ {timeLeft > 0 ? formatTime(timeLeft) : "00:00"}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <span style={qLabelStyle}>Question {currentIndex + 1} of {assessment.questions.length}</span>
                        <h3 style={qTitleStyle}>{currentQuestion.title}</h3>
                        <p style={qDescStyle}>{currentQuestion.description}</p>
                        
                        {currentQuestion.constraints && (
                            <div style={constraintsStyle}>
                                <strong style={{ color: '#38bdf8' }}>Constraints:</strong>
                                <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>{currentQuestion.constraints}</p>
                            </div>
                        )}
                    </div>

                    <div style={actionAreaStyle}>
                         <button 
                            onClick={() => navigate(`/editor/${currentQuestion.id}`)}
                            style={editorBtnStyle}
                         >
                            Open Editor to Solve 💻
                         </button>
                    </div>

                    <div style={navFooterStyle}>
                        <button 
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(currentIndex - 1)}
                            style={{ ...navBtnStyle, opacity: currentIndex === 0 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>

                        {currentIndex < assessment.questions.length - 1 ? (
                            <button 
                                onClick={() => setCurrentIndex(currentIndex + 1)}
                                style={nextBtnStyle}
                            >
                                Next Question
                            </button>
                        ) : (
                            <button 
                                onClick={() => { alert("Submitted Successfully!"); navigate('/student/dashboard'); }}
                                style={submitBtnStyle}
                            >
                                Submit Assessment
                            </button>
                        )}
                    </div>
                </div>

                {/* right side question palette */}
                <div style={paletteStyle}>
                    <h4 style={{ marginBottom: '15px', color: '#94a3b8' }}>Questions</h4>
                    <div style={gridStyle}>
                        {assessment.questions.map((_, index) => (
                            <div 
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                style={{
                                    ...gridItemStyle,
                                    background: currentIndex === index ? '#818cf8' : '#1e293b',
                                    color: currentIndex === index ? 'white' : '#94a3b8'
                                }}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};


const containerStyle = { backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '40px' };
const layoutStyle = { display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', maxWidth: '1100px', margin: '0 auto' };
const mainCardStyle = { background: '#0f172a', padding: '30px', borderRadius: '20px', border: '1px solid #1e293b' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '15px', marginBottom: '20px' };
const timerStyle = { color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem', background: '#1e293b', padding: '5px 15px', borderRadius: '10px' };
const qLabelStyle = { color: '#818cf8', fontWeight: 'bold', fontSize: '0.9rem' };
const qTitleStyle = { marginTop: '10px', fontSize: '1.4rem', color: '#f8fafc' };
const qDescStyle = { color: '#94a3b8', marginTop: '15px', lineHeight: '1.6' };
const constraintsStyle = { marginTop: '20px', background: '#1e293b', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' };
const actionAreaStyle = { display: 'flex', justifyContent: 'center', marginBottom: '30px' };
const editorBtnStyle = { padding: '12px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const navFooterStyle = { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '20px' };
const navBtnStyle = { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const nextBtnStyle = { background: '#334155', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const submitBtnStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const paletteStyle = { background: '#0f172a', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b', height: 'fit-content' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' };
const gridItemStyle = { height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const msgStyle = { color: 'white', textAlign: 'center', marginTop: '100px', fontSize: '1.2rem' };

export default TakeAssessment;