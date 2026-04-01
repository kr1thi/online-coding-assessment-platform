import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddProblem from './AddProblem'; 
import AssessmentForm from './AssessmentForm'; 

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]); 
    const [students, setStudents] = useState([]); // New state for student data
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); 
    
    // dynamic user data
    const userName = localStorage.getItem('userName') || 'Educator';
    const userEmail = localStorage.getItem('userEmail') || 'Not Available'; 
    const token = localStorage.getItem('token');

    // --- API FETCHING ---

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8082/api/admin/assessment/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAssessments(res.data);
        } catch (err) {
            console.error("Error fetching assessments", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            // Updated to fetch student list
            const res = await axios.get('http://localhost:8082/api/admin/students/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchTeacherSubmissions = useCallback(async (assessmentId) => {
        if (!assessmentId) return; 
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8082/api/assessment/teacher/${assessmentId}/results`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSubmissions(res.data);
        } catch (err) {
            console.error("Submissions error:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // --- EFFECTS ---

    useEffect(() => {
        if (activeTab === "Manage" || activeTab === "Dashboard") {
            fetchAssessments();
        }
        if (activeTab === "Students") {
            fetchStudents();
        }
        if (activeTab === "Submissions" && selectedAssessmentId) {
            fetchTeacherSubmissions(selectedAssessmentId);
        }
    }, [activeTab, selectedAssessmentId, fetchAssessments, fetchTeacherSubmissions, fetchStudents]);

    // --- HANDLERS ---

    const handleViewResults = (id) => {
        setSelectedAssessmentId(id);
        setActiveTab("Submissions");
        fetchTeacherSubmissions(id);
    };

    const handleDeleteAssessment = async (id) => {
        if (window.confirm("Are you sure? This will delete the assessment.")) {
            try {
                await axios.delete(`http://localhost:8082/api/admin/assessment/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssessments(prev => prev.filter(asm => asm.id !== id));
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    const handleFinishAssessment = async () => {
        try {
            await axios.put(`http://localhost:8082/api/admin/assessment/${selectedAssessmentId}/complete`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("✅ Assessment Completed!");
            setSelectedAssessmentId(null);
            setActiveTab("Manage");
            fetchAssessments(); 
        } catch (err) {
            setSelectedAssessmentId(null);
            setActiveTab("Manage");
        }
    };

    const handleLogout = () => {
        if (window.confirm("Logout?")) {
            localStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    // --- FILTERING ---

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = sub.studentId?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || sub.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredStudents = students.filter(std => 
        std.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        std.studentId?.toString().includes(searchTerm)
    );

    return (
        <div style={styles.appLayout}>
            {/* sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.brandWrapper}>
                    <div style={styles.logoSquare}>F</div>
                    <h2 style={styles.brandTitle}>FAMEHUB <span style={styles.proBadge}>TEACHER</span></h2>
                </div>   
                <nav style={styles.navStyle}>
                    <NavItem icon="📊" label="Dashboard" active={activeTab === "Dashboard"} onClick={() => {setActiveTab("Dashboard"); setSelectedAssessmentId(null);}} />
                    <NavItem icon="👤" label="My Profile" active={activeTab === "Profile"} onClick={() => {setActiveTab("Profile"); setSelectedAssessmentId(null);}} />
                    <NavItem icon="🧑‍🎓" label="Students" active={activeTab === "Students"} onClick={() => {setActiveTab("Students"); setSelectedAssessmentId(null);}} />
                    <NavItem icon="📝" label="Create New" active={activeTab === "Create"} onClick={() => {setActiveTab("Create"); setSelectedAssessmentId(null);}} />
                    <NavItem icon="🛠️" label="Manage Tests" active={activeTab === "Manage"} onClick={() => {setActiveTab("Manage"); setSelectedAssessmentId(null);}} />
                    <NavItem icon="📑" label="Submissions" active={activeTab === "Submissions"} onClick={() => {setActiveTab("Submissions");}} />
                    
                    <div style={{ flexGrow: 1 }}></div>
                    <div style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</div>
                </nav>
            </aside>

            <main style={styles.mainViewport}>
                <header style={styles.topHeader}>
                    <div>
                        <h1 style={styles.welcomeText}>Welcome back, {userName}!</h1>
                        <p style={styles.breadcrumb}>System / {activeTab}</p>
                    </div>
                    <div style={styles.topProfileHeader} onClick={() => setActiveTab("Profile")}>
                        <div style={styles.miniAvatar}>{userName.charAt(0)}</div>
                        <span style={styles.miniEmail}>{userEmail}</span>
                    </div>
                </header>

                <div style={styles.content}>
                    {/* profile part */}
                    {activeTab === "Profile" && (
                        <div style={styles.profileContainer}>
                            <div style={styles.profileHeaderCard}>
                                <div style={styles.profileCover}></div>
                                <div style={styles.profileInfoArea}>
                                    <div style={styles.avatarCircle}>{userName.charAt(0)}</div>
                                    <div style={{flexGrow: 1}}>
                                        <h2 style={styles.userNameText}>{userName}</h2>
                                        <p style={styles.userSubText}>Authorized Educator • {userEmail}</p>
                                    </div>
                                    <button style={styles.editBtn}>Settings</button>
                                </div>
                            </div>
                            <div style={styles.profileDetailsGrid}>
                                <InfoBox label="Full Name" value={userName} icon="👤" />
                                <InfoBox label="Login Email" value={userEmail} icon="📧" />
                                <InfoBox label="Account Type" value="Teacher / Admin" icon="🎖️" />
                                <InfoBox label="Security Status" value="Verified Session" icon="🛡️" />
                            </div>
                        </div>
                    )}

                    {/* dashboard landing */}
                    {activeTab === "Dashboard" && (
                        <div style={{ animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                                <div style={styles.miniStatCard}>
                                    <span style={{color: '#94a3b8', fontSize: '13px'}}>Total Assessments</span>
                                    <h2 style={{margin: '5px 0 0 0'}}>{assessments.length}</h2>
                                </div>
                                <div style={styles.miniStatCard}>
                                    <span style={{color: '#94a3b8', fontSize: '13px'}}>Registered Students</span>
                                    <h2 style={{margin: '5px 0 0 0', color: '#3b82f6'}}>{students.length}</h2>
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Quick Actions</h3>
                            <div style={styles.statsRow}>
                                <DashboardActionCard 
                                    icon="✨" title="Create New Assessment" 
                                    desc="Design questions and set time limits for students." 
                                    onClick={() => setActiveTab("Create")} 
                                />
                                <DashboardActionCard 
                                    icon="🧑‍🤝‍🧑" title="Student Directory" 
                                    desc="View and manage all registered student accounts." 
                                    onClick={() => setActiveTab("Students")} 
                                />
                                <DashboardActionCard 
                                    icon="⚙️" title="Manage Assessments" 
                                    desc="Monitor, Edit or Close active tests and results." 
                                    onClick={() => setActiveTab("Manage")} 
                                />
                            </div>
                        </div>
                    )}

                    {/* NEW: Students List Tab */}
                    {activeTab === "Students" && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                <h2 style={{margin: 0}}>Student Directory</h2>
                                <input 
                                    type="text" 
                                    placeholder="Search by name or student ID..." 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    style={styles.searchBox} 
                                />
                            </div>

                            <div style={styles.tableWrapper}>
                                <table style={{width: '100%', borderCollapse: 'collapse', color: '#fff'}}>
                                    <thead>
                                        <tr style={styles.tableHeadRow}>
                                            <th style={styles.thStyle}>Student ID</th>
                                            <th style={styles.thStyle}>Full Name</th>
                                            <th style={styles.thStyle}>Email Address</th>
                                            <th style={styles.thStyle}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((std, i) => (
                                            <tr key={i} style={styles.tableRow}>
                                                <td style={styles.tdStyle}>#{std.studentId || std.id}</td>
                                                <td style={{...styles.tdStyle, fontWeight: '600'}}>{std.name}</td>
                                                <td style={styles.tdStyle}>{std.email}</td>
                                                <td style={styles.tdStyle}>
                                                    <span style={styles.statusBadgeAct}>ACTIVE</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredStudents.length === 0 && <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No students found.</p>}
                            </div>
                        </div>
                    )}

                    {/* submission part */}
                    {activeTab === "Submissions" && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                <h2 style={{margin: 0}}>Assessment Submissions</h2>
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <input 
                                        type="text" 
                                        placeholder="Search by Student ID..." 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        style={styles.searchBox} 
                                    />
                                    <select onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterBox}>
                                        <option value="ALL">All Status</option>
                                        <option value="ACCEPTED">Passed</option>
                                        <option value="FAILED">Failed</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.tableWrapper}>
                                <table style={{width: '100%', borderCollapse: 'collapse', color: '#fff'}}>
                                    <thead>
                                        <tr style={styles.tableHeadRow}>
                                            <th style={styles.thStyle}>Student ID</th>
                                            <th style={styles.thStyle}>Student Name</th>
                                            <th style={styles.thStyle}>Score</th>
                                            <th style={styles.thStyle}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.map((sub, i) => (
                                            <tr key={i} style={styles.tableRow}>
                                                <td style={styles.tdStyle}>{sub.studentId}</td>
                                                <td style={{...styles.tdStyle, fontWeight: '600'}}>{sub.studentName || 'N/A'}</td>
                                                <td style={styles.tdStyle}>
                                                    <span style={{color: '#10b981', fontWeight: 'bold'}}>{Number(sub.totalScore).toFixed(1)}</span>
                                                    <span style={{color: '#64748b'}}> / {sub.totalPossible}</span>
                                                </td>
                                                <td style={styles.tdStyle}>
                                                    <span style={{
                                                        padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                                                        background: sub.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: sub.status === 'ACCEPTED' ? '#10b981' : '#ef4444',
                                                        border: `1px solid ${sub.status === 'ACCEPTED' ? '#10b98144' : '#ef444444'}`
                                                    }}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredSubmissions.length === 0 && <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No submissions found.</p>}
                            </div>
                        </div>
                    )}

                    {/* teacher create assessment part */}
                    {activeTab === "Create" && (
                        <div style={styles.formContainer}>
                            <div style={styles.stepperContainer}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{...styles.stepCircle, background: !selectedAssessmentId ? '#10b981' : '#1e293b', color: !selectedAssessmentId ? '#000' : '#94a3b8'}}>1</div>
                                    <span style={{ color: !selectedAssessmentId ? '#fff' : '#94a3b8', fontWeight: '600' }}>Details</span>
                                </div>
                                <div style={styles.stepLine}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{...styles.stepCircle, background: selectedAssessmentId ? '#10b981' : '#1e293b', color: selectedAssessmentId ? '#000' : '#94a3b8'}}>2</div>
                                    <span style={{ color: selectedAssessmentId ? '#fff' : '#94a3b8', fontWeight: '600' }}>Questions</span>
                                </div>
                            </div>

                            {!selectedAssessmentId ? (
                                <AssessmentForm 
                                    token={token} 
                                    styles={styles} 
                                    onSuccess={(id) => setSelectedAssessmentId(id)} 
                                    onCancel={() => setActiveTab("Dashboard")}
                                />
                            ) : (
                                <div style={{ animation: 'slideIn 0.4s ease-out' }}>
                                    <div style={styles.stepHeader}>
                                        <div>
                                            <h2 style={{ color: '#10b981', margin: 0 }}>Question Builder</h2>
                                            <p style={{color: '#94a3b8', fontSize: '14px', marginTop: '5px'}}>Editing Assessment: #{selectedAssessmentId}</p>
                                        </div>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            <button style={styles.editBtn} onClick={() => setSelectedAssessmentId(null)}>Back</button>
                                            <button style={styles.primaryBtn} onClick={handleFinishAssessment}>Go Live 🚀</button>
                                        </div>
                                    </div>
                                    <AddProblem token={token} styles={styles} assessmentId={selectedAssessmentId} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🛠️ MANAGE GRID */}
                    {activeTab === "Manage" && (
                        <div style={{ animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h2 style={{ margin: 0 }}>Manage Assessments</h2>
                                <button onClick={() => setActiveTab("Create")} style={styles.primaryBtn}>+ Create New</button>
                            </div>
                            
                            {loading ? <p>Loading assessments...</p> : (
                                <div style={styles.statsRow}>
                                    {assessments.map(asm => (
                                        <div key={asm.id} style={{
                                            ...styles.manageCard,
                                            opacity: asm.status === 'COMPLETED' ? 0.7 : 1,
                                            border: asm.status === 'COMPLETED' ? '1px solid #1e293b' : '1px solid #334155'
                                        }}>
                                            <div style={styles.cardHeader}>
                                                <h3 style={{margin: 0, fontSize: '18px'}}>{asm.title}</h3>
                                                <span style={asm.status === 'COMPLETED' ? styles.statusBadgeComp : styles.statusBadgeAct}>
                                                    {asm.status || 'ACTIVE'}
                                                </span>
                                            </div>
                                            <p style={styles.cardInfo}>⏱ {asm.duration} Minutes</p>
                                            
                                            <div style={styles.cardActions}>
                                                <button onClick={() => handleViewResults(asm.id)} style={styles.addMoreBtn}>Results</button>
                                                {asm.status !== 'COMPLETED' && (
                                                    <button onClick={() => {setSelectedAssessmentId(asm.id); setActiveTab("Create");}} style={{...styles.editBtn, flex: 1}}>Edit</button>
                                                )}
                                                <button onClick={() => handleDeleteAssessment(asm.id)} style={styles.deleteBtn}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

/* --- SUB-COMPONENTS --- */
const NavItem = ({icon, label, active, onClick}) => (
    <div style={active ? styles.activeNavItem : styles.navItem} onClick={onClick}>
        <span style={{marginRight: '12px', fontSize: '18px'}}>{icon}</span> {label}
    </div>
);

const InfoBox = ({label, value, icon}) => (
    <div style={styles.infoBox}>
        <span style={{fontSize: '24px'}}>{icon}</span>
        <div>
            <label style={styles.lStyle}>{label}</label>
            <p style={{margin: '2px 0 0 0', fontWeight: '500', fontSize: '14px'}}>{value}</p>
        </div>
    </div>
);

const DashboardActionCard = ({icon, title, desc, onClick}) => (
    <div style={styles.card} onClick={onClick}>
        <div style={styles.iconCircle}>{icon}</div>
        <h3 style={{fontSize: '20px', marginBottom: '12px'}}>{title}</h3>
        <p style={styles.cardDesc}>{desc}</p>
    </div>
);

const styles = {
    appLayout: { display: 'flex', height: '100vh', background: '#080a10', color: '#e2e8f0', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    sidebar: { width: '280px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '25px 15px' },
    brandWrapper: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px 30px 10px' },
    logoSquare: { width: '35px', height: '35px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' },
    brandTitle: { fontSize: '19px', fontWeight: '800', color: '#fff', margin: 0 },
    proBadge: { fontSize: '10px', background: '#3b82f6', padding: '2px 6px', borderRadius: '4px' },
    navStyle: { display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 },
    navItem: { padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8', transition: '0.3s', display: 'flex', alignItems: 'center', fontSize: '15px' },
    activeNavItem: { padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' },
    logoutBtn: { padding: '15px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', borderTop: '1px solid #1e293b', marginTop: '10px' },
    mainViewport: { flex: 1, overflowY: 'auto', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' },
    topHeader: { padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100 },
    welcomeText: { fontSize: '24px', fontWeight: '800', margin: 0 },
    breadcrumb: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
    topProfileHeader: { display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer' },
    miniAvatar: { width: '30px', height: '30px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    miniEmail: { fontSize: '13px', color: '#94a3b8' },
    content: { padding: '40px 50px' },
    formCard: {
        background: '#ffffff', 
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
    },
    inputGroup: {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    inputField: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #1a395f',
        fontSize: '14px',
        outline: 'none',
        transition: 'border 0.2s'
    },
    
    // Cards & Dashboard
    miniStatCard: { flex: 1, background: 'rgba(30, 41, 59, 0.4)', padding: '24px', borderRadius: '16px', border: '1px solid #334155' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    card: { background: '#1e293b', padding: '40px 30px', borderRadius: '24px', border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.3s ease' },
    iconCircle: { width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '24px' },
    cardDesc: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' },

    // Forms & Stepper
    formContainer: { background: '#0f172a', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', maxWidth: '1000px', margin: '0 auto' },
    stepperContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' },
    stepCircle: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    stepLine: { width: '60px', height: '2px', background: '#1e293b' },
    stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'rgba(16, 185, 129, 0.05)', padding: '20px', borderRadius: '16px', border: '1px dashed #10b981' },

    // Tables
    tableWrapper: { background: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' },
    tableHeadRow: { background: '#0f172a', textAlign: 'left' },
    thStyle: { padding: '16px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' },
    tableRow: { borderBottom: '1px solid #334155' },
    tdStyle: { padding: '16px', fontSize: '14px' },

    // Buttons
    primaryBtn: { background: '#10b981', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    addMoreBtn: { background: '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', flex: 2 },
    deleteBtn: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
    editBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' },

    // Manage Cards
    manageCard: { background: '#1e293b', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    cardActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    statusBadgeAct: { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    statusBadgeComp: { background: '#334155', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' },
    cardInfo: { color: '#94a3b8', fontSize: '13px' },

    // Search & Filter
    searchBox: { padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff', width: '250px' },
    filterBox: { padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#fff' },

    // Profile Specifics
    profileContainer: { maxWidth: '900px' },
    profileHeaderCard: { background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155', marginBottom: '30px' },
    profileCover: { height: '100px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' },
    profileInfoArea: { padding: '0 30px 30px 30px', display: 'flex', alignItems: 'center', gap: '20px', marginTop: '-40px' },
    avatarCircle: { width: '80px', height: '80px', background: '#0f172a', border: '4px solid #1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#10b981', fontWeight: 'bold' },
    userNameText: { fontSize: '24px', margin: 0, fontWeight: '800' },
    userSubText: { color: '#64748b', fontSize: '14px' },
    profileDetailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    infoBox: { background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' },
    lStyle: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
};

export default TeacherDashboard;