import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                //  Get token from localStorage for authentication
                const token = localStorage.getItem('token');
                
               const response = await fetch('https://online-coding-assessment-platform-production.up.railway.app/api/problems/all', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // ✨ Fix 2: Add Bearer token
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProblems(data);
                } else {
                    console.error("Fetch failed with status:", response.status);
                }
            } catch (error) {
                console.error("Backend connect aagala thala! Check port 8082.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // Filter logic to show only practice problems -assessmentId null ayidum
    // and apply search term
    const filteredProblems = problems.filter(p => {
        // Show only if it's not part of an assessment
        const isPractice = p.assessmentId === null;
        
        const name = p.challengeName ? p.challengeName.toLowerCase() : "";
        const topic = p.topic ? p.topic.toLowerCase() : "";
        const search = searchTerm.toLowerCase();
        
        return isPractice && (name.includes(search) || topic.includes(search));
    });

    return (
        <div className="dashboard-wrapper" style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white' }}>
            {/* nav Header */}
            <div className="dashboard-header-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 80px', background: '#0f172a', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Fame<span style={{ color: '#2563eb' }}>Hub</span></div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    
                </div>
            </div>

            <div className="dashboard-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '30px', letterSpacing: '-1px' }}>Master Your Coding Skills</h1>
                
                {/*search bar section*/}
                <div style={{ marginBottom: '40px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Search problems by title or topic (e.g., Array, String)..." 
                        style={{ 
                            padding: '14px 20px', 
                            width: '100%', 
                            maxWidth: '600px', 
                            borderRadius: '10px', 
                            border: '1px solid #334155', 
                            background: '#0f172a', 
                            color: 'white',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            outline: 'none'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* problems table container */}
                <div className="table-card" style={{ 
                    maxWidth: '1100px', 
                    margin: '0 auto', 
                    background: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #1e293b', 
                    maxHeight: '500px',
                    overflowY: 'auto',
                    position: 'relative'
                }}>
                    {loading ? (
                        <div style={{ padding: '40px', color: '#38bdf8' }}>Loading problems...</div>
                    ) : (
                        <table className="questions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ 
                                background: '#1e293b', 
                                color: '#94a3b8', 
                                textTransform: 'uppercase', 
                                fontSize: '0.75rem', 
                                letterSpacing: '1px',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <tr>
                                    <th style={{ padding: '20px', textAlign: 'left', background: '#1e293b' }}>Title</th>
                                    <th style={{ padding: '20px', textAlign: 'left', background: '#1e293b' }}>Topic</th>
                                    <th style={{ padding: '20px', textAlign: 'left', background: '#1e293b' }}>Difficulty</th>
                                    <th style={{ padding: '20px', textAlign: 'center', background: '#1e293b' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.length > 0 ? (
                                    filteredProblems.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '20px', textAlign: 'left' }}>
                                                <Link to={`/editor/${p.id}`} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>{p.challengeName}</Link>
                                            </td>
                                            <td style={{ padding: '20px', textAlign: 'left', color: '#cbd5e1' }}>{p.topic}</td>
                                            <td style={{ padding: '20px', textAlign: 'left' }}>
                                                <span style={{ 
                                                    color: p.difficultyLevel === 'Easy' ? '#10b981' : (p.difficultyLevel === 'Medium' ? '#f59e0b' : '#ef4444'),
                                                    background: 'rgba(255,255,255,0.05)',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {p.difficultyLevel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px', textAlign: 'center' }}>
                                                <Link to={`/editor/${p.id}`}>
                                                    <button style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '6px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Solve</button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', color: '#94a3b8' }}>
                                            {problems.length === 0 ? "No problems found in database." : "No results match your search."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
