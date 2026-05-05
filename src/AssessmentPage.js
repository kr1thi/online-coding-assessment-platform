import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const [assignedTests, setAssignedTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                //  Fetch all assessments
                const res = await axios.get('http://localhost:8082/api/assessment/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // fetch current students results
                let resultsData = [];
                try {
                    const resultsRes = await axios.get(`http://localhost:8082/api/assessment/student/${userId}/results`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    resultsData = resultsRes.data;
                } catch (e) {
                    console.log("No results found - showing all as Active.");
                }

                // Filter out tests that are already completed
                if (res.data) {
                    const activeTests = res.data.filter(test => {
                        // Check if this test ID exists in students results
                        const isCompleted = resultsData.some(r => r.assessmentId === test.id);
                        // Only return tests that ARE NOT completed
                        return !isCompleted;
                    });
                    
                    setAssignedTests(activeTests);
                }

            } catch (err) {
                console.error("Fetch failed.", err);
                setAssignedTests([]); 
            } finally {
                setLoading(false);
            }
        };

        if (token && userId) {
            fetchAssessments();
        }
    }, [userId, token]);

    if (loading) return (
        <div style={{ backgroundColor: '#020617', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif" }}>Checking Assessments...</h2>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* header section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>📝 Pending Assessments</h1>
                        <p style={{ color: '#94a3b8' }}>Only tests you haven't completed yet are shown here.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/student/dashboard')} 
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Back to Portal
                    </button>
                </div>

                {/* grid Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                    {assignedTests.length > 0 ? assignedTests.map(test => (
                        <div key={test.id} style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>{test.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Duration: <span style={{ color: 'white' }}>{test.duration} mins</span></p>
                            </div>

                            <button 
                                onClick={() => navigate(`/student/exam/${test.id}`)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}
                            >
                                Start Assessment
                            </button>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '50px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ color: 'white' }}>All Caught Up!</h2>
                            <p style={{ color: '#94a3b8' }}>You have no pending assessments at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;
