import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignedAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await axios.get('http://localhost:8082/api/assessment/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssessments(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching assessments", err);
                setLoading(false);
            }
        };
        fetchAssessments();
    }, [token]);

    if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Loading Assessments...</div>;

    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button onClick={() => navigate(-1)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>← Back</button>
                
                <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Assigned <span style={{ color: '#818cf8' }}>Assessments</span></h1>

                {assessments.length === 0 ? (
                    <div style={{ padding: '40px', background: '#0f172a', borderRadius: '15px', textAlign: 'center', border: '1px solid #1e293b' }}>
                        <p style={{ color: '#94a3b8' }}>No assessments assigned yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {assessments.map((asm) => (
                            <div key={asm.id} style={{ padding: '25px', background: '#0f172a', borderRadius: '15px', border: '1px solid #1e293b' }}>
                                <h3 style={{ marginBottom: '10px' }}>{asm.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    Duration: {asm.duration} Mins
                                </p>
                                <button 
                                    onClick={() => navigate(`/assessment/${asm.id}`)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: '#818cf8', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Start Assessment
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedAssessments;