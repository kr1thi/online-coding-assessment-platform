import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignedAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [completedAssessments, setCompletedAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

  
    const BASE_URL = 'https://online-coding-assessment-platform-production.up.railway.app';

    useEffect(() => {
        const fetchAssessments = async () => {
            try {

                const assessmentRes = await axios.get(
                    `${BASE_URL}/api/assessment/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                
                let results = [];

                try {
                    const resultRes = await axios.get(
                        `${BASE_URL}/api/assessment/student/${userId}/results`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    results = resultRes.data || [];

                } catch (resultError) {
                    console.log("No completed results found");
                }

               
                const filteredAssessments = assessmentRes.data.filter((assessment) => {
                    const alreadyCompleted = results.some(
                        (r) => r.assessmentId === assessment.id
                    );

                    return !alreadyCompleted;
                });

                setAssessments(filteredAssessments);
                setCompletedAssessments(results);

            } catch (err) {
                console.error("Error fetching assessments", err);
                setAssessments([]);
            } finally {
                setLoading(false);
            }
        };

        if (token && userId) {
            fetchAssessments();
        }
    }, [token, userId]);

    // loading Screen
    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: '#020617',
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }}
            >
                Loading Assessments...
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: '#020617',
                minHeight: '100vh',
                color: 'white',
                padding: '40px',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '35px'
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: '2rem',
                                marginBottom: '10px'
                            }}
                        >
                            📝 Assigned Assessments
                        </h1>

                        <p style={{ color: '#94a3b8' }}>
                            Only pending assessments are displayed here.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: '#0f172a',
                            color: '#94a3b8',
                            border: '1px solid #334155',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>

               
                {assessments.length === 0 ? (
                    <div
                        style={{
                            background: '#0f172a',
                            border: '1px solid #1e293b',
                            borderRadius: '18px',
                            padding: '60px',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
                            ✅
                        </div>

                        <h2 style={{ marginBottom: '10px' }}>
                            All Assessments Completed
                        </h2>

                        <p style={{ color: '#94a3b8' }}>
                            No pending assessments available right now.
                        </p>
                    </div>
                ) : (

                    // Assessment 
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '25px'
                        }}
                    >
                        {assessments.map((asm) => (
                            <div
                                key={asm.id}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '18px',
                                    padding: '28px',
                                    transition: '0.3s'
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            marginBottom: '15px',
                                            fontSize: '1.3rem'
                                        }}
                                    >
                                        {asm.title}
                                    </h2>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        <p
                                            style={{
                                                color: '#94a3b8',
                                                fontSize: '14px'
                                            }}
                                        >
                                            ⏱ Duration
                                        </p>

                                        <p
                                            style={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {asm.duration} mins
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(`/assessment/${asm.id}`)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '15px'
                                    }}
                                >
                                    Start Assessment
                                </button>
                            </div>
                        ))}
                    </div>
                )}

              
                {completedAssessments.length > 0 && (
                    <div
                        style={{
                            marginTop: '40px',
                            padding: '20px',
                            background: '#0f172a',
                            borderRadius: '14px',
                            border: '1px solid #1e293b'
                        }}
                    >
                        <h3 style={{ marginBottom: '8px' }}>
                            📊 Progress Summary
                        </h3>

                        <p style={{ color: '#94a3b8' }}>
                            Completed Assessments:
                            <span
                                style={{
                                    color: '#22c55e',
                                    fontWeight: 'bold',
                                    marginLeft: '8px'
                                }}
                            >
                                {completedAssessments.length}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedAssessments;
