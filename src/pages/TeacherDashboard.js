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
    const [students, setStudents] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); 

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', studentId: '' });
    
    const userName = localStorage.getItem('userName') || 'Educator';
    const userEmail = localStorage.getItem('userEmail') || 'Not Available'; 
    const token = localStorage.getItem('token');

    const API = "https://online-coding-assessment-platform-production.up.railway.app";

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/admin/assessment/all`, {
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
            const res = await axios.get(`${API}/api/admin/students/all`, {
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
            const res = await axios.get(`${API}/api/assessment/teacher/${assessmentId}/results`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSubmissions(res.data);
        } catch (err) {
            console.error("Submissions error:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

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

    const handleManualAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/admin/students/add`, newStudent, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Student added successfully! ✨");
            setShowAddStudent(false);
            setNewStudent({ name: '', email: '', studentId: '' });
            fetchStudents(); 
        } catch (err) {
            alert("Failed to add student. Check if ID or Email is already taken.");
        }
    };

    const handleDeleteAssessment = async (id) => {
        if (window.confirm("Are you sure? This will delete the assessment.")) {
            try {
                await axios.delete(`${API}/api/admin/assessment/${id}`, {
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
            await axios.put(`${API}/api/admin/assessment/${selectedAssessmentId}/complete`, {}, {
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

                    {activeTab === "Students" && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                <h2 style={{margin: 0}}>Student Directory</h2>
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <button 
                                        onClick={() => setShowAddStudent(!showAddStudent)} 
                                        style={styles.primaryBtn}
                                    >
                                        {showAddStudent ? "Close Form" : "+ Add Student Manual"}
                                    </button>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or student ID..." 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        style={styles.searchBox} 
                                    />
                                </div>
                            </div>

                            {showAddStudent && (
                                <form onSubmit={handleManualAddStudent} style={styles.manualAddForm}>
                                    <input 
                                        placeholder="Student Name" 
                                        style={styles.searchBox} 
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                        required 
                                    />
                                    <input 
                                        placeholder="Student ID" 
                                        style={styles.searchBox} 
                                        value={newStudent.studentId}
                                        onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        style={styles.searchBox} 
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                        required 
                                    />
                                    <button type="submit" style={styles.primaryBtn}>Save Student</button>
                                </form>
                            )}

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
    appLayout: {
        display: 'flex',
        height: '100vh',
        background: '#f5f7fb',
        color: '#111827',
        fontFamily: 'Arial, sans-serif'
    },

    sidebar: {
        width: '240px',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
    },

    brandWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '30px'
    },

    logoSquare: {
        width: '32px',
        height: '32px',
        background: '#2563eb',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold'
    },

    brandTitle: {
        fontSize: '16px',
        fontWeight: '700',
        margin: 0
    },

    proBadge: {
        fontSize: '10px',
        background: '#e0e7ff',
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: '6px'
    },

    navStyle: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexGrow: 1
    },

    navItem: {
        padding: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#374151'
    },

    activeNavItem: {
        padding: '10px',
        borderRadius: '6px',
        background: '#e0e7ff',
        color: '#1d4ed8',
        fontWeight: '600',
        cursor: 'pointer'
    },

    logoutBtn: {
        marginTop: '10px',
        padding: '10px',
        color: '#dc2626',
        cursor: 'pointer'
    },

    mainViewport: {
        flex: 1,
        overflowY: 'auto'
    },

    topHeader: {
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
        background: '#ffffff'
    },

    welcomeText: {
        fontSize: '20px',
        margin: 0
    },

    breadcrumb: {
        fontSize: '12px',
        color: '#6b7280'
    },

    topProfileHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer'
    },

    miniAvatar: {
        width: '30px',
        height: '30px',
        background: '#2563eb',
        borderRadius: '50%',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    miniEmail: {
        fontSize: '13px',
        color: '#374151'
    },

    content: {
        padding: '20px'
    },

    miniStatCard: {
        flex: 1,
        background: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },

    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
    },

    card: {
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        cursor: 'pointer'
    },

    iconCircle: {
        fontSize: '20px',
        marginBottom: '10px'
    },

    cardDesc: {
        fontSize: '13px',
        color: '#6b7280'
    },

    formContainer: {
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },

    stepperContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px'
    },

    stepCircle: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e5e7eb'
    },

    stepLine: {
        width: '40px',
        height: '2px',
        background: '#e5e7eb'
    },

    stepHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
    },

    manualAddForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },

    tableWrapper: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
    },

    tableHeadRow: {
        background: '#f9fafb'
    },

    thStyle: {
        padding: '12px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'left'
    },

    tableRow: {
        borderTop: '1px solid #2055bd'
    },

    tdStyle: {
        padding: '12px',
        fontSize: '14px',
        color: '#111827' 
    },

    primaryBtn: {
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    addMoreBtn: {
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    deleteBtn: {
        background: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    editBtn: {
        background: '#ffffff',
        border: '1px solid #d1d5db',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    manageCard: {
        background: '#e9e7e7',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },

    cardActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '10px'
    },

    statusBadgeAct: {
        background: '#e9e4ea',
        color: '#166534',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
    },

    statusBadgeComp: {
        background: '#e5e7eb',
        color: '#374151',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
    },

    cardInfo: {
        fontSize: '13px',
        color: '#6b7280'
    },

    searchBox: {
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
    },

    filterBox: {
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
    },

    profileContainer: {
        maxWidth: '900px'
    },

    profileHeaderCard: {
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '20px'
    },

    profileCover: {
        height: '80px',
        background: '#e5e7eb'
    },

    profileInfoArea: {
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },

    avatarCircle: {
        width: '60px',
        height: '60px',
        background: '#2563eb',
        color: '#fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    userNameText: {
        margin: 0
    },

    userSubText: {
        fontSize: '13px',
        color: '#6b7280'
    },

    profileDetailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px'
    },

    infoBox: {
        background: '#ffffff',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        gap: '10px'
    },

    lStyle: {
        fontSize: '12px',
        color: '#6b7280'
    }
};

export default TeacherDashboard;
