import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '' });

    const TOTAL_JAVA_PROBLEMS = 20; 

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8082/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(res.data);
            setEditData({ name: res.data.name });
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8082/api/users/update', 
                { name: editData.name }, 
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            setIsEditing(false);
            fetchProfile();
            alert("Profile Synchronized Successfully! ✅");
        } catch (err) {
            alert("Update Failed! ❌");
        }
    };

    const calculateProgress = (count) => {
        const solved = count || 0;
        const percentage = Math.min((solved / TOTAL_JAVA_PROBLEMS) * 100, 100);
        let level = "Level 1: Novice";
        let color = "#94a3b8"; 

        if (percentage >= 100) { level = "Java Expert 🏆"; color = "#facc15"; }
        else if (percentage >= 75) { level = "Advanced Developer"; color = "#a855f7"; }
        else if (percentage >= 40) { level = "Intermediate Coder"; color = "#3b82f6"; }
        else if (percentage > 0) { level = "Java Practitioner"; color = "#22c55e"; }

        return { percentage, level, color };
    };

    if (loading) return <div style={styles.loader}>Accessing FAME Secure Cloud...</div>;

    const javaStats = calculateProgress(user?.solvedCount);
    const renderStudentStats = () => (
        <>
            <div style={styles.activityCard}>
                <div style={styles.cardHeader}>
                    <h4>Skill Proficiency: Java Basics</h4>
                    <span style={{color: javaStats.color, fontWeight: '600'}}>{javaStats.level}</span>
                </div>
                <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${javaStats.percentage}%`, background: javaStats.color}}></div>
                </div>
                <p style={styles.progressText}>{Math.round(javaStats.percentage)}% of curriculum completed</p>
                <div style={styles.badgeGrid}>
                    {user?.solvedCount > 0 && <div style={styles.badge}>First Step 🏅</div>}
                    <div style={styles.badge}>Core Java ☕</div>
                    {javaStats.percentage >= 100 && <div style={styles.badge}>Java Master 🏆</div>}
                </div>
            </div>
            <div style={styles.statsGrid}>
                <StatBox label="Total Solved" value={user?.solvedCount || 0} />
                <StatBox label="XP Points" value={(user?.solvedCount || 0) * 100} />
                <StatBox label="Streak" value={user?.streak || "0 Days"} />
            </div>
        </>
    );

    const renderTeacherStats = () => (
        <>
            <div style={styles.activityCard}>
                <h4 style={{marginBottom: '15px'}}>Teaching Overview</h4>
                <div style={styles.statsGrid}>
                    <StatBox label="Total Students" value="156" />
                    <StatBox label="Active Batches" value="4" />
                    <StatBox label="Assessments Created" value="28" />
                </div>
            </div>
            <div style={styles.actionGrid}>
                <button style={styles.actionBtn}>Create New Test</button>
                <button style={styles.actionBtn}>View Batch Reports</button>
            </div>
        </>
    );

    const renderAdminStats = () => (
        <>
            <div style={styles.activityCard}>
                <h4 style={{marginBottom: '15px', color: '#ef4444'}}>System Administration</h4>
                <div style={styles.statsGrid}>
                    <StatBox label="Total Platform Users" value="1,240" />
                    <StatBox label="Server Health" value="99.9%" />
                    <StatBox label="Pending Requests" value="12" />
                </div>
            </div>
            <div style={styles.actionGrid}>
                <button style={{...styles.actionBtn, borderColor: '#ef4444'}}>Manage User Access</button>
                <button style={styles.actionBtn}>System Logs</button>
            </div>
        </>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>‹ Back to Dashboard</button>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <div style={{...styles.verifiedTag, color: user?.role === 'ADMIN' ? '#ef4444' : '#22c55e'}}>
                        ✓ Verified {user?.role} Profile
                    </div>
                    <button 
                        onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                        style={{...styles.editBtn, background: isEditing ? '#22c55e' : 'rgba(56, 189, 248, 0.1)'}}
                    >
                        {isEditing ? '✓ Save Changes' : '✎ Edit Profile'}
                    </button>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* left card */}
                <div style={styles.identityCard}>
                    <div style={{...styles.avatar, borderColor: user?.role === 'ADMIN' ? '#ef4444' : (user?.role === 'TEACHER' ? '#3b82f6' : javaStats.color)}}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {isEditing ? (
                        <input style={styles.editInput} value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} autoFocus />
                    ) : (
                        <h2 style={styles.userName}>{user?.name}</h2>
                    )}
                    <p style={styles.userSub}>{user?.email}</p>
                    <div style={styles.divider}></div>
                    <div style={styles.infoRow}><span>Staff/Roll ID:</span> <b>{user?.rollNo || 'FAME-001'}</b></div>
                    <div style={styles.infoRow}><span>Institution:</span> <b>{user?.institution || 'FameHub'}</b></div>
                </div>

                {/*right side content */}
                <div style={styles.statsSection}>
                    {user?.role === 'STUDENT' && renderStudentStats()}
                    {user?.role === 'TEACHER' && renderTeacherStats()}
                    {user?.role === 'ADMIN' && renderAdminStats()}
                </div>
            </div>
        </div>
    );
};

// helper StatBox component
const StatBox = ({ label, value }) => (
    <div style={styles.statBox}>
        <small style={{color: '#64748b', fontSize: '0.75rem'}}>{label}</small>
        <h3 style={{margin: '5px 0 0', fontSize: '1.2rem'}}>{value}</h3>
    </div>
);

const styles = {
    container: { backgroundColor: '#020617', minHeight: '100vh', color: '#f1f5f9', padding: '40px', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto 30px' },
    backBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' },
    editBtn: { border: '1px solid #38bdf8', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' },
    verifiedTag: { background: 'rgba(255, 255, 255, 0.05)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
    mainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', maxWidth: '1100px', margin: '0 auto' },
    identityCard: { background: '#0f172a', borderRadius: '16px', padding: '30px', border: '1px solid #1e293b', textAlign: 'center' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', background: '#1e293b', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '3px solid' },
    userName: { fontSize: '1.4rem', marginBottom: '5px' },
    editInput: { background: '#1e293b', border: '1px solid #38bdf8', color: 'white', padding: '5px', borderRadius: '5px', textAlign: 'center', width: '90%' },
    userSub: { color: '#64748b', fontSize: '0.85rem' },
    divider: { height: '1px', background: '#1e293b', margin: '20px 0' },
    infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' },
    statsSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
    activityCard: { background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid #1e293b' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
    statBox: { background: '#1e293b', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' },
    badgeGrid: { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
    badge: { background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem' },
    progressBar: { height: '8px', background: '#1e293b', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' },
    progressFill: { height: '100%', transition: 'width 1.5s' },
    progressText: { fontSize: '0.75rem', color: '#64748b', marginTop: '5px' },
    actionGrid: { display: 'flex', gap: '15px' },
    actionBtn: { flex: 1, background: 'transparent', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '8px', cursor: 'pointer' },
    loader: { textAlign: 'center', padding: '100px', color: '#38bdf8' }
};

export default ProfilePage;