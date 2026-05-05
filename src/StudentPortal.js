import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentPortal = () => {
    const navigate = useNavigate();
    const [assessmentCount, setAssessmentCount] = useState(0);
    const userName = localStorage.getItem('userName') || 'Student';

    useEffect(() => {
        // Pending assessments evlo irukkunu summa oru count fetch panna
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8082/api/assessment/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssessmentCount(res.data.length);
            } catch (err) {
                console.log("Count fetch error");
            }
        };
        fetchCount();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const sections = [
        { 
            id: 1, 
            title: "Practice Problems", 
            desc: "Solve curated coding challenges and improve your logic. Build your streak!", 
            icon: "💻", 
            path: "/student/practice", 
            color: "#38bdf8",
            badge: null
        },
        { 
            id: 2, 
            title: "Assessments", 
            desc: "Formal exams assigned by your college or company. Time-bound challenges.", 
            icon: "📝", 
            path: "/student/assessments", 
            color: "#818cf8",
            badge: assessmentCount > 0 ? `${assessmentCount} Active` : null
        }
    ];

    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', padding: '40px 20px' }}>
            {/* header with profile */}
<div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
    <div className="logo" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Fame<span style={{ color: '#2563eb' }}>Hub</span></div>
    
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {/* profile link button */}
        <button 
            onClick={() => navigate('/profile')} 
            style={{ 
                background: '#1e293b', 
                border: '1px solid #334155', 
                color: 'white', 
                padding: '8px 18px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            👤 Profile
        </button>

        <button 
            onClick={handleLogout} 
            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}
        >
            Logout 🚪
        </button>
    </div>
</div>
            

            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.8rem', marginBottom: '10px', fontWeight: '800' }}>
                    Welcome back, <span style={{ color: '#38bdf8' }}>{userName}!</span>
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: '50px', fontSize: '1.1rem' }}>Choose your path to excellence today.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {sections.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => navigate(s.path)}
                            style={{ 
                                background: '#0f172a', 
                                padding: '40px', 
                                borderRadius: '24px', 
                                border: '1px solid #1e293b', 
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = s.color;
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = '#111a2e';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#1e293b';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = '#0f172a';
                            }}
                        >
                            {/* badge for assessment count */}
                            {s.badge && (
                                <span style={{ position: 'absolute', top: '20px', right: '20px', background: s.color, color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {s.badge}
                                </span>
                            )}

                            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{s.icon}</div>
                            <h2 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>{s.title}</h2>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' }}>{s.desc}</p>
                            
                            <div style={{ marginTop: '25px', color: s.color, fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Explore Now <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentPortal;
